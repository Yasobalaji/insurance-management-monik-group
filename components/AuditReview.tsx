
import React, { useState, useMemo } from 'react';
import { BaseClaimData, User } from '../types';
import { SearchCheck, Search, Edit3, Save, AlertCircle, Clock, ClipboardList, Info, Landmark, User as UserIcon, FileText, Eye, ShieldCheck, BarChart3, PieChart, Activity, CheckCircle2, Filter, Check, X, ShieldAlert } from 'lucide-react';
import { COMPANIES, BRANCHES, CLAIM_TYPES, COMPANY_BRANCH_MAPPING } from '../constants';
import Modal from './Modal';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  currentUser: User | null;
  isGlobal?: boolean;
}

const AuditReview: React.FC<Props> = ({ claims, onUpdateClaim, currentUser, isGlobal }) => {
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterClaimType, setFilterClaimType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [selectedClaim, setSelectedClaim] = useState<BaseClaimData | null>(null);
  const [auditStatus, setAuditStatus] = useState<'Issue' | 'Not Issue'>('Not Issue');
  const [auditIssue, setAuditIssue] = useState('');

  // Verification States
  const [viewedDocs, setViewedDocs] = useState<Record<string, boolean>>({});
  // Stores document state: 'Verified' | 'Not Verified' | undefined (Pending)
  const [docStates, setDocStates] = useState<Record<string, 'Verified' | 'Not Verified'>>({});
  const [showIssuePopup, setShowIssuePopup] = useState(false);

  const availableBranches = useMemo(() => {
    return filterCompany ? (COMPANY_BRANCH_MAPPING[filterCompany] || []) : (isGlobal ? BRANCHES : []);
  }, [filterCompany, isGlobal]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
        if (filterCompany && c.company !== filterCompany) return false;
        if (filterBranch && c.branch !== filterBranch) return false;
        if (filterClaimType && c.claimType !== filterClaimType) return false;
        if (filterStatus) {
            if (filterStatus === 'Audited' && !c.auditedDate) return false;
            if (filterStatus === 'Pending' && !!c.auditedDate) return false;
        }
        if (filterSearch) {
            const s = filterSearch.toLowerCase();
            return c.customerName.toLowerCase().includes(s) || c.loanNumber.toLowerCase().includes(s);
        }
        return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [claims, filterCompany, filterBranch, filterClaimType, filterStatus, filterSearch]);

  const stats = useMemo(() => {
    const total = filteredClaims.length;
    const audited = filteredClaims.filter(c => !!c.auditedDate).length;
    const balance = total - audited;
    const percentage = total > 0 ? Math.round((audited / total) * 100) : 0;
    return { total, audited, balance, percentage };
  }, [filteredClaims]);

  const getDocuments = (claim: BaseClaimData) => {
    const docs: { key: string, label: string }[] = [];
    const specificData = claim.deathData || claim.hospitalData || claim.educationData || claim.marriageData || claim.pregnancyData || claim.customProductData || {};
    
    Object.keys(specificData).forEach(key => {
      if (key.startsWith('file_')) {
        const label = key.replace('file_', '').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        docs.push({ key, label });
      }
    });
    return docs;
  };

  const handleSaveAudit = () => {
    if (!selectedClaim) return;

    const docs = getDocuments(selectedClaim);
    const allVerified = docs.every(d => docStates[d.key] === 'Verified');

    if (auditStatus === 'Not Issue' && !allVerified && docs.length > 0) {
        alert("VERIFICATION INCOMPLETE: ALL DOCUMENTS MUST BE MARKED 'VERIFIED' BEFORE DECLARING 'NO ISSUE'.");
        return;
    }

    if (auditStatus === 'Issue' && !auditIssue.trim()) {
        alert("SPECIFY DISCREPANCY REMARKS BEFORE SAVING.");
        return;
    }

    if (auditStatus === 'Issue') {
        setShowIssuePopup(true);
    } else {
        executeSave();
    }
  };

  const executeSave = () => {
    if (!selectedClaim) return;
    onUpdateClaim(selectedClaim.id, {
        auditedDate: new Date().toISOString().split('T')[0],
        auditStatus,
        auditIssue: auditStatus === 'Issue' ? auditIssue : '',
        auditOfficer: currentUser?.name || 'Officer'
    });
    setSelectedClaim(null);
    setAuditIssue('');
    setDocStates({});
    setViewedDocs({});
    setShowIssuePopup(false);
    alert("AUDIT RECORD PERMANENTLY ARCHIVED.");
  };

  const setDocVerification = (key: string, state: 'Verified' | 'Not Verified') => {
    if (!viewedDocs[key]) {
        alert("ACCESS DENIED: YOU MUST VIEW THE DOCUMENT CONTENT BEFORE MAKING A DECISION.");
        return;
    }
    setDocStates(prev => ({ ...prev, [key]: state }));
  };

  const handleViewDoc = (key: string, link: string) => {
    setViewedDocs(prev => ({ ...prev, [key]: true }));
    window.open(link, '_blank');
  };

  const renderReadOnlyDetail = (label: string, value: string | number | undefined | null) => (
    <div className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">{label}</span>
      <span className="text-[10px] font-bold text-slate-300 uppercase text-right ml-4">{value || '-'}</span>
    </div>
  );

  const statCard = (label: string, value: string | number, icon: React.ReactNode, color: string) => (
    <div className={`bg-white p-5 rounded-3xl shadow-lg border-b-4 ${color} animate-in zoom-in duration-300`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 text-slate-400">{icon}</div>
      </div>
    </div>
  );

  const filterLabelClass = "block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5";
  const filterInputClass = "w-full border-slate-200 rounded-xl text-[11px] font-bold p-2.5 uppercase focus:ring-2 focus:ring-amber-500 bg-white text-slate-800 shadow-sm border transition-all";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex items-center gap-4">
        <div className="bg-amber-500 p-4 rounded-2xl shadow-xl"><SearchCheck className="text-white w-8 h-8" /></div>
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">AUDIT REVIEW</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Verification of Claim Integrity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCard('Total Records', stats.total, <Activity size={20} />, 'border-blue-600')}
        {statCard('Audited Claims', stats.audited, <CheckCircle2 size={20} />, 'border-emerald-500')}
        {statCard('Pending Audit', stats.balance, <Clock size={20} />, 'border-amber-500')}
        {statCard('Audit Completion', `${stats.percentage}%`, <PieChart size={20} />, 'border-indigo-600')}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
                <label className={filterLabelClass}>Search Reference</label>
                <div className="relative">
                  <input type="text" className={filterInputClass} placeholder="NAME / LOAN..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
                  <Search className="absolute right-3 top-2.5 text-slate-300" size={16} />
                </div>
            </div>
            <div>
                <label className={filterLabelClass}>Company</label>
                <select className={filterInputClass} value={filterCompany} onChange={(e) => {setFilterCompany(e.target.value); setFilterBranch('');}}>
                    <option value="">ALL COMPANIES</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className={filterLabelClass}>Branch</label>
                <select className={filterInputClass} value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                    <option value="">ALL BRANCHES</option>
                    {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>
            <div>
                <label className={filterLabelClass}>Claim Type</label>
                <select className={filterInputClass} value={filterClaimType} onChange={(e) => setFilterClaimType(e.target.value)}>
                    <option value="">ALL TYPES</option>
                    {CLAIM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>
            <div>
                <label className={filterLabelClass}>Audit Status</label>
                <select className={filterInputClass} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">ALL RECORDS</option>
                    <option value="Pending">AWAITING AUDIT</option>
                    <option value="Audited">AUDIT COMPLETED</option>
                </select>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-blue-100 h-fit">
              <div className="bg-slate-900 text-white px-6 py-3 font-black text-[10px] uppercase tracking-widest">AUDIT SUMMARY LIST</div>
              <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
                  <table className="min-w-full divide-y divide-blue-50">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                          <tr>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Audit Target</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Status</th>
                              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase">Select</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50 bg-white">
                          {filteredClaims.length === 0 ? (
                            <tr><td colSpan={3} className="py-20 text-center text-slate-300 font-black uppercase text-xs">No records matching filters</td></tr>
                          ) : (
                            filteredClaims.map(c => (
                                <tr key={c.id} className={`hover:bg-sky-50/30 transition-colors ${selectedClaim?.id === c.id ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-5">
                                        <div className="text-xs font-black text-blue-900 uppercase">{c.customerName}</div>
                                        <div className="text-[10px] font-bold text-slate-400">{c.loanNumber} • {c.branch}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {c.auditStatus ? (
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${c.auditStatus === 'Not Issue' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                              {c.auditStatus}
                                            </span>
                                        ) : (
                                            <span className="text-[8px] font-black text-slate-300 uppercase italic">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button onClick={() => { 
                                            setSelectedClaim(c); 
                                            setAuditStatus(c.auditStatus || 'Not Issue'); 
                                            setAuditIssue(c.auditIssue || '');
                                            setDocStates({});
                                            setViewedDocs({});
                                        }} className="bg-blue-800 text-white p-2 rounded-lg hover:bg-amber-500 transition-all shadow-md"><Edit3 size={14} /></button>
                                    </td>
                                </tr>
                            ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          <div className="lg:col-span-8 bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl h-fit sticky top-8 border border-slate-800 overflow-hidden">
              {selectedClaim ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                      <div className="border-b border-white/10 pb-6 flex justify-between items-start">
                          <div>
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">AUDIT PROTOCOL ACTIVE</p>
                            <h2 className="text-2xl font-black uppercase leading-tight">{selectedClaim.customerName}</h2>
                            <p className="text-[11px] font-mono text-slate-400 mt-1">Reference: #{selectedClaim.id.toUpperCase()}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
                            <span className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">CLAIM TYPE</span>
                            <span className="text-xs font-black text-blue-400 uppercase">{selectedClaim.claimType}</span>
                          </div>
                      </div>

                      <div className="space-y-8 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
                        <section>
                            <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black text-[10px] uppercase tracking-[0.25em]">
                                <Landmark size={12} /> Master Account & Loan Context
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                {renderReadOnlyDetail("Company Entity", selectedClaim.company)}
                                {renderReadOnlyDetail("Branch Station", selectedClaim.branch)}
                                {renderReadOnlyDetail("Loan Account", selectedClaim.loanNumber)}
                                {renderReadOnlyDetail("Disbursed Amount", selectedClaim.loanAmount)}
                                {renderReadOnlyDetail("Current Status", selectedClaim.status)}
                                {renderReadOnlyDetail("ID Credentials", selectedClaim.idNumber)}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-4 text-purple-400 font-black text-[10px] uppercase tracking-[0.25em]">
                                <ShieldCheck size={12} /> Digital Verification Protocol
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                                {getDocuments(selectedClaim).length === 0 ? (
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center py-4 italic">No digital attachments identified</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {getDocuments(selectedClaim).map(doc => {
                                            const link = selectedClaim.driveFolderLink || '#';
                                            const isViewed = viewedDocs[doc.key];
                                            const state = docStates[doc.key];

                                            return (
                                                <div key={doc.key} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${state === 'Verified' ? 'bg-emerald-500/10 border-emerald-500/30' : state === 'Not Verified' ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl ${state === 'Verified' ? 'bg-emerald-500 text-slate-900 shadow-lg' : state === 'Not Verified' ? 'bg-red-500 text-white shadow-lg' : 'bg-white/5 text-slate-400'}`}>
                                                            {state === 'Verified' ? <Check size={16} strokeWidth={4} /> : state === 'Not Verified' ? <X size={16} strokeWidth={4} /> : <FileText size={16} />}
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-wider block">{doc.label}</span>
                                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${state === 'Verified' ? 'text-emerald-400' : state === 'Not Verified' ? 'text-red-400' : isViewed ? 'text-blue-400' : 'text-slate-500'}`}>
                                                                {state === 'Verified' ? 'Verified Integrity' : state === 'Not Verified' ? 'Discrepancy Logged' : isViewed ? 'Viewed • Pending Decision' : 'Awaiting Audit Review'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleViewDoc(doc.key, link)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${isViewed ? 'bg-white/10 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'}`}
                                                        >
                                                            <Eye size={12} /> {isViewed ? 'Re-View' : 'View Core'}
                                                        </button>
                                                        <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
                                                            <button 
                                                                onClick={() => setDocVerification(doc.key, 'Verified')}
                                                                disabled={!isViewed}
                                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${state === 'Verified' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-400'}`}
                                                            >
                                                                Verified
                                                            </button>
                                                            <button 
                                                                onClick={() => setDocVerification(doc.key, 'Not Verified')}
                                                                disabled={!isViewed}
                                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${state === 'Not Verified' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-red-400'}`}
                                                            >
                                                                Not Verified
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>
                      </div>

                      <div className="bg-white/5 p-6 rounded-[2.5rem] border-t-2 border-amber-500/40 space-y-6 mt-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Audit Verification Decision</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setAuditStatus('Not Issue')} className={`py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${auditStatus === 'Not Issue' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/40 scale-105' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>No Issues Identified</button>
                                <button onClick={() => setAuditStatus('Issue')} className={`py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${auditStatus === 'Issue' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40 scale-105' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>Discrepancy Detected</button>
                            </div>
                        </div>

                        {auditStatus === 'Issue' && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block flex items-center gap-1"><AlertCircle size={10} /> Discrepancy Remarks (Mandatory)</label>
                                <textarea className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-xs font-bold uppercase h-32 focus:ring-2 focus:ring-red-600 outline-none resize-none transition-all text-white placeholder:text-slate-600" placeholder="SPECIFY NATURE OF AUDIT DISCREPANCY..." value={auditIssue} onChange={e => setAuditIssue(e.target.value)} />
                            </div>
                        )}

                        <button onClick={handleSaveAudit} className="w-full bg-white text-slate-900 py-5 rounded-3xl font-black uppercase text-xs shadow-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 active:scale-95"><Save size={18} /> Commit Final Audit Record</button>
                      </div>
                  </div>
              ) : (
                  <div className="py-48 text-center space-y-4 opacity-40">
                      <SearchCheck size={80} className="mx-auto text-slate-700" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] max-w-[250px] mx-auto">Select a station record to initiate verification protocol</p>
                  </div>
              )}
          </div>
      </div>

      {/* DISCREPANCY SUMMARY POPUP */}
      {showIssuePopup && selectedClaim && (
          <Modal isOpen={showIssuePopup} onClose={() => setShowIssuePopup(false)} title="CRITICAL AUDIT DISCREPANCY REPORT" type="warning">
              <div className="space-y-8 animate-in zoom-in duration-300">
                  <div className="bg-red-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert size={120} /></div>
                      <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-red-100">Integrity Violation Identified</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-4">
                                  <div><p className="text-[8px] font-black text-red-200 uppercase tracking-widest">Organization</p><p className="text-sm font-black uppercase">{selectedClaim.company}</p></div>
                                  <div><p className="text-[8px] font-black text-red-200 uppercase tracking-widest">Customer</p><p className="text-sm font-black uppercase">{selectedClaim.customerName}</p></div>
                              </div>
                              <div className="space-y-4">
                                  <div><p className="text-[8px] font-black text-red-200 uppercase tracking-widest">Claim Code</p><p className="text-sm font-black uppercase font-mono">{selectedClaim.id.toUpperCase()}</p></div>
                                  <div><p className="text-[8px] font-black text-red-200 uppercase tracking-widest">Audit Officer</p><p className="text-sm font-black uppercase">{currentUser?.name}</p></div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-inner">
                      <div className="flex items-center gap-3 mb-4 text-red-600 font-black text-[10px] uppercase tracking-widest">
                          <AlertCircle size={16} /> Discrepancy Statement
                      </div>
                      <p className="text-slate-800 text-xs font-black uppercase border-l-4 border-red-600 pl-6 italic bg-white p-6 rounded-xl shadow-sm">
                          {auditIssue}
                      </p>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setShowIssuePopup(false)} className="flex-1 py-5 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-red-600">Modify</button>
                      <button onClick={executeSave} className="flex-[2] bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-2">
                          <ShieldCheck size={20} /> Authorize Filing
                      </button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default AuditReview;
