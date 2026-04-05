
import React, { useState } from 'react';
import { StaffMember, StaffClaim, StaffClaimHistory } from '../../types';
import { Heart, Plus, Search, FileText, CheckCircle, XCircle, Eye, ShieldCheck, Save, ArrowLeft, Landmark, CreditCard, Activity, X, Info, Camera, Clock, History, User } from 'lucide-react';
import FileUpload from '../FileUpload';
import Modal from '../Modal';
import { STAFF_POLICY_TYPES } from '../../constants';

interface Props {
  claims: StaffClaim[];
  staffList: StaffMember[];
  onUpdate: (list: StaffClaim[]) => void;
}

const StaffClaimModule: React.FC<Props> = ({ claims, staffList, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [viewingClaim, setViewingClaim] = useState<StaffClaim | null>(null);
  const [formData, setFormData] = useState<Partial<StaffClaim>>({
    claimType: 'Medical' as any, requestedAmount: 0
  });

  const handleSave = () => {
    if (!formData.employeeId) return;
    const timestamp = new Date().toLocaleString();
    const newClaim: StaffClaim = {
        ...(formData as StaffClaim),
        id: `CLM-S-${Date.now()}`,
        incidentDate: formData.incidentDate || new Date().toISOString().split('T')[0],
        status: 'Submitted',
        documents: [],
        history: [{
          status: 'Submitted',
          updatedBy: 'System Entry',
          timestamp: timestamp,
          remarks: 'Claim initiated via staff portal.'
        }]
    };
    onUpdate([newClaim, ...claims]);
    setShowForm(false);
  };

  const handleProcessClaim = (id: string, amount: number, remarks: string) => {
    const timestamp = new Date().toLocaleString();
    const next: StaffClaim[] = claims.map(c => {
      if (c.id === id) {
        const history: StaffClaimHistory[] = [...(c.history || []), {
          status: 'Processed',
          updatedBy: 'Internal Auditor',
          timestamp: timestamp,
          remarks: remarks || 'Claim processed and approved for payment.'
        }];
        return { 
          ...c, 
          status: 'Processed' as const, 
          approvedAmount: amount, 
          processedBy: 'Internal Auditor', 
          processedDate: timestamp,
          history 
        };
      }
      return c;
    });
    onUpdate(next);
    setViewingClaim(null);
    alert("Incident Processed & Finalized");
  };

  const inputClass = "w-full border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-red-600 outline-none transition-all bg-slate-50 shadow-inner";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  if (showForm) {
      return (
          <div className="p-10 space-y-8 animate-in slide-in-from-bottom-6 duration-500">
               <div className="flex items-center gap-4">
                  <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg"><Plus size={24} /></div>
                  <h3 className="text-xl font-black text-blue-900 uppercase">File Staff Incident Claim</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <label className={labelClass}>Employee Selection</label>
                      <select className={inputClass} value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                          <option value="">Choose Personnel...</option>
                          {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>)}
                      </select>
                  </div>
                  <div>
                      <label className={labelClass}>Policy Number</label>
                      <input type="text" className={inputClass} value={formData.policyNumber || ''} onChange={e => setFormData({...formData, policyNumber: e.target.value})} placeholder="POL-ST-XXXXX" />
                  </div>
                  <div>
                      <label className={labelClass}>Incident / Coverage Type</label>
                      <select className={inputClass} value={formData.claimType} onChange={e => setFormData({...formData, claimType: e.target.value as any})}>
                          {STAFF_POLICY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className={labelClass}>Incident Date</label>
                      <input type="date" className={inputClass} value={formData.incidentDate || ''} onChange={e => setFormData({...formData, incidentDate: e.target.value})} />
                  </div>
                  <div>
                      <label className={labelClass}>Requested Reimbursement (LKR)</label>
                      <input type="number" className={inputClass} value={formData.requestedAmount} onChange={e => setFormData({...formData, requestedAmount: Number(e.target.value)})} />
                  </div>
                  <div>
                      <label className={labelClass}>Medical Center / Provider</label>
                      <input type="text" className={inputClass} value={formData.hospitalName || ''} onChange={e => setFormData({...formData, hospitalName: e.target.value})} placeholder="Ex: General Hospital" />
                  </div>
              </div>
              <div>
                  <label className={labelClass}>Clinical / Incident Details</label>
                  <textarea className={`${inputClass} h-32 normal-case`} value={formData.treatmentDetails || ''} onChange={e => setFormData({...formData, treatmentDetails: e.target.value})} placeholder="Specify diagnosis or incident nature..." />
              </div>

              <div className="mt-8 border-t pt-8">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-6">Evidentiary Documentation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FileUpload label="Clinical Report (PDF)" accept=".pdf" onChange={()=>{}} />
                      <FileUpload label="Invoice / Bills (IMG)" accept="image/*" onChange={()=>{}} />
                      <FileUpload label="Claim App (PDF)" accept=".pdf" onChange={()=>{}} />
                  </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <button onClick={() => setShowForm(false)} className="px-10 py-4 text-slate-400 font-black uppercase text-xs tracking-widest transition-all hover:text-red-600">Discard</button>
                  <button onClick={handleSave} className="flex-1 bg-blue-800 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Save size={18} /> Submit for Processing</button>
              </div>
          </div>
      );
  }

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-blue-900 uppercase">Personnel Claims Console</h3>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{claims.length} Records</span>
            </div>
            <button onClick={() => setShowForm(true)} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                <Plus size={16} /> New Incident Entry
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map(c => (
                <div key={c.id} className="bg-white border-2 border-slate-50 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-all" />
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-blue-600 uppercase font-mono tracking-tighter">REF: {c.id.slice(-6)}</span>
                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${c.status === 'Processed' || c.status === 'Payment Processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{c.status}</span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter truncate w-48">{c.claimType}</div>
                        <h4 className="text-xl font-black text-slate-900 uppercase leading-none mb-4">LKR {c.requestedAmount.toLocaleString()}</h4>
                        <div className="text-[9px] font-bold text-slate-500 line-clamp-2 uppercase leading-relaxed mb-6 h-8">{c.treatmentDetails}</div>
                        <button onClick={() => setViewingClaim(c)} className="w-full py-2.5 bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                            <Eye size={12} /> Detailed View
                        </button>
                    </div>
                </div>
            ))}
             {claims.length === 0 && (
                <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-100 rounded-[3rem] opacity-50">
                    <Heart size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">No incidents filed in registry</p>
                </div>
            )}
        </div>

        {/* DETAILED CLAIM VIEW MODAL */}
        {viewingClaim && (
            <Modal isOpen={!!viewingClaim} onClose={() => setViewingClaim(null)} title="Personnel Incident Dossier">
                <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] border-b-8 border-emerald-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Activity size={180} /></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Authenticated Personnel</p>
                                <h3 className="text-3xl font-black uppercase tracking-tighter">{staffList.find(s=>s.id===viewingClaim.employeeId)?.fullName || 'Member Profile'}</h3>
                                <div className="flex gap-4 mt-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">ID: {viewingClaim.employeeId}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Policy: {viewingClaim.policyNumber}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Requested Exposure</p>
                                <p className="text-3xl font-black text-emerald-400 font-mono">LKR {viewingClaim.requestedAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Information Grid */}
                        <div className="lg:col-span-7 space-y-8">
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                                  <Info size={14} className="text-blue-500" /> Incident Analysis
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Category</p>
                                      <p className="text-xs font-black text-slate-800 uppercase">{viewingClaim.claimType}</p>
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Occurrence Epoch</p>
                                      <p className="text-xs font-black text-slate-800 uppercase">{viewingClaim.incidentDate}</p>
                                    </div>
                                    <div className="col-span-2 pt-2">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical Center / Entity</p>
                                      <p className="text-xs font-black text-slate-800 uppercase">{viewingClaim.hospitalName || 'PRIVATE CLINIC'}</p>
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-slate-50 p-6 rounded-3xl shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">Case Narrative</p>
                                    <p className="text-xs font-bold text-slate-600 uppercase leading-relaxed">{viewingClaim.treatmentDetails}</p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                                  <FileText size={14} className="text-emerald-500" /> Evidentiary Repository
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-emerald-50 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-50 p-2 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors"><FileText size={16}/></div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase">Audit_Report.pdf</span>
                                        </div>
                                        <Eye size={14} className="text-slate-300 group-hover:text-blue-600" />
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-emerald-50 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Camera size={16}/></div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase">Bill_Invoice.jpg</span>
                                        </div>
                                        <Eye size={14} className="text-slate-300 group-hover:text-blue-600" />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* History / Audit Ledger */}
                        <div className="lg:col-span-5 space-y-6">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                              <History size={14} className="text-indigo-500" /> Processing History
                            </h4>
                            <div className="relative pl-6 space-y-6">
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />
                                
                                {(viewingClaim.history || []).length === 0 ? (
                                   <div className="text-center py-10 opacity-40">
                                      <Clock size={32} className="mx-auto text-slate-200 mb-2" />
                                      <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Ledger Entry</p>
                                   </div>
                                ) : (
                                  viewingClaim.history.map((h, i) => (
                                    <div key={i} className="relative group">
                                        <div className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-colors ${h.status === 'Submitted' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-blue-200 transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                              <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{h.status}</span>
                                              <span className="text-[8px] font-bold text-slate-400 uppercase font-mono">{h.timestamp}</span>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed mb-2">{h.remarks}</p>
                                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/50">
                                              <User size={8} className="text-slate-300" />
                                              <span className="text-[8px] font-black text-slate-400 uppercase italic">By: {h.updatedBy}</span>
                                            </div>
                                        </div>
                                    </div>
                                  ))
                                )}
                            </div>

                            {viewingClaim.status === 'Submitted' && (
                                <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl border-t-8 border-emerald-500 space-y-6 mt-8 animate-in slide-in-from-right-4 duration-500">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] text-center">Authorization Terminal</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Authorized Disbursement (LKR)</label>
                                            <input id="app_amount" type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-black text-emerald-400 font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all" defaultValue={viewingClaim.requestedAmount} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Audit Remarks (Handover)</label>
                                            <textarea id="proc_remark" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white uppercase h-20 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="SPECIFY PROCESSING NOTES..." />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const amount = Number((document.getElementById('app_amount') as HTMLInputElement).value);
                                            const remarks = (document.getElementById('proc_remark') as HTMLTextAreaElement).value;
                                            handleProcessClaim(viewingClaim.id, amount, remarks);
                                        }}
                                        className="w-full bg-emerald-500 text-slate-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all active:scale-95"
                                    >
                                        <ShieldCheck size={20}/> Authorize Process
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default StaffClaimModule;
