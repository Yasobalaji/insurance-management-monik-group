import React, { useState, useMemo } from 'react';
import { BaseClaimData, User } from '../types';
import { 
  Truck, Search, Filter, Camera, ShieldCheck, CheckCircle2, 
  MapPin, Landmark, User as UserIcon, X, Save, FileText, 
  Loader2, AlertCircle, History, ChevronRight, Info, UserCheck, MessageSquare,
  ArrowRight, Layers
} from 'lucide-react';
import { COMPANIES, COMPANY_BRANCH_MAPPING } from '../constants';
import FileUpload from './FileUpload';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  currentUser: User | null;
  isGlobal?: boolean;
}

const DeliveryConfirmation: React.FC<Props> = ({ claims, onUpdateClaim, currentUser, isGlobal }) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [loanSearch, setLoanSearch] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<BaseClaimData | null>(null);
  
  // Entry Form States
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [deliveredBy, setDeliveredBy] = useState(currentUser?.name || '');
  const [receivedBy, setReceivedBy] = useState('');
  const [deliveryRemarks, setDeliveryRemarks] = useState('');

  const availableBranches = useMemo(() => {
    return filterCompany ? (COMPANY_BRANCH_MAPPING[filterCompany] || []) : [];
  }, [filterCompany]);

  const matchingClaims = useMemo(() => {
    // Show all valid claims if no search is performed, or filter them
    return claims.filter(c => {
      // Must be approved/cash requested to be delivered
      if (c.status === 'Completed' || c.status === 'Rejected') return false;
      if (c.status !== 'Approved' && c.status !== 'Cash Requested') return false;

      if (filterCompany && c.company !== filterCompany) return false;
      if (filterBranch && c.branch !== filterBranch) return false;
      if (loanSearch && !c.loanNumber.toLowerCase().includes(loanSearch.toLowerCase())) return false;
      
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [claims, filterCompany, filterBranch, loanSearch]);

  const handleSelectClaim = (c: BaseClaimData) => {
    setSelectedClaim(c);
    setReceivedBy(c.customerName);
    setDeliveryPhoto(null);
    setDeliveryRemarks('');
  };

  const handleConfirmDelivery = async () => {
    if (!selectedClaim) return;
    if (!deliveryPhoto) {
      alert("MANDATORY ACTION: HANDOVER PROOF PHOTO REQUIRED.");
      return;
    }
    if (!receivedBy.trim()) {
      alert("MANDATORY ACTION: RECIPIENT IDENTITY REQUIRED.");
      return;
    }

    setIsProcessing(true);
    // Simulate photo upload & status update
    setTimeout(() => {
      onUpdateClaim(selectedClaim.id, {
        status: 'Completed',
        packDeliveredDate: new Date().toISOString().split('T')[0],
        deliveryProofPhoto: 'simulated_photo_url',
        deliveredBy,
        receivedBy,
        deliveryRemarks
      });
      setIsProcessing(false);
      setSelectedClaim(null);
      setDeliveryPhoto(null);
      setLoanSearch('');
      setReceivedBy('');
      setDeliveryRemarks('');
      alert("SUCCESS: BENEFIT DELIVERY VERIFIED & ARCHIVED.");
    }, 1500);
  };

  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-inner";

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="bg-slate-900 p-5 rounded-[2rem] text-emerald-400 shadow-2xl rotate-[-2deg] border-b-4 border-emerald-500">
                  <Truck size={32} />
              </div>
              <div>
                  <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">Handover Entry</h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Delivery Verification Protocol</p>
              </div>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-blue-50 shadow-lg flex items-center gap-4">
              <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
                  <p className="text-xl font-black text-blue-900">{matchingClaims.length} Records</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                  <History size={24} />
              </div>
          </div>
      </div>

      {/* SEARCH ENGINE */}
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-blue-100 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <Search className="text-blue-600" size={20} />
              <h3 className="text-sm font-black uppercase text-blue-900 tracking-widest">Matrix Search & Identification</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <label className={labelClass}>Organization</label>
                <select className={inputClass} value={filterCompany} onChange={e => {setFilterCompany(e.target.value); setFilterBranch('');}}>
                    <option value="">All Entities</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Branch Node</label>
                <select className={inputClass} value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCompany}>
                    <option value="">All Stations</option>
                    {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Search Loan Number</label>
                <div className="relative">
                    <input 
                      type="text" 
                      className={`${inputClass} pl-12 bg-white border-blue-100`} 
                      placeholder="ENTER LN NO (E.G. LN-99501)..." 
                      value={loanSearch}
                      onChange={e => setLoanSearch(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-blue-300" size={18} />
                </div>
              </div>
          </div>
      </div>

      {/* RESULTS AND VERIFICATION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* List Section */}
          <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-t-[2.5rem] flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                      <Layers size={18} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Queue</span>
                  </div>
                  <span className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-[8px] font-black">Sync Ready</span>
              </div>
              <div className="bg-white rounded-b-[2.5rem] shadow-xl border border-blue-100 max-h-[650px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                  {matchingClaims.length === 0 ? (
                      <div className="py-24 text-center px-10">
                          <AlertCircle size={40} className="mx-auto text-slate-200 mb-4" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No pending deliveries found matching current parameters</p>
                      </div>
                  ) : (
                      matchingClaims.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => handleSelectClaim(c)}
                            className={`w-full p-6 text-left hover:bg-emerald-50/30 transition-all flex items-center justify-between group ${selectedClaim?.id === c.id ? 'bg-emerald-50/50 border-l-4 border-emerald-600' : ''}`}
                          >
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1.5">
                                      <h4 className="text-xs font-black text-blue-900 uppercase group-hover:text-emerald-700 transition-colors">{c.customerName}</h4>
                                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[7px] font-black uppercase">{c.status}</span>
                                  </div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{c.loanNumber} • {c.company} • {c.branch}</p>
                              </div>
                              <div className="bg-white p-2 rounded-xl text-slate-300 group-hover:text-emerald-600 transition-all shadow-sm border border-slate-100 group-hover:rotate-12">
                                  <ChevronRight size={18} />
                              </div>
                          </button>
                      ))
                  )}
              </div>
          </div>

          {/* Handover Console (Entry Form) */}
          <div className="lg:col-span-7">
              {selectedClaim ? (
                  <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-blue-100 space-y-8 animate-in slide-in-from-right-4 duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-blue-900"><Truck size={150} /></div>
                      
                      <div className="flex justify-between items-start border-b border-slate-100 pb-6 relative z-10">
                          <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Authorization Target</p>
                              <h3 className="text-3xl font-black text-slate-900 uppercase leading-tight tracking-tighter">{selectedClaim.customerName}</h3>
                              <p className="text-[11px] font-mono text-slate-400 mt-1">CODE: #{selectedClaim.id.toUpperCase()} • LN: {selectedClaim.loanNumber}</p>
                          </div>
                          <div className="bg-blue-900 text-white p-4 rounded-3xl text-center shadow-lg border border-blue-800">
                              <span className="block text-[8px] font-black text-blue-300 uppercase mb-1 tracking-widest">PRODUCT TYPE</span>
                              <span className="text-xs font-black uppercase">{selectedClaim.claimType}</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 relative z-10">
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                              <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-sm"><MapPin size={18} /></div>
                              <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Service Station</p>
                                  <p className="text-[10px] font-black text-slate-800 uppercase">{selectedClaim.branch}</p>
                              </div>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                              <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-sm"><UserIcon size={18} /></div>
                              <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Registered ID</p>
                                  <p className="text-[10px] font-black text-slate-800 uppercase">{selectedClaim.idNumber}</p>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 relative z-10">
                          <section className="space-y-6">
                             <div className="flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-[0.25em]">
                                <UserCheck size={14} className="text-blue-500" /> Handover Responsibility
                             </div>
                             <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>Dispatching Officer</label>
                                    <input className={inputClass} value={deliveredBy} onChange={e => setDeliveredBy(e.target.value)} placeholder="NAME OF OFFICER..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Authorized Recipient</label>
                                    <input className={inputClass} value={receivedBy} onChange={e => setReceivedBy(e.target.value)} placeholder="NAME OF CUSTOMER..." />
                                </div>
                             </div>
                          </section>

                          <section className="space-y-6">
                              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]">
                                  <Camera size={14} className="text-emerald-500" /> Evidence Generation
                              </div>
                              <div className="bg-emerald-50/50 p-6 rounded-[2rem] border-2 border-dashed border-emerald-100 text-center flex flex-col items-center justify-center min-h-[160px]">
                                  <FileUpload 
                                    label="Visual Handover Proof" 
                                    accept="image/*" 
                                    onChange={(f) => setDeliveryPhoto(f)} 
                                    required 
                                  />
                                  {!deliveryPhoto && (
                                      <div className="flex items-center justify-center gap-2 text-emerald-600/60 font-black text-[8px] uppercase tracking-widest mt-2 animate-pulse">
                                          <Info size={10} /> Handover Photo Mandatory
                                      </div>
                                  )}
                              </div>
                          </section>
                      </div>

                      <section className="space-y-4 pt-4 relative z-10">
                         <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                            <MessageSquare size={14} className="text-indigo-400" /> Delivery Observations
                         </div>
                         <textarea 
                           className={`${inputClass} h-20 normal-case resize-none text-slate-700 font-medium`} 
                           value={deliveryRemarks} 
                           onChange={e => setDeliveryRemarks(e.target.value)} 
                           placeholder="NOTES REGARDING HANDOVER (OPTIONAL)..."
                         />
                      </section>

                      <div className="pt-6 border-t border-slate-100 relative z-10">
                          <button 
                            onClick={handleConfirmDelivery}
                            disabled={isProcessing || !deliveryPhoto || !receivedBy}
                            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.25em] shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none hover:bg-emerald-600 border-b-8 border-black hover:border-emerald-700"
                          >
                              {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                              {isProcessing ? 'SYNCHRONIZING ENTRY...' : 'Commit Delivery Entry'}
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="h-full min-h-[600px] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3.5rem] flex flex-col items-center justify-center text-center px-10 group">
                      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl space-y-8 max-w-sm transition-all group-hover:scale-105">
                          <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-blue-200 group-hover:text-blue-500 transition-colors">
                              <Truck size={48} />
                          </div>
                          <div>
                              <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter group-hover:text-blue-900 transition-colors">Handover Control</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mt-4">Select an active claim from the queue to initialize the digital delivery confirmation protocol.</p>
                          </div>
                          <div className="pt-6">
                              <span className="inline-flex items-center gap-2 text-[8px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-widest border border-blue-100">
                                  Registry Ready <ArrowRight size={10} />
                              </span>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default DeliveryConfirmation;