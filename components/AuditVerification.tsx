
import React, { useState, useMemo } from 'react';
import { BaseClaimData } from '../types';
import { ShieldCheck, Filter, Search, FileSpreadsheet, Calendar, Activity, CheckCircle2, Clock, X } from 'lucide-react';
import { BRANCHES, COMPANIES, COMPANY_BRANCH_MAPPING, CLAIM_TYPES } from '../constants';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  userBranches?: string[];
  userCompanies?: string[];
  isGlobal?: boolean;
}

const AuditVerification: React.FC<Props> = ({ claims, userBranches, userCompanies, isGlobal }) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterClaimType, setFilterClaimType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() => {
    return claims.filter(c => {
        if (filterCompany && c.company !== filterCompany) return false;
        if (filterBranch && c.branch !== filterBranch) return false;
        if (filterClaimType && c.claimType !== filterClaimType) return false;
        if (filterStatus && c.status !== filterStatus) return false;
        
        if (filterSearch) {
            const s = filterSearch.toLowerCase();
            return (
                c.customerName.toLowerCase().includes(s) || 
                c.loanNumber.toLowerCase().includes(s) || 
                c.customerInsuranceId.toLowerCase().includes(s)
            );
        }
        return true;
    }).sort((a,b) => b.timestamp - a.timestamp);
  }, [claims, filterCompany, filterBranch, filterSearch, filterClaimType, filterStatus]);

  const handleDownload = () => {
    const headers = ["Org ID", "Date", "Customer", "Loan", "Company", "Branch", "Type", "Status", "Amount"];
    const rows = filtered.map(c => [
        c.customerInsuranceId,
        new Date(c.timestamp).toLocaleDateString(),
        c.customerName,
        c.loanNumber,
        c.company,
        c.branch,
        c.claimType,
        c.status,
        c.approvedCashAmount || '0'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Claims_Summary_Report_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  const labelClass = "block text-[9px] font-black text-white/60 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "w-full bg-white/5 border border-white/20 rounded-xl p-3 text-xs font-bold text-white uppercase placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500 focus:bg-white/20 transition-all outline-none shadow-inner";
  const selectClass = "w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs font-bold text-white uppercase focus:ring-2 focus:ring-emerald-500 focus:bg-slate-800 transition-all outline-none";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl shadow-xl border-b-4 border-emerald-500">
                <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">CLAIM SUMMARY</h1>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Verification & Integrity Monitor</p>
            </div>
        </div>
        <button onClick={handleDownload} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-emerald-700 transition-all"><FileSpreadsheet size={16} /> Export Detailed Summary</button>
      </div>

      {/* FILTER CONSOLE - DARK THEME */}
      <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                  <Filter className="text-emerald-500" size={24} />
                  <h2 className="text-white font-black uppercase text-sm tracking-[0.2em]">Filters</h2>
              </div>
              <button 
                    onClick={() => {
                        setFilterSearch(''); setFilterCompany(''); setFilterBranch('');
                        setFilterClaimType(''); setFilterStatus('');
                    }}
                    className="bg-white/5 hover:bg-red-600 text-white/80 hover:text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2"
                >
                    <X size={14} /> Reset Filters
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div>
                <label className={labelClass}>Record Search</label>
                <div className="relative">
                    <input type="text" className={inputClass} placeholder="ID / NAME / LOAN..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
                    <Search className="absolute right-3 top-3 text-white/20" size={16} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Organization</label>
                <select className={selectClass} value={filterCompany} onChange={e => { setFilterCompany(e.target.value); setFilterBranch(''); }}>
                    <option value="" className="bg-slate-900 text-white">ALL COMPANIES</option>
                    {COMPANIES.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Branch Station</label>
                <select className={selectClass} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                    <option value="" className="bg-slate-900 text-white">ALL BRANCHES</option>
                    {BRANCHES.map(b => <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Workflow Status</label>
                <select className={selectClass} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="" className="bg-slate-900 text-white">ANY STATUS</option>
                    <option value="Requested" className="bg-slate-900 text-white">REQUESTED</option>
                    <option value="Approved" className="bg-slate-900 text-white">APPROVED</option>
                    <option value="Completed" className="bg-slate-900 text-white">COMPLETED</option>
                    <option value="Rejected" className="bg-slate-900 text-white">REJECTED</option>
                </select>
            </div>
          </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-50">
                  <thead className="bg-slate-50">
                      <tr>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Ident Status</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer & Station</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Type / Date</th>
                          <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Value (LKR)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 bg-white">
                      {filtered.length === 0 ? (
                        <tr><td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic tracking-[0.2em]">No matching audit records identified</td></tr>
                      ) : (
                        filtered.map(c => (
                            <tr key={c.id} className="hover:bg-sky-50/20 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-black text-emerald-600 font-mono mb-1">{c.customerInsuranceId}</div>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                        c.status === 'Completed' ? 'bg-slate-900 text-white' : 
                                        c.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 
                                        c.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-50 text-blue-700'
                                    }`}>{c.status}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-xs font-black text-blue-900 uppercase">{c.customerName}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">{c.company} • {c.branch}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-black text-slate-700 uppercase">{c.claimType}</div>
                                    <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                                        <Clock size={10} /> Req: {new Date(c.timestamp).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="font-mono font-black text-xs text-blue-900">{c.approvedCashAmount || c.loanAmount}</div>
                                    <div className="text-[8px] font-black text-slate-300 uppercase mt-0.5">Loan: {c.loanNumber}</div>
                                </td>
                            </tr>
                        ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default AuditVerification;
