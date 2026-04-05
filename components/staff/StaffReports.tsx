
import React, { useState, useMemo } from 'react';
import { StaffMember, StaffInsuranceRequest, StaffClaim } from '../../types';
import { BarChart3, PieChart, TrendingUp, DollarSign, Users, Activity, FileText, Landmark, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

interface Props {
  staffList: StaffMember[];
  requests: StaffInsuranceRequest[];
  claims: StaffClaim[];
}

const StaffReports: React.FC<Props> = ({ staffList, requests, claims }) => {
  const [reportType, setReportType] = useState<'staff' | 'requests' | 'claims' | 'financial' | 'compliance'>('staff');

  const stats = useMemo(() => {
    return {
        totalStaff: staffList.length,
        activeStaff: staffList.filter(s => s.status === 'Active').length,
        inactiveStaff: staffList.filter(s => s.status === 'Inactive').length,
        totalRequests: requests.length,
        pendingReq: requests.filter(r => r.status === 'Submitted').length,
        totalClaims: claims.length,
        claimsValue: claims.reduce((acc, c) => acc + c.requestedAmount, 0),
        approvedClaims: claims.filter(c => c.status === 'Approved').length,
        rejectedClaims: claims.filter(c => c.status === 'Rejected').length
    };
  }, [staffList, requests, claims]);

  const reportBtn = (id: typeof reportType, label: string) => (
      <button 
        onClick={() => setReportType(id)}
        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${reportType === id ? 'bg-blue-800 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
      >
          {label}
      </button>
  );

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-3">
                <BarChart3 className="text-blue-600" size={28} />
                <div>
                    <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">Intelligence Hub</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel Analytical reporting</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {reportBtn('staff', 'Personnel')}
                {reportBtn('requests', 'Workflow')}
                {reportBtn('claims', 'Incidents')}
                {reportBtn('financial', 'Financial')}
                {reportBtn('compliance', 'Compliance')}
            </div>
        </div>

        {reportType === 'staff' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm border-t-8 border-blue-600">
                        <Users className="text-blue-200 mb-4" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Enrollment</p>
                        <h4 className="text-4xl font-black text-blue-900">{stats.activeStaff}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm border-t-8 border-slate-300">
                        <Users className="text-slate-100 mb-4" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inactive/Archived</p>
                        <h4 className="text-4xl font-black text-slate-400">{stats.inactiveStaff}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm border-t-8 border-indigo-600">
                        <Activity className="text-indigo-100 mb-4" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Workforce</p>
                        <h4 className="text-4xl font-black text-blue-900">{stats.totalStaff}</h4>
                    </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center py-20 text-slate-300 font-black uppercase text-sm italic tracking-[0.2em]">
                    Departmental distribution charts initializing...
                </div>
            </div>
        )}

        {reportType === 'requests' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Depth</p>
                            <h4 className="text-3xl font-black text-blue-900 uppercase">{stats.pendingReq} PENDING</h4>
                        </div>
                        <Clock size={40} className="text-blue-50" />
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Volume</p>
                            <h4 className="text-3xl font-black text-blue-900 uppercase">{stats.totalRequests} TOTAL</h4>
                        </div>
                        <TrendingUp size={40} className="text-blue-50" />
                    </div>
                </div>
                <div className="h-64 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 font-black uppercase text-xs">Turnaround time analysis coming soon</div>
            </div>
        )}

        {reportType === 'claims' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <Activity className="text-emerald-600 mb-2" size={24} />
                        <p className="text-[9px] font-black text-emerald-800 uppercase">Approved</p>
                        <h4 className="text-2xl font-black text-emerald-900">{stats.approvedClaims}</h4>
                    </div>
                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                        <AlertCircle className="text-red-600 mb-2" size={24} />
                        <p className="text-[9px] font-black text-red-800 uppercase">Rejected</p>
                        <h4 className="text-2xl font-black text-red-900">{stats.rejectedClaims}</h4>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                        <Activity className="text-blue-600 mb-2" size={24} />
                        <p className="text-[9px] font-black text-blue-800 uppercase">Total Incidents</p>
                        <h4 className="text-2xl font-black text-blue-900">{stats.totalClaims}</h4>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                        <DollarSign className="text-indigo-600 mb-2" size={24} />
                        <p className="text-[9px] font-black text-indigo-800 uppercase">Gross Loss</p>
                        <h4 className="text-2xl font-black text-indigo-900">{stats.claimsValue.toLocaleString()}</h4>
                    </div>
                </div>
            </div>
        )}

        {reportType === 'financial' && (
            <div className="py-24 text-center space-y-4 opacity-50">
                <Landmark size={64} className="mx-auto text-blue-200" />
                <h4 className="text-xl font-black text-blue-900 uppercase">Financial Audit Ledger</h4>
                <p className="text-[10px] font-black uppercase text-slate-400 max-w-sm mx-auto">Premium reconciliation and departmental cost-center analysis module loading...</p>
            </div>
        )}

        {reportType === 'compliance' && (
            <div className="py-24 text-center space-y-4 opacity-50">
                <ShieldCheck size={64} className="mx-auto text-emerald-200" />
                <h4 className="text-xl font-black text-emerald-900 uppercase">Compliance Registry</h4>
                <p className="text-[10px] font-black uppercase text-slate-400 max-w-sm mx-auto">Policy expiry monitoring and documentation integrity verification suite...</p>
            </div>
        )}
    </div>
  );
};

export default StaffReports;
