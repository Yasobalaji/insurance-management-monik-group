
import React, { useState, useMemo } from 'react';
import { 
  Car, Plus, Search, Filter, Edit, Trash2, Camera, FileText, 
  Landmark, User, ShieldCheck, Calendar, Info, X, Save, 
  MapPin, Clock, Heart, Truck, Bike, MoreHorizontal,
  ShieldAlert, Share2, History, AlertCircle
} from 'lucide-react';
import { Vehicle, VehicleType, User as UserType, VehicleClaim } from '../../types';
import FileUpload from '../FileUpload';
import { COMPANIES } from '../../constants';
import VehicleClaimModule from './VehicleClaimModule';
import Modal from '../Modal';

interface Props {
  vehicles: Vehicle[];
  claims: VehicleClaim[];
  onUpdateVehicles: (v: Vehicle[]) => void;
  onUpdateClaims: (c: VehicleClaim[]) => void;
  currentUser: UserType | null;
}

const VehicleInventory: React.FC<Props> = ({ vehicles, claims, onUpdateVehicles, onUpdateClaims, currentUser }) => {
  const [view, setView] = useState<'list' | 'add' | 'claims'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null);
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    type: 'Car',
    registeredCompany: 'CMBSL',
    purchaseDate: new Date().toISOString().split('T')[0],
    insurance: { 
      companyName: '', policyNumber: '', type: 'Comprehensive', coverageAmount: 0, 
      startDate: '', expiryDate: '', premiumAmount: 0, contactPerson: '', contactNumber: '' 
    },
    revenueLicence: { licenceNumber: '', issueDate: '', expiryDate: '', feeAmount: 0, issuingAuthority: '' },
    allocatedPerson: { 
      name: '', employeeId: '', department: 'Operations', designation: '', contact: '', 
      nic: '', drivingLicenceNo: '', drivingLicenceExpiry: '', status: 'Active', allocationStart: new Date().toISOString().split('T')[0],
      company: 'CMBSL',
      dlNo: ''
    },
    photos: {},
    renewalHistory: []
  });

  const handleSave = () => {
    if (!formData.id || !formData.model) { alert("Vehicle Number and Model are mandatory."); return; }
    const newVehicle: Vehicle = { ...(formData as Vehicle) };
    onUpdateVehicles([newVehicle, ...vehicles]);
    setView('list');
  };

  const handleWhatsAppShare = (v: Vehicle) => {
    const text = encodeURIComponent(`*MONIK GROUP - FLEET ASSET DISPATCH*\n\nUnit No: ${v.id}\nModel: ${v.model}\nType: ${v.type}\nEntity: ${v.registeredCompany}\nAllocated: ${v.allocatedPerson.name}\n\nInsurance Expiry: ${v.insurance.expiryDate}\nRevenue Expiry: ${v.revenueLicence.expiryDate}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filtered = vehicles.filter(v => {
    const s = searchTerm.toLowerCase();
    const matchSearch = v.id.toLowerCase().includes(s) || v.model.toLowerCase().includes(s) || v.allocatedPerson.name.toLowerCase().includes(s);
    const matchType = filterType ? v.type === filterType : true;
    return matchSearch && matchType;
  });

  // Fixed: Added useMemo to the React imports to fix the 'Cannot find name useMemo' error
  const selectedClaims = useMemo(() => {
    if (!selectedVehicleForHistory) return [];
    return claims.filter(c => c.vehicleNumber === selectedVehicleForHistory.id);
  }, [claims, selectedVehicleForHistory]);

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-emerald-600 outline-none transition-all";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";
  const sectionTitle = "text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 border-b border-blue-50 pb-3";

  if (view === 'claims') return <VehicleClaimModule vehicles={vehicles} claims={claims} onUpdateClaims={onUpdateClaims} onBack={() => setView('list')} />;

  if (view === 'add') {
    return (
      <div className="p-10 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-xl"><Car size={24} /></div>
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Register New Fleet Asset</h3>
            </div>
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-red-600 transition-all"><X size={24} /></button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="xl:col-span-2 space-y-10">
                <section>
                    <h4 className={sectionTitle}><Car size={16} /> 1.1 Vehicle Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><label className={labelClass}>Vehicle Number (UID)</label><input className={inputClass} value={formData.id || ''} onChange={e=>setFormData({...formData, id: e.target.value})} placeholder="WP KH-0000" /></div>
                        <div><label className={labelClass}>Model/Make</label><input className={inputClass} value={formData.model || ''} onChange={e=>setFormData({...formData, model: e.target.value})} /></div>
                        <div><label className={labelClass}>Year of Manufacture</label><input className={inputClass} value={formData.yearOfManufacture || ''} onChange={e=>setFormData({...formData, yearOfManufacture: e.target.value})} /></div>
                        <div><label className={labelClass}>Purchase Date</label><input type="date" className={inputClass} value={formData.purchaseDate || ''} onChange={e=>setFormData({...formData, purchaseDate: e.target.value})} /></div>
                        <div><label className={labelClass}>Chassis Number</label><input className={inputClass} value={formData.yearOfManufacture || ''} onChange={e=>setFormData({...formData, chassisNumber: e.target.value})} /></div>
                        <div><label className={labelClass}>Engine Number</label><input className={inputClass} value={formData.engineNumber || ''} onChange={e=>setFormData({...formData, engineNumber: e.target.value})} /></div>
                        <div>
                            <label className={labelClass}>Vehicle Type</label>
                            <select className={inputClass} value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value as any})}>
                                {['Car', 'Van', 'Truck', 'Bike', 'Other'].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Registered Company</label>
                            <select className={inputClass} value={formData.registeredCompany} onChange={e=>setFormData({...formData, registeredCompany: e.target.value})}>
                                {COMPANIES.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div><label className={labelClass}>Fuel Type</label><input className={inputClass} value={formData.fuelType || ''} onChange={e=>setFormData({...formData, fuelType: e.target.value})} /></div>
                        <div><label className={labelClass}>Current Meter (KM)</label><input type="number" className={inputClass} value={formData.currentMileage || 0} onChange={e=>setFormData({...formData, currentMileage: Number(e.target.value)})} /></div>
                    </div>
                </section>

                <section>
                    <h4 className={sectionTitle}><User size={16} /> Allocated Personnel</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>Employee Name</label><input className={inputClass} value={formData.allocatedPerson?.name} onChange={e=>setFormData({...formData, allocatedPerson: {...formData.allocatedPerson!, name: e.target.value}})} /></div>
                        <div><label className={labelClass}>Employee ID</label><input className={inputClass} value={formData.allocatedPerson?.employeeId} onChange={e=>setFormData({...formData, allocatedPerson: {...formData.allocatedPerson!, employeeId: e.target.value}})} /></div>
                        <div><label className={labelClass}>Driving Licence No</label><input className={inputClass} value={formData.allocatedPerson?.drivingLicenceNo} onChange={e=>setFormData({...formData, allocatedPerson: {...formData.allocatedPerson!, drivingLicenceNo: e.target.value}})} /></div>
                        <div><label className={labelClass}>DL Expiry Date</label><input type="date" className={inputClass} value={formData.allocatedPerson?.drivingLicenceExpiry} onChange={e=>setFormData({...formData, allocatedPerson: {...formData.allocatedPerson!, drivingLicenceExpiry: e.target.value}})} /></div>
                        <div><label className={labelClass}>Allocation Start Date</label><input type="date" className={inputClass} value={formData.allocatedPerson?.allocationStart} onChange={e=>setFormData({...formData, allocatedPerson: {...formData.allocatedPerson!, allocationStart: e.target.value}})} /></div>
                    </div>
                </section>

                <section>
                    <h4 className={sectionTitle}><ShieldCheck size={16} /> 1.2 Insurance & Revenue</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black text-emerald-600 mb-4 uppercase tracking-widest">A) Insurance Details</p>
                             <div className="space-y-4">
                                <div><label className={labelClass}>Insurer Name</label><input className={inputClass} value={formData.insurance?.companyName} onChange={e=>setFormData({...formData, insurance: {...formData.insurance!, companyName: e.target.value}})} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Policy No</label><input className={inputClass} value={formData.insurance?.policyNumber} onChange={e=>setFormData({...formData, insurance: {...formData.insurance!, policyNumber: e.target.value}})} /></div>
                                    <div><label className={labelClass}>Expiry Date</label><input type="date" className={inputClass} value={formData.insurance?.expiryDate} onChange={e=>setFormData({...formData, insurance: {...formData.insurance!, expiryDate: e.target.value}})} /></div>
                                </div>
                             </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black text-blue-600 mb-4 uppercase tracking-widest">B) Revenue Licence</p>
                             <div className="space-y-4">
                                <div><label className={labelClass}>Licence Number</label><input className={inputClass} value={formData.revenueLicence?.licenceNumber} onChange={e=>setFormData({...formData, revenueLicence: {...formData.revenueLicence!, licenceNumber: e.target.value}})} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Fee Amount</label><input type="number" className={inputClass} value={formData.revenueLicence?.feeAmount} onChange={e=>setFormData({...formData, revenueLicence: {...formData.revenueLicence!, feeAmount: Number(e.target.value)}})} /></div>
                                    <div><label className={labelClass}>Expiry Date</label><input type="date" className={inputClass} value={formData.revenueLicence?.expiryDate} onChange={e=>setFormData({...formData, revenueLicence: {...formData.revenueLicence!, expiryDate: e.target.value}})} /></div>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <section className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-white shadow-2xl">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-emerald-400"><Camera size={18} /> C) Photo Repository</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FileUpload label="Front View" accept="image/*" onChange={()=>{}} />
                        <FileUpload label="Back View" accept="image/*" onChange={()=>{}} />
                        <FileUpload label="Chassis No" accept="image/*" onChange={()=>{}} />
                        <FileUpload label="Meter Read" accept="image/*" onChange={()=>{}} />
                        <FileUpload label="Interior" accept="image/*" onChange={()=>{}} />
                        <FileUpload label="CR Book (PDF)" accept=".pdf" onChange={()=>{}} />
                    </div>
                </section>
                <div className="pt-8">
                    <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                        <Save size={20} /> Commit to Registry
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Fleet Management Module</h3>
                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{vehicles.length} Units Registered</span>
            </div>
            <div className="flex gap-4">
                <button onClick={()=>setView('claims')} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2">
                    <ShieldAlert size={16} /> Unit Claims
                </button>
                <button onClick={()=>setView('add')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                    <Plus size={18} /> Add New Unit
                </button>
            </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 relative">
                <input className={inputClass} placeholder="SEARCH BY UNIT NO / MODEL / PERSON..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                <Search className="absolute right-4 top-3 text-slate-300" size={18} />
            </div>
            <div>
                <select className={inputClass} value={filterType} onChange={e=>setFilterType(e.target.value)}>
                    <option value="">All Unit Types</option>
                    {['Car', 'Van', 'Truck', 'Bike'].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(v => (
                <div key={v.id} className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-xl hover:border-emerald-600 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 text-emerald-600 transition-opacity">
                        {v.type === 'Car' ? <Car size={80} /> : v.type === 'Truck' ? <Truck size={80} /> : <Bike size={80} />}
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                             <div className="bg-slate-900 text-white p-3 rounded-2xl font-black text-xs shadow-lg uppercase">{v.id}</div>
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => setSelectedVehicleForHistory(v)} 
                                 className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm" 
                                 title="View Claims History"
                               >
                                 <History size={16} />
                               </button>
                               <button onClick={() => handleWhatsAppShare(v)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="WhatsApp Business Send Option"><Share2 size={16} /></button>
                               <button className="text-slate-300 hover:text-blue-600"><MoreHorizontal size={20} /></button>
                             </div>
                        </div>
                        <h4 className="text-xl font-black text-blue-900 uppercase leading-none mb-1">{v.model}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{v.type} • {v.registeredCompany}</p>
                        
                        <div className="space-y-4 border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><User size={14}/></div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Allocated Person</p>
                                    <p className="text-[10px] font-black text-slate-800 uppercase">{v.allocatedPerson.name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Ins. Expiry</p>
                                    <p className="text-[9px] font-black text-blue-900">{v.insurance.expiryDate}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Rev. Expiry</p>
                                    <p className="text-[9px] font-black text-blue-900">{v.revenueLicence.expiryDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* CLAIMS HISTORY MODAL */}
        {selectedVehicleForHistory && (
            <Modal 
              isOpen={!!selectedVehicleForHistory} 
              onClose={() => setSelectedVehicleForHistory(null)} 
              title="Unit Incident History"
            >
                <div className="space-y-8">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl border-b-8 border-red-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><History size={120} /></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Historical Dossier Access</p>
                            <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedVehicleForHistory.id}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedVehicleForHistory.model} • {selectedVehicleForHistory.allocatedPerson.name}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {selectedClaims.length === 0 ? (
                            <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">No incident records identified for this unit</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedClaims.map(c => (
                                    <div key={c.id} className="bg-white border-2 border-slate-50 p-6 rounded-3xl shadow-sm hover:border-blue-600 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] font-black text-blue-600 font-mono uppercase tracking-tighter">#{c.id}</span>
                                                <h4 className="text-sm font-black text-slate-900 uppercase mt-1">{c.type}</h4>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${
                                                c.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 
                                                c.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                                'bg-amber-50 text-amber-700'
                                            }`}>{c.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 uppercase leading-relaxed line-clamp-2 h-8">{c.description}</p>
                                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{c.dateOfIncident}</span>
                                            </div>
                                            <span className="text-sm font-black text-blue-900 font-mono">LKR {c.claimAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default VehicleInventory;
