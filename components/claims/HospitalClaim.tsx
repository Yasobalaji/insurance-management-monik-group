
import React, { useState, useEffect } from 'react';
import { BeneficiaryType, User } from '../../types';
import Modal from '../Modal';
import FileUpload from '../FileUpload';
import { Calendar } from 'lucide-react';

interface Props {
  beneficiary: BeneficiaryType;
  updateData: (data: any) => void;
  currentUser?: User | null;
  isGlobal?: boolean;
}

const HospitalClaim: React.FC<Props> = ({ beneficiary, updateData, currentUser, isGlobal }) => {
  const [showModal, setShowModal] = useState(true);
  const [localData, setLocalData] = useState<any>({});
  const [warning, setWarning] = useState<string | null>(null);
  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white text-black";

  const canSelectDate = isGlobal || currentUser?.interfaceAccess?.customer?.dateSelection;

  useEffect(() => {
    const initData = { hospitalProofType: 'diagnosis_card' };
    setLocalData(initData);
    updateData(initData);
    setWarning(null);
    setShowModal(true);
  }, [beneficiary]);

  const calculateDays = (admit: string, discharge: string) => {
    if (!admit || !discharge) return 0;
    const d1 = new Date(admit);
    const d2 = new Date(discharge);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let val = diffDays;
    if (val > 10) val = 10;
    if (val < 1) val = 0;
    return val;
  };

  const calculateAge = (dob: string, dischargeDate: string) => {
    if (!dob || !dischargeDate) return 0;
    const birth = new Date(dob);
    const discharge = new Date(dischargeDate);
    let age = discharge.getFullYear() - birth.getFullYear();
    const m = discharge.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && discharge.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  }

  const handleChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    
    if (field === 'dateAdmit' || field === 'dateDischarge') {
        const days = calculateDays(
            field === 'dateAdmit' ? value : localData.dateAdmit,
            field === 'dateDischarge' ? value : localData.dateDischarge
        );
        newData.totalAdmitedDays = days;

        if (beneficiary === BeneficiaryType.CHILDREN && newData.childDob && newData.dateDischarge) {
             const age = calculateAge(newData.childDob, newData.dateDischarge);
             newData.childAge = age;
             if (age > 18) {
                 setWarning("CHILDREN AGE MORE THAN 18 YEARS OLD, CLAIM CANNOT BE ACCEPTED");
             } else {
                 setWarning(null);
             }
        }
    }

    if (field === 'childDob' && beneficiary === BeneficiaryType.CHILDREN) {
        if (newData.dateDischarge) {
            const age = calculateAge(value, newData.dateDischarge);
            newData.childAge = age;
            if (age > 18) {
                 setWarning("CHILDREN AGE MORE THAN 18 YEARS OLD, CLAIM CANNOT BE ACCEPTED");
             } else {
                 setWarning(null);
             }
        }
    }

    if (!newData.hospitalProofType) {
        newData.hospitalProofType = localData.hospitalProofType || 'diagnosis_card';
    }

    setLocalData(newData);
    updateData(newData);
  };

  const proofType = localData.hospitalProofType || 'diagnosis_card';

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Hospital Claim Rules">
        <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Limits:</strong> Two claims total (20 days, 25,000.00). Max 10 days per claim (12,500.00).</li>
            <li><strong>Per Day:</strong> 1,250.00</li>
            <li><strong>Restrictions:</strong>
                <ul className="list-circle pl-5 mt-1 text-gray-600">
                    <li>Over period not allowed without verification.</li>
                    <li>Below 24hr admit not eligible.</li>
                    <li>Children age more than 18 years not eligible.</li>
                    <li>Customer/Spouse age more than 65 years not eligible.</li>
                    <li>Ayurvedic & Private hospital claims prohibited.</li>
                    <li>Only one claim per request. Same week dual claims not approved.</li>
                </ul>
            </li>
        </ul>
      </Modal>

      {warning && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold uppercase tracking-widest text-xs">Validation Alert</p>
              <p className="text-sm font-bold uppercase">{warning}</p>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={!canSelectDate ? "opacity-60" : ""}>
            <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Date of Admit</label>
            <div className="relative">
              <input type="date" className={inputClass} onChange={(e) => handleChange('dateAdmit', e.target.value)} disabled={!canSelectDate} />
              <Calendar size={16} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
            </div>
        </div>
        <div className={!canSelectDate ? "opacity-60" : ""}>
            <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Date of Discharge</label>
            <div className="relative">
              <input type="date" className={inputClass} onChange={(e) => handleChange('dateDischarge', e.target.value)} disabled={!canSelectDate} />
              <Calendar size={16} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
            </div>
        </div>

        {beneficiary !== BeneficiaryType.CUSTOMER && (
             <div>
                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Admitted Person Name</label>
                <input type="text" className={inputClass} onChange={(e) => handleChange('admittedName', e.target.value)} />
            </div>
        )}

        {beneficiary === BeneficiaryType.CHILDREN && (
             <div className={!canSelectDate ? "opacity-60" : ""}>
                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Child Date of Birth</label>
                <div className="relative">
                  <input type="date" className={inputClass} onChange={(e) => handleChange('childDob', e.target.value)} disabled={!canSelectDate} />
                  <Calendar size={16} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                </div>
            </div>
        )}

        <div className="md:col-span-2 flex gap-4 bg-gray-50 p-4 rounded-lg">
             <div className="flex-1">
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Calculated Age</span>
                <span className="text-xl font-mono text-blue-900 font-bold">{localData.childAge || '-'}</span>
             </div>
             <div className="flex-1">
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Days (Max 10)</span>
                <span className="text-xl font-mono text-blue-600 font-bold">{localData.totalAdmitedDays || '-'}</span>
             </div>
        </div>

         <div className="md:col-span-2">
            <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Hospital Name</label>
            <input type="text" className={inputClass} onChange={(e) => handleChange('hospitalName', e.target.value)} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-black text-gray-800 mb-4 uppercase tracking-[0.2em] text-xs">Required Documents</h4>
        <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
        
        {beneficiary === BeneficiaryType.CUSTOMER && (
            <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
        )}
        
        {beneficiary === BeneficiaryType.SPOUSE && (
            <>
                <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
                <FileUpload label="Identification - Spouse (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_spouse', f)} required />
                <FileUpload label="Marriage Certificate / Child Birth Cert (PDF)" accept=".pdf" onChange={(f) => handleChange('file_rel_proof', f)} required />
            </>
        )}

         {beneficiary === BeneficiaryType.CHILDREN && (
             <>
                <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
                <FileUpload label="Birth Certificate - Children (PDF)" accept=".pdf" onChange={(f) => handleChange('file_birth_cert_child', f)} required />
             </>
        )}

        <div className="my-4">
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Hospital Proof Type</label>
            <select 
                className={inputClass} 
                value={proofType}
                onChange={(e) => handleChange('hospitalProofType', e.target.value)}
            >
                <option value="diagnosis_card">DIAGNOSIS CARD</option>
                <option value="clinic_book">CLINIC BOOK</option>
            </select>
        </div>
        
        {proofType === 'diagnosis_card' ? (
             <FileUpload key="dc_1" label="Diagnosis Card Photo" accept="image/*" onChange={(f) => handleChange('file_medical_proof_1', f)} required />
        ) : (
             <>
                <FileUpload key="cb_1" label="Clinic Book Photo 1" accept="image/*" onChange={(f) => handleChange('file_medical_proof_1', f)} required />
                <FileUpload key="cb_2" label="Clinic Book Photo 2" accept="image/*" onChange={(f) => handleChange('file_medical_proof_2', f)} required />
             </>
        )}
      </div>
    </div>
  );
};

export default HospitalClaim;
