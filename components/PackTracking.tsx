
import React from 'react';
import { BaseClaimData } from '../types';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
}

const PackTracking: React.FC<Props> = ({ claims, onUpdateClaim }) => {
  const { t } = useLanguage();
  // Filter claims that are Approved AND have a Pack component
  const packClaims = claims.filter(c => 
    c.status === 'Approved' && 
    (c.approvedBenefitType === 'Pack' || c.approvedBenefitType === 'Both')
  );

  const handleDateChange = (id: string, field: 'packRequestDate' | 'packDeliveredDate', value: string) => {
    onUpdateClaim(id, { [field]: value });
  };

  const inputClass = "block w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-xs font-bold uppercase border p-1.5 bg-white text-slate-800";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="bg-purple-600 p-3 rounded-xl shadow-lg shadow-purple-200">
            <Package className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">{t('approvedPackTracking')}</h2>
      </div>

      {packClaims.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl text-center shadow-lg border border-slate-200">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-6 border-4 border-purple-100">
                <Package className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">{t('noApprovedPacks')}</h3>
            <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('approvePackHint')}</p>
        </div>
      ) : (
         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('refId')}</th>
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('customer')}</th>
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('packType')}</th>
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('requestDate')}</th>
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('deliveredDate')}</th>
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {packClaims.map((claim) => (
                            <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-5 whitespace-nowrap text-xs font-black font-mono text-purple-700 uppercase">#{claim.id.slice(-6)}</td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-xs font-black text-slate-900 uppercase">{claim.customerName}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{claim.branch}</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider rounded">
                                        {claim.approvedPackType}
                                    </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <input 
                                        type="date"
                                        className={inputClass}
                                        value={claim.packRequestDate || ''}
                                        onChange={(e) => handleDateChange(claim.id, 'packRequestDate', e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                     <input 
                                        type="date"
                                        className={inputClass}
                                        value={claim.packDeliveredDate || ''}
                                        onChange={(e) => handleDateChange(claim.id, 'packDeliveredDate', e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    {claim.packDeliveredDate ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                            <CheckCircle className="w-3 h-3" strokeWidth={3} /> {t('delivered')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 uppercase tracking-wider">
                                            <Clock className="w-3 h-3" strokeWidth={3} /> {t('pending')}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default PackTracking;
