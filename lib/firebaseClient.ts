"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase only on client side
let app: any = null
let auth: Auth | null = null
let db: Firestore | null = null
let isFirebaseConfigured = false

// Check if we're on the client side and Firebase is configured
if (typeof window !== "undefined") {
  try {
    // Validate configuration
    const requiredKeys = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const hasAllKeys = requiredKeys.every((key) => {
      const value = process.env[key]
      return value && value !== "undefined" && value.trim() !== ""
    })

    if (hasAllKeys) {
      // Initialize Firebase
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
      } else {
        app = getApps()[0]
      }

      // Initialize services
      auth = getAuth(app)
      db = getFirestore(app)
      isFirebaseConfigured = true

      console.log("✅ Firebase initialized successfully")
    } else {
      console.log("⚠️ Firebase configuration incomplete - running in demo mode")
    }
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error)
    // Reset everything to null on error
    app = null
    auth = null
    db = null
    isFirebaseConfigured = false
  }
}

// Export Firebase instances
export { auth, db, isFirebaseConfigured }
export default app
