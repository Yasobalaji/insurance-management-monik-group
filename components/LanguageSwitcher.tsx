
import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'sidebar' | 'login';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'sidebar' }) => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'EN', fullLabel: 'English' },
    { code: 'si', label: 'SI', fullLabel: 'සිංහල' },
    { code: 'ta', label: 'TA', fullLabel: 'தமிழ்' }
  ] as const;

  if (variant === 'login') {
    return (
      <div className="flex gap-2">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
              language === l.code 
                ? 'bg-blue-600 text-white shadow-blue-200' 
                : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            {l.fullLabel}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="px-1 mb-8">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2.5 ml-1 flex items-center gap-2">
        <Globe size={10} /> Local Engine
      </p>
      <div className="grid grid-cols-3 gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 shadow-inner">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`py-2 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest ${
              language === l.code 
                ? 'bg-white text-blue-600 shadow-sm border border-blue-100' 
                : 'text-slate-400 hover:bg-white hover:text-slate-600'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
