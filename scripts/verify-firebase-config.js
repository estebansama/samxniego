// Firebase Configuration Verification Script
// Run with: node scripts/verify-firebase-config.js

const path = require("path")
const fs = require("fs")

console.log("🔍 Firebase Configuration Verification\n")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
const envExists = fs.existsSync(envPath)

console.log("📁 Environment File Check:")
console.log(`   .env.local exists: ${envExists ? "✅" : "❌"}`)

if (!envExists) {
  console.log("\n❌ .env.local file not found!")
  console.log("   Please create .env.local file in your project root.")
  console.log("   You can copy from .env.example: cp .env.example .env.local")
  process.exit(1)
}

// Load environment variables
require("dotenv").config({ path: envPath })

// Required Firebase environment variables
const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]

const optionalVars = [
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
]

const serverVars = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]

console.log("\n🔑 Required Client Variables:")
let allRequired = true
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  const exists = !!value
  const isPlaceholder = value && (value.includes("your_") || value.includes("demo-") || value.includes("placeholder"))

  if (!exists) {
    console.log(`   ${varName}: ❌ Missing`)
    allRequired = false
  } else if (isPlaceholder) {
    console.log(`   ${varName}: ⚠️  Placeholder value detected`)
    allRequired = false
  } else {
    console.log(`   ${varName}: ✅ Configured`)
  }
})

console.log("\n🔧 Optional Client Variables:")
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  const exists = !!value
  const isPlaceholder = value && (value.includes("your_") || value.includes("demo-"))

  if (!exists) {
    console.log(`   ${varName}: ⚪ Not set (will use default)`)
  } else if (isPlaceholder) {
    console.log(`   ${varName}: ⚠️  Placeholder value`)
  } else {
    console.log(`   ${varName}: ✅ Configured`)
  }
})

console.log("\n🔐 Server Variables (for Admin SDK):")
let serverConfigured = true
serverVars.forEach((varName) => {
  const value = process.env[varName]
  const exists = !!value
  const isPlaceholder = value && (value.includes("your_") || value.includes("demo-"))

  if (!exists) {
    console.log(`   ${varName}: ❌ Missing`)
    serverConfigured = false
  } else if (isPlaceholder) {
    console.log(`   ${varName}: ⚠️  Placeholder value`)
    serverConfigured = false
  } else {
    console.log(`   ${varName}: ✅ Configured`)
  }
})

// AI Configuration Check
console.log("\n🤖 AI Integration Variables:")
const aiVars = ["OPENAI_API_KEY", "API_KEY"]
let aiConfigured = false
aiVars.forEach((varName) => {
  const value = process.env[varName]
  const exists = !!value
  const isPlaceholder = value && (value.includes("your_") || value.includes("demo-"))

  if (!exists) {
    console.log(`   ${varName}: ⚪ Not set`)
  } else if (isPlaceholder) {
    console.log(`   ${varName}: ⚠️  Placeholder value`)
  } else {
    console.log(`   ${varName}: ✅ Configured`)
    aiConfigured = true
  }
})

// Summary
console.log("\n📊 Configuration Summary:")
console.log(`   Firebase Client: ${allRequired ? "✅ Ready" : "❌ Needs configuration"}`)
console.log(`   Firebase Server: ${serverConfigured ? "✅ Ready" : "❌ Needs configuration"}`)
console.log(`   AI Integration: ${aiConfigured ? "✅ Ready" : "⚪ Optional"}`)

if (allRequired) {
  console.log("\n🎉 Firebase client configuration looks good!")
  console.log("   You can now test authentication and database features.")
} else {
  console.log("\n⚠️  Firebase configuration incomplete.")
  console.log("   The app will run in demo mode until properly configured.")
}

if (!serverConfigured) {
  console.log("\n💡 To enable server-side features:")
  console.log("   1. Generate a service account key in Firebase Console")
  console.log("   2. Add the server configuration variables to .env.local")
}

console.log("\n🚀 Next Steps:")
console.log("   1. Run: npm run dev")
console.log("   2. Visit: http://localhost:3000/register")
console.log("   3. Try creating an account")
console.log("   4. Check browser console for Firebase messages")
