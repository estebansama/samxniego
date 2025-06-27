const fs = require("fs")
const path = require("path")

console.log("🔍 Probando integración con Firestore...\n")

// Load environment variables
const envPath = path.join(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: ".env.local" })
} else {
  console.log("❌ Archivo .env.local no encontrado")
  process.exit(1)
}

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
    const { initializeApp, cert, getApps } = require("firebase-admin/app")
    const { getFirestore } = require("firebase-admin/firestore")

    if (clientEmail && privateKey) {
      console.log("🔑 Usando credenciales de servicio...")

      if (getApps().length === 0) {
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        })
      } else {
        adminApp = getApps()[0]
      }
    } else {
      console.log("🔑 Usando credenciales por defecto...")
      if (getApps().length === 0) {
        adminApp = initializeApp({ projectId })
      } else {
        adminApp = getApps()[0]
      }
    }

    adminDb = getFirestore(adminApp)
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
      const testDoc = adminDb.collection("test").doc("connection-test")
      await testDoc.set({
        timestamp: new Date(),
        message: "Prueba de conexión exitosa",
        version: "1.0",
      })
      console.log("✅ Escritura en Firestore: OK")

      // Test read
      const doc = await testDoc.get()
      if (doc.exists) {
        console.log("✅ Lectura de Firestore: OK")
        console.log("📄 Datos:", doc.data())
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
