import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { FieldReport, RiskAlert, HistoricalRisk, UserProfile } from "../types";

// --- FIRESTORE DIAGNOSTIC CORES (SKILL REQUIREMENT) ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Global reference variables
let finalDb: any = null;
let finalAuth: any = null;
let isRealFirebase = false;

// Check if Config is real or placeholder
const isPlaceholder = 
  !firebaseConfig || 
  firebaseConfig.apiKey === "PLACEHOLDER_API_KEY" || 
  firebaseConfig.projectId === "PLACEHOLDER_PROJECT_ID";

if (!isPlaceholder) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    finalDb = getFirestore(app);
    finalAuth = getAuth(app);
    isRealFirebase = true;
    console.log("[VitaData] Native Firebase Connection Active");

    // Connection Check as per firebase-integration instructions
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(finalDb, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

  } catch (error) {
    console.warn("[VitaData] Failed to initialize real Firebase client SDK:", error);
    isRealFirebase = false;
  }
} else {
  console.log("[VitaData] Running in Sandboxed Local State (Using LocalStorage Sync)");
}

export { isRealFirebase };
export const db = finalDb;
export const auth = finalAuth;

// Reusable standard Firestore permission error logger
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentFirebaseUser = finalAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentFirebaseUser?.uid || null,
      email: currentFirebaseUser?.email || null,
      emailVerified: currentFirebaseUser?.emailVerified || null,
      isAnonymous: currentFirebaseUser?.isAnonymous || null,
      tenantId: currentFirebaseUser?.tenantId || null,
      providerInfo: currentFirebaseUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[Firestore Security Rule Breach]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- LOCALSTORAGE HIGH-FIDELITY FALLBACK DATABASE (VIRTUAL DB ENGINE) ---
const LOCAL_STORAGE_PREFIX = "vitadata_local_db_";

function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading local storage for ${key}`, err);
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing local storage for ${key}`, err);
  }
}

// Initial mock data sets
const initialReports: FieldReport[] = [
  {
    reportId: "rep-1",
    location: "Kano North, Ungogo axis",
    latitude: 12.0624,
    longitude: 8.5255,
    incidentType: "Water Access Failure",
    severity: "High",
    description: "Deep community well bore pump broke down completely. Hundreds of low-income households are walking miles to muddy streams, compounding sanitation risks.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hrs ago
    submittedBy: "user-1",
    verifiedByAI: true,
    aiAnalysis: "Pump mechanical breakdown detected. Immediate dispatch of mobile water tankers recommended while engineering team replaces the drive shaft.",
    isDeleted: false
  },
  {
    reportId: "rep-2",
    location: "Kano Municipal, Central Market",
    latitude: 12.0022,
    longitude: 8.5920,
    incidentType: "Food Crisis Surge",
    severity: "Critical",
    description: "Acute infant malnutrition cases spike at the community health outpost. Emergency therapeutic food formulas (RUTF) are entirely out of stock.",
    createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(), // 1.2 hrs ago
    submittedBy: "user-2",
    verifiedByAI: true,
    aiAnalysis: "Identified high-density clinic stock depletion. Recommend urgent distribution of emergency nutrition rations and restocking vital medical outposts.",
    isDeleted: false
  }
];

const initialAlerts: RiskAlert[] = [
  {
    alertId: "alt-1",
    areaName: "Kano Municipal",
    incidentType: "Acute Food Shortage",
    severity: "Critical",
    description: "Severe inflation spikes on basic grains. Families report relying on survival foraging strategies in outer wards.",
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
    score: 92,
    status: "active"
  },
  {
    alertId: "alt-2",
    areaName: "Kano North",
    incidentType: "Water Source Failure",
    severity: "Critical",
    description: "Clean bore water supply lines offline in surrounding neighborhoods. High sanitation risk indicators.",
    createdAt: new Date(Date.now() - 900000).toISOString(), // 15 mins ago
    score: 88,
    status: "active"
  },
  {
    alertId: "alt-3",
    areaName: "Kumbotso",
    incidentType: "Cholera Outbreak Risk",
    severity: "High",
    description: "Open sewage channels and flooding near temporary settlements. Immediate hygienic buffer kits needed.",
    createdAt: new Date(Date.now() - 1500000).toISOString(), // 25 mins ago
    score: 75,
    status: "active"
  },
  {
    alertId: "alt-4",
    areaName: "Dala",
    incidentType: "Clinic Inventory Depleted",
    severity: "High",
    description: "Primary aid post reports near-zero stocks of generic antibiotics and basic antimalarial therapeutics.",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    score: 68,
    status: "acknowledged"
  }
];

// Virtual db state cache
let localReports: FieldReport[] = getLocalStorageItem("reports", initialReports);
let localAlerts: RiskAlert[] = getLocalStorageItem("alerts", initialAlerts);

let currentUserMock: UserProfile | null = getLocalStorageItem<UserProfile | null>("current_user", null);
let authCallbacks: ((user: UserProfile | null) => void)[] = [];

// --- EXPOSED DATABASE INTERFACE (DYNAMIC SWITCH BETWEEN REAL FIREBASE / LOCAL STORAGE) ---

// Realtime User profile trigger
export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  if (isRealFirebase && finalAuth) {
    return onAuthStateChanged(finalAuth, async (fbUser) => {
      if (fbUser) {
        // Fetch role from Firestore
        let role: UserProfile['role'] = 'contributor';
        try {
          const userDoc = await getDoc(doc(finalDb, "users", fbUser.uid));
          if (userDoc.exists()) {
            role = userDoc.data().role || 'contributor';
          } else {
            // Self Register default contributor on Firestore
            const newProfileDate = new Date().toISOString();
            const userProfile: UserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Contributor",
              email: fbUser.email || "",
              role: fbUser.email === "shalasare43@gmail.com" ? "admin" : "contributor",
              createdAt: newProfileDate
            };
            await setDoc(doc(finalDb, "users", fbUser.uid), {
              ...userProfile,
              createdAt: new Date()
            });
            role = userProfile.role;
          }
        } catch (error) {
          console.error("Error securing Firestore user roles: ", error);
        }
        
        callback({
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || undefined,
          role,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString()
        });
      } else {
        callback(null);
      }
    });
  } else {
    // Local memory sync
    authCallbacks.push(callback);
    callback(currentUserMock);
    return () => {
      authCallbacks = authCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Custom trigger for popup authentications
export async function authenticateUser(roleSelection: UserProfile['role'] = 'admin') {
  if (isRealFirebase && finalAuth) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(finalAuth, provider);
    return result.user;
  } else {
    // Generate simulated user info based on selected developer roles
    const uid = "mock-" + Math.floor(Math.random() * 100000);
    const mockUser: UserProfile = {
      uid,
      name: `Simulated ${roleSelection.charAt(0).toUpperCase() + roleSelection.slice(1)}`,
      email: roleSelection === 'admin' ? "shalasare43@gmail.com" : `${roleSelection}@vitadata.org`,
      role: roleSelection,
      createdAt: new Date().toISOString()
    };
    currentUserMock = mockUser;
    setLocalStorageItem("current_user", mockUser);
    authCallbacks.forEach(cb => cb(mockUser));
    return mockUser;
  }
}

// Register a custom user locally with validation and account checks
export async function registerCustomUser(name: string, email: string, phone: string, role: UserProfile['role']) {
  const users = getLocalStorageItem<any[]>("simulated_users", []);
  
  if (email) {
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("This email is already registered. Please login to access your account.");
    }
  }
  
  if (phone) {
    const exists = users.find(u => u.phone === phone);
    if (exists) {
      throw new Error("This phone number is already registered. Please login instead.");
    }
  }

  const uid = "usr-" + Date.now();
  const newUser: UserProfile = {
    uid,
    name,
    email,
    phone,
    role,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  setLocalStorageItem("simulated_users", users);

  currentUserMock = newUser;
  setLocalStorageItem("current_user", newUser);
  authCallbacks.forEach(cb => cb(newUser));
  return newUser;
}

// Login a registered custom user locally
export async function loginCustomUser(emailOrPhone: string) {
  const users = getLocalStorageItem<any[]>("simulated_users", []);
  
  const found = users.find(u => 
    (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) || 
    (u.phone && u.phone === emailOrPhone)
  );

  if (!found) {
    throw new Error("Invalid credentials or account does not exist. Please register first.");
  }

  currentUserMock = found;
  setLocalStorageItem("current_user", found);
  authCallbacks.forEach(cb => cb(found));
  return found;
}

export async function logoutUser() {
  if (isRealFirebase && finalAuth) {
    await signOut(finalAuth);
  } else {
    currentUserMock = null;
    setLocalStorageItem("current_user", null);
    authCallbacks.forEach(cb => cb(null));
  }
}

// Fetch Alerts
export function subscribeToAlerts(callback: (alerts: RiskAlert[]) => void) {
  if (isRealFirebase && finalDb) {
    return onSnapshot(collection(finalDb, "alerts"), (snap) => {
      const items: RiskAlert[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          alertId: docSnap.id,
          areaName: d.areaName,
          incidentType: d.incidentType,
          severity: d.severity,
          description: d.description,
          createdAt: d.createdAt?.toDate?.() ? d.createdAt.toDate().toISOString() : d.createdAt,
          score: d.score,
          status: d.status
        });
      });
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "alerts");
    });
  } else {
    callback([...localAlerts]);
    // Listeners mock polling
    const interval = setInterval(() => {
      callback([...localAlerts]);
    }, 4000);
    return () => clearInterval(interval);
  }
}

// Submit a Report
export async function addFieldReport(report: Omit<FieldReport, "reportId">): Promise<string> {
  const reportId = "rep-" + Date.now();
  const docData: FieldReport = {
    ...report,
    reportId
  };

  if (isRealFirebase && finalDb) {
    try {
      await setDoc(doc(finalDb, "reports", reportId), {
        ...docData,
        createdAt: new Date(docData.createdAt) // store as Native timestamp
      });
      return reportId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reports/${reportId}`);
    }
  } else {
    localReports = [docData, ...localReports];
    setLocalStorageItem("reports", localReports);
    return reportId;
  }
  return reportId;
}

// Fetch Reports
export function subscribeToReports(callback: (reports: FieldReport[]) => void) {
  if (isRealFirebase && finalDb) {
    return onSnapshot(collection(finalDb, "reports"), (snap) => {
      const items: FieldReport[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          reportId: docSnap.id,
          location: d.location,
          latitude: d.latitude,
          longitude: d.longitude,
          incidentType: d.incidentType,
          severity: d.severity,
          description: d.description,
          createdAt: d.createdAt?.toDate?.() ? d.createdAt.toDate().toISOString() : d.createdAt,
          submittedBy: d.submittedBy,
          verifiedByAI: d.verifiedByAI,
          aiAnalysis: d.aiAnalysis,
          isDeleted: d.isDeleted || false
        });
      });
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "reports");
    });
  } else {
    callback([...localReports]);
    const interval = setInterval(() => {
      callback([...localReports]);
    }, 4000);
    return () => clearInterval(interval);
  }
}

// Soft Deletes a Report
export async function deleteFieldReport(reportId: string) {
  if (isRealFirebase && finalDb) {
    try {
      await updateDoc(doc(finalDb, "reports", reportId), { isDeleted: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reports/${reportId}`);
    }
  } else {
    localReports = localReports.map(r => r.reportId === reportId ? { ...r, isDeleted: true } : r);
    setLocalStorageItem("reports", localReports);
  }
}

// Recovers a soft-deleted Report
export async function recoverFieldReport(reportId: string) {
  if (isRealFirebase && finalDb) {
    try {
      await updateDoc(doc(finalDb, "reports", reportId), { isDeleted: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reports/${reportId}`);
    }
  } else {
    localReports = localReports.map(r => r.reportId === reportId ? { ...r, isDeleted: false } : r);
    setLocalStorageItem("reports", localReports);
  }
}

// Update Alert statuses
export async function updateAlertStatus(alertId: string, status: 'active' | 'acknowledged' | 'resolved') {
  if (isRealFirebase && finalDb) {
    try {
      await updateDoc(doc(finalDb, "alerts", alertId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `alerts/${alertId}`);
    }
  } else {
    localAlerts = localAlerts.map(a => a.alertId === alertId ? { ...a, status } : a);
    setLocalStorageItem("alerts", localAlerts);
  }
}
