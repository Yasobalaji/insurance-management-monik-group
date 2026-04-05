
import React, { useState, useEffect } from 'react';
import { Product, BeneficiaryType, BankDetails, User } from '../../types';
import FileUpload from '../FileUpload';
import BankDetailsForm from '../BankDetailsForm';
import { Zap, FileText, Info } from 'lucide-react';

interface Props {
  product: Product;
  beneficiary: BeneficiaryType;
  updateData: (data: any) => void;
  updateBankDetails: (data: BankDetails) => void;
  bankDetails: BankDetails;
  currentUser?: User | null;
  isGlobal?: boolean;
}

const DynamicClaimForm: React.FC<Props> = ({ 
  product, beneficiary, updateData, updateBankDetails, bankDetails, currentUser, isGlobal 
}) => {
  const [localData, setLocalData] = useState<Record<string, any>>({});
  const canSelectDate = isGlobal || currentUser?.interfaceAccess?.customer?.dateSelection;

  const handleFieldChange = (key: string, value: any) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);
    updateData(newData);
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Product Header Info */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg"><Zap size={20} /></div>
          <div>
            <h4 className="text-sm font-black text-blue-900 uppercase leading-none">{product.name}</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configured Product Protocol: {product.shortCode}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
            {product.benefitType} Settlement
          </span>
        </div>
      </div>

      {/* Dynamic Logic Criteria Fields */}
      {product.logicCriteria && product.logicCriteria.length > 0 && (
        <section className="space-y-6">
          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info size={14} className="text-blue-500" /> Operational Data Capture
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.logicCriteria.map((logic) => (
              <div key={logic.id}>
                <label className={labelClass}>{logic.criterion}</label>
                {logic.format === 'Date' ? (
                  <input 
                    type="date" 
                    className={inputClass} 
                    onChange={(e) => handleFieldChange(logic.criterion, e.target.value)}
                    disabled={!canSelectDate}
                  />
                ) : logic.format === 'Time' ? (
                  <input 
                    type="time" 
                    className={inputClass} 
                    onChange={(e) => handleFieldChange(logic.criterion, e.target.value)}
                  />
                ) : (
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder={`Enter ${logic.criterion}...`}
                    onChange={(e) => handleFieldChange(logic.criterion, e.target.value)}
                  />
                )}
                {logic.description && <p className="text-[8px] text-slate-400 mt-1 uppercase italic">{logic.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Required Documents */}
      <section className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText size={14} className="text-emerald-500" /> Evidence Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.requiredDocuments
            .filter(doc => doc.beneficiary === 'All' || doc.beneficiary === beneficiary)
            .map((doc) => (
              <FileUpload 
                key={doc.id}
                label={`${doc.name} (${doc.type})`}
                accept={doc.type === 'PDF' ? '.pdf' : 'image/*'}
                onChange={(f) => handleFieldChange(`file_${doc.id}`, f)}
                required
              />
            ))}
            {product.requiredDocuments.filter(doc => doc.beneficiary === 'All' || doc.beneficiary === beneficiary).length === 0 && (
              <div className="col-span-2 py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-300 uppercase italic">No specific documents configured for this beneficiary</p>
              </div>
            )}
        </div>
      </section>

      {/* Automatic Bank Details if Cash is involved */}
      {(product.benefitType === 'Cash' || product.benefitType === 'Both') && (
        <BankDetailsForm data={bankDetails} onChange={updateBankDetails} />
      )}
    </div>
  );
};

export default DynamicClaimForm;
