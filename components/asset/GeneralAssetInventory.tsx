
import React, { useState } from 'react';
import { 
  Package, Plus, Search, Filter, Box, Trash2, Edit, Save, X, Info, 
  MapPin, Calendar, Clock, User, ShieldCheck, Layers, ClipboardList
} from 'lucide-react';
import { GeneralAsset, AssetCondition, User as UserType, GeneralAssetClaim } from '../../types';
import FileUpload from '../FileUpload';

interface Props {
  assets: GeneralAsset[];
  claims: GeneralAssetClaim[];
  onUpdateAssets: (a: GeneralAsset[]) => void;
  onUpdateClaims: (c: GeneralAssetClaim[]) => void;
  currentUser: UserType | null;
}

const GeneralAssetInventory: React.FC<Props> = ({ assets, claims, onUpdateAssets, onUpdateClaims, currentUser }) => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const [formData, setFormData] = useState<Partial<GeneralAsset>>({
    category: 'Furniture',
    condition: 'New',
    documents: []
  });

  const handleSave = () => {
    if (!formData.id || !formData.name) return;
    const newAsset: GeneralAsset = { ...(formData as GeneralAsset) };
    onUpdateAssets([newAsset, ...assets]);
    setView('list');
  };

  const filtered = assets.filter(a => {
    const s = searchTerm.toLowerCase();
    const matchSearch = a.id.toLowerCase().includes(s) || a.name.toLowerCase().includes(s);
    const matchCat = filterCat ? a.category === filterCat : true;
    return matchSearch && matchCat;
  });

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-600 outline-none transition-all";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  if (view === 'add') {
    return (
      <div className="p-10 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-blue-900 uppercase">General Asset Registration</h3>
            <button onClick={() => setView('list')} className="text-slate-400"><X size={24} /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-6">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b border-blue-50 pb-4">Asset Master Data</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className={labelClass}>Asset ID (Unique)</label><input className={inputClass} value={formData.id || ''} onChange={e=>setFormData({...formData, id: e.target.value})} placeholder="ASSET-2025-001" /></div>
                        <div>
                            <label className={labelClass}>Category</label>
                            <select className={inputClass} value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value as any})}>
                                {['Furniture', 'IT Equipment', 'Machinery', 'Other'].map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2"><label className={labelClass}>Asset Name/Description</label><input className={inputClass} value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
                        <div><label className={labelClass}>Model/Type</label><input className={inputClass} value={formData.model || ''} onChange={e=>setFormData({...formData, model: e.target.value})} /></div>
                        <div><label className={labelClass}>Serial Number</label><input className={inputClass} value={formData.serialNumber || ''} onChange={e=>setFormData({...formData, serialNumber: e.target.value})} /></div>
                    </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-4">Financials & Warranty</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className={labelClass}>Purchase Date</label><input type="date" className={inputClass} value={formData.purchaseDate || ''} onChange={e=>setFormData({...formData, purchaseDate: e.target.value})} /></div>
                        <div><label className={labelClass}>Purchase Price (LKR)</label><input type="number" className={inputClass} value={formData.purchasePrice || 0} onChange={e=>setFormData({...formData, purchasePrice: Number(e.target.value)})} /></div>
                        <div><label className={labelClass}>Supplier/Vendor</label><input className={inputClass} value={formData.supplier || ''} onChange={e=>setFormData({...formData, supplier: e.target.value})} /></div>
                        <div><label className={labelClass}>Warranty Expiry</label><input type="date" className={inputClass} value={formData.warrantyExpiry || ''} onChange={e=>setFormData({...formData, warrantyExpiry: e.target.value})} /></div>
                    </div>
                </div>
            </section>

            <section className="space-y-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-6">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b border-blue-50 pb-4">Allocation & Condition</h4>
                    <div className="grid grid-cols-2 gap-6">
                         <div><label className={labelClass}>Location/Dept</label><input className={inputClass} value={formData.location || ''} onChange={e=>setFormData({...formData, location: e.target.value})} /></div>
                         <div>
                            <label className={labelClass}>Current Condition</label>
                            <select className={inputClass} value={formData.condition} onChange={e=>setFormData({...formData, condition: e.target.value as any})}>
                                {['New', 'Good', 'Fair', 'Poor'].map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-white shadow-2xl space-y-6">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-4">Digital Repository</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FileUpload label="Purchase Invoice" accept=".pdf,image/*" onChange={()=>{}} />
                        <FileUpload label="Warranty Card" accept=".pdf,image/*" onChange={()=>{}} />
                        <FileUpload label="User Manual" accept=".pdf" onChange={()=>{}} />
                        <FileUpload label="Asset Photo" accept="image/*" onChange={()=>{}} />
                    </div>
                </div>
                <button onClick={handleSave} className="w-full bg-blue-800 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Save size={18} /> Initialize General Asset
                </button>
            </section>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-blue-900 uppercase">Infrastructure Registry</h3>
            <button onClick={() => setView('add')} className="bg-blue-800 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                <Plus size={18} /> Register Asset
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="md:col-span-2 relative">
                <input className={inputClass} placeholder="SEARCH BY ASSET ID / DESCRIPTION..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                <Search className="absolute right-4 top-3 text-slate-300" size={18} />
            </div>
            <div>
                <select className={inputClass} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                    <option value="">All Categories</option>
                    {['Furniture', 'IT Equipment', 'Machinery'].map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-2xl shadow-sm"><Box size={24} /></div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${a.condition === 'New' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{a.condition}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{a.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">{a.category} • {a.id}</p>
                    <div className="space-y-2 border-t border-slate-50 pt-4">
                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
                            <span>Location</span>
                            <span className="text-slate-800">{a.location}</span>
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
                            <span>Value</span>
                            <span className="text-blue-900 font-mono">LKR {a.purchasePrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default GeneralAssetInventory;
