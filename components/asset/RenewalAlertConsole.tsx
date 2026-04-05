
import React, { useState, useMemo } from 'react';
import { 
  Bell, Mail, Calendar, Send, Info, Clock, AlertCircle, CheckCircle2,
  Car, FileText, Smartphone, User, X, Landmark, ChevronRight, Paperclip, Loader2
} from 'lucide-react';
import { Vehicle, User as UserType } from '../../types';
import Modal from '../Modal';

interface Props {
  vehicles: Vehicle[];
  onUpdateVehicles: (v: Vehicle[]) => void;
  currentUser: UserType | null;
}

const RenewalAlertConsole: React.FC<Props> = ({ vehicles, onUpdateVehicles, currentUser }) => {
  const [selectedForEmail, setSelectedForEmail] = useState<Vehicle | null>(null);
  const [emailType, setEmailType] = useState<'Insurance' | 'RevenueLicence'>('Insurance');
  const [isSending, setIsSending] = useState(false);
  
  const now = new Date();
  
  const alerts = useMemo(() => {
    const list: { vehicle: Vehicle; type: 'Insurance' | 'RevenueLicence' | 'DL'; expiry: string; daysLeft: number; status: 'Red' | 'Orange' | 'Yellow' | 'Green' }[] = [];
    
    vehicles.forEach(v => {
      const checkExpiry = (expiryStr: string, type: 'Insurance' | 'RevenueLicence' | 'DL') => {
        const expiry = new Date(expiryStr);
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        let status: 'Red' | 'Orange' | 'Yellow' | 'Green' = 'Green';
        if (diffDays <= 0) status = 'Red';
        else if (diffDays <= 15) status = 'Orange';
        else if (diffDays <= 30) status = 'Yellow';
        
        if (status !== 'Green') {
          list.push({ vehicle: v, type, expiry: expiryStr, daysLeft: diffDays, status });
        }
      };

      checkExpiry(v.insurance.expiryDate, 'Insurance');
      checkExpiry(v.revenueLicence.expiryDate, 'RevenueLicence');
      checkExpiry(v.allocatedPerson.drivingLicenceExpiry, 'DL');
    });

    return list.sort((a,b) => a.daysLeft - b.daysLeft);
  }, [vehicles]);

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      alert("Renewal request email dispatched successfully to external party.");
      setIsSending(false);
      setSelectedForEmail(null);
    }, 1500);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Red': return 'bg-red-500 text-white shadow-red-200';
      case 'Orange': return 'bg-orange-500 text-white shadow-orange-200';
      case 'Yellow': return 'bg-amber-400 text-slate-900 shadow-amber-100';
      default: return 'bg-emerald-500 text-white shadow-emerald-200';
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-4 rounded-3xl text-emerald-400 shadow-xl"><Clock size={32} /></div>
            <div>
                <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Renewal Alert Dashboard</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Real-time Expiry Monitoring Protocol</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Expired Documents</p>
                    <h4 className="text-3xl font-black text-red-900">{alerts.filter(a=>a.status==='Red').length}</h4>
                </div>
                <AlertCircle className="text-red-200" size={40} />
            </div>
            <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Expiring (15 Days)</p>
                    <h4 className="text-3xl font-black text-orange-900">{alerts.filter(a=>a.status==='Orange').length}</h4>
                </div>
                <Clock className="text-orange-200" size={40} />
            </div>
            <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Valid Registry</p>
                    <h4 className="text-3xl font-black text-emerald-900">{vehicles.length - alerts.length}</h4>
                </div>
                <CheckCircle2 className="text-emerald-200" size={40} />
            </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden">
            <div className="bg-slate-900 text-white px-8 py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-between">
                <span>Active Expiry Alert Queue</span>
                <span className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-lg">Critical Sync Active</span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-50">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Doc Category</th>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiry Timeline</th>
                            <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 bg-white">
                        {alerts.length === 0 ? (
                            <tr><td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic">No pending renewal alerts identified</td></tr>
                        ) : (
                            alerts.map((alert, i) => (
                                <tr key={i} className="hover:bg-sky-50/20 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-black text-blue-900 uppercase mb-1">{alert.vehicle.id}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{alert.vehicle.model} • {alert.vehicle.registeredCompany}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-lg border border-blue-100">
                                            {alert.type.replace('RevenueLicence', 'Revenue Lic.')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-2 py-1 rounded text-[8px] font-black uppercase shadow-sm ${getStatusStyle(alert.status)}`}>
                                                {alert.daysLeft <= 0 ? 'EXPIRED' : `${alert.daysLeft} DAYS LEFT`}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase">{alert.expiry}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => {setSelectedForEmail(alert.vehicle); setEmailType(alert.type as any);}}
                                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg transition-all flex items-center justify-center gap-2 ml-auto active:scale-95"
                                        >
                                            <Mail size={14} /> Init Renewal
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* MANUAL EMAIL COMPOSER MODAL (Part 1.4 Step 2) */}
        {selectedForEmail && (
            <Modal isOpen={!!selectedForEmail} onClose={() => setSelectedForEmail(null)} title="EXTERNAL RENEWAL DISPATCH">
                <div className="space-y-8 animate-in zoom-in duration-300">
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Mail size={100} /></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Pre-filled Intelligence Template</p>
                            <h3 className="text-2xl font-black uppercase">Renewal Request: {selectedForEmail.id}</h3>
                            <div className="flex flex-wrap gap-4 mt-4">
                                <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-tighter">Model: {selectedForEmail.model}</span>
                                <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-tighter">Emp: {selectedForEmail.allocatedPerson.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Address</label>
                                <input className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold bg-slate-50 outline-none" defaultValue="renewals@insurance.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Protocol</label>
                                <input className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold bg-slate-50 outline-none" value={`RENEWAL REQUEST - ${emailType.toUpperCase()} - ${selectedForEmail.id}`} readOnly />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Message Payload</label>
                            <textarea 
                                className="w-full h-48 border border-slate-200 rounded-2xl p-6 text-xs font-bold bg-slate-50 outline-none uppercase leading-relaxed font-mono"
                                value={`TO WHOM IT MAY CONCERN,\n\nPLEASE INITIATE THE RENEWAL FOR THE FOLLOWING UNIT:\n\nUNIT NO: ${selectedForEmail.id}\nMODEL: ${selectedForEmail.model}\nORG: ${selectedForEmail.registeredCompany}\nCHASSIS: ${selectedForEmail.chassisNumber}\n\nRENEWAL TYPE: ${emailType.toUpperCase()}\nCURRENT EXPIRY: ${emailType === 'Insurance' ? selectedForEmail.insurance.expiryDate : selectedForEmail.revenueLicence.expiryDate}\n\nATTACHED: CR BOOK, UNIT PHOTOS, METER READINGS.\n\nREGARDS,\nFLEET MANAGEMENT UNIT`}
                                readOnly
                            />
                        </div>

                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Paperclip className="text-emerald-600" size={20} />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">Automated Attachments Package</p>
                                    <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">4 Files Bundled (CR, Photos, Chassis, Meter)</p>
                                </div>
                            </div>
                            <CheckCircle2 className="text-emerald-500" size={24} />
                        </div>

                        <button 
                            onClick={handleSendEmail}
                            disabled={isSending}
                            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.25em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-slate-400"
                        >
                            {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {isSending ? 'Syncing with Server...' : 'Dispatch Encrypted Email'}
                        </button>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default RenewalAlertConsole;
