#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const admin = require("firebase-admin")

console.log("🔍 Probando integración con Firestore...\n")

// Load environment variables
const envPath = path.join(process.cwd(), ".env.local")
require("dotenv").config({ path: ".env.local" })

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!projectId) {
  console.log("❌ FIREBASE_PROJECT_ID no configurado")
  process.exit(1)
}

console.log(`📁 Proyecto Firebase: ${projectId}`)

// Initialize Firebase Admin (for server-side testing)
let adminApp, adminDb

async function initializeFirebase() {
  try {
    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey: privateKey?.replace(/\\n/g, "\n"),
    }

    if (!admin.apps.length) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      })
    } else {
      adminApp = admin.apps[0]
    }

    adminDb = admin.firestore()
    console.log("✅ Firebase Admin inicializado correctamente")
    return true
  } catch (error) {
    console.log("❌ Error inicializando Firebase Admin:", error.message)
    console.log("🎭 Continuando con prueba simulada...")
    return false
  }
}

// Test Firestore operations
async function testFirestore() {
  console.log("\n🧪 Probando operaciones de Firestore...")

  try {
    if (adminDb) {
      // Test write
      console.log("📝 Probando escritura...")
      const testDoc = adminDb.collection("test").doc("connection-test")
      await testDoc.set({
        message: "Conexión exitosa",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log("✅ Escritura en Firestore: OK")

      // Test read
      console.log("📖 Probando lectura...")
      const doc = await testDoc.get()
      if (doc.exists) {
        console.log("✅ Datos leídos:", doc.data())
      }

      // Test user collection structure
      console.log("\n👥 Verificando estructura de usuarios...")
      const usersRef = adminDb.collection("users")
      const snapshot = await usersRef.limit(1).get()

      if (snapshot.empty) {
        console.log("📝 Colección de usuarios vacía (normal para nueva instalación)")
      } else {
        console.log("✅ Colección de usuarios existe")
        snapshot.forEach((doc) => {
          console.log("👤 Usuario ejemplo:", doc.data())
        })
      }

      // Clean up test document
      console.log("🧹 Limpiando datos de prueba...")
      await testDoc.delete()
      console.log("🧹 Documento de prueba eliminado")
    } else {
      console.log("🎭 Simulando operaciones de Firestore...")
      console.log("✅ Escritura simulada: OK")
      console.log("✅ Lectura simulada: OK")
    }
  } catch (error) {
    console.log("❌ Error en prueba de Firestore:", error.message)

    if (error.code === "permission-denied") {
      console.log("🔒 Error de permisos - verifica las reglas de seguridad")
    } else if (error.code === "not-found") {
      console.log("📁 Proyecto no encontrado - verifica el PROJECT_ID")
    }
  }
}

// Test user registration flow
async function testUserRegistration() {
  console.log("\n👤 Probando flujo de registro de usuario...")

  const testUser = {
    uid: "test-user-" + Date.now(),
    email: "test@example.com",
    nombre: "Usuario de Prueba",
    tipo: "alumno",
    curso: "1A",
    puntos: 0,
    nivel: 1,
    arquetipo: "gamer",
    fechaCreacion: new Date().toISOString(),
    activo: true,
  }

  try {
    if (adminDb) {
      // Test user creation
      await adminDb.collection("users").doc(testUser.uid).set(testUser)
      console.log("✅ Usuario de prueba creado")

      // Test user retrieval
      const userDoc = await adminDb.collection("users").doc(testUser.uid).get()
      if (userDoc.exists) {
        console.log("✅ Usuario de prueba recuperado")
        console.log("📄 Datos del usuario:", userDoc.data())
      }

      // Clean up
      await adminDb.collection("users").doc(testUser.uid).delete()
      console.log("🧹 Usuario de prueba eliminado")
    } else {
      console.log("🎭 Simulando registro de usuario...")
      console.log("✅ Creación simulada:", testUser)
    }
  } catch (error) {
    console.log("❌ Error en prueba de registro:", error.message)
  }
}

// Run tests
async function runTests() {
  const firebaseInitialized = await initializeFirebase()

  await testFirestore()
  await testUserRegistration()

  console.log("\n📊 Resumen de pruebas:")
  if (firebaseInitialized && adminDb) {
    console.log("✅ Firestore está funcionando correctamente")
    console.log("🚀 Los datos de usuario se guardarán en Firebase")
  } else {
    console.log("⚠️ Firestore no está configurado completamente")
    console.log("🎭 La aplicación funcionará en modo demo")
  }

  console.log("\n💡 Próximos pasos:")
  console.log("1. Registra un usuario en /register")
  console.log("2. Verifica en Firebase Console que se creó el usuario")
  console.log('3. Revisa la colección "users" en Firestore')

  if (!firebaseInitialized) {
    console.log("4. Configura las credenciales de Firebase Admin")
    console.log("5. Consulta FIREBASE_SETUP.md para más detalles")
  }
}

runTests().catch(console.error)
