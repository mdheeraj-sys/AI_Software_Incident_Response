/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Maximize2, 
  GraduationCap, 
  Globe, 
  Server, 
  Database, 
  FileText,
  CreditCard,
  Phone
} from 'lucide-react';

interface CollegePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnderAttack?: boolean;
}

export const CollegePortalModal: React.FC<CollegePortalModalProps> = ({
  isOpen,
  onClose,
  isUnderAttack = false,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'admission' | 'fees' | 'contact'>('home');
  const [iframeKey, setIframeKey] = useState<number>(0);

  if (!isOpen) return null;

  const PAGES = {
    home: {
      url: '/college-portal/index.html',
      displayUrl: 'https://portal.gokuluniversity.ac.in/',
      title: 'Gokul Global University — Home & Overview',
      icon: GraduationCap,
    },
    admission: {
      url: '/college-portal/Admission_page.html',
      displayUrl: 'https://portal.gokuluniversity.ac.in/admissions/apply',
      title: 'Student Admissions Portal — Registration Form',
      icon: FileText,
    },
    fees: {
      url: '/college-portal/fees_page.html',
      displayUrl: 'https://portal.gokuluniversity.ac.in/fees/tuition-structure',
      title: 'Fee Payment & Academic Ledgers',
      icon: CreditCard,
    },
    contact: {
      url: '/college-portal/Contact_page.html',
      displayUrl: 'https://portal.gokuluniversity.ac.in/campus/contact',
      title: 'Campus Directory & Support Helpdesk',
      icon: Phone,
    },
  };

  const currentPage = PAGES[activeTab];

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[88vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200">
        {/* 1. Browser Window Top Chrome Bar */}
        <div className="px-4 py-2.5 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            {/* macOS window control buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="size-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                title="Close"
              />
              <span className="size-3 rounded-full bg-yellow-400 inline-block" />
              <span className="size-3 rounded-full bg-emerald-500 inline-block" />
            </div>

            {/* Back / Forward / Refresh controls */}
            <div className="hidden sm:flex items-center gap-1 text-zinc-400">
              <button 
                onClick={() => setActiveTab('home')} 
                className="p-1 hover:text-zinc-700 transition-colors"
                title="Home"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setActiveTab('admission')} 
                className="p-1 hover:text-zinc-700 transition-colors"
                title="Next Page"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleRefresh} 
                className="p-1 hover:text-zinc-700 transition-colors"
                title="Reload Portal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Browser Omnibar / URL Address Field */}
          <div className="flex-1 max-w-xl mx-4 px-3 py-1 bg-white border border-zinc-300 rounded-md flex items-center gap-2 text-xs font-mono text-zinc-700 shadow-2xs">
            <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{currentPage.displayUrl}</span>
            {isUnderAttack && (
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold animate-pulse">
                DDOS PROBING DETECTED
              </span>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <a
              href={currentPage.url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer"
              title="Open standalone in new browser tab"
            >
              <span className="hidden md:inline">Open in Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. College Portal Navigation Tabs */}
        <div className="px-4 py-2 bg-white border-b border-zinc-200 flex items-center gap-2 overflow-x-auto text-xs font-space select-none">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 mr-3 shrink-0">
            <GraduationCap className="w-4 h-4 text-cyan-600" />
            <span>GOKUL COLLEGE PORTAL</span>
          </div>

          {(['home', 'admission', 'fees', 'contact'] as const).map((tabKey) => {
            const page = PAGES[tabKey];
            const Icon = page.icon;
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-cyan-50 border border-cyan-300 text-cyan-900 font-bold shadow-2xs'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600' : 'text-zinc-400'}`} />
                <span className="capitalize">{tabKey}</span>
              </button>
            );
          })}

          <div className="ml-auto hidden lg:flex items-center gap-3 text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-emerald-600" />
              FastAPI :8000
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-600" />
              SQLite 4,820 Records
            </span>
          </div>
        </div>

        {/* 3. Live Embedded College Website (Pulled from jaydipsinh13/College-Website) */}
        <div className="relative flex-1 w-full bg-white overflow-hidden">
          <iframe
            key={`${currentPage.url}-${iframeKey}`}
            src={currentPage.url}
            title={currentPage.title}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </div>
  );
};
