# How Websites and Software Get Hacked

## Purpose

This document explains, in simple but technically accurate language, how real websites and software can be compromised.

It is written for someone learning cybersecurity and for developers building security software.

> **Scope:** This is a defensive learning document. It explains attack concepts and system weaknesses without providing weaponized exploit instructions, payloads, or unauthorized-access procedures.

---

# 1. The Big Picture

A modern application is not just a webpage.

A simplified architecture is:

```text
User
  |
  v
Browser / Mobile App
  |
 HTTPS
  |
  v
Web Server / API
  |
  +-------------------+
  |                   |
  v                   v
Database          External APIs
  |
  v
Stored Data
```

A compromise can happen at almost any layer:

- User accounts
- Browser/client-side code
- Web application
- APIs
- Authentication
- Authorization
- Server configuration
- Dependencies
- Operating system
- Database
- Cloud infrastructure
- Employees and other human users

The core idea is:

> An attacker finds a difference between what the system **intends to allow** and what the system **actually allows**.

---

# 2. Normal Request Flow

Suppose a user logs into a website.

```text
1. User enters credentials
        |
2. Browser sends HTTPS request
        |
3. Server receives request
        |
4. Application validates credentials
        |
5. Server checks database
        |
6. Server creates authenticated session
        |
7. Browser receives session information
        |
8. User accesses protected resources
```

Security problems occur when one of these steps has an incorrect assumption.

For example:

```text
Expected:
Only account owner can see account data.

Actual:
Any logged-in user can request another user's data.
```

That difference is a vulnerability.

---

# 3. Stage 1 — Reconnaissance

Before attempting anything, an attacker may try to understand the target.

They may learn:

- Which domains belong to the organization
- Which public services exist
- What application technologies are visible
- Which login pages exist
- What public information is available
- Whether employees or systems accidentally expose information

Conceptually:

```text
Target organization
        |
        v
Public information
        |
        v
Application / infrastructure map
        |
        v
Possible attack surface
```

### Defensive lesson

Organizations should know what they expose publicly.

Useful controls include:

- Asset inventory
- Attack-surface monitoring
- Secure configuration management
- Removal of unused public services
- Regular security assessments

---

# 4. Stage 2 — Finding Weaknesses

The attacker then looks for weaknesses.

Common categories:

## 4.1 Authentication weaknesses

Authentication answers:

> "Who are you?"

Problems can include:

- Weak passwords
- Password reuse
- Missing multi-factor authentication
- Poor session management
- Unlimited login attempts
- Weak password-reset mechanisms

---

## 4.2 Authorization weaknesses

Authorization answers:

> "What are you allowed to do?"

A major mistake is confusing:

```text
Authenticated = logged in
```

with:

```text
Authorized = allowed to perform this specific action
```

Example:

```text
User A logs in
      |
      v
Requests resource belonging to User B
      |
      v
Server checks only "is logged in?"
      |
      v
Incorrectly grants access
```

This is a broken-access-control problem.

---

## 4.3 Input-handling weaknesses

Applications receive input from users:

- Search terms
- Names
- Comments
- File names
- Form values
- API parameters

If developers treat untrusted input as trusted instructions, security problems can occur.

Examples include:

- SQL injection
- Cross-site scripting
- Command injection
- Template injection

The general problem is:

```text
Untrusted input
      |
      v
Application
      |
      v
Interpreted as something more powerful than intended
```

The defensive principle is:

> Treat external input as untrusted data and use safe APIs that keep data separate from commands.

---

# 5. SQL Injection — Conceptual View

A website may need to search a database.

Conceptually:

```text
User input
    |
    v
Application
    |
    v
Database query
    |
    v
Database
```

If an application incorrectly combines raw user input with a database command, specially crafted input can potentially change the meaning of the query.

The fundamental mistake is:

```text
Data + SQL instructions
```

being mixed together.

The safer design is:

```text
SQL structure
+
separately supplied data
```

using parameterized/prepared queries.

### Defensive controls

- Parameterized queries
- ORM/framework protections
- Input validation
- Least-privilege database accounts
- Database monitoring
- Secure code review
- Dependency updates

---

# 6. Cross-Site Scripting — Conceptual View

A website might allow comments:

```text
User
  |
  v
Comment
  |
  v
Website
  |
  v
Stored/displayed content
  |
  v
Other user's browser
```

If unsafe content is inserted into a webpage, the victim's browser may interpret it as executable browser content.

The core issue:

> The application failed to safely distinguish user-controlled content from trusted webpage code.

### Defensive controls

- Context-aware output encoding
- Safe templating
- Input validation where appropriate
- Content Security Policy
- Secure framework defaults
- Avoid unsafe HTML insertion APIs

---

# 7. Session Attacks

After login, websites normally need a way to remember that the user is authenticated.

A simplified model:

```text
Login
  |
  v
Server creates session
  |
  v
Browser stores session credential
  |
  v
Browser sends it with future requests
```

If an attacker obtains a valid session credential, they may be able to impersonate the user.

### Defensive controls

- HTTPS
- Secure cookie settings
- HttpOnly cookies where appropriate
- SameSite protection
- Session expiration
- Session rotation
- Re-authentication for sensitive actions
- Detection of suspicious sessions

---

# 8. File Upload Problems

Suppose an application accepts profile pictures.

A secure application should answer:

```text
Is the file type allowed?
Is the file actually what it claims to be?
Where will it be stored?
Can it be executed?
Can it affect another part of the system?
```

A dangerous design is:

```text
User uploads file
      |
      v
Server blindly trusts it
      |
      v
File reaches sensitive location
      |
      v
Unexpected behavior
```

### Defensive controls

- Strict allowlists
- File type/content validation
- Size limits
- Randomized storage names
- Store uploads outside executable locations
- Malware scanning where appropriate
- Least-privilege storage permissions

---

# 9. Vulnerable Dependencies

Applications rarely consist entirely of code written by their own developers.

A project may look like:

```text
Application
   |
   +-- Framework
   |
   +-- Library A
   |
   +-- Library B
   |
   +-- Library C
```

If one dependency contains a serious vulnerability, the application can inherit the risk.

### Defensive controls

- Dependency inventory
- Software composition analysis
- Automated vulnerability scanning
- Timely patching
- Version pinning
- Removal of unused dependencies
- Software bill of materials (SBOM)

---

# 10. Misconfiguration

Sometimes the software itself is fine.

The problem is configuration.

Examples:

- Database accidentally exposed to the internet
- Excessive permissions
- Debug mode enabled in production
- Public cloud storage
- Default credentials
- Unnecessary services
- Secrets stored insecurely

Conceptually:

```text
Secure software
      +
Unsafe configuration
      =
Security exposure
```

---

# 11. Phishing and Credential Theft

Not every compromise requires exploiting software.

A fake login page may imitate a legitimate service.

```text
Attacker
   |
   v
Fake login page
   |
   v
Victim enters credentials
   |
   v
Attacker obtains credentials
   |
   v
Attacker attempts legitimate login
```

From the real service's perspective, the credentials may look valid.

### Defensive controls

- Multi-factor authentication
- Phishing-resistant authentication where available
- User awareness
- Login anomaly detection
- Credential leak monitoring
- Strong account recovery controls

---

# 12. Malware and Malicious Software

Malware is software designed to perform unauthorized or harmful actions.

Examples include:

- Ransomware
- Information stealers
- Remote-access malware
- Destructive malware
- Persistence mechanisms

A common high-level lifecycle is:

```text
Initial access
      |
      v
Execution
      |
      v
Persistence / continued access
      |
      v
Discovery
      |
      v
Data access or disruption
```

Defensive systems should monitor for unusual behavior rather than relying only on known malware names.

---

# 13. Privilege Escalation

An attacker may initially gain only limited access.

For example:

```text
Low-privilege account
        |
        v
Find permission/configuration weakness
        |
        v
Higher privileges
```

The goal is to obtain permissions beyond what the original account should have.

### Defensive controls

- Least privilege
- Role-based access control
- Privileged access management
- Secure configuration
- Patch management
- Audit logs
- Separation of administrative accounts

---

# 14. Lateral Movement

Organizations often contain many systems.

```text
Employee PC
     |
     v
Internal application
     |
     v
Internal server
     |
     v
Database
```

If an attacker compromises one system, they may attempt to reach other systems.

### Defensive controls

- Network segmentation
- Zero-trust principles
- Strong authentication between services
- Least privilege
- Internal traffic monitoring
- Endpoint detection and response
- Restrict unnecessary network access

---

# 15. Data Exfiltration

After obtaining access, attackers may attempt to take data outside the organization.

Examples:

- Customer records
- Credentials
- Financial information
- Intellectual property
- Internal documents

Conceptually:

```text
Sensitive data
      |
      v
Unauthorized access
      |
      v
Data collected
      |
      v
Data leaves organization
```

### Defensive controls

- Data-loss prevention
- Access monitoring
- Encryption
- Database auditing
- Network monitoring
- Data classification
- Least privilege

---

# 16. Ransomware

Ransomware attacks typically aim to disrupt access to systems or data.

High-level lifecycle:

```text
Initial access
      |
      v
System compromise
      |
      v
Expansion
      |
      v
Data/system disruption
      |
      v
Extortion
```

Defenses include:

- Offline/immutable backups
- Endpoint protection
- Network segmentation
- Least privilege
- Patch management
- Detection and response
- Incident-response plans

---

# 17. Why Real Incidents Are Usually Multi-Step

A major incident often isn't caused by one vulnerability.

A simplified example:

```text
Phishing
   ↓
Employee credential compromised
   ↓
Attacker logs in
   ↓
Weak authorization
   ↓
Sensitive application accessed
   ↓
Additional credentials discovered
   ↓
Internal system accessed
   ↓
Sensitive data reached
```

Each individual weakness may appear manageable.

Together they create a serious incident.

---

# 18. The Security Mindset

For every important feature, ask:

### What should happen?

### What must never happen?

### What input can the user control?

### What permissions are required?

### What happens if the request is malformed?

### What happens if the user is malicious?

### What happens if an account is compromised?

### What evidence would appear in the logs?

These questions are the foundation of secure software design.

---

# 19. One Mental Model

Remember:

```text
ATTACKER
   |
   v
Find exposed surface
   |
   v
Find weakness
   |
   v
Exploit weakness
   |
   v
Gain access
   |
   v
Increase privileges / move
   |
   v
Reach valuable resource
   |
   v
Steal / modify / disrupt
```

And defense attempts to interrupt every arrow:

```text
Prevent → Detect → Contain → Recover
```

---

# 20. Final Summary

A website usually gets hacked because one or more assumptions fail.

The most important categories to understand are:

1. Authentication
2. Authorization
3. Input validation
4. Session management
5. File handling
6. Dependencies
7. Configuration
8. Secrets management
9. Network exposure
10. Human factors
11. Monitoring
12. Incident response

The goal of cybersecurity is not to assume:

> "Attackers will never get in."

A mature security strategy assumes that something eventually may go wrong and makes sure the system can **prevent, detect, contain, investigate, and recover from it**.
