const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando configuración de Firebase...\n")

// Verificar archivo .env.local
const envPath = path.join(process.cwd(), ".env.local")
const envExists = fs.existsSync(envPath)

console.log(`📁 Archivo .env.local: ${envExists ? "✅ Encontrado" : "❌ No encontrado"}`)

if (envExists) {
  const envContent = fs.readFileSync(envPath, "utf8")

  // Variables requeridas para Firebase
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  console.log("\n🔧 Variables de Firebase:")

  const missingVars = []
  const demoVars = []

  requiredVars.forEach((varName) => {
    const regex = new RegExp(`^${varName}=(.+)$`, "m")
    const match = envContent.match(regex)

    if (match) {
      const value = match[1].trim()
      if (value.includes("demo") || value.includes("your_") || value === "") {
        demoVars.push(varName)
        console.log(`  ${varName}: ⚠️  Valor demo/placeholder`)
      } else {
        console.log(`  ${varName}: ✅ Configurado`)
      }
    } else {
      missingVars.push(varName)
      console.log(`  ${varName}: ❌ Faltante`)
    }
  })

  // Variables opcionales
  const optionalVars = [
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ]

  console.log("\n🔧 Variables opcionales:")

  optionalVars.forEach((varName) => {
    const regex = new RegExp(`^${varName}=(.+)$`, "m")
    const match = envContent.match(regex)

    if (match) {
      const value = match[1].trim()
      if (value.includes("demo") || value.includes("your_") || value === "") {
        console.log(`  ${varName}: ⚠️  Valor demo/placeholder`)
      } else {
        console.log(`  ${varName}: ✅ Configurado`)
      }
    } else {
      console.log(`  ${varName}: ⚪ No configurado`)
    }
  })

  // Resumen
  console.log("\n📊 Resumen:")

  if (missingVars.length === 0 && demoVars.length === 0) {
    console.log("✅ Firebase está completamente configurado")
    console.log("🚀 La aplicación funcionará con Firebase real")
  } else if (missingVars.length > 0) {
    console.log("❌ Faltan variables requeridas de Firebase")
    console.log("🔧 La aplicación funcionará en modo demo")
    console.log("\nVariables faltantes:")
    missingVars.forEach((varName) => console.log(`  - ${varName}`))
  } else if (demoVars.length > 0) {
    console.log("⚠️  Se encontraron valores demo/placeholder")
    console.log("🔧 La aplicación funcionará en modo demo")
    console.log("\nVariables con valores demo:")
    demoVars.forEach((varName) => console.log(`  - ${varName}`))
  }

  console.log("\n📖 Para configurar Firebase real:")
  console.log("1. Ve a https://console.firebase.google.com/")
  console.log("2. Crea un nuevo proyecto o selecciona uno existente")
  console.log("3. Ve a Configuración del proyecto > General")
  console.log('4. En "Tus aplicaciones", agrega una aplicación web')
  console.log("5. Copia la configuración y reemplaza los valores en .env.local")
  console.log("6. Consulta FIREBASE_SETUP.md para instrucciones detalladas")
} else {
  console.log("\n❌ No se encontró el archivo .env.local")
  console.log("🔧 La aplicación funcionará en modo demo")
  console.log("\n📝 Para crear el archivo .env.local:")
  console.log("1. Copia .env.example a .env.local")
  console.log("2. Configura las variables de Firebase")
  console.log("3. Consulta FIREBASE_SETUP.md para instrucciones detalladas")
}

console.log("\n" + "=".repeat(50))
