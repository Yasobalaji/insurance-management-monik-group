
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, Package, BarChart3, ShieldAlert, Bell, Plus, Filter, Search, 
  Settings, UserCheck, Calendar, Activity, ChevronRight, Mail, FileText,
  Clock, CheckCircle2, AlertTriangle, Layers, Building2, TrendingUp, DollarSign, ShieldCheck, Home
} from 'lucide-react';
import { User, Vehicle, GeneralAsset, VehicleClaim, GeneralAssetClaim } from '../types';
import VehicleInventory from './asset/VehicleInventory';
import PropertyAssetClaims from './asset/PropertyAssetClaims';
import AssetReports from './asset/AssetReports';
import RenewalAlertConsole from './asset/RenewalAlertConsole';
import { MOCK_VEHICLES, MOCK_VEHICLE_CLAIMS, MOCK_ASSET_CLAIMS } from '../utils/mockData';

interface Props {
  currentUser: User | null;
  isGlobal: boolean;
  currentView?: string;
}

const AssetManagementModule: React.FC<Props> = ({ currentUser, isGlobal, currentView }) => {
  const [internalTab, setInternalTab] = useState<'alerts' | 'vehicles' | 'property' | 'reports'>('alerts');
  
  // Sync global view with internal tab
  useEffect(() => {
    if (currentView === 'asset_alerts') setInternalTab('alerts');
    else if (currentView === 'asset_registry') setInternalTab('vehicles');
    else if (currentView === 'asset_claims') setInternalTab('property');
    else if (currentView === 'asset_reports') setInternalTab('reports');
    else if (currentView === 'dashboard') setInternalTab('alerts');
  }, [currentView]);

  const activeTab = internalTab;
  const setActiveTab = setInternalTab;
  
  // Data States - Initialized with comprehensive mock datasets
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [assetClaims, setAssetClaims] = useState<any[]>(MOCK_ASSET_CLAIMS);
  const [vehicleClaims, setVehicleClaims] = useState<VehicleClaim[]>(MOCK_VEHICLE_CLAIMS);

  const cardClass = "bg-white rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden min-h-[750px]";
  
  const tabButton = (id: typeof activeTab, label: string, icon: React.ReactNode) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl transition-all border-2 ${isActive ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105' : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
      >
        <div className={`p-3 rounded-2xl ${isActive ? 'bg-emerald-600 shadow-lg' : 'bg-slate-100'}`}>{icon}</div>
        <span className="font-black text-[9px] uppercase tracking-widest">{label}</span>
      </button>
    );
  };

  const getAlertCount = () => {
    let count = 0;
    const now = new Date();
    vehicles.forEach(v => {
      const insExpiry = new Date(v.insurance.expiryDate);
      const revExpiry = new Date(v.revenueLicence.expiryDate);
      const dlExpiry = v.allocatedPerson?.drivingLicenceExpiry ? new Date(v.allocatedPerson.drivingLicenceExpiry) : null;
      
      const diffIns = (insExpiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
      const diffRev = (revExpiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
      
      if (diffIns <= 30 || diffRev <= 30) count++;
      if (dlExpiry) {
        const diffDl = (dlExpiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDl <= 30) count++;
      }
    });
    return count;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* MODULE HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="flex items-center gap-6">
           <div className="bg-emerald-600 p-5 rounded-[2rem] text-white shadow-2xl rotate-[-2deg]">
             <ShieldCheck size={40} />
           </div>
           <div>
             <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">Enterprise Asset Insurance</h1>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Fleet & Property Risk Management</p>
           </div>
        </div>
        <div className="bg-white p-3 rounded-[3rem] shadow-xl border border-blue-50 grid grid-cols-4 gap-2">
          {tabButton('alerts', 'Alert Console', (
            <div className="relative">
              <Bell size={20} />
              {getAlertCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{getAlertCount()}</span>
              )}
            </div>
          ))}
          {tabButton('vehicles', 'Fleet Registry', <Car size={20} />)}
          {tabButton('property', 'Property Claims', <Home size={20} />)}
          {tabButton('reports', 'Analytics', <BarChart3 size={20} />)}
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className={cardClass}>
        <div className="p-1">
            {activeTab === 'alerts' && (
              <RenewalAlertConsole 
                vehicles={vehicles} 
                onUpdateVehicles={setVehicles}
                currentUser={currentUser}
              />
            )}
            {activeTab === 'vehicles' && (
              <VehicleInventory 
                vehicles={vehicles} 
                claims={vehicleClaims}
                onUpdateVehicles={setVehicles}
                onUpdateClaims={setVehicleClaims}
                currentUser={currentUser}
              />
            )}
            {activeTab === 'property' && (
              <PropertyAssetClaims 
                claims={assetClaims}
                onUpdateClaims={setAssetClaims}
                currentUser={currentUser}
              />
            )}
            {activeTab === 'reports' && (
              <AssetReports 
                vehicles={vehicles} 
                assets={[]} 
                vehicleClaims={vehicleClaims}
                assetClaims={assetClaims}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default AssetManagementModule;
