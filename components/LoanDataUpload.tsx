import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, Trash2, Eye, X, AlertCircle } from 'lucide-react';
import { CustomerLoan } from '../types';
import { apiService } from '../services/api';

const EXPECTED_COLUMNS = [
    'loanNumber', 'customerName', 'idNumber', 'company', 'branch',
    'centerName', 'loanAmount', 'collectionMethod', 'loanDisbursedDate',
    'loanMaturityDate', 'totalPaid', 'arrears', 'loanStatus'
];

const COLUMN_LABELS: Record<string, string> = {
    loanNumber: 'Loan Number',
    customerName: 'Customer Name',
    idNumber: 'NIC / ID Number',
    company: 'Company',
    branch: 'Branch',
    centerName: 'Center Name',
    loanAmount: 'Loan Amount',
    collectionMethod: 'Collection Method',
    loanDisbursedDate: 'Disbursed Date',
    loanMaturityDate: 'Maturity Date',
    totalPaid: 'Total Paid',
    arrears: 'Arrears',
    loanStatus: 'Loan Status',
};

const LoanDataUpload: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<CustomerLoan[]>([]);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const parseFile = (file: File) => {
        setError('');
        setUploaded(false);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (rows.length === 0) {
                    setError('File is empty.');
                    return;
                }

                // Normalize column names (case-insensitive, trim spaces)
                const normalized = rows.map(row => {
                    const normalized: any = {};
                    Object.keys(row).forEach(key => {
                        const cleanKey = key.trim().replace(/\s+/g, '');
                        // Match to expected columns case-insensitively
                        const match = EXPECTED_COLUMNS.find(
                            c => c.toLowerCase() === cleanKey.toLowerCase()
                        );
                        if (match) normalized[match] = String(row[key]).trim();
                    });
                    return normalized;
                });

                const valid = normalized.filter(r => r.loanNumber && r.customerName);
                if (valid.length === 0) {
                    setError('No valid rows found. Make sure "loanNumber" and "customerName" columns exist.');
                    return;
                }

                setPreview(valid as CustomerLoan[]);
                setShowPreview(true);
            } catch {
                setError('Failed to parse file. Please use a valid Excel (.xlsx) or CSV file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) parseFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) parseFile(file);
    };

    const handleUpload = async () => {
        if (preview.length === 0) return;
        setUploading(true);
        try {
            await apiService.uploadCustomerLoans(preview);
            setUploaded(true);
            setShowPreview(false);
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleReset = () => {
        setPreview([]);
        setFileName('');
        setError('');
        setUploaded(false);
        setShowPreview(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-slate-900 font-black text-lg uppercase tracking-tighter">Customer & Loan Data Upload</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Upload Excel or CSV — auto-fills claim entry form on loan number match</p>
                </div>
                {preview.length > 0 && !uploaded && (
                    <button onClick={handleReset} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-blue-600" size={20} />
                    <div>
                        <p className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Required Columns</p>
                        <p className="text-[9px] font-bold text-blue-600 mt-0.5">{EXPECTED_COLUMNS.map(c => COLUMN_LABELS[c]).join(' • ')}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const ws = XLSX.utils.aoa_to_sheet([EXPECTED_COLUMNS.map(c => COLUMN_LABELS[c])]);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Template');
                        XLSX.writeFile(wb, 'loan_upload_template.xlsx');
                    }}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                >
                    Download Template
                </button>
            </div>

            {/* Drop Zone */}
            {!uploaded && preview.length === 0 && (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                >
                    <Upload className="mx-auto text-slate-300 group-hover:text-blue-500 transition-colors mb-4" size={36} />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Drop Excel / CSV here</p>
                    <p className="text-[10px] font-bold text-slate-300 mt-2">or click to browse</p>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <AlertCircle className="text-red-500 shrink-0" size={16} />
                    <p className="text-[11px] font-black text-red-600 uppercase tracking-wider">{error}</p>
                </div>
            )}

            {/* Success */}
            {uploaded && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-600" size={22} />
                        <div>
                            <p className="text-sm font-black text-emerald-900 uppercase tracking-wider">Upload Successful</p>
                            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{preview.length} loan records saved to Firestore</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
                        Upload More
                    </button>
                </div>
            )}

            {/* Preview & Upload */}
            {preview.length > 0 && !uploaded && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="text-slate-500" size={18} />
                            <div>
                                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{fileName}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">{preview.length} records ready to upload</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50"
                        >
                            <Eye size={14} /> {showPreview ? 'Hide' : 'Preview'}
                        </button>
                    </div>

                    {showPreview && (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-[10px]">
                                <thead className="bg-slate-900 sticky top-0">
                                    <tr>
                                        {['Loan No', 'Customer', 'NIC', 'Company', 'Branch', 'Loan Amount', 'Collection'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {preview.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono font-black text-blue-700 whitespace-nowrap">{row.loanNumber}</td>
                                            <td className="px-4 py-3 font-black text-slate-800 whitespace-nowrap">{row.customerName}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.idNumber}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.company}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.branch}</td>
                                            <td className="px-4 py-3 font-black text-slate-800 whitespace-nowrap">{row.loanAmount}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.collectionMethod}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-900 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {uploading ? <><Loader2 size={18} className="animate-spin" /> Uploading {preview.length} Records...</> : <><Upload size={18} /> Upload {preview.length} Records to Firestore</>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoanDataUpload;
