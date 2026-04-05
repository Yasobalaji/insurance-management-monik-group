
import React, { useState } from 'react';
import { Car, Users, ClipboardList, Plus, FileText, History, RefreshCcw, Save, Search, Trash2, Camera, Upload, CheckCircle2, Send } from 'lucide-react';
// Corrected imports: InternalClaim -> StaffClaim, StaffBeneficiary -> StaffDependent
import { Vehicle, StaffMember, StaffClaim, AllocatedPerson, VehicleRenewalRecord, StaffDependent } from '../types';
import { COMPANIES } from '../constants';
import FileUpload from './FileUpload';

const InternalInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'staff' | 'claims' | 'reports'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  // Use StaffClaim as defined in types.ts
  const [claims, setClaims] = useState<StaffClaim[]>([]);

  // Form States
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  // Added missing properties to AllocatedPerson to fix line 20 error
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    allocatedPerson: { 
      name: '', 
      employeeId: '', 
      department: 'Operations', 
      designation: '', 
      contact: '', 
      nic: '', 
      drivingLicenceNo: '', 
      drivingLicenceExpiry: '', 
      allocationStart: new Date().toISOString().split('T')[0],
      status: 'Active',
      company: 'CMBSL', 
      dlNo: '' 
    }
  });

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    // Changed beneficiaries to dependents to match StaffMember interface
    dependents: [{ id: '1', name: '', relationship: 'Spouse', dob: '', contact: '' }]
  });

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [newClaim, setNewClaim] = useState<Partial<StaffClaim>>({
    // status should be one of the allowed StaffClaim status values
    status: 'Submitted',
    // StaffClaim uses incidentDate instead of requestDate
    incidentDate: new Date().toISOString().split('T')[0]
  });

  // --- Handlers ---
  const handleSaveVehicle = () => {
    if (!newVehicle.make || !newVehicle.regNo) return;
    const v: Vehicle = {
      ...(newVehicle as Vehicle),
      id: Date.now().toString(),
      // renewalHistory property removed to align with Vehicle interface
    };
    setVehicles([...vehicles, v]);
    setShowVehicleForm(false);
    // Added missing properties to AllocatedPerson to fix line 49 error
    setNewVehicle({ 
      allocatedPerson: { 
        name: '', 
        employeeId: '', 
        department: 'Operations', 
        designation: '', 
        contact: '', 
        nic: '', 
        drivingLicenceNo: '', 
        drivingLicenceExpiry: '', 
        allocationStart: new Date().toISOString().split('T')[0],
        status: 'Active',
        company: 'CMBSL', 
        dlNo: '' 
      } 
    });
  };

  const handleSaveStaff = () => {
    // StaffMember uses fullName instead of name, and id is used as the employee identifier (epf)
    if (!newStaff.fullName || !newStaff.id) return;
    const s: StaffMember = {
      ...(newStaff as StaffMember),
      id: newStaff.id || Date.now().toString(),
      fullName: newStaff.fullName || '',
      dob: newStaff.dob || '',
      gender: newStaff.gender || 'Other',
      contact: newStaff.contact || { phone: '', email: '', address: '' },
      department: newStaff.department || 'Human Resources',
      designation: newStaff.designation || '',
      joinDate: newStaff.joinDate || new Date().toISOString().split('T')[0],
      employmentType: newStaff.employmentType || 'Permanent',
      dependents: newStaff.dependents || [],
      emergencyContact: newStaff.emergencyContact || { name: '', relationship: '', phone: '' },
      status: 'Active',
    };
    setStaff([...staff, s]);
    setShowStaffForm(false);
    // Reset state using correct property names
    setNewStaff({ dependents: [{ id: '1', name: '', relationship: 'Spouse', dob: '', contact: '' }] });
  };

  const handleSaveClaim = () => {
    // StaffClaim uses employeeId
    if (!newClaim.employeeId || !newClaim.claimType) return;
    const c: StaffClaim = {
      ...(newClaim as StaffClaim),
      id: `INT-${Date.now()}`,
      policyNumber: newClaim.policyNumber || 'TBD',
      requestedAmount: newClaim.requestedAmount || 0,
      treatmentDetails: newClaim.treatmentDetails || '',
      hospitalName: newClaim.hospitalName || '',
      status: newClaim.status || 'Submitted',
      incidentDate: newClaim.incidentDate || new Date().toISOString().split('T')[0],
      documents: []
    };
    setClaims([c, ...claims]);
    setShowClaimForm(false);
    setNewClaim({ status: 'Submitted', incidentDate: new Date().toISOString().split('T')[0] });
  };

  const addBeneficiaryRow = () => {
    const currentDependents = newStaff.dependents || [];
    if (currentDependents.length >= 5) return;
    setNewStaff({
      ...newStaff,
      dependents: [...currentDependents, { id: Date.now().toString(), name: '', relationship: 'Spouse', dob: '', contact: '' }]
    });
  };

  const sectionHead = "bg-blue-800 text-white px-8 py-4 font-black uppercase tracking-tighter shadow-md rounded-xl mb-6 flex items-center gap-3";
  const cardClass = "bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden p-8 mb-8";
  const inputClass = "w-full border-blue-100 rounded-xl text-xs font-bold p-3 uppercase focus:ring-2 focus:ring-red-500 bg-white text-slate-900 shadow-sm border transition-all";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex items-center gap-6 mb-12">
        <div className="bg-red-600 p-4 rounded-2xl shadow-xl border-b-4 border-blue-900">
          <ClipboardList className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">STAFF INSURANCE CONSOLE</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Personnel & Fleet Management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-blue-50 mb-10 w-fit">
        <button onClick={() => setActiveTab('vehicles')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'vehicles' ? 'bg-blue-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <Car size={16} /> Fleet Management
        </button>
        <button onClick={() => setActiveTab('staff')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'staff' ? 'bg-blue-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <Users size={16} /> Personnel Registry
        </button>
        <button onClick={() => setActiveTab('claims')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'claims' ? 'bg-blue-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <History size={16} /> Staff Claims
        </button>
      </div>

      {/* --- Fleet Management --- */}
      {activeTab === 'vehicles' && (
        <div className="space-y-8">
          {!showVehicleForm ? (
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">VEHICLE REGISTRY</h2>
                <button onClick={() => setShowVehicleForm(true)} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Plus size={16} /> Add Vehicle
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase text-xs border-2 border-dashed rounded-3xl">
                    No Vehicles Registered in System
                  </div>
                ) : (
                  vehicles.map(v => (
                    <div key={v.id} className="bg-white border border-blue-50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 text-blue-900 p-2 rounded-lg font-black text-xs">#{v.regNo}</div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NEXT RENEWAL: {v.renewalDate}</span>
                      </div>
                      <h3 className="text-lg font-black text-blue-900 uppercase mb-1">{v.make}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Allocated: {v.allocatedPerson.name} ({v.allocatedPerson.company})</p>
                      <button className="w-full py-2.5 bg-slate-50 text-slate-600 font-black text-[9px] uppercase rounded-xl border border-slate-100 hover:bg-blue-50 hover:text-blue-900 transition-all">Update Renewal</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className={cardClass}>
              <div className={sectionHead}><Plus size={20} /> NEW VEHICLE REGISTRATION</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className={labelClass}>Vehicle Make</label>
                  <input type="text" className={inputClass} value={newVehicle.make || ''} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Registration Number</label>
                  <input type="text" className={inputClass} value={newVehicle.regNo || ''} onChange={e => setNewVehicle({...newVehicle, regNo: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Purpose</label>
                  <input type="text" className={inputClass} value={newVehicle.purpose || ''} onChange={e => setNewVehicle({...newVehicle, purpose: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Current Insurance Co.</label>
                  <input type="text" className={inputClass} value={newVehicle.currentInsuranceCompany || ''} onChange={e => setNewVehicle({...newVehicle, currentInsuranceCompany: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Initial Renewal Date</label>
                  <input type="date" className={inputClass} value={newVehicle.renewalDate || ''} onChange={e => setNewVehicle({...newVehicle, renewalDate: e.target.value})} />
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-blue-50">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6">Allocated Personnel Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input type="text" className={inputClass} value={newVehicle.allocatedPerson?.name || ''} onChange={e => setNewVehicle({...newVehicle, allocatedPerson: {...newVehicle.allocatedPerson!, name: e.target.value}})} />
                  </div>
                  <div>
                    <label className={labelClass}>Allocated Company</label>
                    <select className={inputClass} value={newVehicle.allocatedPerson?.company || 'CMBSL'} onChange={e => setNewVehicle({...newVehicle, allocatedPerson: {...newVehicle.allocatedPerson!, company: e.target.value}})}>
                      {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Designation</label>
                    <input type="text" className={inputClass} value={newVehicle.allocatedPerson?.designation || ''} onChange={e => setNewVehicle({...newVehicle, allocatedPerson: {...newVehicle.allocatedPerson!, designation: e.target.value}})} />
                  </div>
                  <div>
                    <label className={labelClass}>NIC No</label>
                    <input type="text" className={inputClass} value={newVehicle.allocatedPerson?.nic || ''} onChange={e => setNewVehicle({...newVehicle, allocatedPerson: {...newVehicle.allocatedPerson!, nic: e.target.value}})} />
                  </div>
                  <div>
                    <label className={labelClass}>DL License No</label>
                    {/* Access dlNo from updated AllocatedPerson interface */}
                    <input type="text" className={inputClass} value={newVehicle.allocatedPerson?.dlNo || ''} onChange={e => setNewVehicle({...newVehicle, allocatedPerson: {...newVehicle.allocatedPerson!, dlNo: e.target.value}})} />
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-blue-50">
                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2"><Camera size={18} /> Document Repository</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FileUpload label="CR Copy (PDF/IMG)" accept=".pdf,image/*" onChange={() => {}} />
                  <FileUpload label="Front View (IMG)" accept="image/*" onChange={() => {}} />
                  <FileUpload label="Back View (IMG)" accept="image/*" onChange={() => {}} />
                  <FileUpload label="Right View (IMG)" accept="image/*" onChange={() => {}} />
                  <FileUpload label="Left View (IMG)" accept="image/*" onChange={() => {}} />
                  <FileUpload label="Chassis No (IMG)" accept="image/*" onChange={() => {}} />
                  <FileUpload label="Meter Reading (IMG)" accept="image/*" onChange={() => {}} />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-12 border-t pt-8">
                <button onClick={() => setShowVehicleForm(false)} className="px-8 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest">Discard</button>
                <button onClick={handleSaveVehicle} className="bg-red-600 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95"><Save size={16} /> Finalize Asset</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Staff Welfare --- */}
      {activeTab === 'staff' && (
        <div className="space-y-8">
           {!showStaffForm ? (
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">STAFF DATABASE</h2>
                <button onClick={() => setShowStaffForm(true)} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Plus size={16} /> New Staff Member
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase text-xs border-2 border-dashed rounded-3xl">
                    No Personnel Found
                  </div>
                ) : (
                  staff.map(s => (
                    <div key={s.id} className="bg-white border border-blue-50 p-6 rounded-3xl shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        {/* Use id (epf identifier) and joinDate from updated StaffMember interface */}
                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-widest">EPF: {s.id}</div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JOINED: {s.joinDate}</span>
                      </div>
                      <h3 className="text-lg font-black text-blue-900 uppercase mb-1">{s.fullName}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-4">{s.designation} • {s.department}</p>
                      <div className="text-[9px] font-black text-blue-800 uppercase bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                        {/* Use dependents from updated StaffMember interface */}
                        {s.dependents.length} Enrolled Beneficiaries
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
           ) : (
            <div className={cardClass}>
              <div className={sectionHead}><Users size={20} /> INITIALIZE STAFF ACCOUNT</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" className={inputClass} value={newStaff.fullName || ''} onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input type="text" className={inputClass} value={newStaff.department || ''} onChange={e => setNewStaff({...newStaff, department: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>EPF Number</label>
                  <input type="text" className={inputClass} value={newStaff.id || ''} onChange={e => setNewStaff({...newStaff, id: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Designation</label>
                  <input type="text" className={inputClass} value={newStaff.designation || ''} onChange={e => setNewStaff({...newStaff, designation: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Date of Join</label>
                  <input type="date" className={inputClass} value={newStaff.joinDate || ''} onChange={e => setNewStaff({...newStaff, joinDate: e.target.value})} />
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-blue-50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Enrolled Beneficiaries (Up to 5)</h3>
                  <button onClick={addBeneficiaryRow} className="text-blue-600 font-black text-[10px] uppercase hover:underline">Add Row</button>
                </div>
                <div className="space-y-4">
                  {newStaff.dependents?.map((b, i) => (
                    <div key={b.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50/50 p-4 rounded-2xl">
                      <div>
                        <label className={labelClass}>Full Name ({i+1})</label>
                        <input type="text" className={inputClass} value={b.name} onChange={e => {
                          const list = [...(newStaff.dependents || [])];
                          list[i].name = e.target.value;
                          setNewStaff({...newStaff, dependents: list});
                        }} />
                      </div>
                      <div>
                        <label className={labelClass}>Relationship</label>
                        <input type="text" className={inputClass} value={b.relationship} onChange={e => {
                          const list = [...(newStaff.dependents || [])];
                          list[i].relationship = e.target.value;
                          setNewStaff({...newStaff, dependents: list});
                        }} />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className={labelClass}>Contact Info</label>
                          <input type="text" className={inputClass} value={b.contact} onChange={e => {
                            const list = [...(newStaff.dependents || [])];
                            list[i].contact = e.target.value;
                            setNewStaff({...newStaff, dependents: list});
                          }} />
                        </div>
                        {i > 0 && (
                          <button onClick={() => {
                            const list = (newStaff.dependents || []).filter((_, idx) => idx !== i);
                            setNewStaff({...newStaff, dependents: list});
                          }} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-12 border-t pt-8">
                <button onClick={() => setShowStaffForm(false)} className="px-8 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest">Discard</button>
                <button onClick={handleSaveStaff} className="bg-red-600 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95"><Save size={16} /> Enroll Personnel</button>
              </div>
            </div>
           )}
        </div>
      )}

      {/* --- Staff Claims --- */}
      {activeTab === 'claims' && (
        <div className="space-y-8">
          {!showClaimForm ? (
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">STAFF CLAIMS HISTORY</h2>
                <button onClick={() => setShowClaimForm(true)} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Plus size={16} /> File Staff Claim
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-50">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Date</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested / Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {claims.length === 0 ? (
                      <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-xs">No Staff Claims Filed</td></tr>
                    ) : (
                      claims.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.status === 'Payment Processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-black text-blue-900">ID: {c.employeeId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] font-black text-slate-700 uppercase">{c.claimType}</div>
                            <div className="text-[9px] font-bold text-slate-400">{c.incidentDate}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="text-[10px] font-black text-blue-900">REQ: {c.requestedAmount?.toLocaleString() || '-'}</div>
                             <div className="text-[10px] font-black text-emerald-600">APP: {c.approvedAmount?.toLocaleString() || '-'}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={cardClass}>
               <div className={sectionHead}><ClipboardList size={20} /> NEW STAFF CLAIM REQUEST</div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className={labelClass}>Policy Number</label>
                    <input type="text" className={inputClass} value={newClaim.policyNumber || ''} onChange={e => setNewClaim({...newClaim, policyNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>Employee ID</label>
                    <input type="text" className={inputClass} value={newClaim.employeeId || ''} onChange={e => setNewClaim({...newClaim, employeeId: e.target.value})} placeholder="Search Employee ID..." />
                  </div>
                  <div>
                    <label className={labelClass}>Claim Type</label>
                    <select className={inputClass} value={newClaim.claimType || ''} onChange={e => setNewClaim({...newClaim, claimType: e.target.value as any})}>
                      <option value="">SELECT TYPE</option>
                      <option value="Medical">Medical</option>
                      <option value="Accident">Accident</option>
                      <option value="Life Event">Life Event</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Treatment Details</label>
                    <textarea className={`${inputClass} h-20 normal-case`} value={newClaim.treatmentDetails || ''} onChange={e => setNewClaim({...newClaim, treatmentDetails: e.target.value})} placeholder="Describe request details..." />
                  </div>
                  <div>
                    <label className={labelClass}>Incident Date</label>
                    <input type="date" className={inputClass} value={newClaim.incidentDate || ''} onChange={e => setNewClaim({...newClaim, incidentDate: e.target.value})} />
                  </div>
               </div>

               <div className="mt-12 pt-8 border-t border-blue-50">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6">Supporting Evidence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUpload label="Application Scan (PDF)" accept=".pdf" onChange={() => {}} />
                    <FileUpload label="Supporting Docs (IMG)" accept="image/*" onChange={() => {}} />
                  </div>
               </div>

               <div className="flex justify-end gap-4 mt-12 border-t pt-8">
                <button onClick={() => setShowClaimForm(false)} className="px-8 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest">Discard</button>
                <button onClick={handleSaveClaim} className="bg-red-600 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95"><Send size={16} className="rotate-[-20deg]" /> File Request</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InternalInterface;
