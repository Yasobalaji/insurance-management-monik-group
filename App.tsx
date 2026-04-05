
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
// Fix: Added import for ReportConsole component to resolve usage on line 378
import ReportConsole from './components/ReportConsole';
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
          pregnancy: reviewBenefitType === 'Pack' || reviewBenefitType === 'Both' ? selectedPacks.pregnancy : false,
          stationery: reviewBenefitType === 'Pack' || reviewBenefitType === 'Both' ? selectedPacks.stationery : false
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
    <div className="flex justify-between border-b border-slate-100 py-3.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{value || '-'}</span>
    </div>
  );

  const getSiloName = () => {
    switch(selectedCategory) {
      case 'customer': return 'Customer Insurance';
      case 'staff': return 'Employee Insurance';
      case 'asset': return 'Asset Insurance';
      case 'admin': return 'Administrator';
      default: return COMPANY_BRAND;
    }
  };

  const getSiloColor = () => {
    switch(selectedCategory) {
      case 'customer': return 'border-blue-600';
      case 'staff': return 'border-red-600';
      case 'asset': return 'border-emerald-600';
      case 'admin': return 'border-indigo-600';
      default: return 'border-slate-600';
    }
  };

  const getIconColor = () => {
    switch(selectedCategory) {
      case 'customer': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'staff': return 'bg-red-50 text-red-600 border-red-100';
      case 'asset': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'admin': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-x-hidden">
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
      
      <div className="flex-1 md:ml-72 p-10 pt-24 md:pt-10 flex flex-col max-w-[1600px] mx-auto w-full">
        {/* HEADER */}
        <div className="mb-10 animate-in slide-in-from-top-4 duration-700">
            <div className={`bg-white p-8 rounded-[2rem] border-l-[12px] ${getSiloColor()} shadow-sm flex items-center justify-between border border-slate-200`}>
                <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl border ${getIconColor()} shadow-sm`}>
                      {selectedCategory === 'asset' ? <ShieldCheck size={28} /> : selectedCategory === 'admin' ? <Settings size={28} /> : <Building2 size={28} />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{companyFullName}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2.5 ml-0.5">{getSiloName()} Silo</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100 shadow-inner">
                  <UserCircle className="text-slate-400" size={18} />
                  <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{currentUser.name} • {currentBranch}</p>
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
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
                                <h2 className="text-slate-900 font-black text-xl uppercase tracking-tighter">Product Engineering Selection</h2>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">Phase 02</span>
                            </div>
                            <div className="p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Target Product Portfolio</label><select className="block w-full rounded-xl border-slate-200 shadow-sm border p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 uppercase text-sm font-black" value={formData.claimType} onChange={(e) => setFormData(prev => ({ ...prev, claimType: e.target.value }))}>
                                        {products.filter(p=>p.targetSilo==='customer').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select></div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Beneficiary Alignment</label><select className="block w-full rounded-xl border-slate-200 shadow-sm border p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 uppercase text-sm font-black" value={formData.beneficiary} onChange={(e) => setFormData(prev => ({ ...prev, beneficiary: e.target.value as BeneficiaryType }))}>{products.find(p => p.id === formData.claimType)?.beneficiaries.map(b => (<option key={b} value={b}>{b}</option>))}</select></div>
                                </div>
                                <div className="mt-14 pt-14 border-t border-slate-100">
                                    {formData.claimType === 'DEATH' ? <DeathClaim beneficiary={formData.beneficiary as BeneficiaryType} updateData={setSubFormData} bankDetails={bankDetails} updateBankDetails={setBankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'HOSPITAL' ? <HospitalClaim beneficiary={formData.beneficiary as BeneficiaryType} updateData={setSubFormData} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'EDUCATION' ? <EducationClaim updateData={setSubFormData} bankDetails={bankDetails} updateBankDetails={setBankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'MARRIAGE' ? <MarriageClaim updateData={setSubFormData} bankDetails={bankDetails} updateBankDetails={setBankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : formData.claimType === 'PREGNANCY' ? <PregnancyClaim updateData={setSubFormData} currentUser={currentUser} isGlobal={isGlobalUser} /> : products.find(p => p.id === formData.claimType) ? <DynamicClaimForm product={products.find(p => p.id === formData.claimType)!} beneficiary={formData.beneficiary as BeneficiaryType} updateData={setSubFormData} updateBankDetails={setBankDetails} bankDetails={bankDetails} currentUser={currentUser} isGlobal={isGlobalUser} /> : null}
                                </div>
                                <div className="mt-12 border-t border-slate-100 pt-12 flex gap-6">
                                    <button onClick={() => setFormData({ claimType: 'DEATH', beneficiary: BeneficiaryType.CUSTOMER })} className="flex-1 bg-white text-slate-400 font-black uppercase py-5 rounded-xl text-xs border border-slate-200 flex items-center justify-center gap-3 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 tracking-widest"><RotateCcw size={16} /> Discard Protocol</button>
                                    <button onClick={() => setShowSubmitConfirm(true)} className="flex-[2] bg-slate-900 text-white font-black uppercase py-6 rounded-xl text-sm shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-blue-900 tracking-[0.2em]"><Zap size={20} fill="currentColor" /> Dispatch Secure Entry</button>
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
                  {/* Fix: ReportConsole component now imported and correctly used */}
                  {currentView === 'reports' && <ReportConsole claims={visibleClaims} currentUser={currentUser} isGlobal={isGlobalUser} />}
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
        <Modal isOpen={!!reviewingClaim} onClose={() => { setReviewingClaim(null); setReviewStatus(null); setReviewBenefitType(null); }} title="REGISTRY PROTOCOL REVIEW">
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
             
             {/* Part 01: Identity Matrix */}
             <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3.5">
                    <UserIcon size={18} className="text-slate-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Phase 01: Identification Matrix</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    {renderApprovalDetail("Dossier ID", reviewingClaim.customerInsuranceId)}
                    {renderApprovalDetail("Legal Name", reviewingClaim.customerName)}
                    {renderApprovalDetail("Credentials", reviewingClaim.idNumber)}
                    {renderApprovalDetail("Organization", reviewingClaim.company)}
                    {renderApprovalDetail("Service Node", reviewingClaim.branch)}
                </div>
             </section>

             {/* Part 02: Loan Details */}
             <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3.5">
                    <Landmark size={18} className="text-slate-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Phase 02: Portfolio Analysis</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    {renderApprovalDetail("Portfolio Ref", reviewingClaim.loanNumber)}
                    {renderApprovalDetail("Principal Val", reviewingClaim.loanAmount)}
                    {renderApprovalDetail("Amortization", reviewingClaim.totalPaid)}
                    {renderApprovalDetail("Outstanding", reviewingClaim.arrears)}
                    {renderApprovalDetail("Product Type", reviewingClaim.claimType)}
                    {renderApprovalDetail("Entry Date", new Date(reviewingClaim.timestamp).toLocaleDateString())}
                </div>
             </section>

             {/* Decision Control Terminal */}
             <div className="bg-slate-50 p-10 rounded-2xl space-y-8 border border-slate-200 relative overflow-hidden">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-200 pb-4 flex items-center gap-3 relative z-10">
                    <ShieldAlert size={16} className="text-slate-400" /> Processing Terminal
                </h4>
                
                {/* STATUS SELECTION */}
                <div className="grid grid-cols-3 gap-4 relative z-10">
                    <button 
                        onClick={() => setReviewStatus('Approved')} 
                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewStatus === 'Approved' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}
                    >
                        <Check size={16} strokeWidth={4} /> Authorize
                    </button>
                    <button 
                        onClick={() => { setReviewStatus('Rejected'); setReviewBenefitType(null); }} 
                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewStatus === 'Rejected' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-red-300 hover:text-red-700'}`}
                    >
                        <X size={16} strokeWidth={4} /> Decline
                    </button>
                    <button 
                        onClick={() => { setReviewStatus('Pending'); setReviewBenefitType(null); }} 
                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewStatus === 'Pending' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'}`}
                    >
                        <Clock size={16} strokeWidth={4} /> Defer
                    </button>
                </div>

                {/* BENEFIT SELECTION (IF APPROVED) */}
                {reviewStatus === 'Approved' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">Settlement Alignment</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['Cash', 'Pack', 'Both'] as BenefitType[]).map(type => (
                                    <button 
                                        key={type} 
                                        onClick={() => setReviewBenefitType(type)}
                                        className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${reviewBenefitType === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-400'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PACK COMPONENT SELECTION */}
                        {(reviewBenefitType === 'Pack' || reviewBenefitType === 'Both') && (
                            <div className="p-8 bg-white rounded-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2.5">Component Selection</p>
                                <div className="flex flex-col gap-4">
                                    {[
                                      { id: 'pregnancy', label: 'Pregnancy Pack' },
                                      { id: 'stationery', label: 'Stationery Distribution' },
                                      { id: 'laptop', label: 'Laptop Facility' }
                                    ].map(pack => (
                                      <label key={pack.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-blue-300 transition-all group">
                                          <div className="flex items-center gap-4">
                                              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${selectedPacks[pack.id as keyof typeof selectedPacks] ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'}`}>
                                                  {selectedPacks[pack.id as keyof typeof selectedPacks] && <Check size={18} strokeWidth={4} />}
                                              </div>
                                              <span className="text-[11px] font-black uppercase text-slate-700 group-hover:text-blue-900">{pack.label}</span>
                                          </div>
                                          <input 
                                              type="checkbox" 
                                              className="hidden" 
                                              checked={selectedPacks[pack.id as keyof typeof selectedPacks]} 
                                              onChange={e => setSelectedPacks({...selectedPacks, [pack.id]: e.target.checked})} 
                                          />
                                      </label>
                                    ))}
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
                        className="w-full bg-slate-900 text-white py-5 rounded-xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                        <ShieldCheck size={20} /> Commit Execution Decision
                    </button>
                </div>
             </div>
          </div>
        </Modal>
      )}

      {showSubmitConfirm && (
        <Modal isOpen={showSubmitConfirm} onClose={() => setShowSubmitConfirm(false)} title="ENTRY VERIFICATION">
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="bg-slate-50 p-10 rounded-2xl border border-slate-200 shadow-inner relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Validate Protocol Dispatch</p>
                        <h3 className="text-2xl font-black uppercase leading-tight mb-10 tracking-tighter text-slate-950">Verify Record Credentials?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-200 pt-10">
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target</label><p className="text-sm font-black uppercase text-slate-900 tracking-widest">{formData.claimType}</p></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Identity</label><p className="text-sm font-black uppercase text-slate-900 tracking-widest">{formData.customerName}</p></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Account</label><p className="text-sm font-black text-slate-900 font-mono">{formData.loanNumber}</p></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Silo</label><p className="text-sm font-black uppercase text-slate-900 tracking-widest">{formData.company}</p></div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">Discard</button>
                  <button onClick={handleFinalSubmit} className="flex-[2] bg-slate-950 hover:bg-blue-900 text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl active:scale-95 transition-all">Execute Secure Entry</button>
                </div>
            </div>
        </Modal>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-white/95 z-[100] flex flex-col items-center justify-center text-slate-950 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative mb-10">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" strokeWidth={1} />
          </div>
          <p className="text-2xl font-black uppercase tracking-[0.5em] text-center max-w-lg leading-relaxed">PROTOCOL SYNC<br/><span className="text-blue-600 opacity-60">ACTIVE</span></p>
          <div className="mt-12 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-3/4 animate-[shimmer_2s_infinite_linear]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
