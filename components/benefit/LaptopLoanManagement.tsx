import React, { useState, useMemo } from 'react';
import { BaseClaimData, LaptopData, User } from '../../types';
import { Laptop as LaptopIcon, Search, Save, Filter, Clock, CheckCircle2, Landmark, CreditCard, User as UserIcon, Lock } from 'lucide-react';
import { COMPANIES, COMPANY_BRANCH_MAPPING } from '../../constants';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  currentUser?: User | null;
}

const LaptopLoanManagement: React.FC<Props> = ({ claims, onUpdateClaim, currentUser }) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const canUpdate = useMemo(() => currentUser?.isGlobal || currentUser?.interfaceAccess?.customer?.laptopLoan_updateLedger, [currentUser]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (c.status === 'Completed' || c.status === 'Rejected') return false;
      const isLaptopRequest = c.claimType === 'EDUCATION' && c.educationData?.laptopReq === 'Yes';
      return isLaptopRequest || !!c.laptopData;
    });
  }, [claims]);

  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-4 rounded-3xl text-blue-400 shadow-xl">
          <LaptopIcon size={32} />
        </div>
        <div>
          <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Laptop Finance</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Tertiary Equipment Monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredClaims.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] shadow-xl border border-blue-50">
              <LaptopIcon size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No active laptop finance records found</p>
            </div>
          ) : (
            filteredClaims.map(c => (
                <div key={c.id} className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden flex flex-col p-8 transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                          <h4 className="text-xl font-black text-blue-900 uppercase leading-none mb-1">{c.customerName}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.loanNumber} • {c.branch}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase shadow-md ${c.laptopData?.status === 'Settled' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                          {c.laptopData?.status || 'Awaiting Sync'}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                       <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Asset Value</p>
                          <p className="text-xs font-black text-blue-900">LKR 125,000.00</p>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Repaid</p>
                          <p className="text-xs font-black text-emerald-600">LKR {c.laptopData?.totalPaid || '0.00'}</p>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Installment</p>
                          <p className="text-xs font-black text-indigo-600">LKR {c.laptopData?.installment || '2,500.00'}</p>
                       </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-end">
                        {canUpdate ? (
                          <button className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-800 transition-all active:scale-95">
                            <Save size={16} /> Update Asset Ledger
                          </button>
                        ) : (
                          <div className="bg-slate-100 text-slate-300 px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 cursor-not-allowed opacity-50">
                            <Lock size={16} /> Ledger Locked
                          </div>
                        )}
                    </div>
                </div>
            ))
          )}
      </div>
    </div>
  );
};

export default LaptopLoanManagement;