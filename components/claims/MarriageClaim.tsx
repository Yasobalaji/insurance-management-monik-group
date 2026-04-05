
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

const MarriageClaim: React.FC<Props> = ({ updateData, updateBankDetails, bankDetails, currentUser, isGlobal }) => {
  const [localData, setLocalData] = useState<any>({});
  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white text-black font-bold uppercase text-xs";

  const canSelectDate = isGlobal || currentUser?.interfaceAccess?.customer?.dateSelection;

  const handleChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    updateData(newData);
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={!canSelectDate ? "opacity-60" : ""}>
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Date of Marriage</label>
                <div className="relative">
                  <input type="date" className={inputClass} onChange={(e) => handleChange('dateMarriage', e.target.value)} disabled={!canSelectDate} />
                  <Calendar size={16} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Children Name</label>
                <input type="text" className={inputClass} onChange={(e) => handleChange('childName', e.target.value)} />
            </div>
        </div>

        <div className="border-t pt-4">
            <h4 className="font-black text-gray-800 mb-4 uppercase tracking-[0.2em] text-xs underline underline-offset-4">Required Documents</h4>
            <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
            <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
            <FileUpload label="Identification - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_child', f)} required />
            <FileUpload label="Birth Certificate - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_birth_cert', f)} required />
            <FileUpload label="Marriage Certificate - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_marriage_cert', f)} required />
            <FileUpload label="Bank Book - Customer (Photo)" accept="image/*" onChange={(f) => handleChange('file_bank_book', f)} required />
        </div>

        <BankDetailsForm data={bankDetails} onChange={updateBankDetails} />
    </div>
  );
};

export default MarriageClaim;
