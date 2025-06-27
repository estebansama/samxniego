#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando configuración de Firebase...")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.error("❌ Archivo .env.local no encontrado")
  console.log("💡 Copia .env.example a .env.local y completa las variables")
  process.exit(1)
}

// Read environment variables
require("dotenv").config({ path: envPath })

const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
]

let allConfigured = true

console.log("\n📋 Verificando variables de entorno:")

requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value && value !== "your_value_here") {
    console.log(`✅ ${varName}: Configurado`)
  } else {
    console.log(`❌ ${varName}: No configurado`)
    allConfigured = false
  }
})

if (allConfigured) {
  console.log("\n🎉 ¡Todas las variables de Firebase están configuradas!")
  console.log("🚀 Puedes ejecutar: npm run dev")
} else {
  console.log("\n⚠️  Algunas variables no están configuradas")
  console.log("📖 Ver FIREBASE_SETUP.md para instrucciones detalladas")
  process.exit(1)
}
