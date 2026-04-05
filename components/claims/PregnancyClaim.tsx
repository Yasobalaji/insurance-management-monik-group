
import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { User } from '../../types';

interface Props {
  updateData: (data: any) => void;
  currentUser?: User | null;
  isGlobal?: boolean;
}

const PregnancyClaim: React.FC<Props> = ({ updateData, currentUser, isGlobal }) => {
  const [localData, setLocalData] = useState<any>({ children: [] });
  const [childrenList, setChildrenList] = useState<{id: number, gender: string}[]>([{ id: 1, gender: 'Male' }]);
  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white text-black font-bold uppercase text-xs";

  const canSelectDate = isGlobal || currentUser?.interfaceAccess?.customer?.dateSelection;

  const handleChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    updateData(newData);
  };

  const addChild = () => {
      const newChild = { id: Date.now(), gender: 'Male' };
      setChildrenList([...childrenList, newChild]);
      updateData({ ...localData, children: [...childrenList, newChild] });
  };

  const removeChild = (id: number) => {
      if (childrenList.length === 1) return;
      const newList = childrenList.filter(c => c.id !== id);
      setChildrenList(newList);
      updateData({ ...localData, children: newList });
  };

  const updateChildGender = (id: number, gender: string) => {
      const newList = childrenList.map(c => c.id === id ? { ...c, gender } : c);
      setChildrenList(newList);
      updateData({ ...localData, children: newList });
  }

  return (
    <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={!canSelectDate ? "opacity-60" : ""}>
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Expected Date</label>
                <div className="relative">
                  <input type="date" className={inputClass} onChange={(e) => handleChange('expectedDate', e.target.value)} disabled={!canSelectDate} />
                  <Calendar size={16} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Hospital</label>
                <input type="text" className={inputClass} onChange={(e) => handleChange('hospital', e.target.value)} />
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md border">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest">Children Gender</label>
                <button type="button" onClick={addChild} className="text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:text-blue-800">
                    <Plus size={14} /> Add Child
                </button>
            </div>
            
            <div className="space-y-2">
                {childrenList.map((child, index) => (
                    <div key={child.id} className="flex gap-4 items-center animate-in fade-in">
                        <select 
                            className={inputClass}
                            value={child.gender}
                            onChange={(e) => updateChildGender(child.id, e.target.value)}
                        >
                            <option value="Male">MALE</option>
                            <option value="Female">FEMALE</option>
                        </select>
                        {childrenList.length > 1 && (
                            <button onClick={() => removeChild(child.id)} className="text-red-500 hover:text-red-700 p-2">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="border-t pt-4">
            <h4 className="font-black text-gray-800 mb-4 uppercase tracking-[0.2em] text-xs underline underline-offset-4">Required Documents</h4>
            <FileUpload label="Application (PDF)" accept=".pdf" onChange={(f) => handleChange('file_application', f)} required />
            <FileUpload label="Identification - Customer (PDF)" accept=".pdf" onChange={(f) => handleChange('file_id_customer', f)} required />
            <FileUpload label="Pregnancy Clinic Book (PDF)" accept=".pdf" onChange={(f) => handleChange('file_clinic_book', f)} required />
        </div>
    </div>
  );
};

export default PregnancyClaim;
