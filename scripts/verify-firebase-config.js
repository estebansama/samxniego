#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando configuración de Firebase...\n")

// Check for .env.local file
const envPath = path.join(process.cwd(), ".env.local")
const envExists = fs.existsSync(envPath)

console.log(`📁 Archivo .env.local: ${envExists ? "✅ Encontrado" : "❌ No encontrado"}`)

if (!envExists) {
  console.log("\n❌ No se encontró el archivo .env.local")
  console.log("💡 Copia .env.example a .env.local y configura las variables")
  process.exit(1)
}

// Load environment variables
require("dotenv").config({ path: envPath })

// Required Firebase variables
const requiredVars = [
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

console.log("\n🔧 Variables de Firebase:")
let allConfigured = true

requiredVars.forEach((varName) => {
  const value = process.env[varName]
  const isConfigured = value && value.trim() !== "" && !value.includes("your-") && !value.includes("demo")
  console.log(`  ${varName}: ${isConfigured ? "✅ Configurado" : "❌ Faltante o demo"}`)
  if (!isConfigured) allConfigured = false
})

console.log("\n🔧 Variables opcionales:")
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  const isConfigured = value && value.trim() !== "" && !value.includes("your-") && !value.includes("demo")
  console.log(`  ${varName}: ${isConfigured ? "✅ Configurado" : "⚠️ No configurado"}`)
})

console.log("\n📊 Resumen:")
if (allConfigured) {
  console.log("✅ Firebase está completamente configurado")
  console.log("🚀 La aplicación funcionará con Firebase real")
} else {
  console.log("⚠️ Firebase no está completamente configurado")
  console.log("🔄 La aplicación funcionará en modo demo")
  console.log("\n💡 Para configurar Firebase:")
  console.log("1. Sigue las instrucciones en FIREBASE_SETUP.md")
  console.log("2. Actualiza las variables en .env.local")
  console.log("3. Ejecuta este script nuevamente")
}
