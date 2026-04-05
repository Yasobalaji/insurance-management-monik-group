
import { ClaimType, BeneficiaryType } from './types';

export const GOOGLE_CLIENT_ID = ""; 

export const SUBSIDIARIES = ["CMC", "MONIK", "CMBSL"];
export const COMPANIES = [...SUBSIDIARIES];

export const APP_NAME = "CUSTOMER INSURANCE MANAGEMENT - MONIK GROUP";
export const SYSTEM_VERSION = "Silo v5.0";
export const COMPANY_BRAND = "MANAGEMENT PORTAL";

export const DAILY_QUOTES = [
  {
    en: "Integrity is doing the right thing, even when no one is watching.",
    si: "අවංකකම යනු කිසිවෙකු නොබලන විට පවා නිවැරදි දේ කිරීමයි.",
    ta: "நேர்மை என்பது யாரும் பார்க்காத போதும் சரியானதைச் செய்வது."
  },
  {
    en: "Service to others is the rent you pay for your room here on earth.",
    si: "අන් අයට සේවය කිරීම යනු ඔබ මේ ලෝකයේ ජීවත්වීම වෙනුවෙන් ගෙවන කුලියයි.",
    ta: "பிறருக்குச் செய்யும் சேவையේ இந்த பூமியில் நீங்கள் තங்குவதற்கான වාඩகை."
  }
];

export const COMPANY_LOGOS: Record<string, string> = {
  "CMC": "https://i.ibb.co/vYm686Q/cmc-logo.png",
  "MONIK": "https://i.ibb.co/vXm38m9/monik-intl.png",
  "CMBSL": "https://i.ibb.co/XyS0p0z/cmbsl-logo.png",
  "GLOBAL": "https://i.ibb.co/XyS0p0z/cmbsl-logo.png"
};

export const DEPARTMENTS = [
  "Human Resources", "Finance", "Information Technology", "Operations", "Sales & Marketing", "Legal", "Administration", "Management"
];

export const SUBSIDIARY_BRANCH_MAPPING: Record<string, string[]> = {
  "CMC": [
    "AKKARAIPATTU", "ALUTHGAMA", "AMPARA", "AMPARA B", "BADULLA", "BADULLA B", 
    "BANDARAWELA", "BANDARAWELA B", "BATTICALOA", "BIBILA", "BIBILA B", "CHUNNAHAM", 
    "DEHIATTAKANDIYA", "DEHIATTAKANDIYA B", "GALLE", "HORANA", "KALUAWANCHIKUDY", 
    "MAHIYANGANAYA", "MAHIYANGANAYA B", "MANNAR", "MONARAGALA", "MONARAGALA B", 
    "PUTHUKKUDIYIRUPPU", "SERUNUWARA", "TRINCOMALEE", "VAVUNIYA", "WELIMADA", "WELIMADA B"
  ],
  "MONIK": [
    "WELIMADA", "NUWARAELIYA", "BALANGODA", "NAWALAPITIYA", "CHILAW", "BADULLA", 
    "WENNAPPUWA", "MAHIYANGANAYA", "PUTTALAM", "JAFFNA", "NELLIADY", "BATTICALOA", 
    "KALMUNAI", "TRINCOMALEE", "MUTUR", "DAMBULLA", "MATHALE", "KALUWANCHIKUDY", "AKKARAIPATTU"
  ],
  "CMBSL": [
    "KULIYAPITIYA", "KANDY", "MATHUGAMA", "MORATUWA", "PANADURA", "MATARA", 
    "EMBILIPITIYA", "KOTTAWA", "POTTOVIL", "VALACHCHENAI", "WATTALA", "AVISSAWELLA", 
    "KEGALLE", "MAHIYANGANAYA", "BATTICALOA"
  ]
};

export const COMPANY_BRANCH_MAPPING: Record<string, string[]> = {
    ...SUBSIDIARY_BRANCH_MAPPING
};

export const BRANCHES = Object.entries(COMPANY_BRANCH_MAPPING).flatMap(([comp, brs]) => brs.map(b => `${comp}:${b}`));

export const CLAIM_TYPES = [
  { value: ClaimType.DEATH, label: "Death Claim" },
  { value: ClaimType.HOSPITAL, label: "Hospital Claim" },
  { value: ClaimType.EDUCATION, label: "Education Support" },
  { value: ClaimType.MARRIAGE, label: "Marriage Support" },
  { value: ClaimType.PREGNANCY, label: "Pregnancy Support" },
];

export const BENEFICIARIES = [
  { value: BeneficiaryType.CUSTOMER, label: "Customer" },
  { value: BeneficiaryType.SPOUSE, label: "Spouse" },
  { value: BeneficiaryType.CHILDREN, label: "Children" },
  { value: BeneficiaryType.FATHER, label: "Father" },
  { value: BeneficiaryType.MOTHER, label: "Mother" },
  { value: BeneficiaryType.FATHER_IN_LAW, label: "Father-in-Law" },
  { value: BeneficiaryType.MOTHER_IN_LAW, label: "Mother-in-Law" },
];

export const ALL_REQUIRED_DOCUMENTS = [
  "Application", "Identification - Customer", "Identification - Spouse", "Identification - Children", 
  "Identification - Beneficiary", "Birth Certificate - Customer", "Birth Certificate - Spouse", 
  "Birth Certificate - Children", "Marriage Certificate", "Death Certificate - Customer", 
  "Death Certificate - Spouse", "Death Certificate - Children", "Death Certificate - Beneficiary", 
  "Bank Book Photo", "Result Sheet", "University Selected Doc", "Clinic Book", "Diagnosis Card", 
  "Manager Confirmation"
];

export const STAFF_POLICY_TYPES = [
  "01. Medical/Hospitalization", "02. Personal Accident", "03. Life Cover", "04. Critical Illness"
];

export const ASSET_INSURANCE_CATEGORIES = [
  { id: 'property', label: 'Property & Buildings', description: 'Office premises, warehouses, and structural assets.', types: ['Fire', 'Flood', 'Storm', 'Impact Damage', 'Burglary'] },
  { id: 'machinery', label: 'Machinery & Equipment', description: 'Plant, production units, and specialized machinery.', types: ['Breakdown', 'Physical Damage', 'Theft'] },
  { id: 'electronics', label: 'IT & Electronics', description: 'Servers, computers, and specialized electronic devices.', types: ['Electronic Breakdown', 'Theft', 'Power Surge'] },
  { id: 'furniture', label: 'Furniture & Fixtures', description: 'Office furniture, fittings, and interior assets.', types: ['Damage', 'Theft', 'Fire'] },
  { id: 'money', label: 'Money & Financial', description: 'Cash in transit, cash in safe, and financial fidelity.', types: ['Theft from Safe', 'Robbery in Transit', 'Fidelity Guarantee'] },
  { id: 'special', label: 'Special Risks', description: 'Niche enterprise risks and specific project insurance.', types: ['Business Interruption', 'Public Liability'] }
];

export const COMPANY_FULL_NAMES: Record<string, string> = {
  "CMC": "CHATHURIKA MICRO CREDIT",
  "MONIK": "MONIK INTERNATIONAL (PVT) LTD",
  "CMBSL": "CUSTOMER INSURANCE MANAGEMENT - MONIK GROUP"
};
