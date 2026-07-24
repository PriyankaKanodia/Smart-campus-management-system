import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, Eye, Type, Volume2, Shield, Sparkles } from 'lucide-react';

interface TopBarControlsProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onAccessibilityChange?: (settings: { fontSize: 'normal' | 'large' | 'xlarge'; highContrast: boolean }) => void;
}

export default function TopBarControls({ currentLang, onLanguageChange, onAccessibilityChange }: TopBarControlsProps) {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [showA11yMenu, setShowA11yMenu] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Apply font size class to body
    document.body.classList.remove('text-normal', 'text-lg', 'text-xl');
    if (fontSize === 'large') document.body.classList.add('text-lg');
    if (fontSize === 'xlarge') document.body.classList.add('text-xl');

    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (onAccessibilityChange) {
      onAccessibilityChange({ fontSize, highContrast });
    }
  }, [fontSize, highContrast]);

  const languages = [
    { code: 'en', label: 'English (US)' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية (Arabic)' }
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Dark / Light Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        title="Toggle Dark/Light Mode"
        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Language Picker */}
      <div className="relative inline-block text-left">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700">
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <select
            value={currentLang}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer pr-1"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accessibility Menu Toggle */}
      <div className="relative">
        <button
          onClick={() => setShowA11yMenu(!showA11yMenu)}
          title="Accessibility (A11y) Settings"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </button>

        {showA11yMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-500" /> Accessibility Preferences
              </span>
              <button onClick={() => setShowA11yMenu(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Font Size Adjuster */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> Text Size Scale
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 text-xs rounded border ${
                    fontSize === 'normal' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  A (Normal)
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 text-xs font-semibold rounded border ${
                    fontSize === 'large' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  A+ (Large)
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-1 text-xs font-bold rounded border ${
                    fontSize === 'xlarge' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  A++ (XL)
                </button>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">High Contrast UI</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
