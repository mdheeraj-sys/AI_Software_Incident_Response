"""
Drain 3.0 Tree-based Log Parser implemented from scratch.
Reference: Part 6 of PS-61 Architecture Document.

Drain parses streaming log messages into fixed templates by constructing a prefix tree
branching on token count and initial tokens, then comparing candidate leaf templates
with token similarity and wildcard substitution.
"""

import re
from typing import List, Dict, Tuple, Optional

class Node:
    def __init__(self, token: str = ""):
        self.token = token
        self.children: Dict[str, "Node"] = {}
        self.leaf_templates: List[int] = []

    def get_or_create_child(self, token: str) -> "Node":
        if token not in self.children:
            self.children[token] = Node(token)
        return self.children[token]

class DrainParser:
    def __init__(self, max_depth: int = 4, sim_threshold: float = 0.5, max_children: int = 100):
        """
        :param max_depth: Maximum tree depth (Root -> length -> token1 -> token2)
        :param sim_threshold: Similarity score required to merge into an existing template
        :param max_children: Max child nodes per node
        """
        self.root = Node()
        self.max_depth = max_depth
        self.sim_threshold = sim_threshold
        self.max_children = max_children
        self.templates: Dict[int, List[str]] = {}  # template_id -> token list with <*>
        self.template_counts: Dict[int, int] = {}  # template_id -> count of matched lines
        self.next_id = 1

    def preprocess(self, line: str) -> str:
        """
        Mask volatile values like IPs, UUIDs, ISO timestamps, and numbers before tokenizing.
        Preserves structural words and tokens.
        """
        # Mask ISO timestamps: e.g. 2026-10-03T10:15:32.401Z or [03/Oct/2026:...]
        line = re.sub(r"\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?", "<TIMESTAMP>", line)
        line = re.sub(r"\[\d{2}/[A-Za-z]+/\d{4}:\d{2}:\d{2}:\d{2}[^\]]*\]", "<TIMESTAMP>", line)
        # Mask IP addresses
        line = re.sub(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "<IP>", line)
        # Mask UUIDs
        line = re.sub(r"[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}", "<UUID>", line, flags=re.IGNORECASE)
        # Mask hex memory addresses
        line = re.sub(r"0x[a-f0-9]+", "<HEX>", line, flags=re.IGNORECASE)
        # Mask generic numbers / durations
        line = re.sub(r"\b\d+ms\b", "<MS>", line)
        line = re.sub(r"\b\d+\b", "<NUM>", line)
        return line

    def tokenize(self, line: str) -> List[str]:
        cleaned = self.preprocess(line)
        # Split on whitespace and quotes
        tokens = [t for t in re.split(r"[\s\"']+", cleaned) if t]
        return tokens

    @staticmethod
    def token_similarity(template_tokens: List[str], line_tokens: List[str]) -> float:
        if len(template_tokens) != len(line_tokens) or len(template_tokens) == 0:
            return 0.0
        matches = sum(
            1 for t, l in zip(template_tokens, line_tokens)
            if t == "<*>" or t == l
        )
        return matches / float(len(template_tokens))

    @staticmethod
    def merge_with_wildcards(template_tokens: List[str], line_tokens: List[str]) -> List[str]:
        return [
            t if t == l else "<*>"
            for t, l in zip(template_tokens, line_tokens)
        ]

    def parse(self, line: str) -> Tuple[int, str, bool]:
        """
        Parses a log line into a template ID.
        Returns: (template_id, template_string, is_new_template)
        """
        tokens = self.tokenize(line)
        length = len(tokens)
        if length == 0:
            return 0, "", False

        # Level 1: Length node
        len_str = str(length)
        node = self.root.get_or_create_child(len_str)

        # Levels 2 to max_depth: initial tokens
        current = node
        for token in tokens[: self.max_depth - 1]:
            # Replace numeric/wildcard tokens with generic key in tree branching
            branch_key = "<*>" if ("<" in token and ">" in token) else token
            if len(current.children) >= self.max_children and branch_key not in current.children:
                branch_key = "<*>"
            current = current.get_or_create_child(branch_key)

        # Match candidates in leaf node
        candidates = current.leaf_templates
        best_match_id = None
        best_score = 0.0

        for template_id in candidates:
            score = self.token_similarity(self.templates[template_id], tokens)
            if score > best_score:
                best_match_id = template_id
                best_score = score

        if best_match_id is not None and best_score >= self.sim_threshold:
            # Match found: update template with wildcards
            self.templates[best_match_id] = self.merge_with_wildcards(
                self.templates[best_match_id], tokens
            )
            self.template_counts[best_match_id] += 1
            template_str = " ".join(self.templates[best_match_id])
            return best_match_id, template_str, False
        else:
            # Create new template
            new_id = self.next_id
            self.next_id += 1
            self.templates[new_id] = tokens
            self.template_counts[new_id] = 1
            current.leaf_templates.append(new_id)
            template_str = " ".join(tokens)
            return new_id, template_str, True

    def get_template(self, template_id: int) -> Optional[str]:
        if template_id in self.templates:
            return " ".join(self.templates[template_id])
        return None
