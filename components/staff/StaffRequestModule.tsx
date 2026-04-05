
import React, { useState } from 'react';
import { StaffMember, StaffInsuranceRequest } from '../../types';
import { ClipboardList, Plus, Search, ShieldCheck, Clock, BadgeCheck, Settings, Calendar } from 'lucide-react';
import { STAFF_POLICY_TYPES } from '../../constants';

interface Props {
  requests: StaffInsuranceRequest[];
  staffList: StaffMember[];
  onUpdate: (list: StaffInsuranceRequest[]) => void;
}

const StaffRequestModule: React.FC<Props> = ({ requests, staffList, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffInsuranceRequest>>({
    requestType: 'New Enrollment', 
    coverageLevel: 'Individual', 
    sumInsured: 500000, 
    policyType: '01. Medical/Hospitalization',
    requestDate: new Date().toISOString().split('T')[0]
  });

  const handleSave = () => {
    if (!formData.employeeId) { alert("Please select an employee"); return; }
    const newReq: StaffInsuranceRequest = {
        ...(formData as StaffInsuranceRequest),
        id: `REQ-${Date.now()}`,
        requestDate: formData.requestDate || new Date().toISOString().split('T')[0],
        status: 'Submitted'
    };
    onUpdate([newReq, ...requests]);
    setShowForm(false);
  };

  const handleProcess = (id: string) => {
    // Fixed: Cast status to 'Processed' as const to satisfy StaffInsuranceRequest status type
    const next: StaffInsuranceRequest[] = requests.map(r => r.id === id ? { ...r, status: 'Processed' as const } : r);
    onUpdate(next);
    alert("Request Processed");
  };

  const inputClass = "w-full border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-red-600 outline-none transition-all bg-slate-50";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  if (showForm) {
      return (
          <div className="p-10 space-y-8 animate-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                  <div className="bg-red-600 p-2 rounded-xl text-white"><Plus size={24} /></div>
                  <h3 className="text-xl font-black text-blue-900 uppercase">New Insurance Request</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <label className={labelClass}>Select Employee</label>
                      <select className={inputClass} value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                          <option value="">Choose Personnel...</option>
                          {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>)}
                      </select>
                  </div>
                  <div>
                      <label className={labelClass}>Request Category</label>
                      <select className={inputClass} value={formData.requestType} onChange={e => setFormData({...formData, requestType: e.target.value as any})}>
                          <option value="New Enrollment">New Enrollment</option>
                          <option value="Modification">Upgrade/Modification</option>
                          <option value="Cancellation">Cancellation</option>
                      </select>
                  </div>
                  <div>
                      <label className={labelClass}>Policy Category</label>
                      <select className={inputClass} value={formData.policyType} onChange={e => setFormData({...formData, policyType: e.target.value})}>
                          {STAFF_POLICY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className={labelClass}>Request Date</label>
                      <div className="relative">
                        <input type="date" className={inputClass} value={formData.requestDate} onChange={e => setFormData({...formData, requestDate: e.target.value})} />
                        <Calendar className="absolute right-3 top-3 text-slate-300 pointer-events-none" size={16} />
                      </div>
                  </div>
                  <div>
                      <label className={labelClass}>Estimated Sum Insured (LKR)</label>
                      <input type="number" className={inputClass} value={formData.sumInsured} onChange={e => setFormData({...formData, sumInsured: Number(e.target.value)})} />
                  </div>
              </div>
              <div className="flex gap-4">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs">Discard</button>
                  <button onClick={handleSave} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Submit for Processing</button>
              </div>
          </div>
      );
  }

  return (
    <div className="p-10 space-y-8">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-blue-900 uppercase">Welfare Workflow Engine</h3>
            <button onClick={() => setShowForm(true)} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                <Plus size={16} /> Initiate Request
            </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Request ID</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Employee ID</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Coverage / Type</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">Lifecycle</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {requests.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono text-[10px] font-black text-blue-600">{r.id}</td>
                            <td className="p-4 font-bold text-xs">{r.employeeId}</td>
                            <td className="p-4">
                                <div className="text-[10px] font-black text-slate-900 uppercase">{r.requestType}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase">{r.policyType}</div>
                                <div className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">REQ: {r.requestDate}</div>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${r.status === 'Processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'}`}>{r.status}</span>
                            </td>
                            <td className="p-4 text-right">
                                {r.status === 'Submitted' && (
                                    <button onClick={() => handleProcess(r.id)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-1 ml-auto">
                                        <Settings size={12} /> Process
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {requests.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-300 font-black uppercase text-xs italic">No pending requests identified</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StaffRequestModule;
