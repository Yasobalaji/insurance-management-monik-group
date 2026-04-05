
import React, { useState, useMemo } from 'react';
import { 
  Home, Settings, Car, Boxes, Cpu, Armchair, TrendingUp, ShieldAlert,
  Plus, Search, Filter, ArrowLeft, FileText, Camera, ShieldCheck, 
  Landmark, AlertTriangle, Send, Info, Save, X, Activity, DollarSign,
  User, Phone, Trash2, ListPlus, Building2, MapPin, Wallet
} from 'lucide-react';
import { ASSET_INSURANCE_CATEGORIES, COMPANIES, BRANCHES } from '../../constants';
import { User as UserType } from '../../types';
import FileUpload from '../FileUpload';

interface AssetItem {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  claimValue: number;
}

interface Props {
  claims: any[];
  onUpdateClaims: (claims: any[]) => void;
  currentUser: UserType | null;
}

const PropertyAssetClaims: React.FC<Props> = ({ claims, onUpdateClaims, currentUser }) => {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    category: '',
    incidentType: '',
    company: '',
    branch: '',
    contactPerson: '',
    contactNumber: '',
    assetId: '',
    description: '',
    dateOfIncident: new Date().toISOString().split('T')[0],
    locationAddress: '',
    ownershipType: 'Owned',
    status: 'Reported',
    items: [] as AssetItem[]
  });

  const [newItem, setNewItem] = useState<Partial<AssetItem>>({
    name: '',
    description: '',
    estimatedValue: 0,
    claimValue: 0
  });

  const getCategoryIcon = (id: string, size = 24) => {
    switch (id) {
      case 'property': return <Home size={size} />;
      case 'machinery': return <Settings size={size} />;
      case 'vehicle': return <Car size={size} />;
      case 'inventory': return <Boxes size={size} />;
      case 'electronics': return <Cpu size={size} />;
      case 'furniture': return <Armchair size={size} />;
      case 'financial': return <TrendingUp size={size} />;
      case 'money': return <Wallet size={size} />;
      case 'special': return <ShieldAlert size={size} />;
      default: return <ShieldCheck size={size} />;
    }
  };

  const handleInitForm = (catId: string) => {
    setFormData({ 
      ...formData, 
      category: catId, 
      incidentType: '', 
      items: [],
      company: currentUser?.company || 'CMBSL',
      branch: currentUser?.branches?.[0] || 'KOLONNAWA'
    });
    setActiveCategory(catId);
    setView('form');
  };

  const addItem = () => {
    if (!newItem.name || !newItem.claimValue) {
      alert("Item Name and Claim Value are required.");
      return;
    }
    const item: AssetItem = {
      id: `ITEM-${Date.now()}`,
      name: newItem.name || '',
      description: newItem.description || '',
      estimatedValue: newItem.estimatedValue || 0,
      claimValue: newItem.claimValue || 0
    };
    setFormData({ ...formData, items: [...formData.items, item] });
    setNewItem({ name: '', description: '', estimatedValue: 0, claimValue: 0 });
  };

  const removeItem = (id: string) => {
    setFormData({ ...formData, items: formData.items.filter((i: AssetItem) => i.id !== id) });
  };

  const totalClaimValue = useMemo(() => {
    return formData.items.reduce((sum: number, item: AssetItem) => sum + item.claimValue, 0);
  }, [formData.items]);

  const handleSave = () => {
    if (!formData.company || !formData.assetId || !formData.incidentType) {
        alert("Company, Reference ID, and Incident Type are required.");
        return;
    }
    if (formData.items.length === 0) {
        alert("Please add at least one asset item to the claim.");
        return;
    }
    const newClaim = {
        ...formData,
        claimAmount: totalClaimValue,
        id: `INS-CLM-${Date.now()}`,
        timestamp: Date.now()
    };
    onUpdateClaims([newClaim, ...claims]);
    setView('dashboard');
    setActiveCategory(null);
  };

  const filteredClaims = claims.filter(c => {
    const s = searchTerm.toLowerCase();
    return (c.assetId?.toLowerCase().includes(s) || 
            c.category?.toLowerCase().includes(s) || 
            c.incidentType?.toLowerCase().includes(s) ||
            c.customerName?.toLowerCase().includes(s));
  });

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-emerald-600 outline-none transition-all";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  if (view === 'form') {
    const currentCat = ASSET_INSURANCE_CATEGORIES.find(c => c.id === activeCategory);
    return (
        <div className="p-10 space-y-12 animate-in slide-in-from-right-6 duration-500 pb-32">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-xl">
                        {getCategoryIcon(activeCategory || '', 24)}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Silo Claims Protocol</h3>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{currentCat?.label}</p>
                    </div>
                </div>
                <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-red-600 transition-all"><X size={24} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* SECTION 1: Business & Location */}
                    <section className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.25em] border-b border-blue-50 pb-4 flex items-center gap-2">
                            <Building2 size={14} /> 1.0 Business & Entity Mapping
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Operating Company</label>
                                <select className={inputClass} value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})}>
                                    <option value="">Select Entity...</option>
                                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Branch Station</label>
                                <select className={inputClass} value={formData.branch} onChange={e=>setFormData({...formData, branch: e.target.value})}>
                                    <option value="">Select Branch...</option>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Insured Premises Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <input className={`${inputClass} pl-10`} value={formData.locationAddress} onChange={e=>setFormData({...formData, locationAddress: e.target.value})} placeholder="FULL GEOGRAPHIC LOCATION..." />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Contact Person (Authorized)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <input className={`${inputClass} pl-10`} value={formData.contactPerson} onChange={e=>setFormData({...formData, contactPerson: e.target.value})} placeholder="NAME..." />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Contact Mobile/Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <input className={`${inputClass} pl-10`} value={formData.contactNumber} onChange={e=>setFormData({...formData, contactNumber: e.target.value})} placeholder="07XXXXXXXX" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Incident Details */}
                    <section className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.25em] border-b border-blue-50 pb-4 flex items-center gap-2">
                            <ShieldAlert size={14} /> 2.0 Peril & Risk Intelligence
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Incident / Peril Type</label>
                                <select className={inputClass} value={formData.incidentType} onChange={e=>setFormData({...formData, incidentType: e.target.value})}>
                                    <option value="">Select Peril...</option>
                                    {currentCat?.types.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Asset Code / Policy Ref</label>
                                <input className={inputClass} value={formData.assetId} onChange={e=>setFormData({...formData, assetId: e.target.value})} placeholder="ASSET-REF-001" />
                            </div>
                            <div>
                                <label className={labelClass}>Date of Loss (Calendar)</label>
                                <div className="relative">
                                    <input type="date" className={inputClass} value={formData.dateOfIncident} onChange={e=>setFormData({...formData, dateOfIncident: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Ownership Status</label>
                                <select className={inputClass} value={formData.ownershipType} onChange={e=>setFormData({...formData, ownershipType: e.target.value})}>
                                    <option value="Owned">Fully Owned</option>
                                    <option value="Leased">Leased / Financed</option>
                                    <option value="Rented">Rented Premises</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Comprehensive Incident Narrative</label>
                                <textarea className={`${inputClass} h-24 normal-case`} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} placeholder="PROVIDE DETAILED ACCOUNT OF THE EVENT..." />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Add Items / Inventory */}
                    <section className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl text-white space-y-8">
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div className="flex items-center gap-3">
                                <ListPlus className="text-emerald-400" size={24} />
                                <h4 className="text-xl font-black uppercase tracking-tighter leading-none">3.0 Asset Damage Inventory</h4>
                            </div>
                            <div className="bg-emerald-500 text-slate-900 px-4 py-1 rounded-full font-black text-[10px] uppercase">
                                Total: LKR {totalClaimValue.toLocaleString()}
                            </div>
                        </div>

                        {/* Add Item Entry Form */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                            <div className="md:col-span-2">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Item Identification</label>
                                <input className="w-full bg-slate-800 border-0 rounded-xl p-3 text-xs font-bold uppercase text-white" value={newItem.name} onChange={e=>setNewItem({...newItem, name: e.target.value})} placeholder={activeCategory === 'money' ? "E.G. MAIN VAULT CASH" : "E.G. MAIN SERVER"} />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Requested LKR</label>
                                <input type="number" className="w-full bg-slate-800 border-0 rounded-xl p-3 text-xs font-bold uppercase text-white" value={newItem.claimValue || ''} onChange={e=>setNewItem({...newItem, claimValue: Number(e.target.value)})} placeholder="0.00" />
                            </div>
                            <div className="flex items-end">
                                <button onClick={addItem} className="w-full h-[46px] bg-emerald-500 text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                                    <Plus size={16} strokeWidth={3} /> Add to Claim
                                </button>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto rounded-2xl border border-white/5">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[8px] font-black text-slate-500 uppercase tracking-widest">Asset Details</th>
                                        <th className="px-6 py-4 text-right text-[8px] font-black text-slate-500 uppercase tracking-widest">Value (LKR)</th>
                                        <th className="px-6 py-4 text-right text-[8px] font-black text-slate-500 uppercase tracking-widest">Rem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {formData.items.map((item: AssetItem) => (
                                        <tr key={item.id} className="hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-black text-white uppercase">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-black text-emerald-400 text-sm">
                                                {item.claimValue.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={()=>removeItem(item.id)} className="text-red-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {formData.items.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-20 text-center text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">No items added to current claim dossier</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* SIDEBAR: Evidence & Submission */}
                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.25em] border-b border-blue-50 pb-4 flex items-center gap-2">
                            <FileText size={14} /> 4.0 Digital Credential Vault
                        </h4>
                        <div className="space-y-2">
                            <FileUpload label="Ownership Evidence (PDF)" accept=".pdf" onChange={()=>{}} />
                            <FileUpload label="Purchase Receipts" accept=".pdf,image/*" onChange={()=>{}} />
                            <FileUpload label="Visual Loss Media (IMG)" accept="image/*" onChange={()=>{}} />
                            <FileUpload label="Official Incident Report" accept=".pdf,image/*" onChange={()=>{}} />
                            <FileUpload label="Repair Estimates" accept=".pdf" onChange={()=>{}} />
                        </div>
                    </section>

                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-1" size={20} />
                        <div>
                            <p className="text-[9px] font-black text-emerald-800 uppercase leading-relaxed tracking-wider">
                                Compliance Check: Verified that all evidentiary documents align with policy terms and the reported peril.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-center space-y-6 shadow-2xl">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Settlement Request</p>
                         <h3 className="text-4xl font-black text-emerald-400 font-mono">LKR {totalClaimValue.toLocaleString()}</h3>
                         <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-900 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.25em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                            <Send size={20} className="rotate-[-20deg]" /> Release Claim Protocol
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="p-10 space-y-12 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Property & Asset Claims</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Cross-Asset Integrated Risk Console</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                <Search className="text-slate-300 ml-2" size={18} />
                <input 
                    className="bg-transparent border-0 text-xs font-bold uppercase w-64 focus:ring-0 outline-none" 
                    placeholder="Filter Claims Repository..." 
                    value={searchTerm} 
                    onChange={e=>setSearchTerm(e.target.value)} 
                />
            </div>
        </div>

        {/* Claim Category Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ASSET_INSURANCE_CATEGORIES.map((cat, idx) => (
                <button 
                    key={cat.id} 
                    onClick={() => handleInitForm(cat.id)}
                    className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all text-left group overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-600">
                        {getCategoryIcon(cat.id, 80)}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl w-fit text-blue-900 mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shadow-sm">
                        {getCategoryIcon(cat.id, 24)}
                    </div>
                    <h4 className="text-sm font-black text-blue-900 uppercase leading-none mb-2">{cat.label}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">{cat.description}</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[8px] uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        <Plus size={10} strokeWidth={4} /> Initiate Claim
                    </div>
                </button>
            ))}
        </div>

        {/* Recent Claims Stream */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden">
             <div className="bg-slate-900 text-white px-8 py-5 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-3">
                    <Activity size={18} className="text-emerald-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em]">Integrated Claim Stream</h4>
                 </div>
                 <span className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-lg text-[8px] font-black uppercase">{claims.length} Records</span>
             </div>
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-blue-50">
                     <thead className="bg-slate-50">
                         <tr>
                             <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Reference</th>
                             <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity & Branch</th>
                             <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Category / Peril</th>
                             <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                             <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Claim Value</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-blue-50">
                        {filteredClaims.map(c => (
                            <tr key={c.id} className="hover:bg-sky-50/20 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="text-xs font-black text-blue-900 uppercase mb-1">{c.assetId}</div>
                                    <div className="text-[9px] font-mono text-slate-400">ID: {c.id.slice(-8)}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-black text-slate-800 uppercase">{c.company}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.branch}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-black text-slate-800 uppercase">{c.incidentType}</div>
                                    <div className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{c.category} Silo</div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[8px] font-black uppercase border border-blue-100">{c.status}</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="text-sm font-black text-slate-900 font-mono">LKR {c.claimAmount.toLocaleString()}</div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Loss Date: {c.dateOfIncident}</div>
                                </td>
                            </tr>
                        ))}
                        {filteredClaims.length === 0 && (
                            <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-black uppercase text-xs italic tracking-widest">No active claims found in filters</td></tr>
                        )}
                     </tbody>
                 </table>
             </div>
        </div>
    </div>
  );
};

export default PropertyAssetClaims;
