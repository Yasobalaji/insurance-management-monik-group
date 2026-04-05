
import { BaseClaimData, ClaimType, BeneficiaryType, CollectionMethod, User, RoleDefinition, Vehicle, VehicleType, StaffMember, StaffInsuranceRequest, StaffClaim, VehicleClaim, GeneralAssetClaim } from '../types';

export const DEFAULT_ROLES: RoleDefinition[] = [
    {
        id: 'role-admin',
        name: 'Administrator',
        description: 'Global system oversight and unrestricted administration.',
        isSystem: true,
        permissions: {
            customer: { 
              dashboard: true, newClaim: true, enquiry: true, checkClaims: true, completedClaims: true,
              paymentRequest: true, paymentUpdate: true, packTracking: true, packMaintain: true,
              newClaim_submit: true, checkClaims_review: true, packTracking_process: true, laptopLoan: true, laptopLoan_updateLedger: true,
              auditSummary: true, auditReview: true, auditReport: true, reports: true,
              dateSelection: true, statusUpdate: true
            },
            staff: { overview: true, registration: true, requests: true, claims: true, documents: true, reports: true },
            asset: { registry: true, newClaim: true, auditTrail: true, management: true },
            administration: true
        }
    },
    {
        id: 'role-staff',
        name: 'Branch Login',
        description: 'Operational access restricted to specific branch nodes.',
        isSystem: true,
        permissions: {
            customer: { 
              dashboard: true, newClaim: true, enquiry: true, checkClaims: true, completedClaims: false,
              paymentRequest: false, paymentUpdate: false, packTracking: true, packMaintain: false,
              newClaim_submit: true, checkClaims_review: false, packTracking_process: false, laptopLoan: true, laptopLoan_updateLedger: false,
              auditSummary: false, auditReview: false, auditReport: false, reports: false,
              dateSelection: false, statusUpdate: false
            },
            staff: { overview: true, registration: true, requests: true, claims: false, documents: false, reports: false },
            asset: { registry: true, newClaim: true, auditTrail: false, management: false },
            administration: false
        }
    }
];

export const MOCK_USERS: User[] = [
    {
        id: 'user-super',
        name: 'Super User',
        username: 'superuser',
        email: 'superuser@internal.com',
        epf: 'MGMT-001',
        mobile: '0777123456',
        company: 'CMBSL',
        role: 'role-admin',
        isGlobal: true,
        interfaceAccess: DEFAULT_ROLES[0].permissions,
        status: 'Active'
    },
    {
        id: 'user-admin',
        name: 'System Admin',
        username: 'admin',
        email: 'admin@internal.com',
        epf: 'MGMT-002',
        mobile: '0777000111',
        company: 'CMBSL',
        role: 'role-admin',
        isGlobal: true,
        interfaceAccess: DEFAULT_ROLES[0].permissions,
        status: 'Active'
    }
];

const companies = ["CMC", "MONIK", "CMBSL"];
const branches = ["KULIYAPITIYA", "KANDY", "MATHUGAMA", "MORATUWA", "PANADURA", "MATARA", "EMBILIPITIYA", "KOTTAWA", "POTTOVIL", "VALACHCHENAI", "VAVUNIYA"];
const depts = ["Human Resources", "Finance", "IT", "Operations", "Sales", "Legal"];
const firstNames = ["Amara", "Kamal", "Nimali", "Sunil", "Dinesh", "Chathura", "Ishara", "Priyantha", "Ruwan", "Saman", "Anura", "Bandara", "Chandana", "Dilshan", "Eran", "Fathima", "Gihan", "Harsha", "Indika", "Janaka"];
const lastNames = ["Siriwardena", "Perera", "Silva", "Jayasuriya", "Gunawardena", "Kumara", "Madushanka", "De Silva", "Wijewardena", "Kumari", "Ratnayake", "Fernando", "Gamage", "Hewage", "Liyanage", "Rodrigo", "Senanayake", "Tennakoon", "Vithanage", "Wickramasinghe"];

const generateFreshClaims = (): BaseClaimData[] => {
    const claims: BaseClaimData[] = [];
    const statuses: Array<BaseClaimData['status']> = ['Requested', 'Pending', 'Approved', 'Cash Requested', 'Completed', 'Rejected'];
    const claimTypes = ['DEATH', 'HOSPITAL', 'EDUCATION', 'MARRIAGE', 'PREGNANCY'];

    companies.forEach(company => {
        for (let i = 1; i <= 30; i++) {
            const branch = branches[i % branches.length];
            const status = statuses[i % statuses.length];
            const claimType = claimTypes[i % claimTypes.length];
            const customerName = `${firstNames[i % firstNames.length]} ${lastNames[(i + 5) % lastNames.length]}`;
            const timestamp = Date.now() - (i * 86400000);
            
            claims.push({
                id: `CLM-${company}-${2025}-${5000 + i}`,
                customerInsuranceId: `${company}/${branch.slice(0, 3)}/${(100 + i).toString().padStart(4, '0')}`,
                timestamp, status, company, branch,
                loanNumber: `LN-${company}-${1000 + i}`,
                customerName,
                idNumber: `19${70 + (i % 20)}5544${i.toString().padStart(2, '0')}V`,
                loanAmount: (50000 + (i * 2500)).toLocaleString() + ".00",
                collectionMethod: i % 2 === 0 ? CollectionMethod.MONTHLY : CollectionMethod.WEEKLY,
                totalPaid: (10000 + (i * 500)).toLocaleString() + ".00",
                arrears: i % 7 === 0 ? "2,500.00" : "0.00",
                claimType,
                beneficiary: claimType === 'EDUCATION' ? BeneficiaryType.CHILDREN : BeneficiaryType.CUSTOMER,
                approvedCashAmount: ['Approved', 'Cash Requested', 'Completed'].includes(status) ? (12500 + (i * 100)).toLocaleString() + ".00" : undefined,
                paymentDate: status === 'Completed' ? new Date(timestamp + 259200000).toISOString().split('T')[0] : undefined
            });
        }
    });
    return claims.sort((a, b) => b.timestamp - a.timestamp);
};

const generateMockVehicles = (): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const makes = ["Toyota", "Mitsubishi", "Isuzu", "Honda", "Nissan", "Bajaj"];
  const modelsMap: Record<string, string[]> = {
    "Toyota": ["Hilux", "Prius", "Corolla", "Land Cruiser", "Axio"],
    "Mitsubishi": ["Lancer", "Montero", "Canter", "L200"],
    "Isuzu": ["Elf", "D-Max", "Forward"],
    "Honda": ["Civic", "Grace", "Vezel", "Fit"],
    "Nissan": ["X-Trail", "Sunny", "Caravan", "Leaf"],
    "Bajaj": ["Pulsar 150", "Discover 125", "RE Three Wheeler"]
  };
  
  for (let i = 1; i <= 50; i++) {
    const make = makes[i % makes.length];
    const model = modelsMap[make][i % modelsMap[make].length];
    const company = companies[i % companies.length];
    const branch = branches[i % branches.length];
    const regNo = `WP ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(66 + (i % 26))}-${(1000 + i)}`;
    const expiryIns = new Date();
    expiryIns.setDate(expiryIns.getDate() + (Math.random() * 60 - 15));

    vehicles.push({
      id: regNo, regNo, make, model, type: (i % 10 === 0 ? "Truck" : i % 5 === 0 ? "Bike" : i % 3 === 0 ? "Van" : "Car"),
      yearOfManufacture: (2010 + (i % 14)).toString(),
      purchaseDate: `20${15 + (i % 8)}-05-12`,
      chassisNumber: `CHS-${Math.random().toString(36).substring(7).toUpperCase()}`,
      engineNumber: `ENG-${Math.random().toString(36).substring(7).toUpperCase()}`,
      registeredCompany: company, fuelType: i % 3 === 0 ? "Diesel" : "Petrol", currentMileage: 25000 + (i * 1250),
      insurance: { companyName: i % 2 === 0 ? "SLIC" : "Allianz", policyNumber: `POL-${10000 + i}`, type: 'Comprehensive', coverageAmount: 1500000 + (i * 100000), startDate: '2024-01-01', expiryDate: expiryIns.toISOString().split('T')[0], premiumAmount: 45000 + (i * 500), contactPerson: "Agent " + i, contactNumber: "0711223344" },
      revenueLicence: { licenceNumber: `REV-${50000 + i}`, issueDate: '2024-01-15', expiryDate: expiryIns.toISOString().split('T')[0], feeAmount: 3500 + (i * 100), issuingAuthority: "DMT - " + branch },
      allocatedPerson: { name: firstNames[i % firstNames.length] + " " + lastNames[i % lastNames.length], employeeId: `EMP-${500 + i}`, department: depts[i % depts.length], designation: "Officer", contact: "0771234567", nic: `85001122${i}V`, drivingLicenceNo: `DL-${90000 + i}`, drivingLicenceExpiry: expiryIns.toISOString().split('T')[0], allocationStart: '2023-01-10', status: 'Active', company, dlNo: `DL-${90000 + i}` },
      photos: {}, renewalHistory: []
    });
  }
  return vehicles;
};

const generateMockStaff = (): StaffMember[] => {
    const list: StaffMember[] = [];
    for (let i = 1; i <= 40; i++) {
        const id = `EPF-${1000 + i}`;
        const company = companies[i % companies.length];
        list.push({
            id, fullName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
            dob: `19${80 + (i % 15)}-04-12`, gender: i % 2 === 0 ? 'Male' : 'Female',
            contact: { phone: '0711223344', email: `staff${i}@${company.toLowerCase()}.lk`, address: 'No 12, Main St, Colombo' },
            department: depts[i % depts.length], designation: i % 5 === 0 ? 'Manager' : 'Executive',
            joinDate: `201${5 + (i % 8)}-02-10`, employmentType: i % 4 === 0 ? 'Contract' : 'Permanent',
            status: 'Active', dependents: [{ id: '1', name: 'Spouse Name', relationship: 'Spouse', dob: '1985-10-10', contact: '0710001112' }],
            emergencyContact: { name: 'Emergency Name', relationship: 'Sibling', phone: '0778889990' }
        });
    }
    return list;
};

const generateMockStaffClaims = (staff: StaffMember[]): StaffClaim[] => {
    return staff.slice(0, 15).map((s, i) => ({
        id: `S-CLM-${100 + i}`, employeeId: s.id, claimType: i % 3 === 0 ? 'Medical' : (i % 3 === 1 ? 'Accident' : 'Life Event'),
        policyNumber: `POL-ST-${500 + i}`, requestedAmount: 5000 + (i * 1500), approvedAmount: i % 4 !== 0 ? 5000 + (i * 1200) : undefined,
        incidentDate: `2024-12-${10 + i}`, hospitalName: 'General Hospital', treatmentDetails: 'Standard treatment protocol applied.',
        status: i % 4 === 0 ? 'Submitted' : (i % 5 === 0 ? 'Rejected' : 'Payment Processed'),
        documents: []
    }));
};

const generateMockVehicleClaims = (vehicles: Vehicle[]): VehicleClaim[] => {
    return vehicles.slice(0, 20).map((v, i) => ({
        id: `V-CLM-${100 + i}`, vehicleNumber: v.id, type: i % 3 === 0 ? 'Accident' : 'Damage',
        dateOfIncident: `2024-11-${10 + i}`, location: 'Colombo 03', description: 'Minor bumper damage recorded during transit.',
        estimatedCost: 25000 + (i * 5000), claimAmount: 20000 + (i * 4500), status: i % 3 === 0 ? 'Paid' : 'Approved',
        documents: [], allocatedPersonAtTime: v.allocatedPerson.name
    }));
};

const generateMockAssetClaims = (): GeneralAssetClaim[] => {
    const list: GeneralAssetClaim[] = [];
    for (let i = 1; i <= 10; i++) {
        list.push({
            id: `A-CLM-${100 + i}`, assetId: `PROP-${50 + i}`, category: i % 2 === 0 ? 'property' : 'machinery',
            incidentType: i % 2 === 0 ? 'Fire' : 'Breakdown', company: companies[i % companies.length],
            branch: branches[i % branches.length], contactPerson: firstNames[i % firstNames.length],
            contactNumber: '0777123456', description: 'Partial damage to structure following external event.',
            dateOfIncident: `2024-10-${0 + i}`, locationAddress: 'Industrial Zone, Site B',
            ownershipType: 'Owned', status: i % 3 === 0 ? 'Settled' : 'In-Progress', claimAmount: 150000 + (i * 50000),
            items: [{ id: '1', name: 'Structure', claimValue: 150000 + (i * 50000) }], documents: []
        });
    }
    return list;
};

export const MOCK_CLAIMS: BaseClaimData[] = generateFreshClaims();
export const MOCK_VEHICLES: Vehicle[] = generateMockVehicles();
export const MOCK_STAFF: StaffMember[] = generateMockStaff();
export const MOCK_STAFF_CLAIMS: StaffClaim[] = generateMockStaffClaims(MOCK_STAFF);
export const MOCK_VEHICLE_CLAIMS: VehicleClaim[] = generateMockVehicleClaims(MOCK_VEHICLES);
export const MOCK_ASSET_CLAIMS: GeneralAssetClaim[] = generateMockAssetClaims();
