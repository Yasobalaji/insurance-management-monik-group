
import React, { useState, useMemo } from 'react';
import { BaseClaimData, YearlyPackStatus, LaptopData } from '../types';
import { 
  Gift, Filter, Calendar, CheckCircle, XCircle, Clock, 
  ChevronDown, ChevronUp, AlertCircle, Save, Package, 
  Laptop, Baby, BookOpen, Layers, Search, UserCheck, Check
} from 'lucide-react';
import { COMPANIES, COMPANY_BRANCH_MAPPING } from '../constants';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
}

const PackMaintain: React.FC<Props> = ({ claims, onUpdateClaim }) => {
  const [selectedCats, setSelectedCats] = useState<string[]>(['Scholarship', 'GCE_OL', 'Pregnancy', 'Laptop']);
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { id: 'Scholarship', label: 'Grade 5 Scholarship', icon: <BookOpen size={14}/> },
    { id: 'GCE_OL', label: 'GCE (O/L)', icon: <Layers size={14}/> },
    { id: 'Pregnancy', label: 'Pregnancy Pack', icon: <Baby size={14}/> },
    { id: 'Laptop', label: 'Laptop Loan', icon: <Laptop size={14}/> }
  ];

  const toggleCat = (id: string) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      // Must be approved to be maintained
      if (c.status !== 'Approved' && c.status !== 'Completed' && c.status !== 'Cash Requested') return false;
      
      // Filter by approved benefit type (Pack, Both, Laptop)
      // User requested: "pack, laptop show under maintance"
      const hasMaintenanceBenefit = c.approvedBenefitType === 'Pack' || c.approvedBenefitType === 'Both' || c.approvedBenefitType === 'Other';
      if (!hasMaintenanceBenefit && !c.laptopData) return false;

      const isSchol = selectedCats.includes('Scholarship') && c.educationData?.examType === 'Scholarship';
      const isOL = selectedCats.includes('GCE_OL') && c.educationData?.examType === 'GCE_OL';
      const isPreg = selectedCats.includes('Pregnancy') && c.claimType === 'PREGNANCY';
      const isLap = selectedCats.includes('Laptop') && (c.educationData?.laptopReq === 'Yes' || !!c.laptopData);
      
      if (!isSchol && !isOL && !isPreg && !isLap) return false;
      if (filterCompany && c.company !== filterCompany) return false;
      if (filterBranch && c.branch !== filterBranch) return false;
      return true;
    });
  }, [claims, selectedCats, filterCompany, filterBranch]);

  const getRequiredYears = (claim: BaseClaimData) => {
    const type = claim.educationData?.examType;
    const baseYear = claim.educationData?.examYear ? parseInt(claim.educationData.examYear) : new Date(claim.timestamp).getFullYear();
    const count = type === 'Scholarship' ? 6 : (type === 'GCE_OL' ? 2 : 0);
    return Array.from({ length: count }, (_, i) => baseYear + i);
  };

  const handleUpdatePackStatus = (claimId: string, year: number, updates: Partial<YearlyPackStatus>) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    const existingPacks = claim.yearlyPacks || [];
    const packIndex = existingPacks.findIndex(p => p.year === year);
    let newPacks = [...existingPacks];
    if (packIndex > -1) {
      newPacks[packIndex] = { ...newPacks[packIndex], ...updates };
    } else {
      newPacks.push({ year, status: 'Pending', ...updates });
    }
    onUpdateClaim(claimId, { yearlyPacks: newPacks });
  };

  const handleUpdateLaptop = (id: string, updates: Partial<LaptopData>) => {
    const claim = claims.find(c => c.id === id);
    const existing = claim?.laptopData || { loanNumber: '', period: '', installment: '', disbursementDate: '', totalPaid: '', status: 'Active' };
    onUpdateClaim(id, { laptopData: { ...existing, ...updates } });
  };

  const getPackData = (claim: BaseClaimData, year: number): YearlyPackStatus => {
    return claim.yearlyPacks?.find(p => p.year === year) || { year, status: 'Pending' };
  };

  const inputClass = "w-full border-slate-200 rounded-xl text-[11px] font-bold p-2.5 uppercase focus:ring-2 focus:ring-purple-500 bg-white text-slate-800 shadow-sm border transition-all";
  const labelClass = "block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5";
  const darkInputClass = "w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-black text-emerald-400 font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-none";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      
      {/* MULTI-SELECT CATEGORY HEADER */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-blue-50 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="flex items-center gap-6">
          <div className="bg-purple-600 p-4 rounded-3xl text-white shadow-xl"><Gift size={32} /></div>
          <div>
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">Maintenance Console</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage pack delivery and specialized asset fulfillment</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
           {categories.map(c => (
             <button 
               key={c.id} 
               onClick={() => toggleCat(c.id)}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${selectedCats.includes(c.id) ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-purple-200'}`}
             >
               {c.icon} {c.label} {selectedCats.includes(c.id) && <Check size={12} strokeWidth={4} />}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div><label className={labelClass}>Company</label><select className={inputClass} value={filterCompany} onChange={e => {setFilterCompany(e.target.value); setFilterBranch('');}}><option value="">ALL COMPANIES</option>{COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className={labelClass}>Branch</label><select className={inputClass} value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCompany}><option value="">ALL BRANCHES</option>{(filterCompany ? COMPANY_BRANCH_MAPPING[filterCompany] || [] : []).map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div className="md:col-span-2 flex items-end"><div className="relative w-full"><input type="text" className={inputClass} placeholder="SEARCH BY NAME / LOAN..." /><Search className="absolute right-3 top-2.5 text-slate-300" size={16} /></div></div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-100">
        <table className="min-w-full divide-y divide-blue-50">
          <thead className="bg-slate-50 font-black text-[10px] uppercase text-slate-400">
            <tr>
              <th className="px-8 py-5 text-left tracking-widest">Beneficiary Identity</th>
              <th className="px-8 py-5 text-left tracking-widest">Benefit Classification</th>
              <th className="px-8 py-5 text-center tracking-widest">Fulfillment State</th>
              <th className="px-8 py-5 text-right tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50 bg-white">
            {filteredClaims.length === 0 ? (
              <tr><td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic">No active maintenance records identified</td></tr>
            ) : (
              filteredClaims.map(c => {
                const isExpanded = expandedId === c.id;
                const phaseCount = getRequiredYears(c).length;
                const deliveredCount = (c.yearlyPacks || []).filter(p => p.status === 'Delivered').length;
                
                return (
                  <React.Fragment key={c.id}>
                    <tr className={`hover:bg-sky-50/20 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-blue-900 uppercase">{c.customerName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{c.loanNumber} • {c.branch}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-purple-100">
                          {c.claimType === 'PREGNANCY' ? 'PREGNANCY PACK' : (c.educationData?.examType || 'EDUCATION ASSET')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                         {phaseCount > 0 ? (
                           <div className="flex flex-col items-center gap-1.5">
                             <span className="text-[9px] font-black text-slate-500 uppercase">{deliveredCount} / {phaseCount} YEARS</span>
                             <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(deliveredCount / phaseCount) * 100}%` }} /></div>
                           </div>
                         ) : (
                           <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${c.packDeliveredDate ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{c.packDeliveredDate ? 'Fulfilled' : 'Awaiting'}</span>
                         )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className={`p-3 rounded-2xl transition-all border ${isExpanded ? 'bg-blue-800 text-white border-blue-900' : 'bg-white text-slate-400 border-slate-100 hover:text-blue-600 shadow-sm'}`}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50/40">
                        <td colSpan={4} className="p-10 border-b border-blue-50">
                          <div className="animate-in slide-in-from-top-2 duration-300">
                             
                             {phaseCount > 0 && (
                               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                  {getRequiredYears(c).map(year => {
                                    const p = getPackData(c, year);
                                    return (
                                      <div key={year} className={`p-8 rounded-[2rem] border-2 transition-all shadow-xl ${p.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                                         <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                               <Calendar size={18} className="text-purple-600" />
                                               <h4 className="text-lg font-black text-slate-900 uppercase">{year} Phase</h4>
                                            </div>
                                            <select className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border-2 ${p.status === 'Delivered' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-500'}`} value={p.status} onChange={e => handleUpdatePackStatus(c.id, year, { status: e.target.value as any })}>
                                               <option value="Pending">Pending</option><option value="Delivered">Delivered</option><option value="Canceled">Canceled</option>
                                            </select>
                                         </div>
                                         <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                               <div><label className={labelClass}>Cycle Loan No</label><input className={inputClass} value={p.loanNumber || ''} onChange={e => handleUpdatePackStatus(c.id, year, { loanNumber: e.target.value })} /></div>
                                               <div><label className={labelClass}>Member Status</label><select className={inputClass} value={p.customerStatus || 'Active'} onChange={e => handleUpdatePackStatus(c.id, year, { customerStatus: e.target.value as any })}><option value="Active">ACTIVE</option><option value="Left">LEFT</option></select></div>
                                            </div>
                                            <div><label className={labelClass}>Release Date</label><input type="date" className={inputClass} value={p.date || ''} onChange={e => handleUpdatePackStatus(c.id, year, { date: e.target.value })} /></div>
                                            <div><label className={labelClass}>Other Remarks</label><textarea className={`${inputClass} h-16 normal-case py-2`} value={p.other || ''} onChange={e => handleUpdatePackStatus(c.id, year, { other: e.target.value })} /></div>
                                         </div>
                                      </div>
                                    );
                                  })}
                               </div>
                             )}

                             {c.claimType === 'EDUCATION' && c.educationData?.laptopReq === 'Yes' && (
                               <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400 rotate-12"><Laptop size={120} /></div>
                                  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                                     <div className="bg-emerald-600 p-3 rounded-2xl text-slate-900 shadow-xl"><Laptop size={28} /></div>
                                     <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Laptop Finance Tracking</h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10 relative z-10">
                                     <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Laptop Loan No</label><input className={darkInputClass} value={c.laptopData?.loanNumber || ''} onChange={e => handleUpdateLaptop(c.id, { loanNumber: e.target.value })} /></div>
                                     <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Agreement Period</label><input className={darkInputClass} value={c.laptopData?.period || ''} onChange={e => handleUpdateLaptop(c.id, { period: e.target.value })} /></div>
                                     <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Instalment</label><input className={darkInputClass} value={c.laptopData?.installment || ''} onChange={e => handleUpdateLaptop(c.id, { installment: e.target.value })} /></div>
                                     <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Disbursement Date</label><input type="date" className={darkInputClass} value={c.laptopData?.disbursementDate || ''} onChange={e => handleUpdateLaptop(c.id, { disbursementDate: e.target.value })} /></div>
                                     <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Accumulation Paid</label><input className={darkInputClass} value={c.laptopData?.totalPaid || ''} onChange={e => handleUpdateLaptop(c.id, { totalPaid: e.target.value })} /></div>
                                     <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loan Status</label><select className={darkInputClass} value={c.laptopData?.status || 'Active'} onChange={e => handleUpdateLaptop(c.id, { status: e.target.value as any })}><option value="Active">ACTIVE</option><option value="Settled">SETTLED</option><option value="Arrears">ARREARS</option></select></div>
                                     <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Delivery Handover</label><input type="date" className={darkInputClass} value={c.packDeliveredDate || ''} onChange={e => onUpdateClaim(c.id, { packDeliveredDate: e.target.value })} /></div>
                                  </div>
                                  <div className="flex justify-end"><button className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all flex items-center gap-2"><Save size={18}/> Commit Finance Profile</button></div>
                               </div>
                             )}

                             {c.claimType === 'PREGNANCY' && (
                               <div className="bg-white p-10 rounded-[2.5rem] border border-blue-50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
                                  <div className="flex items-center gap-6">
                                     <div className="bg-blue-800 p-5 rounded-[2rem] text-white shadow-xl"><Baby size={32} /></div>
                                     <div>
                                        <h4 className="text-2xl font-black text-blue-900 uppercase leading-none">Pregnancy Welfare Pack</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Maternity Support Logistics</p>
                                     </div>
                                  </div>
                                  <div className="flex flex-wrap gap-8 items-end">
                                     <div className="space-y-2"><label className={labelClass}>Pack Request Date</label><input type="date" className={inputClass} value={c.packRequestDate || ''} onChange={e => onUpdateClaim(c.id, { packRequestDate: e.target.value })} /></div>
                                     <div className="space-y-2"><label className={labelClass}>Handover Date</label><input type="date" className={inputClass} value={c.packDeliveredDate || ''} onChange={e => onUpdateClaim(c.id, { packDeliveredDate: e.target.value })} /></div>
                                     <button className="bg-blue-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 flex items-center gap-2"><Save size={16}/> Update Status</button>
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
  );
};

export default PackMaintain;
