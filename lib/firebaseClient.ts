"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

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
    console.warn("❌ Missing Firebase environment variables:", missing)
    return false
  }

  const placeholders = ["demo", "your-", "placeholder", "example"]
  const hasPlaceholder = requiredVars.some((varName) => {
    const value = process.env[varName]?.toLowerCase() || ""
    return placeholders.some((p) => value.includes(p))
  })

  if (hasPlaceholder) {
    console.warn("❌ Firebase environment variables contain placeholders")
    return false
  }

  return true
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let isFirebaseConfigured = false

try {
  isFirebaseConfigured = validateFirebaseConfig()

  if (!isFirebaseConfigured) {
    throw new Error("Firebase environment variables are invalid or missing.")
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)

  console.log("✅ Firebase initialized successfully")
} catch (error) {
  console.error("❌ Firebase initialization failed:", error)
  throw error
}

export { app, auth, db, isFirebaseConfigured }
