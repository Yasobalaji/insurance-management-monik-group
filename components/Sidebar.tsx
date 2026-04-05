
import React from 'react';
import { 
  Home, FilePlus, User, Package, ShieldCheck, CreditCard, 
  SearchCheck, LayoutGrid, Lock, ClipboardCheck, 
  History, BarChart3, ListChecks, Landmark, ShieldAlert, 
  FileSpreadsheet, Activity, MessageSquare, Bell, Gift,
  ChevronDown, ChevronRight, Building2, CheckCircle, Heart,
  Wallet, FileSearch, Truck, Boxes, Settings, Box, Database, Layers,
  Users, Command, Search, Laptop, Baby, Car, Home as HomeIcon, LogOut,
  ArrowLeftRight, PieChart, Truck as DeliveryIcon, Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User as UserType, InterfaceAccess, RoleDefinition } from '../types';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  currentView: string;
  setCurrentView: (view: any) => void;
  onLogout: () => void;
  onSwitchCategory: () => void;
  category: 'customer' | 'staff' | 'asset' | 'admin';
  currentUser: UserType | null;
  unreadCount: number;
  roles: RoleDefinition[];
}

const Sidebar: React.FC<Props> = ({ currentView, setCurrentView, onSwitchCategory, category, currentUser, unreadCount, roles, onLogout }) => {
  const { t } = useLanguage();

  const navItemClass = (isActive: boolean) => `
    group flex items-center gap-3 w-full px-5 py-3.5 rounded-xl transition-all duration-200 ease-out uppercase tracking-[0.12em] text-[10px] font-black
    ${isActive 
      ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-600 shadow-sm' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
  `;

  const sectionHeaderClass = "px-5 pt-8 pb-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-between";

  const isAdminModule = category === 'admin';

  return (
    <div className="hidden md:flex flex-col w-72 bg-white text-slate-900 min-h-screen fixed h-full z-50 border-r border-slate-200 shadow-sm">
      
      {/* BRANDING */}
      <div className="p-8 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onSwitchCategory}>
            <div className={`p-2.5 rounded-xl transition-all bg-blue-50 text-blue-600 border border-blue-100 shadow-sm`}>
                <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-[11px] font-black tracking-[0.2em] text-slate-900 uppercase leading-tight">MONIK GROUP</h1>
              <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Insurance Silo</p>
            </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 py-6 px-5 space-y-1.5 overflow-y-auto custom-scrollbar bg-white">
        
        <div className="mb-6 px-1">
           <button 
             onClick={onSwitchCategory} 
             className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white text-slate-900 border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95"
           >
              <ArrowLeftRight size={14} /> Switch Module
           </button>
        </div>

        {/* INTEGRATED LANGUAGE SELECTOR */}
        <LanguageSwitcher variant="sidebar" />

        {isAdminModule ? (
           <div className="space-y-1">
              <div className={sectionHeaderClass}>Administrator</div>
              <button onClick={() => setCurrentView('users')} className={navItemClass(currentView === 'users' || currentView === 'admin')}>
                 <Users size={18} /> User Registry
              </button>
              <button onClick={() => setCurrentView('roles')} className={navItemClass(currentView === 'roles')}>
                 <Command size={18} /> Role Architect
              </button>
              <button onClick={() => setCurrentView('products')} className={navItemClass(currentView === 'products')}>
                 <Box size={18} /> Product Studio
              </button>
              <button onClick={() => setCurrentView('data')} className={navItemClass(currentView === 'data')}>
                 <Database size={18} /> Data Vault
              </button>
           </div>
        ) : (
          <>
            {category === 'customer' && (
              <div className="space-y-1">
                 <div className={sectionHeaderClass}>Core Operations</div>
                 <button onClick={() => setCurrentView('dashboard')} className={navItemClass(currentView === 'dashboard')}>
                    <Activity size={18} /> Intelligence
                 </button>
                 <button onClick={() => setCurrentView('form')} className={navItemClass(currentView === 'form')}>
                    <FilePlus size={18} /> Entry Form
                 </button>
                 <button onClick={() => setCurrentView('list')} className={navItemClass(currentView === 'list')}>
                    <ListChecks size={18} /> Review Desk
                 </button>

                 <div className={sectionHeaderClass}>Benefits</div>
                 <button onClick={() => setCurrentView('stationery_pack')} className={navItemClass(currentView === 'stationery_pack')}>
                    <Gift size={18} /> Pack Logistics
                 </button>
                 <button onClick={() => setCurrentView('laptop_loan')} className={navItemClass(currentView === 'laptop_loan')}>
                    <Laptop size={18} /> Laptop Finance
                 </button>

                 <div className={sectionHeaderClass}>Verification</div>
                 <button onClick={() => setCurrentView('audit_review')} className={navItemClass(currentView === 'audit_review')}>
                    <FileSearch size={18} /> Audit Sync
                 </button>
                 <button onClick={() => setCurrentView('audit_report')} className={navItemClass(currentView === 'audit_report')}>
                    <FileSpreadsheet size={18} /> Audit Ledger
                 </button>

                 <div className={sectionHeaderClass}>Finance</div>
                 <button onClick={() => setCurrentView('payment_request')} className={navItemClass(currentView === 'payment_request')}>
                    <Wallet size={18} /> Dispatch Batch
                 </button>
                 <button onClick={() => setCurrentView('payment_update')} className={navItemClass(currentView === 'payment_update')}>
                    <CreditCard size={18} /> Payment Update
                 </button>

                 <div className={sectionHeaderClass}>Analytics</div>
                 <button onClick={() => setCurrentView('reports')} className={navItemClass(currentView === 'reports')}>
                    <PieChart size={18} /> Report Studio
                 </button>
                 <button onClick={() => setCurrentView('completed_claims')} className={navItemClass(currentView === 'completed_claims')}>
                    <CheckCircle size={18} /> Archive
                 </button>
              </div>
            )}

            {category === 'staff' && (
               <div className="space-y-1">
                  <div className={sectionHeaderClass}>Personnel</div>
                  <button onClick={() => setCurrentView('staff_main')} className={navItemClass(true)}>
                     <Heart size={18} /> Welfare Hub
                  </button>
               </div>
            )}

            {category === 'asset' && (
               <div className="space-y-1">
                  <div className={sectionHeaderClass}>Fleet</div>
                  <button onClick={() => setCurrentView('asset_alerts')} className={navItemClass(currentView === 'asset_alerts')}>
                     <Bell size={18} /> Expiry Alerts
                  </button>
                  <button onClick={() => setCurrentView('asset_registry')} className={navItemClass(currentView === 'asset_registry')}>
                     <Car size={18} /> Vehicle Assets
                  </button>
               </div>
            )}
          </>
        )}
      </div>

      {/* USER PROFILE */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all">
            <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm group-hover:border-blue-300 group-hover:text-blue-600 transition-all`}>
                <User size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 truncate">{currentUser?.name || 'User'}</p>
                <p className={`text-[8px] text-slate-500 uppercase tracking-widest font-black mt-0.5 opacity-60`}>
                  {roles.find(r => r.id === currentUser?.role)?.name || 'Executive'}
                </p>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
