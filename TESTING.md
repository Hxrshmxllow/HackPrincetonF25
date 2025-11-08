# Testing Auth & Firestore

## Step-by-Step Test

### 1. Sign Up (Landing Page)
- Click "Sign In" button
- Click "Don't have an account? Sign Up"
- Enter email: `test@example.com`
- Enter password: `test123456` (min 6 chars)
- Click "Sign Up"
- ✅ Should see profile icon appear in navbar

### 2. Complete Profile Setup
- Click "Get Started" or navigate to `/setup`
- Fill out all 6 steps:
  - Name: "Test User"
  - Budget: $10,000 - $50,000
  - Car Make: "Toyota"
  - ZIP: "08540"
  - Year: 2015 - 2024
  - Comfort: "Sedan"
- Click "Finish"
- ✅ Should redirect to home page

### 3. Verify in App
- Click profile icon (top right)
- ✅ Should see all your profile data pre-filled
- Edit something and click "Save Changes"
- ✅ Should see success message

### 4. Check Firestore Console
1. Go to https://console.firebase.google.com
2. Select your project: `hackprinceton-d2127`
3. Click "Firestore Database" (left sidebar)
4. Click "profiles" collection
5. ✅ Should see 1 document with ID = your user's UID
6. Click the document
7. ✅ Should see all fields: name, budgetMin, budgetMax, make, model, zipCode, yearMin, yearMax, comfortLevel, updatedAt

### 5. Test Persistence
- Click "Logout" button
- Click "Sign In" again with same email/password
- Go to Profile page
- ✅ All your data should still be there (loaded from Firestore)

## Troubleshooting

**No data in Firestore?**
- Check browser console for errors (F12)
- Make sure Email/Password auth is enabled in Firebase Console
- Make sure Firestore is created (not just Realtime Database)

**Can't sign up?**
- Check Firebase Console → Authentication → Sign-in method
- Enable "Email/Password" provider
- Password must be at least 6 characters

**Profile not saving?**
- Check browser console for errors
- Make sure you're signed in (check for profile icon in navbar)

