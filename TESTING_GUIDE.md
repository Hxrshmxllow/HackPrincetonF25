# Complete Testing Guide: Auth & Cloud Storage

## ✅ Pre-Test Checklist

### 1. Firebase Console Setup
- [ ] Go to https://console.firebase.google.com
- [ ] Select project: `hackprinceton-d2127`
- [ ] **Authentication** → Sign-in method → Enable "Email/Password"
- [ ] **Firestore Database** → Create database (if not exists) → Start in "test mode"

### 2. Firestore Security Rules (for testing)
Go to Firestore → Rules tab, paste this:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
Click "Publish"

---

## 🧪 Complete Test Flow

### Test 1: Sign Up & Create Profile

**Step 1: Sign Up**
1. Open `http://localhost:5174/`
2. Click "Sign In" button (top right)
3. Click "Don't have an account? Sign Up"
4. Enter:
   - Email: `test1@example.com`
   - Password: `test123456` (min 6 chars)
5. Click "Sign Up"
6. ✅ **Expected:** Modal closes, profile icon appears in navbar

**Step 2: Verify in Firebase Console**
1. Go to Firebase Console → Authentication → Users
2. ✅ **Expected:** See `test1@example.com` in the list
3. Note the User UID (click on the user to see it)

**Step 3: Complete Profile Setup**
1. Click "Get Started" button
2. Fill out all 6 steps:
   - **Step 1:** Name: `John Doe`
   - **Step 2:** Budget: Min `10000`, Max `50000`
   - **Step 3:** Make: `Toyota`, Model: `Camry`
   - **Step 4:** ZIP: `08540`
   - **Step 5:** Year: Min `2015`, Max `2024`
   - **Step 6:** Comfort: `Sedan`
3. Click "Finish"
4. ✅ **Expected:** Redirects to home page

**Step 4: Verify Profile in Firestore**
1. Go to Firebase Console → Firestore Database
2. Click "profiles" collection
3. ✅ **Expected:** See 1 document with ID = your User UID
4. Click the document
5. ✅ **Expected:** See all fields:
   ```
   name: "John Doe"
   budgetMin: "10000"
   budgetMax: "50000"
   make: "Toyota"
   model: "Camry"
   zipCode: "08540"
   yearMin: "2015"
   yearMax: "2024"
   comfortLevel: "sedan"
   updatedAt: "2025-11-08T..."
   ```

---

### Test 2: View & Edit Profile

**Step 1: View Profile**
1. Click profile icon (top right)
2. ✅ **Expected:** All profile data is pre-filled
3. ✅ **Expected:** No errors in browser console

**Step 2: Edit Profile**
1. Change name to `Jane Doe`
2. Change budget max to `60000`
3. Click "Save Changes"
4. ✅ **Expected:** Success message appears
5. ✅ **Expected:** Redirects to home after 1 second

**Step 3: Verify Update in Firestore**
1. Go to Firestore → profiles → your document
2. ✅ **Expected:** `name` = "Jane Doe"
3. ✅ **Expected:** `budgetMax` = "60000"
4. ✅ **Expected:** `updatedAt` timestamp is newer

---

### Test 3: Logout & Login Persistence

**Step 1: Logout**
1. Click "Logout" button
2. ✅ **Expected:** Profile icon disappears
3. ✅ **Expected:** "Sign In" button appears

**Step 2: Login Again**
1. Click "Sign In"
2. Enter same email: `test1@example.com`
3. Enter same password: `test123456`
4. Click "Sign In"
5. ✅ **Expected:** Profile icon appears

**Step 3: Verify Profile Persists**
1. Click profile icon
2. ✅ **Expected:** All data is still there (name: "Jane Doe", etc.)
3. ✅ **Expected:** Data loaded from Firestore, not localStorage

---

### Test 4: Multiple Users (Isolation Test)

**Step 1: Create Second User**
1. Logout
2. Sign up with: `test2@example.com` / `test123456`
3. Complete profile with different data:
   - Name: `Alice Smith`
   - Budget: `20000` - `40000`
   - Make: `Honda`
4. Finish setup

**Step 2: Verify Isolation**
1. Go to Firestore → profiles
2. ✅ **Expected:** See 2 documents (different User UIDs)
3. Click first document → ✅ See "Jane Doe" data
4. Click second document → ✅ See "Alice Smith" data
5. ✅ **Expected:** Each user only sees their own data

---

### Test 5: Browser Console Verification

**Open Browser Console (F12) and check:**

**On Sign Up:**
- ✅ No red errors
- ✅ May see: "Main.tsx loaded", "App rendered successfully"

**On Profile Save:**
- ✅ No red errors
- ✅ If error occurs, should see: "Error saving profile: ..." (but still saves to localStorage as fallback)

**On Profile Load:**
- ✅ No red errors
- ✅ If error occurs, should see: "Error loading profile: ..." (but falls back to localStorage)

---

### Test 6: Network Tab Verification

**Open DevTools → Network tab:**

**On Profile Save:**
1. Filter by "firestore"
2. Save profile
3. ✅ **Expected:** See POST request to Firestore API
4. ✅ **Expected:** Status 200 (success)

**On Profile Load:**
1. Filter by "firestore"
2. Navigate to profile page
3. ✅ **Expected:** See GET request to Firestore API
4. ✅ **Expected:** Status 200 (success)

---

### Test 7: Fallback to localStorage

**Test when NOT logged in:**
1. Logout
2. Click "Get Started" (without signing in)
3. Complete profile setup
4. ✅ **Expected:** Profile saves to localStorage (check DevTools → Application → Local Storage)
5. ✅ **Expected:** Profile page loads from localStorage

---

## 🐛 Troubleshooting

**Profile not saving to Firestore?**
- Check browser console for errors
- Verify you're signed in (profile icon visible)
- Check Firestore rules allow write
- Verify Firestore database is created

**Can't sign up?**
- Check Firebase Console → Authentication → Sign-in method
- Ensure Email/Password is enabled
- Password must be at least 6 characters

**Profile not loading?**
- Check browser console for errors
- Verify Firestore document exists
- Check Firestore rules allow read
- Try refreshing the page

**Data not persisting after logout/login?**
- Check Firestore document still exists
- Verify User UID matches document ID
- Check browser console for errors

---

## ✅ Success Criteria

All tests pass if:
- ✅ Users can sign up and login
- ✅ Profiles save to Firestore (visible in console)
- ✅ Profiles load from Firestore on page refresh
- ✅ Each user's data is isolated
- ✅ Data persists after logout/login
- ✅ Falls back to localStorage when not logged in
- ✅ No console errors during normal operation

