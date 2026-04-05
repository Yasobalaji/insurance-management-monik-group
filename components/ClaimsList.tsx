
import React, { useState, useMemo } from 'react';
import { BaseClaimData, User, AppNotification } from '../types';
import { Clock, Filter, Lock, Search, ListChecks, Calendar, X, Eye, ShieldCheck, ChevronDown, ShieldAlert, Share2, CheckSquare, Square, Building2, MapPin } from 'lucide-react';
import { COMPANIES, COMPANY_BRANCH_MAPPING, CLAIM_TYPES } from '../constants';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  onEditClaim?: (claim: BaseClaimData) => void;
  onDeleteClaim?: (id: string) => void;
  onAddNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  userBranches?: string[];
  userCompanies?: string[];
  isGlobal?: boolean;
  currentUser?: User | null;
  selectedItems?: any[];
  onToggleSelection?: (item: any) => void;
}

const ClaimsList: React.FC<Props> = ({ claims, onUpdateClaim, onEditClaim, onDeleteClaim, onAddNotification, userBranches, userCompanies, isGlobal, currentUser, selectedItems = [], onToggleSelection }) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const canEnterReview = useMemo(() => isGlobal || currentUser?.interfaceAccess?.customer?.checkClaims_review, [isGlobal, currentUser]);

  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
        if (filterCompany && claim.company !== filterCompany) return false;
        if (filterBranch && claim.branch !== filterBranch) return false;
        if (filterType && claim.claimType !== filterType) return false;
        if (filterStatus && claim.status !== filterStatus) return false;
        if (!filterStatus && (claim.status !== 'Requested' && claim.status !== 'Pending')) return false;
        return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [claims, filterCompany, filterBranch, filterType, filterStatus]);

  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 ml-1";
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-black uppercase text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all outline-none shadow-sm placeholder:text-slate-300";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      {/* FILTER PANEL */}
      <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col gap-10">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-blue-600 border border-slate-200 shadow-sm">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h2 className="text-slate-950 font-black uppercase text-xl tracking-tighter leading-none">Matrix Filter Console</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 ml-0.5">Protocol identification & sorting</p>
                  </div>
              </div>
              <button 
                onClick={() => { setFilterCompany(''); setFilterBranch(''); setFilterType(''); setFilterStatus(''); }} 
                className="bg-white text-slate-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm"
              >
                  <X size={14} className="inline mr-2" /> Reset Registry
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div><label className={labelClass}>Operating Entity</label><select className={inputClass} value={filterCompany} onChange={(e) => {setFilterCompany(e.target.value); setFilterBranch('');}}><option value="">ALL ORGANIZATIONS</option>{COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className={labelClass}>Service Node</label><select className={inputClass} value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} disabled={!filterCompany}><option value="">ALL BRANCH NODES</option>{(filterCompany ? (COMPANY_BRANCH_MAPPING[filterCompany] || []) : []).map(b => <option key={b} value={b}>{b}</option>)}</select></div>
              <div><label className={labelClass}>Product Category</label><select className={inputClass} value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="">ALL PORTFOLIOS</option>{CLAIM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>)}</select></div>
              <div><label className={labelClass}>Lifecycle Status</label><select className={inputClass} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="">PENDING QUEUE</option><option value="Requested">REQUESTED</option><option value="Pending">PENDING</option></select></div>
          </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
              <table className="min-w-full">
                  <thead className="bg-slate-900">
                      <tr>
                          <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol State</th>
                          <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Beneficiary Focus</th>
                          <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Epoch</th>
                          <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Action Desk</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredClaims.map((claim) => {
                          const isSelected = !!selectedItems.find(i => i.id === claim.id);
                          return (
                            <tr key={claim.id} className={`hover:bg-slate-50 transition-all group ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                <td className="px-8 py-6">
                                    <button 
                                      onClick={() => onToggleSelection?.(claim)}
                                      className={`transition-all ${isSelected ? 'text-blue-600' : 'text-slate-200 hover:text-slate-400'}`}
                                    >
                                      {isSelected ? <CheckSquare size={18} strokeWidth={3} /> : <Square size={18} strokeWidth={3} />}
                                    </button>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${
                                        claim.status === 'Requested' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}>
                                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${claim.status === 'Requested' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                      {claim.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-black text-slate-900 uppercase leading-none tracking-tight group-hover:text-blue-600 transition-colors">{claim.customerName}</div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                      <span className="text-slate-900">{claim.company}</span> • {claim.branch}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-2">
                                      <Calendar size={13} className="text-slate-300"/> 
                                      {new Date(claim.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-3">
                                      {canEnterReview ? (
                                        <button 
                                          onClick={() => onEditClaim && onEditClaim(claim)} 
                                          className="bg-white border border-slate-200 text-slate-900 hover:border-blue-600 hover:text-blue-600 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 flex items-center gap-2"
                                        >
                                          <Eye size={14} /> Desk Review
                                        </button>
                                      ) : (
                                        <span className="flex items-center justify-end gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest italic"><Lock size={12} /> Restricted</span>
                                      )}
                                    </div>
                                </td>
                            </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default ClaimsList;
