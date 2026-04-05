
import React, { useState } from 'react';
import { StaffMember, StaffClaim, StaffInsuranceRequest } from '../../types';
import { FileArchive, Search, Filter, Folder, FileText, Shield, User, Download, Eye, Clock, ListFilter, Heart, Camera } from 'lucide-react';

interface Props {
  staffList: StaffMember[];
  claims: StaffClaim[];
  requests: StaffInsuranceRequest[];
}

const StaffDocumentVault: React.FC<Props> = ({ staffList, claims, requests }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Registration' | 'Policies' | 'Incidents'>('All');

  const cardClass = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group";

  return (
    <div className="p-10 space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl"><FileArchive size={28} /></div>
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Digital Document Repository</h3>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                        type="text" 
                        className="bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold uppercase w-64 focus:ring-2 focus:ring-indigo-600 outline-none"
                        placeholder="Search Dossiers..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 shadow-sm"><Filter size={18} /></button>
            </div>
        </div>

        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit">
            {(['All', 'Registration', 'Policies', 'Incidents'] as const).map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div className={cardClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><User size={32} /></div>
                    <div>
                        <h4 className="font-black text-blue-900 uppercase text-sm leading-none">KYC Credentials</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Identities</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 border-t border-slate-50 pt-4 uppercase">
                        <span>Managed Objects</span>
                        <span className="text-slate-900 font-mono">{staffList.length * 2} Files</span>
                    </div>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all">Deep Scan Folder</button>
                </div>
            </div>

            <div className={cardClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Shield size={32} /></div>
                    <div>
                        <h4 className="font-black text-blue-900 uppercase text-sm leading-none">Policy Terms</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Contract Versions</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 border-t border-slate-50 pt-4 uppercase">
                        <span>Managed Objects</span>
                        <span className="text-slate-900 font-mono">{requests.length} Files</span>
                    </div>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all">Deep Scan Folder</button>
                </div>
            </div>

            <div className={cardClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-red-50 p-3 rounded-2xl text-red-600"><Camera size={32} /></div>
                    <div>
                        <h4 className="font-black text-blue-900 uppercase text-sm leading-none">Incident Evidence</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Claim Verification</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 border-t border-slate-50 pt-4 uppercase">
                        <span>Managed Objects</span>
                        <span className="text-slate-900 font-mono">{claims.length * 3} Files</span>
                    </div>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all">Deep Scan Folder</button>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
             <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100">
                 <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] flex items-center gap-2"><ListFilter size={14}/> Integrated Object Activity</h4>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead className="bg-white">
                         <tr>
                             <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase">Context</th>
                             <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase">Owner</th>
                             <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase text-center">Status</th>
                             <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase text-right">Access</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {claims.map(c => (
                             <tr key={c.id} className="hover:bg-slate-50/50">
                                 <td className="px-8 py-4">
                                     <div className="flex items-center gap-3">
                                         <FileText size={14} className="text-red-400" />
                                         <span className="text-[10px] font-black text-slate-700 uppercase">Evidence_Pack_{c.id.slice(-4)}.zip</span>
                                     </div>
                                 </td>
                                 <td className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">EMP: {c.employeeId}</td>
                                 <td className="px-8 py-4 text-center">
                                     <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">Verified</span>
                                 </td>
                                 <td className="px-8 py-4 text-right">
                                     <button className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Eye size={14}/></button>
                                 </td>
                             </tr>
                         ))}
                         {claims.length === 0 && <tr><td colSpan={4} className="py-24 text-center text-slate-300 font-black uppercase text-xs">Repository Sync Pending...</td></tr>}
                     </tbody>
                 </table>
             </div>
        </div>
    </div>
  );
};

export default StaffDocumentVault;
