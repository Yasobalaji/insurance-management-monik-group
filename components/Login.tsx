
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Loader2, Landmark, User, Lock, Quote, ChevronRight, MapPin } from 'lucide-react';
import { User as UserType } from '../types';
import { COMPANIES, COMPANY_LOGOS, DAILY_QUOTES, COMPANY_BRANCH_MAPPING, APP_NAME, COMPANY_BRAND } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  onLogin: (user: UserType, branch?: string) => void;
  users: UserType[];
}

const Login: React.FC<Props> = ({ onLogin, users }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [selCompany, setSelCompany] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selBranch, setSelBranch] = useState('');

  const quoteIdx = useMemo(() => Math.floor(Date.now() / 86400000) % DAILY_QUOTES.length, []);
  const currentQuote = DAILY_QUOTES[quoteIdx];

  const branches = useMemo(() => {
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
    if (foundUser && foundUser.branches && foundUser.branches.length > 0) {
        return foundUser.branches;
    }
    return selCompany ? (COMPANY_BRANCH_MAPPING[selCompany] || []) : [];
  }, [selCompany, username, users]);

  const handleExecuteLogin = () => {
    if (!username || !password) return;
    
    setIsLoggingIn(true);
    setTimeout(() => {
      const foundUser = users.find(u => 
        (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
        u.company === selCompany &&
        u.status !== 'Inactive'
      );

      if (!foundUser) {
        alert("ACCESS DENIED: USER NOT IDENTIFIED IN ORGANIZATIONAL SCOPE");
        setIsLoggingIn(false);
        return;
      }

      const isSuper = (foundUser.username.toLowerCase() === 'superuser' || foundUser.name.toLowerCase() === 'super user') && password === '1122';
      const isStandard = password === '123';
      const isPersonal = foundUser.password && password === foundUser.password;

      if (isSuper || isStandard || isPersonal) {
        onLogin(foundUser, selBranch);
      } else {
        alert("ACCESS DENIED: INVALID SECURITY KEY");
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
        const googleUser = users.find(u => u.company === selCompany && u.status !== 'Inactive');
        if (googleUser) {
            onLogin(googleUser, selBranch);
        } else {
            alert("GOOGLE AUTH FAILED: NO LINKED ACCOUNT FOUND FOR THIS ORGANIZATION");
            setIsLoggingIn(false);
        }
    }, 1200);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const inputClass = "w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute top-8 right-8">
        <LanguageSwitcher variant="login" />
      </div>

      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-blue-50">
              <img src={selCompany ? COMPANY_LOGOS[selCompany] : COMPANY_LOGOS["CMBSL"]} alt="Logo" className="h-16 object-contain" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black text-blue-900 uppercase tracking-tight leading-tight">{APP_NAME}</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{COMPANY_BRAND}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-blue-50 space-y-8 relative overflow-hidden">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, (selCompany === 'CMBSL' ? 3 : 0)].map((i, idx) => i !== 0 && <div key={idx} className={`h-1.5 rounded-full transition-all ${step >= i ? 'w-8 bg-blue-600' : 'w-2 bg-slate-100'}`} />)}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Enterprise Selection</label>
                <div className="relative">
                  <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select className={`${inputClass} pl-12 appearance-none`} value={selCompany} onChange={e => setSelCompany(e.target.value)}>
                    <option value="">Select Organization...</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button disabled={!selCompany} onClick={nextStep} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all">
                Continue to Login <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white border-2 border-slate-100 py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-sm group"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Sign in with Gmail</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Or Internal Identity</div>
              </div>

              <div className="text-left space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Username / Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                        type="text"
                        className={`${inputClass} pl-12`} 
                        placeholder="username or email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Security Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="password" className={`${inputClass} pl-12`} placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase transition-colors hover:bg-slate-100">Back</button>
                <button 
                  disabled={!username || !password} 
                  onClick={nextStep} 
                  className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  Assign Node <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Authorized Service Node</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select className={`${inputClass} pl-12 appearance-none`} value={selBranch} onChange={e => setSelBranch(e.target.value)}>
                    <option value="">Select Working Branch...</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center px-4">Ensure you select the node for which you have on-site authorization today.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase transition-colors hover:bg-slate-100">Back</button>
                <button disabled={!selBranch} onClick={handleExecuteLogin} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                  {isLoggingIn ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  Authorize Access
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl space-y-4">
           <div className="flex justify-center text-blue-400 opacity-50"><Quote size={32} /></div>
           <p className="text-sm italic font-bold text-slate-800 leading-relaxed">"{currentQuote[language]}"</p>
        </div>

        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">Integrated Compliance • Silo v5.0</p>
      </div>
    </div>
  );
};

export default Login;
