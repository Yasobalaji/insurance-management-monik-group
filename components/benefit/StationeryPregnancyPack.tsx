
import React, { useState, useMemo } from 'react';
import { BaseClaimData, YearlyPackStatus, User } from '../../types';
import { 
  Gift, Filter, Calendar, CheckCircle2, ChevronDown, ChevronUp, 
  Search, Save, Baby, BookOpen, Layers, Check, UserMinus, 
  UserCheck, Clock, ShieldCheck, Plus, Trash2, Fingerprint, 
  Lock, ArrowRight, Activity, CalendarPlus
} from 'lucide-react';
import { COMPANIES, COMPANY_BRANCH_MAPPING } from '../../constants';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  currentUser?: User | null;
}

const StationeryPregnancyPack: React.FC<Props> = ({ claims, onUpdateClaim, currentUser }) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canProcess = useMemo(() => currentUser?.isGlobal || currentUser?.interfaceAccess?.customer?.packTracking_process, [currentUser]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      // Must be approved to be here
      if (c.status === 'Rejected') return false;
      
      const isPregnancy = c.claimType === 'PREGNANCY';
      const isEducationWithPack = c.claimType === 'EDUCATION' && (c.approvedBenefitType === 'Pack' || c.approvedBenefitType === 'Both');
      
      if (!isPregnancy && !isEducationWithPack) return false;
      
      if (filterCompany && c.company !== filterCompany) return false;
      if (filterBranch && c.branch !== filterBranch) return false;
      
      if (searchTerm) {
          const s = searchTerm.toLowerCase();
          return c.customerName.toLowerCase().includes(s) || c.loanNumber.toLowerCase().includes(s) || c.customerInsuranceId.toLowerCase().includes(s);
      }
      
      return true;
    });
  }, [claims, filterCompany, filterBranch, searchTerm]);

  const handleAddYear = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    const existingPacks = claim.yearlyPacks || [];
    const lastYear = existingPacks.length > 0 
      ? Math.max(...existingPacks.map(p => p.year)) 
      : (claim.educationData?.examYear ? parseInt(claim.educationData.examYear) : new Date().getFullYear());
    
    const newYear = lastYear + 1;
    const newPacks: YearlyPackStatus[] = [...existingPacks, { 
        year: newYear, 
        status: 'Pending', 
        customerStatus: 'Active' 
    }];
    
    onUpdateClaim(claimId, { yearlyPacks: newPacks });
  };

  const handleUpdateYearlyPack = (claimId: string, year: number, updates: Partial<YearlyPackStatus>) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    const newPacks = (claim.yearlyPacks || []).map(p => 
        p.year === year ? { ...p, ...updates } : p
    );
    onUpdateClaim(claimId, { yearlyPacks: newPacks });
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-black uppercase focus:ring-2 focus:ring-emerald-500 outline-none transition-all";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-40">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="bg-slate-900 p-5 rounded-[2rem] text-emerald-400 shadow-2xl rotate-[-2deg] border-b-4 border-emerald-500">
                  <Gift size={32} />
              </div>
              <div>
                  <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">Benefit Fulfillment</h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Pack Logistics & Maintenance</p>
              </div>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-blue-50 shadow-lg flex items-center gap-4">
              <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Pool</p>
                  <p className="text-xl font-black text-blue-900">{filteredClaims.length} Records</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Activity size={24} />
              </div>
          </div>
      </div>

      {/* FILTER CONSOLE */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Omni Search</label>
                <div className="relative">
                    <Search className="absolute left-4 top-3 text-slate-300" size={18} />
                    <input className={`${inputClass} pl-12 bg-white`} placeholder="SEARCH BY NAME / REG CODE / LOAN..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Organization</label>
                <select className={`${inputClass} bg-white`} value={filterCompany} onChange={e => {setFilterCompany(e.target.value); setFilterBranch('');}}>
                    <option value="">All Entities</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Branch Node</label>
                <select className={`${inputClass} bg-white`} value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCompany}>
                    <option value="">All Stations</option>
                    {(filterCompany ? COMPANY_BRANCH_MAPPING[filterCompany] || [] : []).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
          </div>
      </div>

      {/* DATA STREAM */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-50">
                  <thead className="bg-slate-950">
                      <tr>
                          <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                             Benefit Identity Matrix (Company / Branch / Customer / Claim Code / Reg Code / Pack Type)
                          </th>
                          <th className="px-10 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Control</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 bg-white">
                      {filteredClaims.length === 0 ? (
                        <tr><td colSpan={2} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic tracking-widest">No matching benefit records identified</td></tr>
                      ) : (
                        filteredClaims.map(c => {
                            const isExpanded = expandedId === c.id;
                            const packLabel = c.claimType === 'PREGNANCY' ? 'PREGNANCY PACK' : 'STATIONERY PACK';
                            
                            return (
                                <React.Fragment key={c.id}>
                                    <tr className={`hover:bg-emerald-50/20 transition-all group ${isExpanded ? 'bg-emerald-50/40' : ''}`}>
                                        <td className="px-10 py-8">
                                            <div className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-700 transition-colors">
                                                {c.company} <span className="text-slate-300 mx-2">/</span> 
                                                {c.branch} <span className="text-slate-300 mx-2">/</span> 
                                                {c.customerName} <span className="text-slate-300 mx-2">/</span> 
                                                {c.shortCode || 'N/A'} <span className="text-slate-300 mx-2">/</span> 
                                                <span className="text-indigo-600 font-mono">{c.customerInsuranceId}</span> <span className="text-slate-300 mx-2">/</span> 
                                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px]">{packLabel}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            {canProcess ? (
                                                <button 
                                                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                                                  className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2 ml-auto ${isExpanded ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-slate-950 hover:bg-slate-950 hover:text-white'}`}
                                                >
                                                    {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                                    {isExpanded ? 'Close Console' : 'Process Pack'}
                                                </button>
                                            ) : (
                                                <div className="flex justify-end gap-2 text-[10px] font-black text-slate-300 uppercase italic"><Lock size={14}/> Encrypted Access</div>
                                            )}
                                        </td>
                                    </tr>
                                    
                                    {isExpanded && (
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={2} className="px-10 py-12 border-b border-blue-100">
                                                <div className="animate-in slide-in-from-top-4 duration-500 space-y-10">
                                                    
                                                    {/* CASE 1: EDUCATION (Schol / OL) */}
                                                    {c.claimType === 'EDUCATION' && (
                                                        <div className="space-y-8">
                                                            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg"><BookOpen size={24}/></div>
                                                                    <h4 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Academic Support Ledger</h4>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleAddYear(c.id)}
                                                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
                                                                >
                                                                    <CalendarPlus size={16}/> Add Phase Year
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                                                {(c.yearlyPacks || []).length === 0 ? (
                                                                    <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                                                                        <p className="text-slate-400 font-black uppercase text-xs">No active phase years logged. Add a year to initialize tracking.</p>
                                                                    </div>
                                                                ) : (
                                                                    c.yearlyPacks?.sort((a,b)=>a.year - b.year).map(p => (
                                                                        <div key={p.year} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all shadow-xl ${p.status === 'Delivered' ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100'}`}>
                                                                            <div className="flex justify-between items-center mb-8">
                                                                                <span className="text-3xl font-black text-blue-900 font-mono">{p.year}</span>
                                                                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${p.status === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                                                                    {p.status}
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-5">
                                                                                <div>
                                                                                    <label className={labelClass}>Member Integrity Status</label>
                                                                                    <select 
                                                                                        className={inputClass}
                                                                                        value={p.customerStatus || 'Active'}
                                                                                        onChange={e => handleUpdateYearlyPack(c.id, p.year, { customerStatus: e.target.value as any })}
                                                                                    >
                                                                                        <option value="Active">Active</option>
                                                                                        <option value="Left">Non Active</option>
                                                                                    </select>
                                                                                </div>
                                                                                <div>
                                                                                    <label className={labelClass}>Deliver Date</label>
                                                                                    <div className="relative">
                                                                                        <input 
                                                                                            type="date" 
                                                                                            className={inputClass} 
                                                                                            value={p.date || ''} 
                                                                                            onChange={e => handleUpdateYearlyPack(c.id, p.year, { date: e.target.value, status: e.target.value ? 'Delivered' : 'Pending' })} 
                                                                                        />
                                                                                        <Calendar size={14} className="absolute right-3 top-3 text-slate-300 pointer-events-none" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* CASE 2: PREGNANCY */}
                                                    {c.claimType === 'PREGNANCY' && (
                                                        <div className="bg-white p-10 rounded-[3rem] border border-blue-50 shadow-2xl relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-emerald-600 rotate-12"><Baby size={180}/></div>
                                                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                                                                <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-xl"><Baby size={28}/></div>
                                                                <div>
                                                                    <h4 className="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">Pregnancy Support Dispatch</h4>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Maternity Logistics Protocol</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                                                <div className="space-y-4">
                                                                    <label className={labelClass}>Request Date</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="date" 
                                                                            className={`${inputClass} py-4 px-6 text-sm`} 
                                                                            value={c.packRequestDate || ''} 
                                                                            onChange={e => onUpdateClaim(c.id, { packRequestDate: e.target.value })} 
                                                                        />
                                                                        <Clock size={18} className="absolute right-4 top-4 text-slate-300 pointer-events-none" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <label className={labelClass}>Delivered Date</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="date" 
                                                                            className={`${inputClass} py-4 px-6 text-sm ${c.packDeliveredDate ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-50' : ''}`} 
                                                                            value={c.packDeliveredDate || ''} 
                                                                            onChange={e => onUpdateClaim(c.id, { packDeliveredDate: e.target.value })} 
                                                                        />
                                                                        <CheckCircle2 size={18} className={`absolute right-4 top-4 pointer-events-none ${c.packDeliveredDate ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-12 flex justify-end">
                                                                <button 
                                                                    onClick={() => {
                                                                        if (c.packDeliveredDate && c.packRequestDate) {
                                                                            alert("DISPATCH PROTOCOL FINALIZED.");
                                                                            setExpandedId(null);
                                                                        } else {
                                                                            alert("PLEASE ENSURE BOTH DATES ARE LOGGED.");
                                                                        }
                                                                    }}
                                                                    className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-3 border-b-8 border-black hover:border-emerald-700"
                                                                >
                                                                    <ShieldCheck size={20}/> Finalize Logistics Entry
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default StationeryPregnancyPack;
