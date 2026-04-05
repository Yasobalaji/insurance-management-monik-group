
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, DollarSign, FileSpreadsheet, 
  Search, Filter, Calendar, Building2, Truck, Box, Clock, Activity,
  CheckCircle2, AlertTriangle, Layers, MapPin, Home, X
} from 'lucide-react';
import { Vehicle, VehicleClaim } from '../../types';
import { COMPANIES, BRANCHES, ASSET_INSURANCE_CATEGORIES } from '../../constants';

interface Props {
  vehicles: Vehicle[];
  assets: any[]; 
  vehicleClaims: VehicleClaim[];
  assetClaims: any[];
}

const AssetReports: React.FC<Props> = ({ vehicles, vehicleClaims, assetClaims }) => {
  const [reportType, setReportType] = useState<'fleet' | 'property' | 'claims' | 'financial'>('fleet');

  // Advanced Filters
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = useMemo(() => {
    const vcFiltered = vehicleClaims.filter(c => {
      const v = vehicles.find(v => v.id === c.vehicleNumber);
      if (filterCompany && v?.registeredCompany !== filterCompany) return false;
      // Branch filtering for vehicles would need branch data on vehicle object
      if (startDate && new Date(c.dateOfIncident) < new Date(startDate)) return false;
      if (endDate && new Date(c.dateOfIncident) > new Date(endDate)) return false;
      return true;
    });

    const acFiltered = assetClaims.filter(c => {
      if (filterCompany && c.company !== filterCompany) return false;
      if (filterCategory && c.category !== filterCategory) return false;
      if (startDate && new Date(c.dateOfIncident) < new Date(startDate)) return false;
      if (endDate && new Date(c.dateOfIncident) > new Date(endDate)) return false;
      return true;
    });

    const vFiltered = vehicles.filter(v => {
      if (filterCompany && v.registeredCompany !== filterCompany) return false;
      return true;
    });

    return {
      vehicleClaims: vcFiltered,
      assetClaims: acFiltered,
      vehicles: vFiltered
    };
  }, [vehicles, vehicleClaims, assetClaims, filterCompany, filterBranch, filterCategory, startDate, endDate]);

  const stats = useMemo(() => {
    return {
        totalVehicleValue: filteredData.vehicles.reduce((acc, v) => acc + (v.insurance.coverageAmount || 0), 0),
        totalClaimAmount: [...filteredData.vehicleClaims, ...filteredData.assetClaims].reduce((acc, c) => acc + (c.claimAmount || c.estimatedCost || 0), 0),
        fleetCount: filteredData.vehicles.length,
        propertyClaimCount: filteredData.assetClaims.length,
        vehicleClaimCount: filteredData.vehicleClaims.length
    };
  }, [filteredData]);

  const handleExport = (type: string) => {
    alert(`Generating Executive ${type.toUpperCase()} PDF Report with current filters...`);
  };

  const statCard = (label: string, value: string | number, icon: React.ReactNode, color: string) => (
    <div className={`bg-white p-6 rounded-[2rem] shadow-xl border-b-8 ${color} transition-all hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <h3 className="text-2xl font-black text-blue-900 leading-none">{value}</h3>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 text-slate-400">{icon}</div>
      </div>
    </div>
  );

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl p-3 text-[10px] font-black uppercase focus:ring-2 focus:ring-emerald-600 outline-none transition-all shadow-sm";
  const filterLabel = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
            <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-4 rounded-3xl text-emerald-400 shadow-2xl"><BarChart3 size={32} /></div>
                <div>
                    <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Asset Risk Intelligence</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Predictive & Real-time Loss Analysis</p>
                </div>
            </div>
            <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-100 gap-2">
                {(['fleet', 'property', 'claims', 'financial'] as const).map(t => (
                    <button 
                        key={t}
                        onClick={() => setReportType(t)}
                        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${reportType === t ? 'bg-blue-800 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                    >
                        {t === 'property' ? 'Property & Asset' : t}
                    </button>
                ))}
            </div>
        </div>

        {/* CUSTOMIZABLE FILTERS PANEL */}
        <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 relative overflow-hidden group shadow-inner">
            <div className="flex items-center gap-3 mb-6">
                <Filter className="text-emerald-600" size={20} />
                <h4 className="text-blue-900 font-black uppercase text-xs tracking-widest">Report Customization Engine</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                    <label className={filterLabel}>Organization</label>
                    <select className={inputClass} value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                        <option value="">All Companies</option>
                        {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className={filterLabel}>Branch Station</label>
                    <select className={inputClass} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                        <option value="">All Branches</option>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label className={filterLabel}>Asset Category</label>
                    <select className={inputClass} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {ASSET_INSURANCE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={filterLabel}>Incident From</label>
                    <input type="date" className={inputClass} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label className={filterLabel}>Incident To</label>
                    <input type="date" className={inputClass} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={() => { setFilterCompany(''); setFilterBranch(''); setFilterCategory(''); setStartDate(''); setEndDate(''); }}
                        className="w-full bg-slate-900 text-white font-black text-[10px] uppercase py-3 rounded-xl hover:bg-black transition-all"
                    >Reset Engine</button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCard('Insured Value', `LKR ${stats.totalVehicleValue.toLocaleString()}`, <DollarSign size={24}/>, 'border-blue-600')}
            {statCard('Active Fleet', stats.fleetCount, <Truck size={24}/>, 'border-emerald-500')}
            {statCard('Loss Exposure', `LKR ${stats.totalClaimAmount.toLocaleString()}`, <AlertTriangle size={24}/>, 'border-red-600')}
            {statCard('Incident Volume', stats.propertyClaimCount + stats.vehicleClaimCount, <Activity size={24}/>, 'border-indigo-600')}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl border border-blue-50">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-blue-600" size={24} />
                        <h3 className="text-xl font-black text-blue-900 uppercase">Risk Distribution</h3>
                    </div>
                    <button onClick={()=>handleExport(reportType)} className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-slate-900 transition-all">
                        <FileSpreadsheet size={14} /> Master Export
                    </button>
                </div>
                
                <div className="h-[400px] bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed flex items-center justify-center text-center p-12">
                    <div className="space-y-4">
                        <Layers size={64} className="mx-auto text-slate-200" />
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.25em]">Predictive {reportType} modeling engine active...</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 text-white">
                <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
                    <PieChart className="text-emerald-400" size={24} />
                    <h3 className="text-xl font-black uppercase">Category Density</h3>
                </div>
                
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                            <span>Property / Building</span>
                            <span>{filteredData.assetClaims.filter(c=>c.category==='property').length} Claims</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{width: '65%'}} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                            <span>Machinery Risk</span>
                            <span>{filteredData.assetClaims.filter(c=>c.category==='machinery').length} Claims</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{width: '45%'}} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                            <span>Electronics & IT</span>
                            <span>{filteredData.assetClaims.filter(c=>c.category==='electronics').length} Claims</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{width: '30%'}} />
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Financial Recon Ratio</h4>
                    <div className="flex items-center gap-4">
                        <Activity size={32} className="text-emerald-600" />
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Asset Resilience Score</p>
                            <p className="text-2xl font-black text-white">4.8 <span className="text-xs text-slate-500">/ 5.0</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AssetReports;
