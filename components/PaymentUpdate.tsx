
import React, { useState, useMemo } from 'react';
import { BaseClaimData } from '../types';
import { CreditCard, History, Search, CalendarCheck, Eye, CheckCircle2, User, UserCheck, Landmark, X, FileText, Info, ShieldCheck } from 'lucide-react';
import { COMPANIES, BRANCHES, COMPANY_BRANCH_MAPPING } from '../constants';
import Modal from './Modal';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  userBranches?: string[];
  userCompanies?: string[];
  isGlobal?: boolean;
}

const PaymentUpdate: React.FC<Props> = ({ claims, onUpdateClaim, userBranches, userCompanies, isGlobal }) => {
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  // UI States
  const [selectedForView, setSelectedForView] = useState<BaseClaimData | null>(null);
  const [selectedForUpdate, setSelectedForUpdate] = useState<BaseClaimData | null>(null);
  
  // Update Form States
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payParty, setPayParty] = useState<'Customer' | 'Branch'>('Customer');

  const availableCompanies = useMemo(() => isGlobal ? COMPANIES : userCompanies || [], [isGlobal, userCompanies]);
  
  const availableBranches = useMemo(() => {
    let list = filterCompany ? (COMPANY_BRANCH_MAPPING[filterCompany] || []) : (isGlobal ? BRANCHES : []);
    return list.filter(b => isGlobal || userBranches?.some(ub => ub.includes(b)));
  }, [filterCompany, isGlobal, userBranches]);

  const approvedClaims = useMemo(() => {
    return claims.filter(c => {
        // According to new workflow, only 'Cash Requested' claims show here for final update
        // Fix: Removed redundant status comparison that caused unintentional overlap warning
        if (c.status !== 'Cash Requested') return false;
        
        if (filterCompany && c.company !== filterCompany) return false;
        if (filterBranch && c.branch !== filterBranch) return false;
        if (filterSearch) {
            const s = filterSearch.toLowerCase();
            return c.customerName.toLowerCase().includes(s) || c.loanNumber.toLowerCase().includes(s);
        }
        return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [claims, filterSearch, filterCompany, filterBranch]);

  const handleFinalUpdate = () => {
      if (!selectedForUpdate) return;
      
      // Update with all requested fields plus setting status to 'Completed'
      onUpdateClaim(selectedForUpdate.id, { 
          status: 'Completed', // Final Lifecycle Status
          paymentStatus: 'Paid', 
          paymentDate: payDate, 
          paymentParty: payParty,
          loanStatus: 'Completed'
      });
      
      setSelectedForUpdate(null);
  };

  const renderReadOnlyDetail = (label: string, value: string | number | undefined | null) => (
    <div className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">{label}</span>
      <span className="text-[10px] font-bold text-slate-300 uppercase text-right ml-4">{value || '-'}</span>
    </div>
  );

  const labelClass = "block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider";
  const inputClass = "w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-800";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl"><History className="text-white w-8 h-8" /></div>
        <div>
            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">PAYMENT UPDATE</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Confirm disbursement to target beneficiary</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Search Records</label>
                <div className="relative">
                    <input type="text" className={inputClass} placeholder="NAME / LOAN..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
                    <Search className="absolute right-3 top-2.5 text-slate-300" size={16} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Organization</label>
                <select className={inputClass} value={filterCompany} onChange={e => { setFilterCompany(e.target.value); setFilterBranch(''); }}>
                    <option value="">ALL COMPANIES</option>
                    {availableCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Station</label>
                <select className={inputClass} value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCompany && !isGlobal}>
                    <option value="">ALL BRANCHES</option>
                    {availableBranches.map(b => <option key={b} value={b} className="bg-white text-black">{b}</option>)}
                </select>
              </div>
          </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-50">
                  <thead className="bg-slate-900">
                      <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer / Identity</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Status</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Value</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Control</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 bg-white">
                      {approvedClaims.length === 0 ? (
                        <tr><td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic tracking-[0.2em]">No Pending 'Cash Requested' records identified</td></tr>
                      ) : (
                        approvedClaims.map(c => (
                            <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="text-xs font-black text-blue-900 uppercase">{c.customerName}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.loanNumber} • {c.branch}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{c.status}</span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="text-sm font-black text-emerald-600 font-mono">LKR {c.approvedCashAmount}</div>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setSelectedForView(c)}
                                            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-200"
                                            title="View Full Claim Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedForUpdate(c); setPayDate(new Date().toISOString().split('T')[0]); setPayParty('Customer'); }}
                                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 flex items-center gap-2 active:scale-95 transition-all"
                                        >
                                            <CheckCircle2 size={14} /> Mark Paid
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

      {/* UPDATE PAYMENT MODAL */}
      {selectedForUpdate && (
          <Modal isOpen={!!selectedForUpdate} onClose={() => setSelectedForUpdate(null)} title="EXECUTE PAYMENT VERIFICATION">
              <div className="space-y-8">
                  <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-3xl flex items-center gap-6">
                      <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl text-white">
                          <Landmark size={24} />
                      </div>
                      <div className="flex-1">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Authorization Target</p>
                          <h3 className="text-xl font-black text-blue-900 uppercase">{selectedForUpdate.customerName}</h3>
                          <div className="flex items-center gap-4 mt-2">
                              <span className="text-[11px] font-black text-slate-500 font-mono">#{selectedForUpdate.id.toUpperCase()}</span>
                              <span className="text-lg font-black text-emerald-700 font-mono">LKR {selectedForUpdate.approvedCashAmount}</span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                          <label className={labelClass}>Paid Date</label>
                          <div className="relative">
                            <input type="date" className={inputClass} value={payDate} onChange={e => setPayDate(e.target.value)} />
                          </div>
                      </div>
                      <div className="space-y-4">
                          <label className={labelClass}>Receiving Party / Recipient</label>
                          <select className={inputClass} value={payParty} onChange={e => setPayParty(e.target.value as any)}>
                              <option value="Customer">CUSTOMER</option>
                              <option value="Branch">BRANCH ACCOUNT / MANAGER</option>
                          </select>
                      </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border-t-8 border-emerald-500 shadow-2xl">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="bg-white/10 p-3 rounded-2xl"><UserCheck className="text-emerald-400 w-6 h-6" /></div>
                          <h4 className="text-white font-black uppercase tracking-widest text-sm">Disbursement Commitment</h4>
                      </div>
                      <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 uppercase tracking-tight">
                          By confirming, you verify that the amount of <span className="text-emerald-400 font-black">LKR {selectedForUpdate.approvedCashAmount}</span> has been successfully disbursed. This action will mark the claim as <span className="text-emerald-400 font-black">COMPLETED</span> and is irreversible.
                      </p>
                      <button 
                        onClick={handleFinalUpdate}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                          <CheckCircle2 size={18} /> Confirm Payment Execution
                      </button>
                  </div>
              </div>
          </Modal>
      )}

      {/* VIEW CLAIM MODAL */}
      {selectedForView && (
          <Modal isOpen={!!selectedForView} onClose={() => setSelectedForView(null)} title="CLAIM ARCHIVE RECORD">
              <div className="space-y-8 bg-slate-950 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
                  <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                  
                  <div className="border-b border-white/10 pb-6 flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">ARCHIVE DATA ACCESS</p>
                        <h2 className="text-2xl font-black uppercase leading-tight">{selectedForView.customerName}</h2>
                        <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">REF: {selectedForView.id.toUpperCase()} • LOAN: {selectedForView.loanNumber}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <span className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">CLAIM TYPE</span>
                        <span className="text-xs font-black text-emerald-400 uppercase">{selectedForView.claimType}</span>
                      </div>
                  </div>

                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-emerald-400 font-black text-[10px] uppercase tracking-[0.25em]">
                            <Landmark size={12} /> Organizational Hierarchy
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-12">
                            {renderReadOnlyDetail("Operating Entity", selectedForView.company)}
                            {renderReadOnlyDetail("Station / Branch", selectedForView.branch)}
                            {renderReadOnlyDetail("NIC / ID Credentials", selectedForView.idNumber)}
                            {renderReadOnlyDetail("Principal Disbursed", selectedForView.loanAmount)}
                            {renderReadOnlyDetail("Account Standing", selectedForView.loanStatus)}
                            {renderReadOnlyDetail("Repayment Accumulation", selectedForView.totalPaid)}
                            {renderReadOnlyDetail("Outstanding Arrears", selectedForView.arrears)}
                            {selectedForView.arrearsReason && renderReadOnlyDetail("Arrears Context", selectedForView.arrearsReason)}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-4 text-blue-400 font-black text-[10px] uppercase tracking-[0.25em]">
                            <FileText size={12} /> Claim Specific Data
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            {selectedForView.claimType === 'DEATH' && selectedForView.deathData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                    {selectedForView.deathData.deceasedName && renderReadOnlyDetail("Deceased Party", selectedForView.deathData.deceasedName)}
                                    {renderReadOnlyDetail("Date of Death", selectedForView.deathData.dateOfDeath)}
                                    {renderReadOnlyDetail("Cause / Nature", selectedForView.deathData.natureOfDeath)}
                                    {renderReadOnlyDetail("Payment Phase", selectedForView.deathData.paymentType)}
                                </div>
                            )}
                            {selectedForView.claimType === 'HOSPITAL' && selectedForView.hospitalData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                    {selectedForView.hospitalData.admittedName && renderReadOnlyDetail("Patient Profile", selectedForView.hospitalData.admittedName)}
                                    {renderReadOnlyDetail("Medical Center", selectedForView.hospitalData.hospitalName)}
                                    {renderReadOnlyDetail("Admission Date", selectedForView.hospitalData.dateAdmit)}
                                    {renderReadOnlyDetail("Discharge Date", selectedForView.hospitalData.dateDischarge)}
                                    {renderReadOnlyDetail("Duration (Days)", selectedForView.hospitalData.totalAdmitedDays)}
                                </div>
                            )}
                            {selectedForView.claimType === 'EDUCATION' && selectedForView.educationData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                    {renderReadOnlyDetail("Education Level", selectedForView.educationData.examType)}
                                    {renderReadOnlyDetail("Academic Year", selectedForView.educationData.examYear)}
                                    {renderReadOnlyDetail("Educational Entity", selectedForView.educationData.school)}
                                    {renderReadOnlyDetail("Result Output", selectedForView.educationData.results)}
                                </div>
                            )}
                            {selectedForView.claimType === 'MARRIAGE' && selectedForView.marriageData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                    {renderReadOnlyDetail("Marriage Registry Date", selectedForView.marriageData.dateMarriage)}
                                    {renderReadOnlyDetail("Dependent Identity", selectedForView.marriageData.childName)}
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-4 text-purple-400 font-black text-[10px] uppercase tracking-[0.25em]">
                            <ShieldCheck size={12} /> Digital Attachments
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            {selectedForView.driveFolderLink ? (
                                <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <ShieldCheck size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">DRIVE REPOSITORY ACCESSIBLE</span>
                                    </div>
                                    <a href={selectedForView.driveFolderLink} target="_blank" rel="noopener noreferrer" className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg text-[9px] font-black uppercase shadow-lg hover:bg-emerald-400 transition-all">Launch Folder</a>
                                </div>
                            ) : (
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center py-4 italic">No digital credentials attached to this record</p>
                            )}
                        </div>
                    </section>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default PaymentUpdate;