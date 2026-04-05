
import React, { useState, useMemo } from 'react';
import { BaseClaimData, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { CreditCard, Filter, Search, CheckCircle2, Send, Printer, ArrowLeft, Table as TableIcon, Database, Loader2, Landmark, FileText, Download, FolderPlus, CheckCircle, Calendar } from 'lucide-react';
import { BRANCHES, CLAIM_TYPES, COMPANIES, COMPANY_BRANCH_MAPPING } from '../constants';
import { apiService } from '../services/api';

interface Props {
  claims: BaseClaimData[];
  onUpdateClaim: (id: string, data: Partial<BaseClaimData>) => void;
  userBranches?: string[];
  userCompanies?: string[];
  isGlobal?: boolean;
  currentUser?: User | null;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PaymentRequest: React.FC<Props> = ({ claims, onUpdateClaim, userBranches, userCompanies, isGlobal, currentUser }) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'selection' | 'batch'>('selection');
  const [currentBatchId, setCurrentBatchId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');

  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterWeekday, setFilterWeekday] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const availableCompanies = useMemo(() => isGlobal ? COMPANIES : userCompanies || [], [isGlobal, userCompanies]);
  const availableBranches = useMemo(() => {
    let list = filterCompany ? (COMPANY_BRANCH_MAPPING[filterCompany] || []) : (isGlobal ? BRANCHES : []);
    return list.filter(b => isGlobal || userBranches?.some(ub => ub.includes(b)));
  }, [filterCompany, isGlobal, userBranches]);

  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
        if (claim.status !== 'Approved') return false;
        const hasCash = claim.approvedBenefitType === 'Cash' || claim.approvedBenefitType === 'Both';
        if (!hasCash) return false;
        
        if (filterCompany && claim.company !== filterCompany) return false;
        if (filterBranch && claim.branch !== filterBranch) return false;
        
        if (filterWeekday) {
            if (!claim.centerDate) return false;
            const dayIndex = new Date(claim.centerDate).getDay();
            if (WEEKDAYS[dayIndex] !== filterWeekday) return false;
        }
        
        return true;
    });
  }, [claims, filterCompany, filterBranch, filterWeekday]);

  const batchStats = useMemo(() => {
    const selected = filteredClaims.filter(c => selectedIds.has(c.id));
    const totalAmount = selected.reduce((acc, c) => acc + parseFloat((c.approvedCashAmount || '0').replace(/,/g, '')), 0);
    return { items: selected, count: selected.length, amount: totalAmount };
  }, [filteredClaims, selectedIds]);

  const handleInitBatch = () => {
      const code = `BTCH/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
      setCurrentBatchId(code);
      setViewMode('batch');
  };

  const handlePrintAndDownload = async () => {
    try {
      setProcessStep('Requesting Folder Authorization...');
      const dirHandle = await (window as any).showDirectoryPicker();
      
      setIsProcessing(true);
      
      for (let i = 0; i < batchStats.items.length; i++) {
        const item = batchStats.items[i];
        setProcessStep(`Archiving: ${item.customerName} (${i + 1}/${batchStats.count})`);
        
        const fileName = `${item.customerInsuranceId.replace(/\//g, '_')}_VOUCHER.txt`;
        const fileContent = `
MONIK GROUP HOLDING - DISBURSEMENT VOUCHER
-------------------------------------------
BATCH REF: ${currentBatchId}
CLAIM ID: ${item.id}
DATE: ${new Date().toLocaleString()}

BENEFICIARY: ${item.customerName}
LOAN NO: ${item.loanNumber}
STATION: ${item.branch} / ${item.company}
ID NO: ${item.idNumber}

BANK: ${item.bankDetails?.bankName}
ACC: ${item.bankDetails?.accountNo}
BRANCH: ${item.bankDetails?.branchNameOrCode}

AUTHORIZED AMOUNT: LKR ${item.approvedCashAmount}
-------------------------------------------
SYSTEM GENERATED DOCUMENT - CMBSL INTERNAL
        `;

        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(fileContent);
        await writable.close();
        
        await new Promise(r => setTimeout(r, 200));
      }

      setProcessStep('Finalizing Print Spooler...');
      setTimeout(() => {
          window.print();
          setIsProcessing(false);
          setProcessStep('');
      }, 500);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setProcessStep('');
      alert("Process interrupted. Ensure you provide folder permissions.");
    }
  };

  const handleFinalizeBatch = async () => {
      setIsProcessing(true);
      setProcessStep('Dispatching Batch to Financial Server...');
      try {
          await apiService.processBatch({ batchId: currentBatchId, items: batchStats.items });
          for (const item of batchStats.items) {
              onUpdateClaim(item.id, { status: 'Cash Requested' });
          }
          alert("Batch Dispatched Successfully");
          setViewMode('selection');
          setSelectedIds(new Set());
      } catch (e) {
          console.error(e);
          alert("Sync error. Local state updated.");
          for (const item of batchStats.items) {
              onUpdateClaim(item.id, { status: 'Cash Requested' });
          }
          setViewMode('selection');
          setSelectedIds(new Set());
      } finally {
          setIsProcessing(false);
          setProcessStep('');
      }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
      if (selectedIds.size === filteredClaims.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredClaims.map(c => c.id)));
      }
  };

  if (viewMode === 'batch') {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 pb-32 print:p-0 print:m-0 print:bg-white">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .page-break { page-break-after: always; display: block; border: none !important; }
                    body { background: white !important; padding: 0 !important; }
                }
                .print-only { display: none; }
                .page-break { page-break-after: always; }
            `}} />

            <div className="no-print bg-slate-900 text-white p-10 rounded-[3rem] border-b-[12px] border-emerald-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><CreditCard size={120} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4">
                        <button onClick={() => setViewMode('selection')} className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-4 hover:text-white transition-colors"><ArrowLeft size={16}/> Back to Selection</button>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Batch Authorization Console</h2>
                        <div className="flex gap-6">
                            <div><p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">BATCH ID</p><p className="text-sm font-black text-indigo-400 font-mono">{currentBatchId}</p></div>
                            <div><p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">VOLUME</p><p className="text-sm font-black">{batchStats.count} RECORDS</p></div>
                            <div><p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">AGGREGATE</p><p className="text-sm font-black text-emerald-400 font-mono">LKR {batchStats.amount.toLocaleString()}</p></div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={handlePrintAndDownload}
                            className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-3 shadow-xl active:scale-95"
                        >
                            <FolderPlus size={18} /> Document Print & Save
                        </button>
                        <button 
                            onClick={handleFinalizeBatch}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all disabled:bg-slate-700"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            Release Batch
                        </button>
                    </div>
                </div>
            </div>

            <div className="no-print bg-white rounded-[2.5rem] shadow-xl border border-blue-50 overflow-hidden">
                <table className="min-w-full divide-y divide-blue-50 text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Station Info</th>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Customer Profile</th>
                            <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase">Payer Context</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                        {batchStats.items.map(item => (
                            <tr key={item.id} className="hover:bg-sky-50/20">
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-black text-slate-800 uppercase">{item.branch}</div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase">LN: {item.loanNumber}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-xs font-black text-blue-900 uppercase">{item.customerName}</div>
                                    <div className="text-[9px] font-bold text-indigo-600 uppercase">{item.claimType}</div>
                                </td>
                                <td className="px-8 py-5 text-right font-mono font-black text-emerald-600 text-sm">LKR {item.approvedCashAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isProcessing && (
                <div className="no-print fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
                    <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 flex flex-col items-center gap-8 max-w-lg w-full text-center">
                        <div className="relative">
                            <Loader2 className="w-20 h-20 text-emerald-500 animate-spin" strokeWidth={1} />
                            <FileText className="absolute inset-0 m-auto w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-black uppercase tracking-tighter">Processing Batch...</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{processStep}</p>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-pulse w-3/4"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="print-only">
                {batchStats.items.map((item, idx) => (
                    <div key={item.id} className="page-break p-16 text-slate-900 bg-white font-sans border-b-2 border-slate-100">
                        <div className="flex justify-between items-start border-b-8 border-slate-900 pb-10 mb-12">
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter">DISBURSEMENT VOUCHER</h1>
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">Monik International • Financial Management Silo</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase">BATCH REFERENCE</p>
                                <p className="text-xl font-black text-blue-800 font-mono">{currentBatchId}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                            <div className="space-y-8">
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-3">Beneficiary Identity</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-slate-500">Legal Name:</span> <span className="text-sm font-black uppercase">{item.customerName}</span></div>
                                        <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-slate-500">Loan Account:</span> <span className="text-sm font-black uppercase font-mono">{item.loanNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-slate-500">Branch Station:</span> <span className="text-sm font-black uppercase">{item.branch}</span></div>
                                        <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-slate-500">Identification:</span> <span className="text-sm font-black uppercase font-mono">{item.idNumber}</span></div>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-3">Bank Remittance Data</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-slate-500">Institution:</span> <span className="text-sm font-black uppercase">{item.bankDetails?.bankName}</span></div>
                                        <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-slate-500">Branch / Code:</span> <span className="text-sm font-black uppercase">{item.bankDetails?.branchNameOrCode}</span></div>
                                        <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-slate-500">Account No:</span> <span className="text-lg font-black font-mono text-indigo-700">{item.bankDetails?.accountNo}</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="p-10 bg-slate-900 text-white rounded-[3rem] text-center border-b-[12px] border-emerald-500 shadow-2xl">
                                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-6">NET PAYOUT VALUE</p>
                                    <p className="text-5xl font-black font-mono">LKR {item.approvedCashAmount}</p>
                                    <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Product Category: {item.claimType}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Beneficiary: {item.beneficiary}</p>
                                    </div>
                                </div>

                                <div className="p-8 border-4 border-slate-50 rounded-[2.5rem] space-y-12 bg-white">
                                     <div className="flex justify-between items-end gap-10">
                                         <div className="flex-1 border-t-2 border-slate-300 text-center pt-3">
                                             <p className="text-[9px] font-black uppercase text-slate-400">Authorized Signature</p>
                                         </div>
                                         <div className="flex-1 border-t-2 border-slate-300 text-center pt-3">
                                             <p className="text-[9px] font-black uppercase text-slate-400">Beneficiary Acknowledgement</p>
                                         </div>
                                     </div>
                                     <div className="pt-4 border-t border-slate-50">
                                         <p className="text-[9px] font-bold text-slate-300 uppercase italic">System Trace ID: {item.id.toUpperCase()} • Printed By: {currentUser?.name || 'System'}</p>
                                         <p className="text-[9px] font-bold text-slate-300 uppercase italic">Dispatch Date: {new Date().toLocaleDateString()}</p>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl text-white shadow-emerald-200"><CreditCard size={32} /></div>
            <div>
                <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">DISBURSEMENT QUEUE</h1>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Scheduled Financial Releases</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-4 bg-white p-2 rounded-2xl shadow-lg border border-blue-50">
             <select className="bg-slate-50 border-0 rounded-xl text-[10px] font-black uppercase p-2.5 outline-none focus:ring-2 focus:ring-blue-600 transition-all" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                <option value="">ALL ENTITIES</option>
                {availableCompanies.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <select className="bg-slate-50 border-0 rounded-xl text-[10px] font-black uppercase p-2.5 outline-none focus:ring-2 focus:ring-blue-600 transition-all" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                <option value="">ALL BRANCHES</option>
                {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
             {/* NEW WEEKDAY FILTER */}
             <select className="bg-blue-600 text-white border-0 rounded-xl text-[10px] font-black uppercase p-2.5 outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-md" value={filterWeekday} onChange={e => setFilterWeekday(e.target.value)}>
                <option value="">Any Weekday</option>
                {WEEKDAYS.map(w => <option key={w} value={w} className="bg-white text-slate-900">{w.toUpperCase()}</option>)}
             </select>
             <button onClick={selectAll} className="px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-black transition-all shadow-md active:scale-95">
                 {selectedIds.size === filteredClaims.length ? 'Reset Selection' : 'Select All'}
             </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-50 text-left">
                  <thead className="bg-slate-900">
                      <tr>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Meta</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary Focus</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase text-right tracking-widest">Authorized LKR</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 bg-white">
                      {filteredClaims.length === 0 ? (
                        <tr><td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase text-xs italic tracking-[0.2em]">No approved cash claims pending in scheduled registry</td></tr>
                      ) : (
                        filteredClaims.map(c => {
                            const dayIndex = c.centerDate ? new Date(c.centerDate).getDay() : null;
                            const dayName = dayIndex !== null ? WEEKDAYS[dayIndex] : 'NOT SET';
                            return (
                                <tr key={c.id} className={`hover:bg-emerald-50/20 transition-all cursor-pointer ${selectedIds.has(c.id) ? 'bg-emerald-50/40' : ''}`} onClick={() => toggleSelectOne(c.id)}>
                                    <td className="px-8 py-6">
                                        <div className={`w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm ${selectedIds.has(c.id) ? 'bg-emerald-600 border-emerald-600 text-white rotate-12 scale-110 shadow-emerald-200' : 'bg-white border-slate-200'}`}>
                                            {selectedIds.has(c.id) && <CheckCircle2 size={18} strokeWidth={3} />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[11px] font-black text-blue-900 uppercase leading-none mb-1.5">{c.company}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{c.branch}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{c.customerName}</div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{c.claimType}</div>
                                            <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded text-[8px] font-black text-blue-700 uppercase">
                                                <Calendar size={10} /> {dayName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-mono font-black text-emerald-700 text-sm">
                                        {c.approvedCashAmount}
                                    </td>
                                </tr>
                            );
                        })
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {selectedIds.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-[calc(50%+144px)] bg-slate-950 text-white px-12 py-7 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col md:flex-row items-center gap-16 z-[100] animate-in slide-in-from-bottom-12 duration-700 backdrop-blur-xl">
              <div className="flex items-center gap-10 divide-x divide-white/10">
                  <div className="flex items-center gap-5">
                      <div className="bg-emerald-600 p-4 rounded-3xl shadow-2xl shadow-emerald-500/30 rotate-6"><CreditCard size={28}/></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">AGGREGATE BATCH VALUE</p>
                        <p className="text-2xl font-black text-emerald-400 font-mono leading-none">LKR {batchStats.amount.toLocaleString()}</p>
                      </div>
                  </div>
                  <div className="pl-10">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">DOSSIER VOLUME</p>
                      <p className="text-2xl font-black leading-none">{batchStats.count} UNITS</p>
                  </div>
              </div>
              <button 
                onClick={handleInitBatch}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group"
              >
                  <Send size={20} className="group-hover:translate-x-1 transition-transform" /> Dispatch Processing
              </button>
          </div>
      )}
    </div>
  );
};

export default PaymentRequest;
