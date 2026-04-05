
import React, { useState } from 'react';
import { User, StaffMember, StaffInsuranceRequest, StaffClaim } from '../types';
import { Users, FileText, ClipboardList, Package, BarChart3, Plus, Search, Filter, ShieldCheck, UserPlus, Heart, Activity, BadgeCheck, FileBox, FileArchive, Building2 } from 'lucide-react';
import StaffRegistration from './staff/StaffRegistration';
import StaffRequestModule from './staff/StaffRequestModule';
import StaffClaimModule from './staff/StaffClaimModule';
import StaffReports from './staff/StaffReports';
import StaffDocumentVault from './staff/StaffDocumentVault';
import { MOCK_STAFF, MOCK_STAFF_CLAIMS } from '../utils/mockData';

interface Props {
  currentUser: User | null;
  isGlobal: boolean;
}

const StaffInsuranceModule: React.FC<Props> = ({ currentUser, isGlobal }) => {
  const [activeTab, setActiveTab] = useState<'reg' | 'req' | 'claims' | 'docs' | 'reports'>('reg');
  
  // High-level data state - Initialized with rich demo data
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [requests, setRequests] = useState<StaffInsuranceRequest[]>([]);
  const [claims, setClaims] = useState<StaffClaim[]>(MOCK_STAFF_CLAIMS);

  const cardClass = "bg-white rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden min-h-[700px]";
  
  const tabButton = (id: typeof activeTab, label: string, icon: React.ReactNode) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl transition-all border-2 ${activeTab === id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105' : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      <div className={`p-3 rounded-2xl ${activeTab === id ? 'bg-red-600 shadow-lg' : 'bg-slate-100'}`}>{icon}</div>
      <span className="font-black text-[9px] uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* MODULE NAVIGATION HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="flex items-center gap-6">
           <div className="bg-red-600 p-5 rounded-[2rem] text-white shadow-2xl rotate-3">
             <Building2 size={40} />
           </div>
           <div>
             <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">Internal Welfare Engine</h1>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Staff Insurance Management Silo</p>
           </div>
        </div>
        <div className="bg-white p-3 rounded-[3rem] shadow-xl border border-blue-50 grid grid-cols-5 gap-2">
          {tabButton('reg', 'Directory', <UserPlus size={20} />)}
          {tabButton('req', 'Requests', <ClipboardList size={20} />)}
          {tabButton('claims', 'Incidents', <Heart size={20} />)}
          {tabButton('docs', 'Documents', <FileArchive size={20} />)}
          {tabButton('reports', 'Executive', <BarChart3 size={20} />)}
        </div>
      </div>

      {/* RENDER ACTIVE MODULE */}
      <div className={cardClass}>
        <div className="p-1">
            {activeTab === 'reg' && <StaffRegistration staffList={staffList} onUpdate={setStaffList} />}
            {activeTab === 'req' && <StaffRequestModule requests={requests} staffList={staffList} onUpdate={setRequests} />}
            {activeTab === 'claims' && <StaffClaimModule claims={claims} staffList={staffList} onUpdate={setClaims} />}
            {activeTab === 'docs' && <StaffDocumentVault staffList={staffList} claims={claims} requests={requests} />}
            {activeTab === 'reports' && <StaffReports staffList={staffList} requests={requests} claims={claims} />}
        </div>
      </div>
    </div>
  );
};

export default StaffInsuranceModule;
