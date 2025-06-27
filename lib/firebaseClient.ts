import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

let app = null
let auth = null
let db = null
let storage = null
let isFirebaseConfigured = false

if (typeof window !== "undefined") {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  const allKeysExist = Object.values(firebaseConfig).every((v) => typeof v === "string" && v !== "")

  if (allKeysExist) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
      isFirebaseConfigured = true
    } catch (error) {
      console.error("Error inicializando Firebase:", error)
      auth = null
db = null
storage = null
isFirebaseConfigured = false

    }
  }
}

export { app, auth, db, storage, isFirebaseConfigured }
