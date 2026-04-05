
import React, { useState } from 'react';
import { StaffMember, StaffDependent } from '../../types';
import { UserPlus, Save, Trash2, Plus, Info, Landmark, User, Mail, Smartphone, MapPin, Briefcase, Heart, AlertCircle, X, FileText, Camera } from 'lucide-react';
import { DEPARTMENTS } from '../../constants';
import FileUpload from '../FileUpload';

interface Props {
  staffList: StaffMember[];
  onUpdate: (list: StaffMember[]) => void;
}

const StaffRegistration: React.FC<Props> = ({ staffList, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    fullName: '', department: 'Human Resources', employmentType: 'Permanent', status: 'Active',
    contact: { phone: '', email: '', address: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    dependents: []
  });

  const [newDep, setNewDep] = useState<Partial<StaffDependent>>({ name: '', relationship: 'Spouse', dob: '', contact: '' });

  const handleSave = () => {
    if (!formData.fullName || !formData.id) { alert("Core ID and Full Name are mandatory."); return; }
    const newStaff: StaffMember = { ...(formData as StaffMember), status: 'Active' };
    onUpdate([newStaff, ...staffList]);
    setIsAdding(false);
  };

  const addDependent = () => {
    if (!newDep.name) return;
    const deps = [...(formData.dependents || [])];
    deps.push({ ...(newDep as StaffDependent), id: Date.now().toString() });
    setFormData({ ...formData, dependents: deps });
    setNewDep({ name: '', relationship: 'Spouse', dob: '', contact: '' });
  };

  const inputClass = "w-full border-slate-200 rounded-xl p-4 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-slate-50 shadow-inner";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block";
  const sectionTitle = "text-xs font-black text-blue-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-blue-50 pb-3";

  if (isAdding) {
    return (
      <div className="p-10 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-red-600 p-3 rounded-2xl text-white shadow-xl"><UserPlus size={24} /></div>
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Personnel Enrollment</h3>
            </div>
            <button onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-400 p-3 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"><X size={24} /></button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Primary Details */}
            <div className="space-y-8">
                <section>
                    <h4 className={sectionTitle}><User size={16} /> Basic Credentials</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Employee System ID</label>
                            <input type="text" className={inputClass} value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="MON-2025-000" />
                        </div>
                        <div>
                            <label className={labelClass}>Gender Identity</label>
                            <select className={inputClass} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Full Legal Name</label>
                            <input type="text" className={inputClass} value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Date of Birth</label>
                            <input type="date" className={inputClass} value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} />
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className={sectionTitle}><Briefcase size={16} /> Employment Scope</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Organization Department</label>
                            <select className={inputClass} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Official Designation</label>
                            <input type="text" className={inputClass} value={formData.designation || ''} onChange={e => setFormData({...formData, designation: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Service Commencement Date</label>
                            <input type="date" className={inputClass} value={formData.joinDate || ''} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Employment Category</label>
                            <select className={inputClass} value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value as any})}>
                                <option value="Permanent">Permanent Grade</option>
                                <option value="Contract">Contractual Term</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className={sectionTitle}><Camera size={16} /> Identity Evidence</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUpload label="NIC / ID Front (IMG)" accept="image/*" onChange={() => {}} />
                        <FileUpload label="NIC / ID Back (IMG)" accept="image/*" onChange={() => {}} />
                    </div>
                </section>
            </div>

            {/* Dependents & Emergency */}
            <div className="space-y-8">
                <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <h4 className={sectionTitle}><Heart size={16} className="text-red-600" /> Beneficiary Dependents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="md:col-span-2">
                             <label className={labelClass}>Dependent Name</label>
                             <input type="text" className={inputClass} value={newDep.name} onChange={e => setNewDep({...newDep, name: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Relationship</label>
                            <select className={inputClass} value={newDep.relationship} onChange={e => setNewDep({...newDep, relationship: e.target.value})}>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Mother">Mother</option>
                                <option value="Father">Father</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Date of Birth</label>
                            <input type="date" className={inputClass} value={newDep.dob} onChange={e => setNewDep({...newDep, dob: e.target.value})} />
                        </div>
                        <div className="flex items-end md:col-span-2">
                            <button onClick={addDependent} className="w-full bg-blue-800 text-white h-[52px] rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Add Beneficiary</button>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {formData.dependents?.map((d, i) => (
                            <div key={d.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm group">
                                <div>
                                    <p className="text-xs font-black text-blue-900 uppercase">{d.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d.relationship} {d.dob ? `• Born: ${d.dob}` : ''}</p>
                                </div>
                                <button onClick={() => setFormData({...formData, dependents: formData.dependents?.filter(x => x.id !== d.id)})} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100">
                    <h4 className={sectionTitle}><AlertCircle size={16} className="text-red-600" /> Emergency Response</h4>
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Primary Contact Name</label>
                            <input type="text" className={inputClass} value={formData.emergencyContact?.name} onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact!, name: e.target.value}})} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Relationship</label>
                                <input type="text" className={inputClass} value={formData.emergencyContact?.relationship} onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact!, relationship: e.target.value}})} />
                            </div>
                            <div>
                                <label className={labelClass}>Emergency Phone</label>
                                <input type="text" className={inputClass} value={formData.emergencyContact?.phone} onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact!, phone: e.target.value}})} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex justify-end gap-6">
            <button onClick={() => setIsAdding(false)} className="px-10 py-5 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-red-600 transition-colors">Abort Registry</button>
            <button onClick={handleSave} className="bg-slate-900 text-white px-16 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                <Save size={18} /> Commit Internal Security Profile
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Corporate Personnel Registry</h3>
                <span className="bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{staffList.length} Active Profiles</span>
            </div>
            <button onClick={() => setIsAdding(true)} className="bg-red-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all hover:bg-red-700 active:scale-95">
                <UserPlus size={18} /> Enroll New Staff Member
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffList.map(s => (
                <div key={s.id} className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-xl hover:border-blue-600 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-all" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg group-hover:bg-blue-800 transition-colors"><Landmark size={20} /></div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{s.status}</span>
                        </div>
                        <h4 className="font-black text-blue-900 uppercase leading-none text-xl mb-2">{s.fullName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">{s.designation} • {s.department}</p>
                        
                        <div className="space-y-2 border-t border-slate-50 pt-6">
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                                <span>Employee ID</span>
                                <span className="text-blue-600 font-mono">#{s.id}</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                                <span>Commencement</span>
                                <span className="text-slate-900">{s.joinDate}</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                                <span>Contract Type</span>
                                <span className="text-slate-900">{s.employmentType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {staffList.length === 0 && (
                <div className="col-span-full py-48 text-center bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] animate-pulse">
                    <Info size={64} className="mx-auto text-slate-200 mb-6" />
                    <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em]">No personnel matched in security directory</p>
                    <p className="text-slate-300 text-[10px] font-bold uppercase mt-2">Initialize enrollment protocol using the action above</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default StaffRegistration;
