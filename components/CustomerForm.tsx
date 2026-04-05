
import React, { useState, useEffect, useMemo } from 'react';
import { COMPANY_BRANCH_MAPPING, COMPANIES } from '../constants';
import { BaseClaimData, CollectionMethod, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
// Fix: Added MapPin to imports
import { UserCheck, Clock, AlertCircle, ShieldAlert, CalendarDays, History, Fingerprint, BadgeInfo, Table, Info, Calendar, MapPin } from 'lucide-react';

interface Props {
  data: Partial<BaseClaimData>;
  onChange: (field: string, value: any) => void;
  userBranches?: string[];
  userCompanies?: string[];
  isGlobal?: boolean;
  currentUser?: User | null;
  allClaims: BaseClaimData[];
}

const CustomerForm: React.FC<Props> = ({ data, onChange, userBranches, userCompanies, isGlobal, currentUser, allClaims }) => {
  const { t, language } = useLanguage();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : language === 'si' ? 'si-LK' : 'ta-LK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);

  const formattedTime = now.toLocaleTimeString(language === 'en' ? 'en-GB' : language === 'si' ? 'si-LK' : 'ta-LK', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1";
  const inputClass = "block w-full rounded-xl border-slate-200 shadow-sm border p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase text-sm font-black transition-all placeholder:text-slate-300";
  const selectClass = "block w-full rounded-xl border-slate-200 shadow-sm border p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase text-sm font-black cursor-pointer transition-all appearance-none";

  const handleCurrencyBlur = (field: string, value: string) => {
    const clean = value.replace(/[^\d.]/g, '');
    if (!clean) return;
    const num = parseFloat(clean);
    if (!isNaN(num)) {
      const formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      onChange(field, formatted);
    }
  };

  const arrearsNum = parseFloat(data.arrears?.replace(/,/g, '') || '0');
  const hasArrears = !isNaN(arrearsNum) && arrearsNum > 0;
  
  const canSelectDate = isGlobal || currentUser?.interfaceAccess?.customer?.dateSelection;

  const availableCompanies = useMemo(() => {
    if (isGlobal) return COMPANIES;
    return userCompanies && userCompanies.length > 0 ? COMPANIES.filter(c => userCompanies.includes(c)) : [];
  }, [isGlobal, userCompanies]);

  const availableBranches = useMemo(() => {
    const companyBranches = data.company ? (COMPANY_BRANCH_MAPPING[data.company] || []) : [];
    if (isGlobal) return companyBranches;
    return companyBranches.filter(b => {
      const key = `${data.company}:${b}`;
      return userBranches?.some(ub => ub === key || ub === b);
    });
  }, [data.company, isGlobal, userBranches]);

  const loanHistory = useMemo(() => {
    if (!data.loanNumber || data.loanNumber.length < 3) return [];
    return allClaims.filter(c => c.loanNumber.toLowerCase() === data.loanNumber?.toLowerCase());
  }, [data.loanNumber, allClaims]);

  useEffect(() => {
    if (data.company && !data.customerInsuranceId) {
      const companyCount = allClaims.filter(c => c.company === data.company).length;
      const newId = `${data.company}/${(companyCount + 1).toString().padStart(4, '0')}`;
      onChange('customerInsuranceId', newId);
    }
  }, [data.company, allClaims]);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="absolute top-0 right-0 z-10 p-6 opacity-40">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {formattedTime}
          </span>
        </div>
      </div>

      <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-blue-600">
                <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-slate-900 font-black text-xl uppercase tracking-tighter">Beneficiary Mapping Protocol</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Phase 01: Identification Matrix</p>
            </div>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">Authorized Entry</span>
      </div>
      
      <div className="p-10 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-2xl border border-slate-100">
             <div className="relative">
                <label className={labelClass}>{t('company')}</label>
                <div className="relative">
                  <select 
                      className={`${selectClass} ${!data.company ? 'border-blue-200' : ''}`}
                      value={data.company || ''} 
                      onChange={(e) => {
                          onChange('company', e.target.value);
                          onChange('branch', '');
                          onChange('customerInsuranceId', ''); 
                      }}
                  >
                      <option value="">{t('selectCompany')}</option>
                      {availableCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Table size={16} /></div>
                </div>
            </div>
             <div className="relative">
                <label className={labelClass}>{t('branch')}</label>
                <div className="relative">
                  <select 
                      className={`${selectClass} ${!data.branch ? 'border-blue-200' : ''}`}
                      value={data.branch || ''} 
                      onChange={(e) => onChange('branch', e.target.value)}
                      disabled={!data.company}
                  >
                      <option value="">{t('selectBranch')}</option>
                      {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {/* Fixed: MapPin correctly imported from lucide-react */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><MapPin size={16} /></div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="relative">
              <label className={labelClass}>{t('loanNumber')}</label>
              <div className="relative">
                <input type="text" className={`${inputClass} ${loanHistory.length > 0 ? 'border-blue-400' : ''}`} value={data.loanNumber || ''} onChange={(e) => onChange('loanNumber', e.target.value)} placeholder="Ex: LN-99501" />
                {loanHistory.length > 0 && <div className="absolute right-4 top-1/2 -translate-y-1/2"><BadgeInfo className="text-blue-600" size={18} /></div>}
              </div>
          </div>

          <div>
              <label className={labelClass}>{t('customerName')}</label>
              <input type="text" className={inputClass} value={data.customerName || ''} onChange={(e) => onChange('customerName', e.target.value)} />
          </div>

          <div>
              <label className={labelClass}>Lifecycle Identifier</label>
              <div className="relative">
                <input type="text" className="block w-full rounded-xl border-slate-200 shadow-inner border p-4 bg-white text-blue-900 uppercase text-sm font-black cursor-not-allowed italic" value={data.customerInsuranceId || 'AUTO GENERATING...'} readOnly />
                <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600/30" size={18} />
              </div>
          </div>

          {loanHistory.length > 0 && (
            <div className="col-span-full animate-in slide-in-from-top-2 duration-500">
               <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-white">
                        <History size={16} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Master Ledger for: {data.loanNumber}</span>
                     </div>
                     <span className="bg-blue-600 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm">{loanHistory.length} Previous Protocols</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50">Epoch</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50">Reference</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50">Category</th>
                          <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Aggregate Val</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {loanHistory.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-slate-600 border-r border-slate-50">{new Date(h.timestamp).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] font-black text-blue-900 border-r border-slate-50">{h.customerInsuranceId}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-black text-[10px] text-slate-800 uppercase border-r border-slate-50">{h.claimType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-[11px] font-black text-slate-900">{h.approvedCashAmount || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-white p-4 flex items-center justify-center gap-3 text-[10px] font-black text-blue-600 uppercase border-t border-slate-200">
                    <AlertCircle size={14} /> Audit Notice: verify disbursement accumulation to prevent redundant entries
                  </div>
               </div>
            </div>
          )}

          <div>
              <label className={labelClass}>National Identification</label>
              <input 
                type="text" 
                className={inputClass} 
                value={data.idNumber || ''} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  onChange('idNumber', val);
                }} 
                placeholder="NUMBERS ONLY (E.G. 1980...)" 
              />
          </div>

          <div>
               <label className={labelClass}>{t('centerName')}</label>
              <input type="text" className={inputClass} value={data.centerName || ''} onChange={(e) => onChange('centerName', e.target.value)} />
          </div>

           <div>
              <label className={labelClass}>{t('loanAmount')}</label>
              <input 
                type="text" 
                placeholder="100,000.00" 
                className={inputClass} 
                value={data.loanAmount || ''} 
                onChange={(e) => onChange('loanAmount', e.target.value)}
                onBlur={(e) => handleCurrencyBlur('loanAmount', e.target.value)}
              />
          </div>
          
           <div>
              <label className={labelClass}>{t('collectionMethod')}</label>
              <div className="relative">
                <select className={selectClass} value={data.collectionMethod || ''} onChange={(e) => onChange('collectionMethod', e.target.value as CollectionMethod)}>
                    <option value="">SELECT METHOD</option>
                    {Object.values(CollectionMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><History size={16} /></div>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
              <div className={!canSelectDate ? "opacity-40" : ""}>
                <label className={labelClass}>{t('disbursedDate')}</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className={inputClass} 
                    value={data.loanDisbursedDate || ''} 
                    onChange={(e) => onChange('loanDisbursedDate', e.target.value)} 
                    disabled={!canSelectDate}
                  />
                  <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className={!canSelectDate ? "opacity-40" : ""}>
                <label className={labelClass}>Cycle Maturity Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className={inputClass} 
                    value={data.loanMaturityDate || ''} 
                    onChange={(e) => onChange('loanMaturityDate', e.target.value)} 
                    disabled={!canSelectDate}
                  />
                  <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
          </div>

          <div>
              <label className={labelClass}>Ledger Status</label>
              <input type="text" className={inputClass} value={data.loanStatus || ''} onChange={(e) => onChange('loanStatus', e.target.value)} placeholder="Ex: ACTIVE / COMPLETED" />
          </div>
        </div>

        <div className={`p-10 rounded-2xl border-2 transition-all ${!data.centerDate ? 'bg-blue-50/30 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-8">
                <CalendarDays className={`${!data.centerDate ? 'text-blue-600' : 'text-slate-400'} w-6 h-6`} />
                <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest">Mandatory Center Registry</h4>
            </div>
            <div className="max-w-md">
                <label className={labelClass}>Center Date (Temporal Selection)</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className={`${inputClass} bg-white`} 
                    value={data.centerDate || ''} 
                    onChange={(e) => onChange('centerDate', e.target.value)} 
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600/40 pointer-events-none" />
                </div>
                {!data.centerDate && <p className="mt-3 text-[9px] font-black text-blue-600 uppercase tracking-widest italic animate-pulse">Required to proceed with protocol entry</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
           <div>
              <label className={labelClass}>{t('totalPaid')}</label>
              <input 
                type="text" 
                placeholder="1,000.00" 
                className={inputClass} 
                value={data.totalPaid || ''} 
                onChange={(e) => onChange('totalPaid', e.target.value)}
                onBlur={(e) => handleCurrencyBlur('totalPaid', e.target.value)}
              />
          </div>

           <div className={hasArrears ? "lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8" : ""}>
              <div>
                <label className={labelClass}>Portfolio Arrears</label>
                <input 
                  type="text" 
                  placeholder="0.00" 
                  className={`${inputClass} ${hasArrears ? 'border-red-200 text-red-600' : ''}`} 
                  value={data.arrears || ''} 
                  onChange={(e) => onChange('arrears', e.target.value)}
                  onBlur={(e) => handleCurrencyBlur('arrears', e.target.value)}
                />
              </div>
              {hasArrears && (
                <div className="animate-in fade-in slide-in-from-right-2">
                  <label className={`${labelClass} text-red-600 flex items-center gap-1 font-black`}>
                    <AlertCircle size={10} /> Discrepancy Remarks Required
                  </label>
                  <textarea 
                    className="block w-full rounded-xl border-red-100 shadow-inner border p-4 bg-white text-slate-900 uppercase text-[11px] font-black h-[52px] resize-none"
                    value={data.arrearsReason || ''}
                    onChange={(e) => onChange('arrearsReason', e.target.value)}
                    placeholder="SPECIFY REMARKS..."
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
