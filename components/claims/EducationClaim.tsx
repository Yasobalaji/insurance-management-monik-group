
import React, { useState } from 'react';
import { BankDetails, User } from '../../types';
import FileUpload from '../FileUpload';
import BankDetailsForm from '../BankDetailsForm';
import { Calendar } from 'lucide-react';

interface Props {
  updateData: (data: any) => void;
  updateBankDetails: (data: BankDetails) => void;
  bankDetails: BankDetails;
  currentUser?: User | null;
  isGlobal?: boolean;
}

const EducationClaim: React.FC<Props> = ({ updateData, updateBankDetails, bankDetails, currentUser, isGlobal }) => {
  const [examType, setExamType] = useState<string>('Scholarship');
  const [localData, setLocalData] = useState<any>({});
  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white text-black font-bold uppercase text-xs";

  const canSelectDate = isGlobal || currentUser?.interfaceAccess?.customer?.dateSelection;

  const handleChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value, examType };
    setLocalData(newData);
    updateData(newData);
  };

  const handleTypeChange = (val: string) => {
    setExamType(val);
    setLocalData({});
    updateData({ examType: val });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="block text-[10px] font-black text-gray-700 mb-2 uppercase tracking-widest">Exam Type</label>
        <select 
            className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black font-bold uppercase text-xs"
            value={examType}
            onChange={(e) => handleTypeChange(e.target.value)}
        >
            <option value="Scholarship">GRADE 5 SCHOLARSHIP</option>
            <option value="GCE_OL">G.C.E (O/L)</option>
            <option value="GCE_AL">G.C.E (A/L)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Exam Year</label>
            <input type="number" className={inputClass} onChange={(e) => handleChange('examYear', e.target.value)} />
        </div>
        <div>
            <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">School</label>
            <input type="text" className={inputClass} onChange={(e) => handleChange('school', e.target.value)} />
        </div>
         <div className={!canSelectDate ? "opacity-60" : ""}>
            <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Result Date</label>
            <div className="relative">
              <input type="date" className={inputClass} onChange={(e) => handleChange('resultDate', e.target.value)} disabled={!canSelectDate} />
              <Calendar size={16} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
            </div>
        </div>

        {examType === 'Scholarship' && (
            <>
                 <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Cut-off Marks</label>
                    <input type="number" className={inputClass} onChange={(e) => handleChange('cutoffMarks', e.target.value)} />
                </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Obtained Marks</label>
                    <input type="number" className={inputClass} onChange={(e) => handleChange('results', e.target.value)} />
                </div>
            </>
        )}

        {examType === 'GCE_OL' && (
             <>
                 <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Results (e.g., 9A)</label>
                    <input type="text" className={inputClass} onChange={(e) => handleChange('results', e.target.value)} />
                </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Index No</label>
                    <input type="text" className={inputClass} onChange={(e) => handleChange('indexNo', e.target.value)} />
                </div>
            </>
        )}

        {examType === 'GCE_AL' && (
             <>
                 <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">A/L Results</label>
                    <input type="text" className={inputClass} onChange={(e) => handleChange('results', e.target.value)} />
                </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Selected University</label>
                    <input type="text" className={inputClass} onChange={(e) => handleChange('university', e.target.value)} />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Laptop Requirement</label>
                     <select className={inputClass} onChange={(e) => handleChange('laptopReq', e.target.value)}>
                        <option value="No">NO</option>
                        <option value="Yes">YES</option>
                    </select>
                </div>
            </>
        )}
      </div>

       <div className="border-t pt-4">
            <h4 className="font-black text-gray-800 mb-4 uppercase tracking-[0.2em] text-xs underline underline-offset-4">Required Documents</h4>
            <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
            <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
            <FileUpload label="Birth Certificate - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_birth_cert', f)} required />
            <FileUpload label="Result Sheet (PDF)" accept=".pdf" onChange={(f) => handleChange('file_results', f)} required />
            
            {(examType === 'GCE_OL' || examType === 'GCE_AL') && (
                <FileUpload label="Bank Book - Customer (Photo)" accept="image/*" onChange={(f) => handleChange('file_bank_book', f)} required />
            )}
            
            {examType === 'GCE_AL' && (
                <>
                    <FileUpload label="Identification - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_child', f)} required />
                    <FileUpload label="University Selected Doc (PDF)" accept=".pdf" onChange={(f) => handleChange('file_uni_letter', f)} required />
                    <FileUpload label="Income/Expense Confirmation - Manager (PDF)" accept=".pdf" onChange={(f) => handleChange('file_manager_income', f)} required />
                    {localData.laptopReq === 'Yes' && (
                         <FileUpload label="Request Laptop Confirmation - Manager (PDF)" accept=".pdf" onChange={(f) => handleChange('file_laptop_req', f)} required />
                    )}
                </>
            )}
       </div>

        {(examType === 'GCE_OL' || examType === 'GCE_AL') && (
            <BankDetailsForm data={bankDetails} onChange={updateBankDetails} />
        )}
    </div>
  );
};

export default EducationClaim;
