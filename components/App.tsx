import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CustomerForm from './components/CustomerForm';
import DeathClaim from './components/claims/DeathClaim';
import HospitalClaim from './components/claims/HospitalClaim';
import EducationClaim from './components/claims/EducationClaim';
import MarriageClaim from './components/claims/MarriageClaim';
import PregnancyClaim from './components/claims/PregnancyClaim';
import DynamicClaimForm from './components/claims/DynamicClaimForm';
import ClaimsList from './components/ClaimsList';
import StationeryPregnancyPack from './components/benefit/StationeryPregnancyPack';
import LaptopLoanManagement from './components/benefit/LaptopLoanManagement';
import PaymentRequest from './components/PaymentRequest';
import PaymentUpdate from './components/PaymentUpdate';
import AuditReview from './components/AuditReview';
import AuditSummaryReport from './components/AuditSummaryReport';
import AuditVerification from './components/AuditVerification';
import Administration from './components/Administration';
import Summary from './components/Summary';
import CompletedClaims from './components/CompletedClaims';
import CategorySelection from './components/CategorySelection';
import StaffInsuranceModule from './components/StaffInsuranceModule';
import AssetManagementModule from './components/AssetManagementModule';
import Modal from './components/Modal';
import { User, SessionAction, BaseClaimData, BeneficiaryType, BankDetails, Product, RoleDefinition, AppNotification, ClaimType, BenefitType, PackType } from './types';
import { COMPANY_BRAND, APP_NAME, COMPANY_FULL_NAMES } from './constants';
import { Clock, UserCircle, MessageSquare, Zap, RotateCcw, ShieldCheck, Settings, Building2, CheckCircle2, ShieldAlert, Lock, Loader2, User as UserIcon, Landmark, FileText, ClipboardCheck, ArrowRight, Bell, Check, X, Shield, Package, Wallet, Layers } from 'lucide-react';
import { apiService } from './services/api';
import { MOCK_USERS, DEFAULT_ROLES } from './utils/mockData';

const INITIAL_BANK_DETAILS: BankDetails = {
    accountHolderName: '', bankName: '', branchNameOrCode: '', accountNo: '', verifyAccountNo: ''
};

const INITIAL_PRODUCTS: Product[] = [
    { id: 'DEATH', name: 'Death Claim', shortCode: 'DTH', claimType: ClaimType.DEATH, subType: 'Main', targetSilo: 'customer', beneficiaries: [BeneficiaryType.CUSTOMER, BeneficiaryType.SPOUSE, BeneficiaryType.CHILDREN, BeneficiaryType.FATHER, BeneficiaryType.MOTHER, BeneficiaryType.FATHER_IN_LAW, BeneficiaryType.MOTHER_IN_LAW], benefitType: 'Cash', paymentParty: 'Customer', requiredDocuments: [], logicCriteria: [], customFields: [], isSystem: true, allocatedCompanies: ["CMC", "MONIK", "CMBSL"], logicDescription: '' },
    { id: 'HOSPITAL', name: 'Hospital Claim', shortCode: 'HSP', claimType: ClaimType.HOSPITAL, subType: 'Main', targetSilo: 'customer', beneficiaries: [BeneficiaryType.CUSTOMER, BeneficiaryType.SPOUSE, BeneficiaryType.CHILDREN], benefitType: 'Cash', paymentParty: 'Customer', requiredDocuments: [], logicCriteria: [], customFields: [], isSystem: true, allocatedCompanies: ["CMC", "MONIK", "CMBSL"], logicDescription: '' },
    { id: 'EDUCATION', name: 'Education Support', shortCode: 'EDU', claimType: ClaimType.EDUCATION, subType: 'Main', targetSilo: 'customer', beneficiaries: [BeneficiaryType.CHILDREN], benefitType: 'Both', paymentParty: 'Customer', requiredDocuments: [], logicCriteria: [], customFields: [], isSystem: true, allocatedCompanies: ["CMC", "MONIK", "CMBSL"], logicDescription: '' },
    { id: 'MARRIAGE', name: 'Marriage Support', shortCode: 'MRG', claimType: ClaimType.MARRIAGE, subType: 'Main', targetSilo: 'customer', beneficiaries: [BeneficiaryType.CHILDREN], benefitType: 'Cash', paymentParty: 'Customer', requiredDocuments: [], logicCriteria: [], customFields: [], isSystem: true, allocatedCompanies: ["CMC", "MONIK", "CMBSL"], logicDescription: '' },
    { id: 'PREGNANCY', name: 'Pregnancy Support', shortCode: 'PRG', claimType: ClaimType.PREGNANCY, subType: 'Main', targetSilo: 'customer', beneficiaries: [BeneficiaryType.CUSTOMER], benefitType: 'Pack', paymentParty: 'Customer', requiredDocuments: [], logicCriteria: [], customFields: [], isSystem: true, allocatedCompanies: ["CMC", "MONIK", "CMBSL"], logicDescription: '' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<'customer' | 'staff' | 'asset' | 'admin' | null>(null);
  
  const [currentUser] = useState<User>(MOCK_USERS[0]);
  const [currentBranch] = useState<string>('HEAD OFFICE');
  const [claims, setClaims] = useState<BaseClaimData[]>([]);
  
  const [sessionLog, setSessionLog] = useState<SessionAction[]>([]);
  const [isLoggingActive, setIsLoggingActive] = useState<boolean>(true);
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_ROLES);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<AppNotification | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
  // Review Modal State
  const [reviewingClaim, setReviewingClaim] = useState<BaseClaimData | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected' | 'Pending' | null>(null);
  const [reviewBenefitType, setReviewBenefitType] = useState<BenefitType | null>(null);
  const [selectedPacks, setSelectedPacks] = useState<{ pregnancy: boolean; stationery: boolean; laptop: boolean }>({
    pregnancy: false,
    stationery: false,
    laptop: false
  });
  
  const [formData, setFormData] = useState<Partial<BaseClaimData>>({
      claimType: 'DEATH',
      beneficiary: BeneficiaryType.CUSTOMER,
  });
  const [subFormData, setSubFormData] = useState<any>({});
  const [bankDetails, setBankDetails] = useState<BankDetails>(INITIAL_BANK_DETAILS);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      const fetched = await apiService.getClaims();
      setClaims(fetched);
    };
    load();
  }, []);

  const isGlobalUser = true;

  const visibleClaims = useMemo(() => {
    return claims;
  }, [claims]);

  const logAction = (action: string) => {
    if (!isLoggingActive) return;
    setSessionLog(prev => [...prev, { timestamp: Date.now(), action, module: currentView }]);
  };

  const handleUpdateClaim = async (id: string, updates: Partial<BaseClaimData>) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    await apiService.updateClaim(id, updates);
    logAction(`CLAIM_UPDATE_${id}_${updates.status || 'DATA'}`);
  };

  const handleFinalReviewSubmit = () => {
    if (!reviewingClaim || !reviewStatus) return;

    const updates: Partial<BaseClaimData> = {
      status: reviewStatus as any,
    };

    if (reviewStatus === 'Approved') {
      updates.approvedBenefitType = reviewBenefitType || 'Cash';
      updates.approvedCashAmount = reviewingClaim.loanAmount;
      updates.approvedBenefits = {
        cash: reviewBenefitType === 'Cash' || reviewBenefitType === 'Both',
        laptopLoan: selectedPacks.laptop,
        pack: {
          pregnancy: selectedPacks.pregnancy,
          stationery: selectedPacks.stationery
        }
      };
    }

    handleUpdateClaim(reviewingClaim.id, updates);
    setReviewingClaim(null);
    setReviewStatus(null);
    setReviewBenefitType(null);
    setSelectedPacks({ pregnancy: false, stationery: false, laptop: false });
  };

  const downloadSessionReport = () => {
    const report = sessionLog.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.module} -> ${l.action}`).join('\n');
    const blob = new Blob([`INTERNAL MANAGEMENT - SECURE SESSION REPORT\nUSER: ${currentUser?.name}\nSTART: ${new Date(now).toLocaleString()}\n\nRECORDED ACTIONS:\n${report}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Internal_Session_Log_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    logAction("SESSION_REPORT_DOWNLOADED");
  };

  const addNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: AppNotification = {
      ...n, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    setToast(newNotification);
    setTimeout(() => setToast(null), 5000);
  };

  const handleAddUser = (user: User) => {
    const roleObj = roles.find(r => r.id === user.role);
    const userWithPerms = { ...user, interfaceAccess: roleObj?.permissions };
    setUsers(prev => {
        const idx = prev.findIndex(u => u.id === user.id);
        if (idx > -1) {
            const next = [...prev];
            next[idx] = userWithPerms;
            return next;
        }
        return [userWithPerms, ...prev];
    });
    logAction(`USER_UPSERTED_${user.username}`);
  };

  const handleDeleteUser = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
      logAction(`USER_DELETED_${id}`);
  };

  const handleSaveRole = (role: RoleDefinition) => {
    setRoles(prev => {
        const idx = prev.findIndex(r => r.id === role.id);
        if (idx > -1) {
            const next = [...prev];
            next[idx] = role;
            return next;
        }
        return [...prev, role];
    });
    setUsers(prevUsers => prevUsers.map(u => u.role === role.id ? { ...u, interfaceAccess: role.permissions } : u));
    logAction(`ROLE_SAVED_${role.name}`);
  };

  const handleDeleteRole = (id: string) => {
      setRoles(prev => prev.filter(r => r.id !== id));
      logAction(`ROLE_DELETED_${id}`);
  };

  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
        const idx = prev.findIndex(p => p.id === product.id);
        if (idx > -1) {
            const next = [...prev];
            next[idx] = product;
            return next;
        }
        return [...prev, product];
    });
    logAction(`PRODUCT_SAVED_${product.name}`);
  };

  const handleDeleteProduct = (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      logAction(`PRODUCT_DELETED_${id}`);
  };

  const handleFinalSubmit = async () => {
    setShowSubmitConfirm(false);
    setIsSubmitting(true);
    const selectedProduct = products.find(p => p.id === formData.claimType);
    const claimToSave: BaseClaimData = {
        ...formData,
        id: `CLM-${Date.now()}`,
        timestamp: Date.now(),
        status: 'Requested',
        deathData: formData.claimType === 'DEATH' ? subFormData : undefined,
        hospitalData: formData.claimType === 'HOSPITAL' ? subFormData : undefined,
        educationData: formData.claimType === 'EDUCATION' ? subFormData : undefined,
        marriageData: formData.claimType === 'MARRIAGE' ? subFormData : undefined,
        pregnancyData: formData.claimType === 'PREGNANCY' ? subFormData : undefined,
        bankDetails: bankDetails,
        company: formData.company || currentUser?.company || 'CMBSL',
        branch: formData.branch || 'HEAD OFFICE',
        customerInsuranceId: formData.customerInsuranceId || 'TEMP-ID',
        shortCode: selectedProduct?.shortCode
    } as BaseClaimData;

    const fd = new FormData();
    fd.append('data', JSON.stringify(claimToSave));
    await apiService.createClaim(fd);
    setClaims(prev => [claimToSave, ...prev]);
    logAction(`NEW_CLAIM_SUBMITTED_${claimToSave.id}`);
    setTimeout(() => {
        setIsSubmitting(false);
        setCurrentView('dashboard');
        setFormData({ claimType: 'DEATH', beneficiary: BeneficiaryType.CUSTOMER });
        setSubFormData({});
        setBankDetails(INITIAL_BANK_DETAILS);
    }, 1500);
  };

  if (!selectedCategory) return (
    <CategorySelection 
        currentUser={currentUser} 
        onSelect={cat => { 
            setSelectedCategory(cat as any); 
            if (cat === 'admin') setCurrentView('users');
            else setCurrentView('dashboard');
            logAction(`SELECTED_SILO_${cat.toUpperCase()}`); 
        }} 
    />
  );

  const companyFullName = COMPANY_FULL_NAMES[currentUser.company] || "INTERNAL MANAGEMENT SYSTEM";

  const renderApprovalDetail = (label: string, value: string | undefined | number) => (
    <div className="flex justify-between border-b border-slate-100 py-2.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[11px] font-black text-slate-800 uppercase">{value || '-'}</span>
    </div>
  );

  const getSiloName = () => {
    switch(selectedCategory) {
      case 'customer': return 'Customer Insurance';
      case 'staff': return 'Employee Insurance';
      case 'asset': return 'Asset Insurance';
      case 'admin': return 'System Administrator';
      default: return COMPANY_BRAND;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex font-sans text-slate-900 overflow-x-hidden">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(v) => { logAction(`VIEW_CHANGE_${v.toUpperCase()}`); setCurrentView(v); }} 
        onLogout={() => setSelectedCategory(null)} 
        onSwitchCategory={() => setSelectedCategory(null)} 
        category={selectedCategory} 
        currentUser={currentUser} 
        roles={roles}
        unreadCount={notifications.filter(n => !n.isRead).length}
      />
      
      <div className="flex-1 md:ml-72 p-10 pt-24 md:pt-10 flex flex-col">
        {/* HEADER */}
        <div className="mb-12 animate-in slide-in-from-top-6 duration-700">
            <div className={`bg-white p-8 rounded-[3rem] border-l-[12px] ${selectedCategory === 'admin' ? 'border-emerald-600' : 'border-blue-600'} shadow-2xl flex items-center justify-between border border-blue-50`}>
                <div className="flex items-center gap-6">
                    <div className={`${selectedCategory === 'asset' ? 'bg-emerald-600' : selectedCategory === 'admin' ? 'bg-emerald-700' : 'bg-blue-800'} p-4 rounded-3xl text-white shadow-xl rotate-[-2deg]`}>
                      {selectedCategory === 'asset' ? <ShieldCheck size={32} /> : selectedCategory === 'admin' ? <Settings size={32} /> : <Building2 size={32} />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">{companyFullName}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2.5 ml-1">{getSiloName()} Protocol</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner">
                  <UserCircle className="text-blue-600" size={20} />
                  <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Identity</p>
                    <p className="text-[10px] font-black text-blue-900 uppercase leading-none">{currentUser.name} • {currentBranch}</p>
                  </div>
                </div>
            </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          {selectedCategory === 'customer' ? (
              <>
                  {currentView === 'dashboard' && <Summary claims={visibleClaims} userBranches={currentUser.branches} isGlobal={isGlobalUser} currentUser={currentUser} />}
                  {currentView === 'form' && (
                    <div className="max-w-6xl mx-auto space-y-10 pb-32">
                        <CustomerForm data={formData} onChange={(f, v) => setFormData(prev => ({...prev, [f]: v}))} allClaims={claims} currentUser={currentUser} isGlobal={isGlobalUser} userBranches={currentUser.branches} />
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-blue-100 overflow-hidden">
                            <div className="bg-blue-800 px-10 py-10 border-b-4 border-red-600"><h2 className="text-white font-black text-2xl uppercase tracking-tighter">Workflow Allocation Protocol</h2></div>
                            <div className="p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div><label className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Target Product</label><select className="block w-full rounded-2xl border-blue-50 shadow-sm border p-4 bg-sky-50/20 text-slate-800 focus:ring-2 focus:ring-red-500 uppercase text-sm font-black" value={formData.claimType} onChange={(e) => setFormData(prev => ({ ...prev, claimType: e.target.value }))}>
                                        {products.filter(p=>p.targetSilo==='customer').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select></div>
                                    <div><label className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Beneficiary Assignment</label><select className="block w-full rounded-2xl border-blue-50 shadow-sm border p-4 bg-sky-50/20 text-slate-800 focus:ring-2 focus:ring-red-500 uppercase text-sm font-black" value={formData.beneficiary} onChange={(e) => setFormData(prev => ({ ...prev, beneficiary: e.target.value as BeneficiaryType }))}>{products.find(p => p.id === formData.claimType)?.beneficiaries.map(b => (<option key={b} value={b}>{b}</option>))}</select></div>
                                </div>
                                <div className="mt-14 pt-14 border-t border-blue-50">
                                    {formData.claimType === 'DEATH' ? <DeathClaim beneficiary={formData.beneficiary as BeneficiaryType} updateData={setSubFormData} bankDetails={bankDetails} updateBankDetails={setBankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'HOSPITAL' ? <HospitalClaim beneficiary={formData.beneficiary as BeneficiaryType} updateData={setSubFormData} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'EDUCATION' ? <EducationClaim updateData={setSubFormData} bankDetails={bankDetails} updateBankDetails={setBankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'MARRIAGE' ? <MarriageClaim updateData={setSubFormData} bankDetails={bankDetails} updateBankDetails={setBankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'PREGNANCY' ? <PregnancyClaim updateData={setSubFormData} currentUser={currentUser} isGlobal={isGlobalUser} /> : products.find(p => p.id === formData.claimType) ? <DynamicClaimForm product={products.find(p => p.id === formData.claimType)!} beneficiary={formData.beneficiary as BeneficiaryType} updateData={setSubFormData} updateBankDetails={setBankDetails} bankDetails={bankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : null}
                                </div>
                                <div className="mt-12 border-t border-blue-50 pt-12 flex gap-6">
                                    <button onClick={() => setFormData({ claimType: 'DEATH', beneficiary: BeneficiaryType.CUSTOMER })} className="flex-1 bg-slate-100 text-slate-500 font-black uppercase py-5 rounded-2xl text-xs border border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 tracking-widest"><RotateCcw size={18} /> Discard Draft</button>
                                    <button onClick={() => setShowSubmitConfirm(true)} className="flex-[2] bg-emerald-500 text-slate-950 font-black uppercase py-6 rounded-[2rem] text-sm shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] border-b-[8px] border-emerald-600 flex items-center justify-center gap-6 active:scale-95 transition-all hover:bg-emerald-400 tracking-[0.2em]"><Zap size={22} fill="currentColor" /> Initialize Submission</button>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}
                  {currentView === 'list' && <ClaimsList claims={visibleClaims} onUpdateClaim={handleUpdateClaim} onAddNotification={addNotification} currentUser={currentUser} isGlobal={isGlobalUser} onEditClaim={(c) => setReviewingClaim(c)} />}
                  {currentView === 'stationery_pack' && <StationeryPregnancyPack claims={visibleClaims} onUpdateClaim={handleUpdateClaim} currentUser={currentUser} />}
                  {currentView === 'laptop_loan' && <LaptopLoanManagement claims={visibleClaims} onUpdateClaim={handleUpdateClaim} currentUser={currentUser} />}
                  {currentView === 'payment_request' && <PaymentRequest claims={visibleClaims} onUpdateClaim={handleUpdateClaim} userBranches={currentUser.branches} isGlobal={isGlobalUser} currentUser={currentUser} />}
                  {currentView === 'payment_update' && <PaymentUpdate claims={visibleClaims} onUpdateClaim={handleUpdateClaim} userBranches={currentUser.branches} isGlobal={isGlobalUser} />}
                  {currentView === 'audit_review' && <AuditReview claims={visibleClaims} onUpdateClaim={handleUpdateClaim} currentUser={currentUser} isGlobal={isGlobalUser} />}
                  {currentView === 'audit_report' && <AuditSummaryReport claims={visibleClaims} isGlobal={isGlobalUser} />}
                  {currentView === 'audit_logs' && <AuditVerification claims={visibleClaims} onUpdateClaim={handleUpdateClaim} isGlobal={isGlobalUser} />}
                  {currentView === 'completed_claims' && <CompletedClaims claims={visibleClaims} isGlobal={isGlobalUser} />}
              </>
          ) : selectedCategory === 'staff' ? (
              <StaffInsuranceModule currentUser={currentUser} isGlobal={isGlobalUser} />
          ) : selectedCategory === 'asset' ? (
              <AssetManagementModule currentUser={currentUser} isGlobal={isGlobalUser} currentView={currentView} />
          ) : selectedCategory === 'admin' ? (
              <Administration 
                  activeTab={currentView as any} 
                  users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} 
                  roles={roles} onSaveRole={handleSaveRole} onDeleteRole={handleDeleteRole} 
                  products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} 
                  onExportData={() => {}} onImportData={() => {}} allClaims={claims} 
                  isLoggingActive={isLoggingActive}
                  onToggleLogging={() => setIsLoggingActive(!isLoggingActive)}
                  onDownloadSession={downloadSessionReport}
                  sessionCount={sessionLog.length}
              />
          ) : null}
        </div>
      </div>

      {/* APPROVAL INTERFACE MODAL */}
      {reviewingClaim && (
        <Modal isOpen={!!reviewingClaim} onClose={() => { setReviewingClaim(null); setReviewStatus(null); setReviewBenefitType(null); }} title="PROTOCOL REVIEW">
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
             
             {/* Part 01: Identity Matrix */}
             <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-900 border-b-2 border-slate-100 pb-3">
                    <UserIcon size={20} className="text-emerald-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Phase 01: Identity Matrix</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                    {renderApprovalDetail("Credential ID", reviewingClaim.customerInsuranceId)}
                    {renderApprovalDetail("Legal Name", reviewingClaim.customerName)}
                    {renderApprovalDetail("National ID", reviewingClaim.idNumber)}
                    {renderApprovalDetail("Primary Entity", reviewingClaim.company)}
                    {renderApprovalDetail("Service Node", reviewingClaim.branch)}
                </div>
             </section>

             {/* Part 02: Loan Details */}
             <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-900 border-b-2 border-slate-100 pb-3">
                    <Landmark size={20} className="text-indigo-600" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Phase 02: Financial Ledger</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 bg-indigo-50/10 p-8 rounded-[2rem] border border-indigo-100/50 shadow-inner">
                    {renderApprovalDetail("Account Portfolio", reviewingClaim.loanNumber)}
                    {renderApprovalDetail("Issued Principal", reviewingClaim.loanAmount)}
                    {renderApprovalDetail("Cycle Type", reviewingClaim.collectionMethod)}
                    {renderApprovalDetail("Activation Date", reviewingClaim.loanDisbursedDate)}
                    {renderApprovalDetail("Total Amortization", reviewingClaim.totalPaid)}
                    {renderApprovalDetail("Outstanding Balance", reviewingClaim.arrears)}
                </div>
             </section>

             {/* Decision Control Terminal */}
             <div className="bg-slate-100 p-10 rounded-[3rem] space-y-8 border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-blue-900 rotate-12"><Shield size={120} /></div>
                
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-200 pb-4 flex items-center gap-3 relative z-10">
                    <ShieldAlert size={18} className="text-amber-500" /> Executive Action Terminal
                </h4>
                
                {/* STATUS SELECTION */}
                <div className="grid grid-cols-3 gap-4 relative z-10">
                    <button 
                        onClick={() => setReviewStatus('Approved')} 
                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewStatus === 'Approved' ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:bg-emerald-50'}`}
                    >
                        <Check size={16} strokeWidth={4} /> Approve
                    </button>
                    <button 
                        onClick={() => { setReviewStatus('Rejected'); setReviewBenefitType(null); }} 
                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewStatus === 'Rejected' ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:bg-red-50'}`}
                    >
                        <X size={16} strokeWidth={4} /> Reject
                    </button>
                    <button 
                        onClick={() => { setReviewStatus('Pending'); setReviewBenefitType(null); }} 
                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewStatus === 'Pending' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:bg-blue-50'}`}
                    >
                        <Clock size={16} strokeWidth={4} /> Pending
                    </button>
                </div>

                {/* BENEFIT SELECTION (IF APPROVED) */}
                {reviewStatus === 'Approved' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Authorized Benefit Category</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['Cash', 'Pack', 'Both'] as BenefitType[]).map(type => (
                                    <button 
                                        key={type} 
                                        onClick={() => setReviewBenefitType(type)}
                                        className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewBenefitType === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {type === 'Cash' ? <Wallet size={12}/> : type === 'Pack' ? <Package size={12}/> : <Layers size={12}/>}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PACK COMPONENT SELECTION */}
                        {(reviewBenefitType === 'Pack' || reviewBenefitType === 'Both') && (
                            <div className="p-8 bg-white rounded-[2rem] border border-emerald-100 space-y-6 animate-in zoom-in-95 shadow-inner">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Select Inventory Components</p>
                                <div className="flex flex-col gap-4">
                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selectedPacks.pregnancy ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200'}`}>
                                                {selectedPacks.pregnancy && <Check size={18} strokeWidth={4} />}
                                            </div>
                                            <span className="text-[11px] font-black uppercase text-slate-700 group-hover:text-emerald-600">Pregnancy Support Pack</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedPacks.pregnancy} 
                                            onChange={e => setSelectedPacks({...selectedPacks, pregnancy: e.target.checked})} 
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selectedPacks.stationery ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200'}`}>
                                                {selectedPacks.stationery && <Check size={18} strokeWidth={4} />}
                                            </div>
                                            <span className="text-[11px] font-black uppercase text-slate-700 group-hover:text-emerald-600">Stationery Distribution Pack</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedPacks.stationery} 
                                            onChange={e => setSelectedPacks({...selectedPacks, stationery: e.target.checked})} 
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selectedPacks.laptop ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200'}`}>
                                                {selectedPacks.laptop && <Check size={18} strokeWidth={4} />}
                                            </div>
                                            <span className="text-[11px] font-black uppercase text-slate-700 group-hover:text-emerald-600">Laptop Loan Facility</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedPacks.laptop} 
                                            onChange={e => setSelectedPacks({...selectedPacks, laptop: e.target.checked})} 
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* FINAL SUBMISSION BUTTON */}
                <div className="pt-8 relative z-10">
                    <button 
                        onClick={handleFinalReviewSubmit} 
                        disabled={!reviewStatus || (reviewStatus === 'Approved' && !reviewBenefitType) || (reviewStatus === 'Approved' && (reviewBenefitType === 'Pack' || reviewBenefitType === 'Both') && !selectedPacks.pregnancy && !selectedPacks.stationery && !selectedPacks.laptop)}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-4 border-b-8 border-black hover:border-emerald-700 disabled:opacity-50 disabled:bg-slate-300 disabled:border-slate-400"
                    >
                        <ShieldCheck size={22} /> Execute Final Review Decision
                    </button>
                </div>
             </div>
          </div>
        </Modal>
      )}

      {showSubmitConfirm && (
        <Modal isOpen={showSubmitConfirm} onClose={() => setShowSubmitConfirm(false)} title="FINAL VERIFICATION">
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="bg-slate-950 text-white p-10 rounded-[3rem] border-b-[12px] border-emerald-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.05] text-emerald-500 rotate-12"><CheckCircle2 size={180} /></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Validate Protocol Entry</p>
                        <h3 className="text-3xl font-black uppercase leading-tight mb-10 tracking-tighter">Ready for Dispatch?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-10">
                            <div><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Target Product</label><p className="text-sm font-black uppercase text-white tracking-widest">{formData.claimType}</p></div>
                            <div><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Customer Profile</label><p className="text-sm font-black uppercase text-white tracking-widest">{formData.customerName}</p></div>
                            <div><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Portfolio Ref</label><p className="text-sm font-black text-white font-mono tracking-tighter">{formData.loanNumber}</p></div>
                            <div><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Assigned Recipient</label><p className="text-sm font-black uppercase text-white tracking-widest">{formData.beneficiary}</p></div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-6">
                  <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-5 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-red-500 transition-colors">Abort Execution</button>
                  <button onClick={handleFinalSubmit} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-all border-b-8 border-emerald-600">Execute Secure Dispatch</button>
                </div>
            </div>
        </Modal>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-950/95 z-[100] flex flex-col items-center justify-center text-white backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative mb-10">
            <Zap className="w-20 h-20 text-emerald-500 animate-pulse" fill="currentColor" />
            <div className="absolute inset-0 w-20 h-20 bg-emerald-500 rounded-full blur-[40px] opacity-20 animate-pulse" />
          </div>
          <p className="text-3xl font-black uppercase tracking-[0.5em] text-center max-w-lg leading-relaxed">SECURE DISPATCH<br/><span className="text-emerald-500">IN PROGRESS</span></p>
          <div className="mt-12 w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-emerald-500 w-3/4 animate-[shimmer_2s_infinite_linear]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;