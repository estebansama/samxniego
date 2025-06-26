# Firebase Setup Guide for Clasio App

## 🚀 Quick Start

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name: `clasio-app` (or your preference)
4. Enable Google Analytics (recommended)

### Step 2: Enable Authentication
1. Go to **Authentication** → **Get started**
2. **Sign-in method** tab → Enable **Email/Password**
3. Save changes

### Step 3: Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Start in **test mode** (for now)
3. Choose your location (closest to users)

### Step 4: Get Web App Configuration
1. **Project Settings** (gear icon) → **General** tab
2. Scroll to "Your apps" → Click **Web** icon `</>`
3. Register app: `clasio-web`
4. Copy the `firebaseConfig` object

### Step 5: Generate Service Account Key
1. **Project Settings** → **Service accounts** tab
2. Click **Generate new private key**
3. Download JSON file (keep secure!)

## 🔧 Environment Configuration

### Create .env.local
Copy `.env.example` to `.env.local` and fill in your values:

\`\`\`bash
cp .env.example .env.local
\`\`\`

### Client Configuration (from Web App Config)
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
\`\`\`

### Server Configuration (from Service Account JSON)
\`\`\`env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
\`\`\`

## 🔐 Security Rules

Update Firestore rules in Firebase Console:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can access app data
    match /{collection}/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

## ✅ Verification

Run the verification script:
\`\`\`bash
npm run verify-firebase
\`\`\`

## 🚨 Troubleshooting

### Common Issues:

1. **"Component auth has not been registered yet"**
   - Restart development server: `npm run dev`
   - Check all environment variables are set

2. **"Invalid API key"**
   - Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
   - No extra spaces or quotes

3. **"Project not found"**
   - Check `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches Firebase project

4. **Private key issues**
   - Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters
   - Wrap in double quotes

### Getting Help:
- Check Firebase Console for error messages
- Verify all environment variables
- Restart development server after changes

## 🎯 Testing

1. Start development server: `npm run dev`
2. Visit: `http://localhost:3000/register`
3. Create a test account
4. Check browser console for Firebase messages
5. Verify user appears in Firebase Console → Authentication

## 🚀 Next Steps

Once Firebase is working:
- Set up AI integration (OpenAI/Gemini)
- Configure production environment
- Add monitoring and analytics
- Deploy to Vercel
