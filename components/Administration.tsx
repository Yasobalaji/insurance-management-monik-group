
import React, { useState, useMemo, useEffect } from 'react';
import { User as UserType, RoleDefinition, InterfaceAccess, Product, BeneficiaryType, ProductLogic, BaseClaimData, BenefitType } from '../types';
import { 
  Users, Shield, Plus, Trash2, Edit, Save, Building2, 
  Settings2, Command, Database, ShieldCheck, 
  Box, X, Zap, Check, MapPin, MessageSquare, Filter,
  Activity, ListPlus, LayoutList, FileSpreadsheet, XCircle, CheckCircle2, RefreshCw, Eye, EyeOff,
  Globe, Layers, FileText, Calendar, Play, Pause, Download, Search, Share2, ShieldAlert, Key, ClipboardList,
  ChevronRight, Square, CheckSquare, Lock, Settings
} from 'lucide-react';
import { COMPANIES, COMPANY_BRANCH_MAPPING, BENEFICIARIES, CLAIM_TYPES, DEPARTMENTS, SUBSIDIARIES, ALL_REQUIRED_DOCUMENTS } from '../constants';
import Modal from './Modal';
import LoanDataUpload from './LoanDataUpload';

interface Props {
  activeTab?: 'users' | 'roles' | 'products' | 'data';
  users: UserType[];
  onAddUser: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
  roles: RoleDefinition[];
  onSaveRole: (role: RoleDefinition) => void;
  onDeleteRole: (id: string) => void;
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allClaims: BaseClaimData[];
  isLoggingActive?: boolean;
  onToggleLogging?: () => void;
  onDownloadSession?: () => void;
  sessionCount?: number;
  onToggleSelection?: (item: any) => void;
  selectedItems?: any[];
}

const Administration: React.FC<Props> = ({ 
  activeTab: externalTab,
  users, onAddUser, onDeleteUser, 
  roles, onSaveRole, onDeleteRole,
  products, onSaveProduct, onDeleteProduct,
  allClaims,
  onToggleSelection,
  selectedItems = []
}) => {
  const [internalTab, setInternalTab] = useState<'users' | 'roles' | 'products' | 'data'>('users');
  const activeTab = externalTab || internalTab;
  const setActiveTab = (tab: any) => setInternalTab(tab);

  const [userListFilterCompany, setUserListFilterCompany] = useState('');
  const [userListFilterSearch, setUserListFilterSearch] = useState('');

  // User States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [uCompany, setUCompany] = useState('CMBSL');
  const [uName, setUName] = useState('');
  const [uEpf, setUEpf] = useState('');
  const [uDept, setUDept] = useState('Operations');
  const [uUsername, setUUsername] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState('role-staff');
  const [uBranches, setUBranches] = useState<string[]>([]);
  const [uStatus, setUStatus] = useState<'Active' | 'Inactive'>('Active');

  // Product States
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pShortCode, setPShortCode] = useState('');
  const [pBenefitType, setPBenefitType] = useState<BenefitType>('Cash');
  const [pPaymentParty, setPPaymentParty] = useState('Customer');
  const [pLogicDesc, setPLogicDesc] = useState('');
  // Fixed: Included 'admin' in the union type for pTargetSilo state to align with the Product interface definition
  const [pTargetSilo, setPTargetSilo] = useState<'customer' | 'staff' | 'asset' | 'admin'>('customer');
  const [pAllocatedCompanies, setPAllocatedCompanies] = useState<string[]>(['CMBSL']);

  const handleAddUser = () => {
    if (!uName || !uEpf || (!editingUserId && !uPassword) || !uUsername) { alert("Core fields mandatory."); return; }
    onAddUser({
      id: editingUserId || `user-${Date.now()}`, name: uName, company: uCompany, epf: uEpf, department: uDept,
      username: uUsername, password: uPassword || undefined, role: uRole, branches: uBranches, email: `${uUsername}@monik.lk`, mobile: '', 
      isGlobal: uCompany === 'MONIK GROUP' || uRole === 'role-admin', status: uStatus
    });
    setEditingUserId(null); setUName(''); setUEpf(''); setUUsername(''); setUPassword(''); setUBranches([]); setUStatus('Active');
  };

  const handleEditUser = (u: UserType) => {
      setEditingUserId(u.id); setUName(u.name); setUCompany(u.company); setUEpf(u.epf); setUDept(u.department || 'Operations');
      setUUsername(u.username); setURole(u.role); setUBranches(u.branches || []); setUStatus(u.status || 'Active');
  };

  const handleSaveProductLocal = () => {
    if (!pName || !pShortCode) { alert("Product Name and Code are mandatory."); return; }
    const product: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      name: pName,
      shortCode: pShortCode,
      targetSilo: pTargetSilo,
      benefitType: pBenefitType,
      paymentParty: pPaymentParty,
      logicDescription: pLogicDesc,
      allocatedCompanies: pAllocatedCompanies,
      beneficiaries: [BeneficiaryType.CUSTOMER], // Default
      requiredDocuments: [],
      logicCriteria: [],
      customFields: []
    };
    onSaveProduct(product);
    setEditingProductId(null); setPName(''); setPShortCode(''); setPLogicDesc(''); setPAllocatedCompanies(['CMBSL']);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setPName(p.name);
    setPShortCode(p.shortCode);
    setPBenefitType(p.benefitType);
    setPPaymentParty(p.paymentParty);
    setPLogicDesc(p.logicDescription);
    // Fixed: This call now matches the updated state definition for pTargetSilo
    setPTargetSilo(p.targetSilo);
    setPAllocatedCompanies(p.allocatedCompanies || []);
  };

  const toggleCompanyAllocation = (comp: string) => {
    setPAllocatedCompanies(prev => prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]);
  };

  const toggleBranchSelection = (branch: string) => {
    setUBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
        if (userListFilterCompany && u.company !== userListFilterCompany) return false;
        if (userListFilterSearch) {
            const s = userListFilterSearch.toLowerCase();
            return u.name.toLowerCase().includes(s) || u.epf.toLowerCase().includes(s) || u.username.toLowerCase().includes(s);
        }
        return true;
    });
  }, [users, userListFilterCompany, userListFilterSearch]);

  const cardClass = "bg-white rounded-[2.5rem] shadow-2xl border border-blue-100 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500";
  const sectionHeader = "bg-slate-900 text-white p-8 flex items-center justify-between border-b-8 border-emerald-500";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1";
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase";

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="bg-emerald-600 p-4 rounded-3xl shadow-xl border-b-4 border-slate-900"><Settings2 className="text-white w-8 h-8" /></div>
          <div><h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">Global Administration</h1><p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-1">System Control & Hierarchy</p></div>
        </div>
        <div className="bg-white p-3 rounded-full shadow-xl border border-slate-100 flex gap-2">
          {[{ id: 'users', label: 'USER DIRECTORY', icon: <Users size={16}/> }, { id: 'roles', label: 'ROLE ARCHITECT', icon: <Command size={16}/> }, { id: 'products', label: 'PRODUCT STUDIO', icon: <Box size={16}/> }, { id: 'data', label: 'DATA VAULT', icon: <Database size={16}/> }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-50'}`}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-12">
          <div className={cardClass}>
            <div className={sectionHeader}><div className="flex items-center gap-4"><div className="bg-white/20 p-2 rounded-lg"><Plus size={20} /></div><h2 className="font-black uppercase tracking-[0.2em] text-lg">{editingUserId ? 'Modify User Profile' : 'Identity Mapping'}</h2></div></div>
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
                <div><label className={labelClass}>Operating Entity</label><select className={inputClass} value={uCompany} onChange={e=>{setUCompany(e.target.value); setUBranches([]);}}>{COMPANIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div className="md:col-span-2"><label className={labelClass}>Full Legal Name</label><input className={inputClass} value={uName} onChange={e=>setUName(e.target.value)} /></div>
                <div><label className={labelClass}>EPF Identity</label><input className={inputClass} value={uEpf} onChange={e=>setUEpf(e.target.value)} /></div>
                <div className="md:col-span-2"><label className={labelClass}>Unit Department</label><select className={inputClass} value={uDept} onChange={e=>setUDept(e.target.value)}>{DEPARTMENTS.map(d=><option key={d} value={d}>{d.toUpperCase()}</option>)}</select></div>
              </div>
              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                 <button onClick={handleAddUser} className="bg-emerald-600 hover:bg-emerald-700 text-white px-20 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center gap-3 transition-all active:scale-95"><Save size={18} /> {editingUserId ? 'Apply Changes' : 'Commit New Identity'}</button>
              </div>
            </div>
          </div>
          
          <div className={cardClass}>
             <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row gap-6">
                <div className="flex-1"><label className={labelClass}>Registry Search</label><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input className={`${inputClass} pl-12 bg-white`} placeholder="SEARCH BY NAME..." value={userListFilterSearch} onChange={e => setUserListFilterSearch(e.target.value)} /></div></div>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-50">
                   <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <tr>
                           <th className="px-8 py-6 text-left">Select</th>
                           <th className="px-8 py-6 text-left">Identity</th>
                           <th className="px-8 py-6 text-left">Entity</th>
                           <th className="px-8 py-6 text-center">Status</th>
                           <th className="px-8 py-6 text-right">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-emerald-50">
                      {filteredUsers.map(u => {
                         const isSelected = !!selectedItems.find(i => i.id === u.id);
                         return (
                            <tr key={u.id} className={`hover:bg-emerald-50/20 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                                <td className="px-8 py-6">
                                    <button onClick={() => onToggleSelection?.(u)} className={isSelected ? 'text-blue-600' : 'text-slate-200'}>
                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </button>
                                </td>
                                <td className="px-8 py-6"><div className="text-sm font-black text-slate-800 uppercase">{u.name}</div><div className="text-[10px] font-mono text-indigo-600">EPF: {u.epf}</div></td>
                                <td className="px-8 py-6"><div className="text-[10px] font-black text-slate-600 uppercase">{u.company}</div></td>
                                <td className="px-8 py-6 text-center"><span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700">ACTIVE</span></td>
                                <td className="px-8 py-6 text-right flex justify-end gap-2">
                                  <button onClick={() => handleEditUser(u)} className="p-3 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit size={14}/></button>
                                  <button onClick={() => onDeleteUser(u.id)} className="p-3 bg-slate-100 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={14}/></button>
                                </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
           {roles.map(role => (
             <div key={role.id} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-6 group hover:border-indigo-500 transition-all">
                <div className="flex justify-between items-start">
                   <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Shield size={28} /></div>
                   <button className="text-slate-300 hover:text-blue-600"><Settings size={18}/></button>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">{role.name}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-6">
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase"><Check size={12} className="text-emerald-500" /> Dashboard</div>
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase"><Check size={12} className="text-emerald-500" /> Claims Entry</div>
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase"><Check size={12} className="text-emerald-500" /> Payments</div>
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase"><Lock size={12} className="text-red-300" /> Admin Core</div>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-12">
          {/* Product Editor Card */}
          <div className={cardClass}>
            <div className={sectionHeader}><div className="flex items-center gap-4"><Box size={24} /><h2 className="font-black uppercase tracking-[0.2em] text-lg">{editingProductId ? 'Engineer Product Profile' : 'New Product Architecture'}</h2></div></div>
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-2">
                  <label className={labelClass}>Product Identity Name</label>
                  <input className={inputClass} value={pName} onChange={e => setPName(e.target.value)} placeholder="E.G. SURGERY ASSISTANCE" />
                </div>
                <div>
                  <label className={labelClass}>Short Code</label>
                  <input className={inputClass} value={pShortCode} onChange={e => setPShortCode(e.target.value)} placeholder="E.G. SRG" />
                </div>
                <div>
                  <label className={labelClass}>Target Silo</label>
                  <select className={inputClass} value={pTargetSilo} onChange={e => setPTargetSilo(e.target.value as any)}>
                    <option value="customer">Customer Portfolio</option>
                    <option value="staff">Staff Welfare</option>
                    <option value="asset">Enterprise Assets</option>
                    <option value="admin">System Administration</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Settlement Logic</label>
                  <select className={inputClass} value={pBenefitType} onChange={e => setPBenefitType(e.target.value as any)}>
                    <option value="Cash">Cash Settlement</option>
                    <option value="Pack">Physical Pack</option>
                    <option value="Both">Aggregated (Both)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Paying Entity</label>
                  <input className={inputClass} value={pPaymentParty} onChange={e => setPPaymentParty(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                   <label className={labelClass}>Eligibility Constraints Description</label>
                   <textarea className={`${inputClass} normal-case h-12 py-2`} value={pLogicDesc} onChange={e => setPLogicDesc(e.target.value)} placeholder="EX: ELIGIBLE AFTER 6 MONTHS OF CONTINUOUS ACTIVE STATUS..." />
                </div>
              </div>

              <div className="space-y-4">
                  <label className={labelClass}>Authorized Organizations</label>
                  <div className="flex flex-wrap gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                      {COMPANIES.map(c => (
                          <button 
                            key={c} 
                            onClick={() => toggleCompanyAllocation(c)}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${pAllocatedCompanies.includes(c) ? 'bg-white border-blue-600 shadow-md text-blue-900' : 'bg-white/40 border-transparent text-slate-400 opacity-60'}`}
                          >
                              {pAllocatedCompanies.includes(c) ? <CheckCircle2 size={14} className="text-blue-600" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
                              {c}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
                 <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase italic tracking-widest"><ShieldAlert size={14} /> Global Product Definition Mode</div>
                 <div className="flex gap-4">
                    {editingProductId && <button onClick={() => { setEditingProductId(null); setPName(''); setPShortCode(''); setPLogicDesc(''); }} className="px-10 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Discard</button>}
                    <button onClick={handleSaveProductLocal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-16 py-4 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center gap-3 active:scale-95 transition-all"><Save size={18} /> {editingProductId ? 'Execute Engineering' : 'Deploy New Product'}</button>
                 </div>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {products.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl relative overflow-hidden group hover:border-emerald-500 transition-all">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-emerald-600 transition-colors">{p.shortCode}</div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg"><Box size={24}/></div>
                    <div>
                      <h4 className="font-black text-blue-900 uppercase text-lg leading-tight">{p.name}</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{p.targetSilo} SILO</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Benefit</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 rounded">{p.benefitType}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Payer</span>
                        <span className="text-[10px] font-black text-slate-700 uppercase">{p.paymentParty}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">Deployed Entities</span>
                      <div className="flex flex-wrap gap-1">
                        {(p.allocatedCompanies || []).map(c => <span key={c} className="text-[8px] font-black bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">{c}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleEditProduct(p)} className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-md">
                      <Edit size={14} /> Modify Architecture
                    </button>
                    <button onClick={() => onDeleteProduct(p.id)} className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 border border-slate-100">
                      <Trash2 size={14} /> Decommission
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-10">
            <LoanDataUpload />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={100}/></div>
                <h4 className="text-xl font-black uppercase tracking-widest mb-2 text-emerald-400">Master Ledger Integrity</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-10">Total Records: {allClaims.length} Objects</p>
                <div className="space-y-4">
                   <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-white hover:text-slate-950 transition-all">
                      <span className="font-black text-[10px] uppercase">Download Secure JSON Dump</span>
                      <Download size={18} />
                   </button>
                   <button className="w-full py-4 bg-emerald-600 text-slate-950 rounded-2xl flex items-center justify-between px-6 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400">
                      <span>Synchronize Cloud Vault</span>
                      <RefreshCw size={18} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;
