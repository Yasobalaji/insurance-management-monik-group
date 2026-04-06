import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, X, AlertCircle, Eye } from 'lucide-react';
import { CustomerLoan } from '../types';
import { apiService } from '../services/api';

// Maps Excel column header → CustomerLoan field
// Handles partial/truncated names case-insensitively
const COLUMN_MAP: Record<string, keyof CustomerLoan> = {
    'loan num':             'loanNumber',
    'loan number':          'loanNumber',
    'loannum':              'loanNumber',
    'loannumber':           'loanNumber',

    'product c':            'productCode',
    'product code':         'productCode',
    'productcode':          'productCode',

    'product d':            'productDescription',
    'product description':  'productDescription',
    'productdescription':   'productDescription',

    'branch':               'branch',

    'center na':            'centerName',
    'center name':          'centerName',
    'centername':           'centerName',

    // Row G is Customer Name (first "Customer" column)
    'customer name':        'customerName',
    'customername':         'customerName',

    'address':              'address',

    // Row I is Customer NIC (second "Customer" column — IDNumber used as primary NIC)
    'idnumber':             'idNumber',
    'id number':            'idNumber',
    'nic':                  'idNumber',
    'nic number':           'idNumber',

    'date of bi':           'dateOfBirth',
    'date of birth':        'dateOfBirth',
    'dob':                  'dateOfBirth',
    'dateofbirth':          'dateOfBirth',

    'bsp code':             'bspCode',
    'bspcode':              'bspCode',

    'mobile no':            'mobile',
    'mobile number':        'mobile',
    'mobile':               'mobile',

    'business':             'business',

    'collection':           'collectionMethod',
    'collection method':    'collectionMethod',
    'collectionmethod':     'collectionMethod',

    'route':                'route',

    'loan type':            'loanType',
    'loantype':             'loanType',

    'granted d':            'loanDisbursedDate',
    'granted date':         'loanDisbursedDate',
    'granteddate':          'loanDisbursedDate',
    'disbursed date':       'loanDisbursedDate',

    'maturity d':           'loanMaturityDate',
    'maturity date':        'loanMaturityDate',
    'maturitydate':         'loanMaturityDate',

    // Two "Loan Amo" columns — first is original, second is disbursed
    'loan amount':          'loanAmount',
    'loanamount':           'loanAmount',
    'loan amo':             'loanAmount',

    'regional am':          'regionalAmount',
    'regional amount':      'regionalAmount',

    'rate':                 'interestRate',
    'interest rate':        'interestRate',

    'period':               'period',

    'interest p':           'interestPerPeriod',
    'interest per period':  'interestPerPeriod',

    'capital po':           'capitalPortion',
    'capital portion':      'capitalPortion',

    'portfolio v':          'portfolioValue',
    'portfolio value':      'portfolioValue',

    'capital pa':           'capitalPaid',
    'capital paid':         'capitalPaid',

    'future ca':            'futureCapital',
    'future capital':       'futureCapital',

    'future int':           'futureInterest',
    'future interest':      'futureInterest',

    'capital ar':           'capitalArrears',
    'capital arrears':      'capitalArrears',

    'interest a':           'interestArrears',
    'interest arrears':     'interestArrears',

    'total arre':           'arrears',
    'total arrears':        'arrears',
    'totalarrears':         'arrears',

    'capital be':           'capitalBalance',
    'capital balance':      'capitalBalance',

    'ndia':                 'ndia',

    'odarreas':             'odArrears',
    'od arrears':           'odArrears',

    'odpaid':               'odPaid',
    'od paid':              'odPaid',

    'odbalance':            'odBalance',
    'od balance':           'odBalance',

    'total paid':           'totalPaid',
    'totalpaid':            'totalPaid',

    'last trans':           'lastTransactionDate',
    'last transaction':     'lastTransactionDate',
    'lasttransaction':      'lastTransactionDate',

    'advanced':             'advanced',

    'outstandi':            'outstanding',
    'outstanding':          'outstanding',

    'last paid':            'lastPaidDate',
    'lastpaid':             'lastPaidDate',

    'age in re':            'ageInRecovery',
    'age in recovery':      'ageInRecovery',

    'loan stati':           'loanStatus',
    'loan status':          'loanStatus',
    'loanstatus':           'loanStatus',

    'legal stati':          'legalStatus',
    'legal status':         'legalStatus',
    'legalstatus':          'legalStatus',

    'member n':             'memberNumber',
    'member number':        'memberNumber',
    'membernumber':         'memberNumber',
};

function mapRow(raw: Record<string, any>): Partial<CustomerLoan> {
    const result: Partial<CustomerLoan> = {};
    const keys = Object.keys(raw);

    // Track which "Loan Amo" column we've seen (first = loanAmount, second = loanAmountDisbursed)
    let loanAmoCount = 0;
    // Track which "Customer" column we've seen (first = customerName, second = skip for idNumber handled by IDNumber col)
    let customerCount = 0;
    // Track "Interest P" (first = interestPerPeriod, second = interestPaid)
    let interestPCount = 0;
    // Track "Capital Pa" vs "Capital Po"
    let capitalPaCount = 0;

    for (const key of keys) {
        const normalKey = key.trim().toLowerCase().replace(/\s+/g, ' ');
        let field = COLUMN_MAP[normalKey];

        // Handle ambiguous duplicates by position
        if (normalKey === 'loan amo' || normalKey === 'loan amount') {
            if (loanAmoCount === 0) { field = 'loanAmount'; }
            else { field = 'loanAmountDisbursed'; }
            loanAmoCount++;
        }
        if (normalKey === 'customer' || normalKey === 'customer name') {
            if (customerCount === 0) { field = 'customerName'; }
            else { field = 'idNumber'; } // second "Customer" col is NIC
            customerCount++;
        }
        if (normalKey === 'interest p' || normalKey === 'interest per period' || normalKey === 'interest paid') {
            if (interestPCount === 0) { field = 'interestPerPeriod'; }
            else { field = 'interestPaid'; }
            interestPCount++;
        }

        if (field && raw[key] !== undefined && raw[key] !== '') {
            (result as any)[field] = String(raw[key]).trim();
        }
    }

    return result;
}

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
                const wb = XLSX.read(data, { type: 'array', cellDates: true });
                const ws = wb.Sheets[wb.SheetNames[0]];

                // Try row 1 as header first, then row 2 (if headers start at row 2)
                let rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
                if (rows.length === 0 || !Object.keys(rows[0]).some(k => k.toLowerCase().includes('loan'))) {
                    rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false, range: 1 });
                }

                if (rows.length === 0) { setError('File is empty or headers not found.'); return; }

                const mapped = rows.map(mapRow).filter(r => r.loanNumber && r.customerName) as CustomerLoan[];
                // Set default empty strings for required fields
                const valid = mapped.map(r => ({
                    ...r,
                    company: r.company || '',
                    totalPaid: r.totalPaid || '0',
                    arrears: r.arrears || '0',
                    collectionMethod: r.collectionMethod || '',
                }));

                if (valid.length === 0) {
                    setError('No valid rows found. Ensure "Loan Num" and "Customer Name" columns exist.');
                    return;
                }

                setPreview(valid as CustomerLoan[]);
                setShowPreview(true);
            } catch (err) {
                setError('Failed to parse file. Use a valid .xlsx, .xls, or .csv file.');
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
        } catch {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-slate-900 font-black text-lg uppercase tracking-tighter">Customer & Loan Data Upload</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Upload your Excel file — auto-fills claim form on loan number match</p>
                </div>
                {preview.length > 0 && !uploaded && (
                    <button onClick={handleReset} className="text-slate-400 hover:text-red-500 transition-colors"><X size={18} /></button>
                )}
            </div>

            {/* Supported columns info */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <FileSpreadsheet className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-[11px] font-black text-blue-900 uppercase tracking-wider mb-1">Detected Column Format</p>
                        <p className="text-[9px] font-bold text-blue-600 leading-relaxed">
                            Loan Num • Product Code • Branch • Center Name • Customer Name • Address • IDNumber • Date of Birth • BSP Code • Mobile No • Business • Collection • Route • Loan Type • Granted Date • Maturity Date • Loan Amount • Rate • Period • Capital Arrears • Interest Arrears • Total Arrears • Capital Balance • OD Arrears • OD Paid • OD Balance • Total Paid • Last Transaction • Outstanding • Last Paid • Loan Status • Legal Status • Member Number
                        </p>
                    </div>
                </div>
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
                    <p className="text-[10px] font-bold text-slate-300 mt-2">or click to browse • .xlsx .xls .csv</p>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <AlertCircle className="text-red-500 shrink-0" size={16} />
                    <p className="text-[11px] font-black text-red-600 uppercase tracking-wider">{error}</p>
                </div>
            )}

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

            {preview.length > 0 && !uploaded && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="text-slate-500" size={18} />
                            <div>
                                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{fileName}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">{preview.length} records ready</p>
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
                        <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-[10px]">
                                <thead className="bg-slate-900 sticky top-0">
                                    <tr>
                                        {['Loan No', 'Customer', 'NIC', 'Branch', 'Center', 'Loan Amount', 'Collection', 'Total Paid', 'Arrears', 'Status'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {preview.slice(0, 50).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono font-black text-blue-700 whitespace-nowrap">{row.loanNumber}</td>
                                            <td className="px-4 py-3 font-black text-slate-800 whitespace-nowrap">{row.customerName}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.idNumber}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.branch}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.centerName}</td>
                                            <td className="px-4 py-3 font-black text-slate-800 whitespace-nowrap">{row.loanAmount}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.collectionMethod}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.totalPaid}</td>
                                            <td className={`px-4 py-3 font-black whitespace-nowrap ${parseFloat(row.arrears) > 0 ? 'text-red-600' : 'text-slate-600'}`}>{row.arrears}</td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.loanStatus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {preview.length > 50 && (
                                <div className="bg-slate-50 p-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">
                                    Showing 50 of {preview.length} records
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-900 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {uploading
                            ? <><Loader2 size={18} className="animate-spin" /> Uploading {preview.length} Records...</>
                            : <><Upload size={18} /> Upload {preview.length} Records to Firestore</>
                        }
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoanDataUpload;
