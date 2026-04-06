
export interface SessionAction {
  timestamp: number;
  action: string;
  module: string;
}

export enum ClaimType {
  DEATH = 'DEATH',
  HOSPITAL = 'HOSPITAL',
  EDUCATION = 'EDUCATION',
  PREGNANCY = 'PREGNANCY',
  MARRIAGE = 'MARRIAGE'
}

export enum BeneficiaryType {
  CUSTOMER = 'Customer',
  SPOUSE = 'Spouse',
  CHILDREN = 'Children',
  FATHER = 'Father',
  MOTHER = 'Mother',
  FATHER_IN_LAW = 'Father-in-Law',
  MOTHER_IN_LAW = 'Mother-in-Law'
}

export enum CollectionMethod {
  MONTHLY = 'Monthly',
  WEEKLY = 'Weekly'
}

export type BenefitType = 'Cash' | 'Pack' | 'Both' | 'Other';
export type PackType = 'Stationery' | 'Pregnancy' | 'Laptop';

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  branchNameOrCode: string;
  accountNo: string;
  verifyAccountNo?: string;
}

export interface InterfaceAccess {
  customer: {
    dashboard: boolean;
    newClaim: boolean;
    newClaim_submit: boolean;
    checkClaims: boolean;
    checkClaims_review: boolean;
    completedClaims: boolean;
    paymentRequest: boolean;
    paymentUpdate: boolean;
    packTracking: boolean;
    packTracking_process: boolean;
    packMaintain: boolean;
    laptopLoan: boolean;
    laptopLoan_updateLedger: boolean;
    auditSummary: boolean;
    auditReview: boolean;
    auditReport: boolean;
    enquiry: boolean;
    reports: boolean;
    dateSelection: boolean;
    statusUpdate: boolean;
  };
  staff: {
    overview: boolean;
    registration: boolean;
    requests: boolean;
    claims: boolean;
    documents: boolean;
    reports: boolean;
  };
  asset: {
    registry: boolean;
    newClaim: boolean;
    auditTrail: boolean;
    management: boolean;
  };
  administration: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: InterfaceAccess;
  department?: string;
  status?: 'Active' | 'Inactive';
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  epf: string;
  mobile: string;
  company: string;
  department?: string;
  role: string;
  password?: string;
  branches?: string[];
  isGlobal?: boolean;
  interfaceAccess?: InterfaceAccess; 
  status?: 'Active' | 'Inactive';
}

export interface YearlyPackStatus {
  year: number;
  status: 'Pending' | 'Delivered' | 'Canceled';
  date?: string;
  loanNumber?: string;
  customerStatus?: 'Active' | 'Left';
  other?: string;
}

export interface LaptopData {
  loanNumber: string;
  period: string;
  installment: string;
  disbursementDate: string;
  totalPaid: string;
  status: 'Active' | 'Settled' | 'Arrears';
}

// Interface for individual document verification
export interface DocVerification {
  status: 'Verified' | 'Not Verified';
  reason?: string;
}

export interface BaseClaimData {
  id: string;
  customerInsuranceId: string;
  status: 'Requested' | 'Pending' | 'Approved' | 'Rejected' | 'Cash Requested' | 'Completed';
  timestamp: number;
  company: string;
  branch: string;
  loanNumber: string;
  customerName: string;
  idNumber: string;
  loanAmount: string;
  collectionMethod: CollectionMethod;
  totalPaid: string;
  arrears: string;
  claimType: string; 
  beneficiary: BeneficiaryType;
  bankDetails?: BankDetails;
  approvedCashAmount?: string;
  shortCode?: string;
  paymentDate?: string;
  paymentParty?: string;
  paymentStatus?: string;
  loanStatus?: string;
  arrearsReason?: string;
  centerName?: string;
  centerDate?: string;
  loanDisbursedDate?: string;
  loanMaturityDate?: string;
  
  deathData?: any;
  hospitalData?: any;
  educationData?: any;
  marriageData?: any;
  pregnancyData?: any;
  customProductData?: any;
  
  auditedDate?: string;
  auditStatus?: 'Issue' | 'Not Issue';
  auditIssue?: string;
  auditOfficer?: string;

  approvedBenefits?: {
    cash: boolean;
    laptopLoan: boolean;
    pack: {
      pregnancy: boolean;
      stationery: boolean;
    };
  };

  docChecks?: Record<string, DocVerification>;
  identityCheck?: DocVerification;
  financialCheck?: DocVerification;
  reviewReason?: string;

  approvedBenefitType?: BenefitType;
  approvedPackType?: string;
  packRequestDate?: string;
  packDeliveredDate?: string;
  yearlyPacks?: YearlyPackStatus[];
  laptopData?: LaptopData;

  driveFolderLink?: string;
  deliveryProofPhoto?: string;
  deliveredBy?: string;
  receivedBy?: string;
  deliveryRemarks?: string;
}

export interface AppNotification {
  id: string;
  timestamp: number;
  isRead: boolean;
  type: 'CLAIM_UPDATE' | 'ENQUIRY' | 'REPLY' | 'SYSTEM';
  title: string;
  message: string;
  claimId?: string;
  senderName: string;
  senderRole: string;
  recipientRole?: string;
}

export interface ProductLogic {
  id: string;
  criterion: string;
  operator: string;
  value: string;
  format: 'Text' | 'Number' | 'Date' | 'Time';
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  shortCode: string;
  claimType?: ClaimType;
  subType?: string;
  targetSilo: 'customer' | 'staff' | 'asset' | 'admin';
  beneficiaries: BeneficiaryType[];
  benefitType: BenefitType;
  paymentParty: string;
  requiredDocuments: {
    id: string;
    name: string;
    type: 'PDF' | 'IMAGE';
    beneficiary: BeneficiaryType | 'All';
  }[];
  logicCriteria: ProductLogic[];
  customFields: any[];
  isSystem?: boolean;
  allocatedCompanies?: string[];
  logicDescription: string;
}

export type VehicleType = 'Car' | 'Van' | 'Truck' | 'Bike' | 'Other';

export interface AllocatedPerson {
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  contact: string;
  nic: string;
  drivingLicenceNo: string;
  drivingLicenceExpiry: string;
  allocationStart: string;
  status: 'Active' | 'Inactive';
  company: string;
  dlNo: string;
}

export interface VehicleRenewalRecord {
  id: string;
  date: string;
  type: 'Insurance' | 'RevenueLicence' | 'DL';
  amount: number;
  officer: string;
}

export interface Vehicle {
  id: string;
  regNo: string;
  model: string;
  make: string;
  yearOfManufacture: string;
  purchaseDate: string;
  chassisNumber: string;
  engineNumber: string;
  type: VehicleType;
  registeredCompany: string;
  fuelType: string;
  currentMileage: number;
  insurance: {
    companyName: string;
    policyNumber: string;
    type: 'Comprehensive' | 'Third-Party';
    coverageAmount: number;
    startDate: string;
    expiryDate: string;
    premiumAmount: number;
    contactPerson: string;
    contactNumber: string;
  };
  revenueLicence: {
    licenceNumber: string;
    issueDate: string;
    expiryDate: string;
    feeAmount: number;
    issuingAuthority: string;
  };
  allocatedPerson: AllocatedPerson;
  photos: Record<string, string>;
  renewalHistory: VehicleRenewalRecord[];
  purpose?: string;
  currentInsuranceCompany?: string;
  renewalDate?: string;
}

export interface StaffDependent {
  id: string;
  name: string;
  relationship: string;
  dob: string;
  contact: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  department: string;
  designation: string;
  joinDate: string;
  employmentType: 'Permanent' | 'Contract';
  dependents: StaffDependent[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: 'Active' | 'Inactive';
}

export interface StaffInsuranceRequest {
  id: string;
  employeeId: string;
  requestType: 'New Enrollment' | 'Modification' | 'Cancellation';
  policyType: string;
  coverageLevel: 'Individual' | 'Family';
  sumInsured: number;
  requestDate: string;
  status: 'Submitted' | 'Processed' | 'Rejected';
}

export interface StaffClaimHistory {
  status: string;
  updatedBy: string;
  timestamp: string;
  remarks?: string;
}

export interface StaffClaim {
  id: string;
  employeeId: string;
  claimType: 'Medical' | 'Accident' | 'Life Event';
  policyNumber: string;
  requestedAmount: number;
  approvedAmount?: number;
  incidentDate: string;
  hospitalName: string;
  treatmentDetails: string;
  status: 'Submitted' | 'Processed' | 'Approved' | 'Rejected' | 'Payment Processed';
  documents: string[];
  processedDate?: string;
  processedBy?: string;
  history?: StaffClaimHistory[];
}

export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor';

export interface GeneralAsset {
  id: string;
  name: string;
  category: 'Furniture' | 'IT Equipment' | 'Machinery' | 'Other';
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  supplier: string;
  warrantyExpiry: string;
  location: string;
  condition: AssetCondition;
  documents: string[];
}

export interface VehicleClaim {
  id: string;
  vehicleNumber: string;
  type: 'Accident' | 'Theft' | 'Damage' | 'Third-Party';
  dateOfIncident: string;
  location: string;
  description: string;
  estimatedCost: number;
  claimAmount: number;
  policeReportNumber?: string;
  status: 'Reported' | 'Assessed' | 'Approved' | 'Rejected' | 'Paid';
  documents: string[];
  allocatedPersonAtTime?: string;
}

export interface GeneralAssetClaim {
  id: string;
  assetId: string;
  category: string;
  incidentType: string;
  company: string;
  branch: string;
  contactPerson: string;
  contactNumber: string;
  description: string;
  dateOfIncident: string;
  locationAddress: string;
  ownershipType: 'Owned' | 'Leased' | 'Rented';
  status: 'Reported' | 'In-Progress' | 'Settled' | 'Rejected';
  claimAmount: number;
  items: any[];
  documents: string[];
}

export interface CustomerLoan {
  loanNumber: string;
  productCode?: string;
  productDescription?: string;
  branch: string;
  centerName?: string;
  customerName: string;
  address?: string;
  idNumber: string;
  dateOfBirth?: string;
  bspCode?: string;
  mobile?: string;
  business?: string;
  collectionMethod: string;
  route?: string;
  loanType?: string;
  loanDisbursedDate?: string;
  loanMaturityDate?: string;
  loanAmount: string;
  loanAmountDisbursed?: string;
  regionalAmount?: string;
  interestRate?: string;
  period?: string;
  interestPerPeriod?: string;
  capitalPortion?: string;
  portfolioValue?: string;
  capitalPaid?: string;
  interestPaid?: string;
  futureCapital?: string;
  futureInterest?: string;
  capitalArrears?: string;
  interestArrears?: string;
  arrears: string;
  capitalBalance?: string;
  ndia?: string;
  odArrears?: string;
  odPaid?: string;
  odBalance?: string;
  totalPaid: string;
  lastTransactionDate?: string;
  advanced?: string;
  outstanding?: string;
  lastPaidDate?: string;
  ageInRecovery?: string;
  loanStatus?: string;
  legalStatus?: string;
  memberNumber?: string;
  company: string;
}
