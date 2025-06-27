#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando configuración de Firebase...\n")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  console.log("📁 Archivo .env.local: ✅ Encontrado")
} else {
  console.log("📁 Archivo .env.local: ❌ No encontrado")
  console.log("💡 Crea un archivo .env.local basado en .env.example")
  process.exit(1)
}

// Load environment variables
require("dotenv").config({ path: ".env.local" })

// Required Firebase client variables
const requiredClientVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]

// Optional Firebase variables
const optionalVars = [
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
]

console.log("🔧 Variables de Firebase:")
let allConfigured = true

requiredClientVars.forEach((varName) => {
  const value = process.env[varName]
  if (value && value.trim() !== "" && !value.includes("your_") && !value.includes("demo-")) {
    console.log(`  ${varName}: ✅ Configurado`)
  } else {
    console.log(`  ${varName}: ❌ No configurado o valor placeholder`)
    allConfigured = false
  }
})

console.log("\n🔧 Variables opcionales:")
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (value && value.trim() !== "" && !value.includes("your_") && !value.includes("demo-")) {
    console.log(`  ${varName}: ✅ Configurado`)
  } else {
    console.log(`  ${varName}: ⚠️ No configurado`)
  }
})

// Check for common issues
console.log("\n🔍 Verificando problemas comunes:")

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
if (apiKey && apiKey.startsWith("AIza")) {
  console.log("  Formato de API Key: ✅ Válido")
} else {
  console.log("  Formato de API Key: ❌ Inválido (debe empezar con 'AIza')")
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
if (projectId && projectId.length > 0 && !projectId.includes(" ")) {
  console.log("  Formato de Project ID: ✅ Válido")
} else {
  console.log("  Formato de Project ID: ❌ Inválido (no debe contener espacios)")
}

// Summary
console.log("\n📊 Resumen:")
if (allConfigured) {
  console.log("✅ Firebase está completamente configurado")
  console.log("🚀 La aplicación funcionará con Firebase real")
} else {
  console.log("⚠️ Firebase no está completamente configurado")
  console.log("🎭 La aplicación funcionará en modo demo")
  console.log("📖 Consulta FIREBASE_SETUP.md para instrucciones completas")
}

console.log("\n💡 Próximos pasos:")
if (allConfigured) {
  console.log("1. Ejecuta 'npm run test-firestore' para probar la conexión")
  console.log("2. Inicia la aplicación con 'npm run dev'")
  console.log("3. Prueba el registro de usuarios en /register")
} else {
  console.log("1. Configura las variables faltantes en .env.local")
  console.log("2. Consulta FIREBASE_SETUP.md para obtener las credenciales")
  console.log("3. Ejecuta este script nuevamente para verificar")
}
