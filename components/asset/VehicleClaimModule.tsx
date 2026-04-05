
import React, { useState } from 'react';
import { 
  ShieldAlert, Plus, Search, Filter, ArrowLeft, Clock, CheckCircle2, 
  MapPin, User, FileText, AlertTriangle, Save, Eye, Camera, Trash2, Send
} from 'lucide-react';
import { Vehicle, VehicleClaim, User as UserType } from '../../types';
import FileUpload from '../FileUpload';

interface Props {
  vehicles: Vehicle[];
  claims: VehicleClaim[];
  onUpdateClaims: (c: VehicleClaim[]) => void;
  onBack: () => void;
}

const VehicleClaimModule: React.FC<Props> = ({ vehicles, claims, onUpdateClaims, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<VehicleClaim>>({
    type: 'Accident',
    status: 'Reported',
    dateOfIncident: new Date().toISOString().split('T')[0],
    documents: []
  });

  const handleSave = () => {
    if (!formData.vehicleNumber || !formData.description) { alert("Mandatory fields missing."); return; }
    const newClaim: VehicleClaim = {
        ...(formData as VehicleClaim),
        id: `V-CLM-${Date.now()}`
    };
    onUpdateClaims([newClaim, ...claims]);
    setIsAdding(false);
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-red-600 outline-none transition-all";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  if (isAdding) {
    return (
      <div className="p-10 space-y-12 animate-in slide-in-from-right-6 duration-500">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-red-600 uppercase">File Incident Report</h3>
            <button onClick={()=>setIsAdding(false)} className="text-slate-400 hover:text-red-600 transition-all"><ArrowLeft size={24} /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-6">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b border-blue-50 pb-4">Incident Metadata</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Target Vehicle</label>
                            <select className={inputClass} value={formData.vehicleNumber} onChange={e=>setFormData({...formData, vehicleNumber: e.target.value})}>
                                <option value="">Select Unit...</option>
                                {vehicles.map(v=><option key={v.id} value={v.id}>{v.id} ({v.model})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Incident Type</label>
                            <select className={inputClass} value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value as any})}>
                                {['Accident', 'Theft', 'Damage', 'Third-Party'].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div><label className={labelClass}>Date of Incident</label><input type="date" className={inputClass} value={formData.dateOfIncident} onChange={e=>setFormData({...formData, dateOfIncident: e.target.value})} /></div>
                        <div><label className={labelClass}>Location</label><input className={inputClass} value={formData.location || ''} onChange={e=>setFormData({...formData, location: e.target.value})} /></div>
                        <div className="col-span-2"><label className={labelClass}>Full Description</label><textarea className={`${inputClass} h-24 normal-case`} value={formData.description || ''} onChange={e=>setFormData({...formData, description: e.target.value})} /></div>
                    </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-4">Financial Impact Assessment</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className={labelClass}>Estimated Damage (LKR)</label><input type="number" className={inputClass} value={formData.estimatedCost || 0} onChange={e=>setFormData({...formData, estimatedCost: Number(e.target.value)})} /></div>
                        <div><label className={labelClass}>Claim Amount (LKR)</label><input type="number" className={inputClass} value={formData.claimAmount || 0} onChange={e=>setFormData({...formData, claimAmount: Number(e.target.value)})} /></div>
                        <div className="col-span-2"><label className={labelClass}>Police Report Number (If Applicable)</label><input className={inputClass} value={formData.policeReportNumber || ''} onChange={e=>setFormData({...formData, policeReportNumber: e.target.value})} /></div>
                    </div>
                </div>
            </section>

            <section className="space-y-8">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-white shadow-2xl space-y-6">
                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest border-b border-white/5 pb-4"><Camera size={18} /> Evidence Capture</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FileUpload label="Accident Photo 1" accept="image/*" onChange={()=>{}} />
                        <FileUpload label="Accident Photo 2" accept="image/*" onChange={()=>{}} />
                        <FileUpload label="Police Report Scan" accept=".pdf,image/*" onChange={()=>{}} />
                        <FileUpload label="Repair Quotation" accept=".pdf,image/*" onChange={()=>{}} />
                    </div>
                </div>
                <button onClick={handleSave} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Send size={18} className="rotate-[-20deg]" /> Dispatch System Claim
                </button>
            </section>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="text-slate-400 hover:text-blue-900 transition-colors"><ArrowLeft size={24} /></button>
                <h3 className="text-2xl font-black text-blue-900 uppercase">Fleet Incident Registry</h3>
            </div>
            <button onClick={() => setIsAdding(true)} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                <Plus size={18} /> Log Incident
            </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-50">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident Details</th>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit & Person</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflow State</th>
                            <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">LKR Exposure</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 bg-white">
                        {claims.length === 0 ? (
                            <tr><td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic">No fleet incidents reported in the current cycle</td></tr>
                        ) : (
                            claims.map(c => (
                                <tr key={c.id} className="hover:bg-red-50/20 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-black text-red-600 font-mono mb-1">#{c.id}</div>
                                        <div className="text-[10px] font-black text-blue-900 uppercase leading-none">{c.type}</div>
                                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{c.dateOfIncident} • {c.location}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-black text-blue-900 uppercase mb-1">{c.vehicleNumber}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{c.allocatedPersonAtTime || 'Not Specified'}</div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                            c.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 
                                            c.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                            'bg-amber-50 text-amber-700'
                                        }`}>{c.status}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="text-sm font-black text-blue-900 font-mono">LKR {c.claimAmount.toLocaleString()}</div>
                                        <div className="text-[8px] font-black text-slate-300 uppercase mt-1">Est. Damage: {c.estimatedCost.toLocaleString()}</div>
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

export default VehicleClaimModule;
