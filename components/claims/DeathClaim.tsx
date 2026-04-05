
import React, { useState, useEffect } from 'react';
import { BeneficiaryType, BankDetails, User } from '../../types';
import FileUpload from '../FileUpload';
import BankDetailsForm from '../BankDetailsForm';
import { Calendar } from 'lucide-react';

interface Props {
  beneficiary: BeneficiaryType;
  updateData: (data: any) => void;
  updateBankDetails: (data: BankDetails) => void;
  bankDetails: BankDetails;
  currentUser?: User | null;
  isGlobal?: boolean;
}

const DeathClaim: React.FC<Props> = ({ beneficiary, updateData, updateBankDetails, bankDetails, currentUser, isGlobal }) => {
  const [paymentType, setPaymentType] = useState<'1st' | '2nd'>('1st');
  const [localData, setLocalData] = useState<any>({});
  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white text-black font-bold uppercase text-xs";

  const canSelectDate = isGlobal || currentUser?.interfaceAccess?.customer?.dateSelection;

  useEffect(() => {
    setLocalData({}); 
  }, [beneficiary]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    updateData({ ...newData, paymentType });
  };

  const handlePaymentTypeChange = (val: '1st' | '2nd') => {
    setPaymentType(val);
    setLocalData({}); 
    updateData({ paymentType: val });
  }

  const isImmediateFamily = [
    BeneficiaryType.CUSTOMER, 
    BeneficiaryType.SPOUSE, 
    BeneficiaryType.CHILDREN
  ].includes(beneficiary);

  const isParentsOrInLaws = [
    BeneficiaryType.FATHER,
    BeneficiaryType.MOTHER,
    BeneficiaryType.FATHER_IN_LAW,
    BeneficiaryType.MOTHER_IN_LAW
  ].includes(beneficiary);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {isImmediateFamily && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-[10px] font-black text-gray-700 mb-2 uppercase tracking-widest">Payment Type</label>
            <div className="flex space-x-4">
                <button 
                    onClick={() => handlePaymentTypeChange('1st')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentType === '1st' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    1st Payment
                </button>
                <button 
                    onClick={() => handlePaymentTypeChange('2nd')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentType === '2nd' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    2nd Payment
                </button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        
        {(isParentsOrInLaws || (isImmediateFamily && paymentType === '2nd')) && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiary !== BeneficiaryType.CUSTOMER && (
                    <div>
                        <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Name of Deceased Person</label>
                        <input type="text" className={inputClass} onChange={(e) => handleChange('deceasedName', e.target.value)} />
                    </div>
                )}
                <div className={!canSelectDate ? "opacity-60" : ""}>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Date of Death</label>
                    <div className="relative">
                      <input type="date" className={inputClass} onChange={(e) => handleChange('dateOfDeath', e.target.value)} disabled={!canSelectDate} />
                      <Calendar size={16} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Nature of Death</label>
                    <input type="text" className={inputClass} onChange={(e) => handleChange('natureOfDeath', e.target.value)} />
                </div>
           </div>
        )}

        {isImmediateFamily && paymentType === '1st' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiary !== BeneficiaryType.CUSTOMER && (
                    <div>
                        <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Name of {beneficiary.toUpperCase()}</label>
                        <input type="text" className={inputClass} onChange={(e) => handleChange('beneficiaryName', e.target.value)} />
                    </div>
                )}
                <div className={!canSelectDate ? "opacity-60" : ""}>
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Date of Death</label>
                    <div className="relative">
                      <input type="date" className={inputClass} onChange={(e) => handleChange('dateOfDeath', e.target.value)} disabled={!canSelectDate} />
                      <Calendar size={16} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
             </div>
        )}

        <div className="border-t pt-4">
             <h4 className="font-black text-gray-800 mb-4 uppercase tracking-[0.2em] text-xs underline underline-offset-4">Required Documents</h4>
             
             {isImmediateFamily && paymentType === '1st' && (
                <>
                    <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
                    <FileUpload label="Manager E-mail Confirmation Screenshot (Photo)" accept="image/*" onChange={(f) => handleChange('file_manager_email', f)} required />
                </>
             )}

             {beneficiary === BeneficiaryType.CUSTOMER && paymentType === '2nd' && (
                 <>
                    <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
                    <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
                    <FileUpload label="Death Certificate - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_death_cert_customer', f)} required />
                 </>
             )}

             {beneficiary === BeneficiaryType.SPOUSE && paymentType === '2nd' && (
                 <>
                    <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
                    <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
                    <FileUpload label="Identification - Spouse (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_spouse', f)} required />
                    <FileUpload label="Marriage Cert OR Child Birth Cert (PDF)" accept=".pdf" onChange={(f) => handleChange('file_rel_proof', f)} required />
                    <FileUpload label="Death Certificate - Spouse (PDF)" accept=".pdf" onChange={(f) => handleChange('file_death_cert_spouse', f)} required />
                 </>
             )}

            {beneficiary === BeneficiaryType.CHILDREN && paymentType === '2nd' && (
                 <>
                    <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
                    <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
                    <FileUpload label="Birth Certificate - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_birth_cert_child', f)} required />
                    <FileUpload label="Death Certificate - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_death_cert_child', f)} required />
                 </>
             )}

             {isParentsOrInLaws && (
                 <>
                    <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
                    <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
                    <FileUpload label={`Identification - ${beneficiary.toUpperCase()} (PDF)`} accept=".pdf" onChange={(f) => handleChange('file_id_beneficiary', f)} required />
                    <FileUpload label={`Death Certificate - ${beneficiary.toUpperCase()} (PDF)`} accept=".pdf" onChange={(f) => handleChange('file_death_cert_beneficiary', f)} required />
                    
                    {(beneficiary === BeneficiaryType.FATHER || beneficiary === BeneficiaryType.MOTHER) ? (
                         <>
                            <FileUpload label="Birth Certificate - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_birth_cert_customer', f)} required />
                            <FileUpload label="Bank Book - Customer (Photo)" accept="image/*" onChange={(f) => handleChange('file_bank_book', f)} required />
                         </>
                    ) : (
                         <>
                             <FileUpload label="Marriage Certificate - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_marriage_cert_customer', f)} required />
                             <FileUpload label="Birth Certificate - Spouse (PDF)" accept=".pdf" onChange={(f) => handleChange('file_birth_cert_spouse', f)} required />
                             <FileUpload label="Bank Book - Customer (Photo)" accept="image/*" onChange={(f) => handleChange('file_bank_book', f)} required />
                         </>
                    )}
                 </>
             )}
        </div>

        {isParentsOrInLaws && (
            <BankDetailsForm data={bankDetails} onChange={updateBankDetails} />
        )}
      </div>
    </div>
  );
};

export default DeathClaim;
