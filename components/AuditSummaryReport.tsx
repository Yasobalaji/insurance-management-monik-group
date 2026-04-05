
import React, { useMemo } from 'react';
import { BaseClaimData } from '../types';
import { ClipboardCheck, FileSpreadsheet, Printer, Landmark, Search, Calendar, Landmark as BankIcon, BadgeCheck, DollarSign } from 'lucide-react';
import { COMPANIES, BRANCHES, COMPANY_BRANCH_MAPPING } from '../constants';

interface Props {
  claims: BaseClaimData[];
  userBranches?: string[];
  userCompanies?: string[];
  isGlobal?: boolean;
}

const AuditSummaryReport: React.FC<Props> = ({ claims }) => {
  // Show all audited claims, but report should contain all these fields as requested.
  const auditedClaims = useMemo(() => claims.filter(c => !!c.auditedDate).sort((a,b) => b.auditedDate!.localeCompare(a.auditedDate!)), [claims]);

  const handleExportCSV = () => {
    const headers = [
        "Company", 
        "Claim Code", 
        "Branch", 
        "Loan No", 
        "Customer", 
        "Audit Officer", 
        "Loan Amount", 
        "Requested Date", 
        "Claim Status", 
        "Benefit (Pack/Cash)", 
        "Paid/Delivered Date", 
        "Payment Party"
    ];

    const rows = auditedClaims.map(c => [
        c.company,
        c.shortCode || c.claimType,
        c.branch,
        c.loanNumber,
        c.customerName,
        c.auditOfficer || 'N/A',
        c.loanAmount,
        new Date(c.timestamp).toLocaleDateString(),
        c.status,
        c.approvedBenefitType || 'N/A',
        c.paymentDate || c.packDeliveredDate || 'N/A',
        c.paymentParty || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Audit_Detailed_Summary_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl shadow-xl"><ClipboardCheck className="text-white w-8 h-8" /></div>
            <div><h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">AUDIT SUMMARY REPORT</h1><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Comprehensive Compliance Audit Log</p></div>
          </div>
          <button onClick={handleExportCSV} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-emerald-700 transition-all"><FileSpreadsheet size={16} /> Export Detailed CSV</button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-50">
                  <thead className="bg-slate-50">
                      <tr>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity & Org</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Loan & Date</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Officer</th>
                          <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment/Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                      {auditedClaims.length === 0 ? (
                        <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase text-xs">No Audit Records in History</td></tr>
                      ) : (
                        auditedClaims.map(c => (
                            <tr key={c.id} className="hover:bg-sky-50/30">
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-black text-blue-900 uppercase">{c.customerName}</div>
                                    <div className="text-[9px] font-bold text-slate-600 uppercase">{c.company} • {c.branch}</div>
                                    <div className="inline-block px-1.5 py-0.5 mt-1 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase rounded">Code: {c.shortCode || c.claimType}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-black text-slate-900 uppercase">#{c.loanNumber}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10} /> Req: {new Date(c.timestamp).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-black text-emerald-700 uppercase flex items-center gap-1"><DollarSign size={10} /> LKR {c.loanAmount}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Benefit: {c.approvedBenefitType || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-black text-slate-700 uppercase">{c.auditOfficer || 'N/A'}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">On: {c.auditedDate}</div>
                                    <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[7px] font-black uppercase ${c.auditStatus === 'Not Issue' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{c.auditStatus}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[9px] font-black text-slate-800 uppercase flex items-center gap-1"><BadgeCheck size={10} className="text-blue-500" /> {c.status}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Paid: {c.paymentDate || c.packDeliveredDate || '-'}</div>
                                    <div className="text-[8px] font-black text-indigo-600 uppercase">To: {c.paymentParty || '-'}</div>
                                </td>
                            </tr>
                        ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default AuditSummaryReport;
