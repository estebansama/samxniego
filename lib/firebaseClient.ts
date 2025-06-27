"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Firebase configuration validation
const validateFirebaseConfig = () => {
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.warn("Missing Firebase environment variables:", missing)
    return false
  }

  // Check for demo/placeholder values
  const demoValues = ["demo", "your-", "placeholder", "example"]
  const hasDemo = requiredVars.some((varName) => {
    const value = process.env[varName]?.toLowerCase() || ""
    return demoValues.some((demo) => value.includes(demo))
  })

  if (hasDemo) {
    console.warn("Firebase environment variables contain demo values")
    return false
  }

  return true
}

// Initialize Firebase only on client side
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let isFirebaseConfigured = false

if (typeof window !== "undefined") {
  try {
    isFirebaseConfigured = validateFirebaseConfig()

    if (isFirebaseConfigured) {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      }

      // Initialize Firebase
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

      if (app) {
        auth = getAuth(app)
        db = getFirestore(app)
        console.log("✅ Firebase initialized successfully")
      }
    } else {
      console.log("⚠️ Firebase not configured, using demo mode")
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
    // Reset everything to null on error
    app = null
    auth = null
    db = null
    isFirebaseConfigured = false
  }
}

export { app, auth, db, isFirebaseConfigured }
