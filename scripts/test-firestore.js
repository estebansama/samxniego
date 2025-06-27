#!/usr/bin/env node

const { initializeApp, getApps, cert } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

// Load environment variables
require("dotenv").config({ path: ".env.local" })

console.log("🔍 Probando integración con Firestore...\n")

async function testFirestore() {
  try {
    // Initialize Firebase Admin
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    }

    console.log(`📁 Proyecto Firebase: ${process.env.FIREBASE_PROJECT_ID}`)
    console.log("🔑 Usando credenciales de servicio...")

    const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig, "admin") : getApps()[0]
    const adminAuth = getAuth(adminApp)
    const adminDb = getFirestore(adminApp)

    console.log("✅ Firebase Admin inicializado correctamente\n")

    // Test Firestore operations
    console.log("🧪 Probando operaciones de Firestore...")

    // Test write
    const testDoc = adminDb.collection("test").doc("connection-test")
    const testData = {
      timestamp: new Date(),
      message: "Prueba de conexión exitosa",
      version: "1.0",
    }

    await testDoc.set(testData)
    console.log("✅ Escritura en Firestore: OK")

    // Test read
    const docSnapshot = await testDoc.get()
    if (docSnapshot.exists) {
      console.log("✅ Lectura de Firestore: OK")
      console.log("📄 Datos:", docSnapshot.data())
    }

    // Check users collection
    console.log("\n👥 Verificando estructura de usuarios...")
    const usersSnapshot = await adminDb.collection("users").limit(5).get()

    if (usersSnapshot.empty) {
      console.log("📝 Colección de usuarios vacía (normal para nueva instalación)")
    } else {
      console.log(`📊 Usuarios encontrados: ${usersSnapshot.size}`)
      usersSnapshot.forEach((doc) => {
        const userData = doc.data()
        console.log(`  - ${userData.nombre} (${userData.email}) - ${userData.tipo}`)
      })
    }

    // Clean up test document
    await testDoc.delete()
    console.log("\n🧹 Documento de prueba eliminado")

    // Test user creation flow
    console.log("\n👤 Probando flujo de registro de usuario...")

    const testUserId = `test-user-${Date.now()}`
    const testUserData = {
      uid: testUserId,
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

    // Create test user document
    await adminDb.collection("users").doc(testUserId).set(testUserData)
    console.log("✅ Usuario de prueba creado")

    // Retrieve test user
    const userDoc = await adminDb.collection("users").doc(testUserId).get()
    if (userDoc.exists) {
      console.log("✅ Usuario de prueba recuperado")
      console.log("📄 Datos del usuario:", userDoc.data())
    }

    // Clean up test user
    await adminDb.collection("users").doc(testUserId).delete()
    console.log("🧹 Usuario de prueba eliminado")

    console.log("\n📊 Resumen de pruebas:")
    console.log("✅ Firestore está funcionando correctamente")
    console.log("🚀 Los datos de usuario se guardarán en Firebase")

    console.log("\n💡 Próximos pasos:")
    console.log("1. Registra un usuario en /register")
    console.log("2. Verifica en Firebase Console que se creó el usuario")
    console.log('3. Revisa la colección "users" en Firestore')
  } catch (error) {
    console.error("❌ Error probando Firestore:", error.message)

    if (error.code === "auth/invalid-credential") {
      console.log("\n💡 Posibles soluciones:")
      console.log("1. Verifica que FIREBASE_PRIVATE_KEY esté correctamente configurado")
      console.log("2. Asegúrate de que las credenciales de servicio sean válidas")
      console.log("3. Revisa que el proyecto Firebase esté activo")
    }

    process.exit(1)
  }
}

testFirestore()
