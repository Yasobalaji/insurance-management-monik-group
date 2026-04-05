
import React from 'react';
import { Users, Building2, ShieldAlert, ArrowRight, UserCheck, Settings, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { APP_NAME, COMPANY_BRAND } from '../constants';

interface Props {
  onSelect: (category: 'customer' | 'staff' | 'asset' | 'admin') => void;
  currentUser: User | null;
}

const CategorySelection: React.FC<Props> = ({ onSelect, currentUser }) => {
  const categories = [
    {
      id: 'customer' as const,
      title: 'Customer Insurance',
      subtitle: 'External Core',
      description: 'Sophisticated processing for life, health, and academic financial instruments.',
      icon: <Users className="w-9 h-9" />,
      color: 'from-blue-600 to-blue-800',
      accent: 'blue',
      hasAccess: true
    },
    {
      id: 'staff' as const,
      title: 'Employee Insurance',
      subtitle: 'Internal Welfare',
      description: 'Comprehensive welfare lifecycle management for organizational personnel.',
      icon: <Building2 className="w-9 h-9" />,
      color: 'from-slate-700 to-slate-900',
      accent: 'slate',
      hasAccess: true
    },
    {
      id: 'asset' as const,
      title: 'Asset Insurance',
      subtitle: 'Enterprise Risk',
      description: 'Asset resilience monitoring for fixed infrastructure and mobile fleet units.',
      icon: <ShieldAlert className="w-9 h-9" />,
      color: 'from-emerald-500 to-emerald-700',
      accent: 'emerald',
      hasAccess: true
    },
    {
      id: 'admin' as const,
      title: 'System Administrator',
      subtitle: 'System Control',
      description: 'High-level architectural oversight, role governance and data integrity.',
      icon: <Settings className="w-9 h-9" />,
      color: 'from-indigo-600 to-indigo-800',
      accent: 'indigo',
      hasAccess: true
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col p-10 md:p-16 font-sans overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')` /* Replace this with actual Monik Background URL if hosted */ }}
    >
      {/* Overlay to ensure readability and corporate rays effect */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      
      {/* Abstract Background Shapes (Reduced for cleaner look with image) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] -mr-96 -mt-96" />

      <header className="max-w-7xl mx-auto w-full mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 z-10">
        <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
          <div className="flex items-center gap-6 mb-4">
            <div className="bg-blue-600 p-3.5 rounded-[1.5rem] shadow-xl">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">MONIK GROUP</h1>
              <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mt-2 ml-0.5">Claim Management System</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 shadow-xl animate-in fade-in slide-in-from-right-6 duration-1000">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=2563eb&color=ffffff`} alt="User" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Name</p>
            <p className="text-sm font-black text-slate-900 uppercase mt-0.5">{currentUser?.name || 'Authorized Member'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-1 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`group relative flex flex-col text-left h-[460px] rounded-[3rem] overflow-hidden transition-all duration-700 border border-white/40 bg-white/80 backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both hover:-translate-y-4 hover:border-blue-600/50 hover:bg-white`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${cat.color} opacity-80 group-hover:h-3 transition-all`} />
              
              <div className="relative z-10 flex flex-col h-full p-10 justify-between">
                <div>
                  <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-10 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {cat.icon}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Silo Protocol</p>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8 leading-tight">{cat.title}</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed group-hover:text-slate-700 transition-colors">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-blue-600 font-black text-[12px] uppercase tracking-[0.2em] bg-slate-50 px-8 py-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                      Login <ArrowRight size={18} />
                    </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="mt-20 pt-10 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-10 text-slate-500 z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">OPERATIONAL PROTOCOL © 2025 SILO ANALYTICS - ALL RIGHT TO MONIK GROUP OF COMPANIES @2025</p>
        <div className="flex gap-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-blue-600 cursor-pointer transition-colors">Security v5.2 - demo</span>
        </div>
      </footer>
    </div>
  );
};

export default CategorySelection;
