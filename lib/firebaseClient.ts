import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Validate Firebase configuration more thoroughly
const validateFirebaseConfig = () => {
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.warn("Missing Firebase environment variables:", missing)
    return false
  }

  // Check if values are not just empty strings or placeholder values
  const hasValidValues = requiredVars.every((varName) => {
    const value = process.env[varName]
    return value && value.trim() !== "" && !value.includes("your_") && !value.includes("demo-")
  })

  if (!hasValidValues) {
    console.warn("Firebase environment variables contain placeholder or empty values")
    return false
  }

  return true
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let isFirebaseConfigured = false

try {
  // Check if Firebase config is valid
  isFirebaseConfigured = validateFirebaseConfig()

  if (!isFirebaseConfigured) {
    console.warn("Firebase not properly configured. Running in demo mode.")
    console.info("To enable Firebase, please configure your environment variables.")
  } else {
    // Only initialize Firebase if configuration is valid
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

    // Initialize Firebase services only after successful app initialization
    auth = getAuth(app)
    db = getFirestore(app)

    console.log("Firebase initialized successfully")
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
  console.warn("Falling back to demo mode due to initialization error")

  // Reset everything to null on error
  app = null
  auth = null
  db = null
  isFirebaseConfigured = false
}

// Export the Firebase services and configuration status
export { auth, db, isFirebaseConfigured }
export default app
