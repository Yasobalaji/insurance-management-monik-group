
import React, { useState, useMemo } from 'react';
import { BaseClaimData } from '../types';
import { CheckCircle, Filter, Search, FileSpreadsheet, Calendar, ChevronRight, Eye, Landmark, User, FileText, BadgeInfo, X, Share2 } from 'lucide-react';
import Modal from './Modal';
import { COMPANIES, COMPANY_BRANCH_MAPPING, CLAIM_TYPES } from '../constants';

interface Props {
  claims: BaseClaimData[];
  userBranches?: string[];
  userCompanies?: string[];
  isGlobal?: boolean;
}

const CompletedClaims: React.FC<Props> = ({ claims, userBranches, userCompanies, isGlobal }) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('Completed');
  const [filterSearch, setFilterSearch] = useState('');
  const [viewingClaim, setViewingClaim] = useState<BaseClaimData | null>(null);

  const completed = useMemo(() => {
    return claims.filter(c => {
        if (filterStatus && c.status !== filterStatus) return false;
        if (!filterStatus && c.status !== 'Completed') return false;
        
        if (filterCompany && c.company !== filterCompany) return false;
        if (filterBranch && c.branch !== filterBranch) return false;
        if (filterType && c.claimType !== filterType) return false;
        if (filterSearch) {
            const s = filterSearch.toLowerCase();
            return c.customerName.toLowerCase().includes(s) || c.loanNumber.toLowerCase().includes(s) || c.customerInsuranceId.toLowerCase().includes(s);
        }
        return true;
    }).sort((a,b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
  }, [claims, filterCompany, filterBranch, filterType, filterStatus, filterSearch]);

  const handleWhatsAppShare = (claim: BaseClaimData) => {
    const text = encodeURIComponent(`*MONIK GROUP - ARCHIVED CLAIM VOUCHER*\n\nIdentity: ${claim.customerName}\nStatus: ${claim.status}\nValue: LKR ${claim.approvedCashAmount}\nPaid Date: ${claim.paymentDate}\n\nThis record is permanently archived in the Insurance Silo.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ["Company", "Loan Code", "Branch", "Loan No", "Customer Name", "Claim Type", "Beneficiary", "Paid Date", "Amount"];
    const rows = completed.map(c => [
        c.company,
        c.shortCode || 'N/A',
        c.branch,
        c.loanNumber,
        c.customerName,
        c.claimType,
        c.beneficiary,
        c.paymentDate,
        c.approvedCashAmount || '0'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Completed_Claims_Report_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  const labelClass = "block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "w-full border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-600 bg-white text-slate-800 shadow-sm border transition-all";

  const renderDetail = (label: string, value: string | undefined) => (
    <div className="flex justify-between border-b border-slate-50 py-3">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-bold text-slate-800 uppercase">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl"><CheckCircle className="text-white w-8 h-8" /></div>
            <div>
              <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">COMPLETED CLAIMS</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Disbursement Registry & Archives</p>
            </div>
        </div>
        <button onClick={handleExportCSV} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all"><FileSpreadsheet size={16} /> Download CSV Registry</button>
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.06)] border border-blue-100 flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                  <Filter size={24} />
                </div>
                <h2 className="text-slate-900 font-black uppercase text-lg tracking-tighter leading-none">Filters</h2>
            </div>
            <button 
              onClick={() => { setFilterCompany(''); setFilterBranch(''); setFilterType(''); setFilterStatus('Completed'); setFilterSearch(''); }}
              className="bg-slate-100 text-slate-500 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-200 hover:bg-red-50 hover:text-red-600"
            >
                <X size={14}/> Clear Context
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
            <div>
                <label className={labelClass}>Record Identity</label>
                <div className="relative">
                  <input type="text" className={inputClass} placeholder="ID / NAME..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
                  <Search className="absolute right-3 top-2.5 text-slate-300" size={16} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Organization</label>
                <select className={inputClass} value={filterCompany} onChange={e => {setFilterCompany(e.target.value); setFilterBranch('');}}>
                    <option value="">ALL ENTITIES</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Station</label>
                <select className={inputClass} value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCompany}>
                    <option value="">ALL NODES</option>
                    {(filterCompany ? (COMPANY_BRANCH_MAPPING[filterCompany] || []) : []).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Lifecycle</label>
                <select className={inputClass} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="Completed">COMPLETED</option>
                    <option value="Rejected">REJECTED</option>
                </select>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200/50">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-50">
                  <thead className="bg-slate-950">
                      <tr>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Org & Branch</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Code / No</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer & Type</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Date</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (LKR)</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Hub</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 bg-white">
                      {completed.length === 0 ? (
                        <tr><td colSpan={6} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic tracking-widest">No matching finalized records found in history</td></tr>
                      ) : (
                        completed.map(c => (
                            <tr key={c.id} className="hover:bg-emerald-50/20 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-black text-slate-900 uppercase">{c.company}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">{c.branch}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-black text-indigo-600 uppercase">CODE: {c.shortCode || 'DTH'}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">LN: {c.loanNumber}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-xs font-black text-blue-900 uppercase">{c.customerName}</div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{c.claimType} • {c.beneficiary}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-black text-slate-700 uppercase flex items-center gap-1 font-mono"><Calendar size={12} className="text-slate-400"/> {c.paymentDate}</div>
                                </td>
                                <td className="px-8 py-5 text-right font-mono font-black text-emerald-700">
                                    {c.approvedCashAmount}
                                </td>
                                <td className="px-8 py-5 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleWhatsAppShare(c)}
                                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                            title="WhatsApp Business Send Option"
                                        >
                                            <Share2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => setViewingClaim(c)}
                                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-blue-800 hover:text-white transition-all shadow-sm"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {viewingClaim && (
          <Modal isOpen={!!viewingClaim} onClose={() => setViewingClaim(null)} title="COMPLETED RECORD ARCHIVE">
            <div className="space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-3xl border-b-8 border-emerald-500">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.25em] mb-1">RECORD IDENTIFIER</p>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">{viewingClaim.customerName}</h3>
                            <p className="text-xs font-black text-slate-400 mt-1">INS ID: {viewingClaim.customerInsuranceId}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl text-center">
                            <span className="block text-[8px] font-black uppercase text-slate-500 mb-1">TOTAL DISBURSED</span>
                            <span className="text-lg font-black text-emerald-400 font-mono">LKR {viewingClaim.approvedCashAmount}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Landmark className="text-blue-400 w-4 h-4 mb-2" />
                            <p className="text-[8px] font-black text-slate-500 uppercase">Station</p>
                            <p className="text-[10px] font-black text-white uppercase">{viewingClaim.branch}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <FileText className="text-indigo-400 w-4 h-4 mb-2" />
                            <p className="text-[8px] font-black text-slate-500 uppercase">Loan No</p>
                            <p className="text-[10px] font-black text-white uppercase">{viewingClaim.loanNumber}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <User className="text-amber-400 w-4 h-4 mb-2" />
                            <p className="text-[8px] font-black text-slate-500 uppercase">Beneficiary</p>
                            <p className="text-[10px] font-black text-white uppercase">{viewingClaim.beneficiary}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Calendar className="text-emerald-400 w-4 h-4 mb-2" />
                            <p className="text-[8px] font-black text-slate-500 uppercase">Paid On</p>
                            <p className="text-[10px] font-black text-white uppercase">{viewingClaim.paymentDate}</p>
                        </div>
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2"><BadgeInfo size={14} /> Full Registry Metadata</h4>
                    {renderDetail("Parent Organization", viewingClaim.company)}
                    {renderDetail("Claim Classification", viewingClaim.claimType)}
                    {renderDetail("Identification (NIC/DL)", viewingClaim.idNumber)}
                    {renderDetail("Payment Recipient", viewingClaim.paymentParty)}
                    {renderDetail("Processed Audit Officer", viewingClaim.auditOfficer)}
                    {renderDetail("Reference Batch ID", viewingClaim.id)}
                </div>
            </div>
          </Modal>
      )}
    </div>
  );
};

export default CompletedClaims;
