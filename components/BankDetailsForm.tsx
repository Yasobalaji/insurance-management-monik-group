
import React, { useEffect, useState } from 'react';
import { BankDetails } from '../types';

interface Props {
  data: BankDetails;
  onChange: (data: BankDetails) => void;
}

const BankDetailsForm: React.FC<Props> = ({ data, onChange }) => {
  const [error, setError] = useState<string>('');
  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-black";

  const handleChange = (field: keyof BankDetails, value: string) => {
    // Restrict Account No and Verify Account No to numbers only
    // Fixed: Account for verifyAccountNo correctly in logic
    if ((field === 'accountNo' || field === 'verifyAccountNo') && !/^\d*$/.test(value)) {
      return;
    }
    
    // No blank spaces
    if (value.includes(' ')) {
        return;
    }

    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  useEffect(() => {
    if (data.verifyAccountNo && data.accountNo !== data.verifyAccountNo) {
      setError('Account numbers do not match!');
    } else {
      setError('');
    }
  }, [data.accountNo, data.verifyAccountNo]);

  return (
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wide border-b border-slate-300 pb-2">Bank Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
          <input
            type="text"
            className={inputClass}
            value={data.accountHolderName}
            onChange={(e) => handleChange('accountHolderName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            className={inputClass}
            value={data.bankName}
            onChange={(e) => handleChange('bankName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Code / Name</label>
          <input
            type="text"
            className={inputClass}
            value={data.branchNameOrCode}
            onChange={(e) => handleChange('branchNameOrCode', e.target.value)}
          />
        </div>
        <div></div> {/* Spacer */}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Account No (Numbers Only)</label>
          <input
            type="text"
            className={inputClass}
            value={data.accountNo}
            onChange={(e) => handleChange('accountNo', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Verify Account No</label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border bg-white text-black ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            // Fixed: Pass verifyAccountNo as a valid keyof BankDetails
            value={data.verifyAccountNo || ''}
            onChange={(e) => handleChange('verifyAccountNo', e.target.value)}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default BankDetailsForm;
