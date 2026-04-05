
import React, { useMemo, useState } from 'react';
import { BaseClaimData, User } from '../types';
import { 
  ClipboardList, Clock, CheckCircle2, Activity, TrendingUp, ChevronRight, Zap, Target, 
  ShieldCheck, Filter, X, Search, Calendar, BarChart3, PieChart, ArrowUpRight, 
  Building2, MapPin, Percent, Layers, Landmark
} from 'lucide-react';
import { COMPANIES, COMPANY_BRANCH_MAPPING, CLAIM_TYPES } from '../constants';

interface Props {
  claims: BaseClaimData[];
  userBranches?: string[];
  isGlobal?: boolean;
  currentUser?: User | null;
  onToggleSelection?: (item: any) => void;
  selectedItems?: any[];
}

const Summary: React.FC<Props> = ({ claims, userBranches, isGlobal }) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (filterCompany && c.company !== filterCompany) return false;
      if (filterBranch && c.branch !== filterBranch) return false;
      if (filterType && c.claimType !== filterType) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [claims, filterCompany, filterBranch, filterType, filterStatus]);

  const stats = useMemo(() => {
    const total = filteredClaims.length;
    const requested = filteredClaims.filter(c => c.status === 'Requested').length;
    const approved = filteredClaims.filter(c => ['Approved', 'Cash Requested', 'Completed'].includes(c.status)).length;
    const completed = filteredClaims.filter(c => c.status === 'Completed').length;
    const rejected = filteredClaims.filter(c => c.status === 'Rejected').length;

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const completionRate = approved > 0 ? Math.round((completed / approved) * 100) : 0;

    const typeDist = CLAIM_TYPES.map(t => ({
        label: t.label,
        count: filteredClaims.filter(c => c.claimType === t.value).length,
        percentage: total > 0 ? Math.round((filteredClaims.filter(c => c.claimType === t.value).length / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    const entityStats = COMPANIES.map(comp => {
        const compClaims = filteredClaims.filter(c => c.company === comp);
        return {
            name: comp,
            count: compClaims.length,
            value: compClaims.reduce((acc, curr) => acc + parseFloat((curr.loanAmount || '0').replace(/,/g, '')), 0)
        };
    }).sort((a, b) => b.count - a.count);

    return { total, requested, approved, completed, rejected, approvalRate, completionRate, typeDist, entityStats };
  }, [filteredClaims]);

  const availableBranches = useMemo(() => {
    return filterCompany ? (COMPANY_BRANCH_MAPPING[filterCompany] || []) : [];
  }, [filterCompany]);

  const statCard = (label: string, value: number | string, icon: React.ReactNode, accentColor: string, bgColor: string, subLabel?: string) => (
    <div className={`relative overflow-hidden bg-white p-8 rounded-3xl shadow-sm border border-slate-200 transition-all hover:border-slate-300 group`}>
      <div className={`absolute top-0 right-0 p-8 opacity-[0.03] ${accentColor} group-hover:opacity-[0.06] transition-opacity`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-6 shadow-sm border border-slate-100`}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 20, className: accentColor })}
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-0.5">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{value}</h3>
            {subLabel && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{subLabel}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const filterLabelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 ml-1";
  const filterInputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-black uppercase text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all outline-none shadow-sm";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* GLOBAL FILTER CONSOLE */}
      <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col gap-10">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-blue-600 border border-slate-200 shadow-sm">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h2 className="text-slate-950 font-black uppercase text-xl tracking-tighter leading-none">Intelligence Hub Console</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 ml-0.5">Real-time analytical parameter configuration</p>
                  </div>
              </div>
              <button 
                onClick={() => { setFilterCompany(''); setFilterBranch(''); setFilterType(''); setFilterStatus(''); }} 
                className="bg-white text-slate-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm"
              >
                  <X size={14} className="inline mr-2" /> Reset Metrics
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div><label className={filterLabelClass}>Operating Organization</label><select className={filterInputClass} value={filterCompany} onChange={e => {setFilterCompany(e.target.value); setFilterBranch('');}}><option value="">ALL ENTITIES</option>{COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className={filterLabelClass}>Service Station</label><select className={filterInputClass} value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCompany}><option value="">ALL BRANCH NODES</option>{availableBranches.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
              <div><label className={filterLabelClass}>Product Portfolio</label><select className={filterInputClass} value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">ALL CLASSIFICATIONS</option>{CLAIM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>)}</select></div>
              <div><label className={filterLabelClass}>Lifecycle Path</label><select className={filterInputClass} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="">ANY STATUS</option><option value="Requested">REQUESTED</option><option value="Approved">APPROVED</option><option value="Completed">COMPLETED</option><option value="Rejected">REJECTED</option></select></div>
          </div>
      </div>

      {/* PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCard('Total Records', stats.total, <ClipboardList />, 'text-slate-600', 'bg-slate-50')}
        {statCard('Approval Rate', `${stats.approvalRate}%`, <Percent />, 'text-blue-600', 'bg-blue-50', 'KPI Efficiency')}
        {statCard('Finalized', stats.completed, <CheckCircle2 />, 'text-emerald-600', 'bg-emerald-50', `${stats.completionRate}% Sync`)}
        {statCard('Liability Exposure', `LKR ${(stats.total * 12500).toLocaleString()}`, <Activity />, 'text-indigo-600', 'bg-indigo-50', 'Estimate')}
      </div>

      {/* ANALYTICAL OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 rounded-xl text-white shadow-md"><BarChart3 size={20} /></div>
                    <div>
                        <h3 className="font-black text-slate-950 uppercase tracking-tighter text-lg">Risk Portfolio Segmentation</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-0.5">Distribution Analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <TrendingUp size={14} className="text-blue-600" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Pool</span>
                </div>
            </div>

            <div className="flex-1 space-y-10">
                {stats.typeDist.map((item) => (
                    <div key={item.label} className="group">
                        <div className="flex justify-between items-end mb-3">
                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white shadow-sm" />
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-950">{item.count} <span className="text-[9px] text-slate-300 ml-1">UNITS</span></span>
                                <span className="ml-4 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.percentage}%</span>
                            </div>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                            <div 
                                className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
            <div className="mb-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2.5 ml-1 flex items-center gap-2"><Building2 size={12} /> Organizational Hub</p>
                <h3 className="text-xl font-black uppercase leading-tight tracking-tighter text-slate-950">Entity Performance</h3>
            </div>

            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto custom-scrollbar -mx-2 px-2">
                {stats.entityStats.map((entity, i) => (
                    <div key={entity.name} className="py-6 flex items-center justify-between group hover:bg-slate-50 transition-all rounded-xl px-4">
                        <div className="flex items-center gap-5">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                                0{i+1}
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">{entity.name}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{entity.count} Protocols</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[12px] font-black text-slate-950 font-mono tracking-tight">LKR {(entity.value / 1000).toFixed(0)}K</p>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-1">Value</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100">
                <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 py-4 rounded-xl flex items-center justify-between px-6 transition-all group">
                    <span className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-900">Executive Data Export</span>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600" />
                </button>
            </div>
        </div>
      </div>

      {/* PERFORMANCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
          <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-12 border-b border-slate-100 pb-8">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-blue-600"><Zap size={20} fill="currentColor" /></div>
                <h4 className="text-lg font-black text-slate-950 uppercase tracking-tighter leading-none">Operational Efficiency Matrix</h4>
             </div>
             <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6 flex flex-col items-center">
                    <div className="relative w-28 h-28 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                            <circle cx="56" cy="56" r="48" fill="none" stroke="#3B82F6" strokeWidth="10" strokeDasharray="301.59" strokeDashoffset={301.59 * (1 - stats.approvalRate/100)} strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-950 leading-none">{stats.approvalRate}%</span>
                        </div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Approval Ratio</p>
                </div>
                <div className="space-y-6 flex flex-col items-center">
                    <div className="relative w-28 h-28 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                            <circle cx="56" cy="56" r="48" fill="none" stroke="#10B981" strokeWidth="10" strokeDasharray="301.59" strokeDashoffset={301.59 * (1 - stats.completionRate/100)} strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-950 leading-none">{stats.completionRate}%</span>
                        </div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Closure Accuracy Ratio</p>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <div className="bg-slate-50 px-10 py-6 border-b border-slate-200 flex items-center gap-4">
                 <Target className="text-slate-400" size={18} />
                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Workflow State Metrics</h4>
             </div>
             <div className="p-10 flex-1 flex flex-col justify-between">
                {[
                    { label: 'Requested Phase', count: stats.requested, color: 'bg-blue-600', text: 'text-blue-700' },
                    { label: 'Authorized Phase', count: stats.approved, color: 'bg-emerald-600', text: 'text-emerald-700' },
                    { label: 'Discrepancy (Declined)', count: stats.rejected, color: 'bg-slate-300', text: 'text-slate-400' },
                    { label: 'Archive Completed', count: stats.completed, color: 'bg-slate-900', text: 'text-slate-900' }
                ].map(status => (
                    <div key={status.label} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${status.color} shadow-sm border border-white`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{status.label}</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <span className={`text-sm font-black ${status.text}`}>{status.count}</span>
                            <div className="w-20 h-1 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full ${status.color}`} style={{ width: `${(status.count / (stats.total || 1)) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
      </div>

    </div>
  );
};

export default Summary;
