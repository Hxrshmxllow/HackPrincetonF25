# API Examples

This document provides examples of how to use the CarInsight API endpoints.

Base URL: `http://localhost:8000`

---

## User Endpoints

### 1. Create User Profile

**POST** `/users/`

Create a new user profile when they complete the ProfileSetup flow.

```bash
curl -X POST http://localhost:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "budgetMin": 20000,
    "budgetMax": 45000,
    "make": "Toyota",
    "model": "Camry",
    "zipCode": "08544",
    "yearMin": 2018,
    "yearMax": 2024,
    "comfortLevel": "sedan"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "profile": {
      "budgetMin": 20000,
      "budgetMax": 45000,
      "make": "Toyota",
      "model": "Camry",
      "zipCode": "08544",
      "yearMin": 2018,
      "yearMax": 2024,
      "comfortLevel": "sedan"
    },
    "searchHistory": [],
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Get User Profile

**GET** `/users/<user_id>`

Retrieve a user's profile by their ID.

```bash
curl http://localhost:8000/users/550e8400-e29b-41d4-a716-446655440000
```

### 3. Update User Profile

**PUT** `/users/<user_id>`

Update user preferences (all fields optional).

```bash
curl -X PUT http://localhost:8000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "budgetMax": 50000,
    "make": "Honda",
    "comfortLevel": "suv"
  }'
```

### 4. Add Search to History

**POST** `/users/<user_id>/searches`

Track user search behavior.

```bash
curl -X POST http://localhost:8000/users/550e8400-e29b-41d4-a716-446655440000/searches \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "make": "Honda",
      "model": "Civic",
      "year": 2022,
      "maxPrice": 25000
    }
  }'
```

### 5. Get Search History

**GET** `/users/<user_id>/searches?limit=10`

Retrieve user's recent searches.

```bash
curl "http://localhost:8000/users/550e8400-e29b-41d4-a716-446655440000/searches?limit=5"
```

---

## Recommendation Endpoints

### 1. Generate Recommendations

**POST** `/recommendations/generate`

Generate AI-powered car recommendations for a user.

```bash
curl -X POST http://localhost:8000/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "primaryUse": "Daily commuting and weekend trips"
  }'
```

**With Custom Parameters:**
```bash
curl -X POST http://localhost:8000/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "budget": 35000,
    "carType": "suv",
    "location": "10001",
    "primaryUse": "Family trips and cargo hauling"
  }'
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "_id": "rec-uuid-123",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "recommendations": [
      {
        "make": "Toyota",
        "model": "RAV4",
        "year": 2021,
        "price": 28999,
        "reason": "Excellent reliability and resale value with spacious interior"
      },
      {
        "make": "Honda",
        "model": "CR-V",
        "year": 2020,
        "price": 26500,
        "reason": "Top safety ratings and fuel efficiency for an SUV"
      }
    ],
    "searchCriteria": {
      "budget": 35000,
      "carType": "suv",
      "location": "10001",
      "primaryUse": "Family trips and cargo hauling"
    },
    "createdAt": "2024-01-01T12:30:00Z"
  }
}
```

### 2. Get User's Recommendations

**GET** `/recommendations/user/<user_id>?limit=10`

Retrieve all recommendations for a user.

```bash
curl "http://localhost:8000/recommendations/user/550e8400-e29b-41d4-a716-446655440000?limit=5"
```

### 3. Get Specific Recommendation

**GET** `/recommendations/<recommendation_id>`

Get a single recommendation by ID.

```bash
curl http://localhost:8000/recommendations/rec-uuid-123
```

---

## Integration with Frontend

### React/TypeScript Example

```typescript
// services/api.ts
const API_BASE = 'http://localhost:8000';

export interface UserProfile {
  userId?: string;
  name: string;
  budgetMin: number;
  budgetMax: number;
  make: string;
  model?: string;
  zipCode: string;
  yearMin: number;
  yearMax: number;
  comfortLevel: string;
}

export interface Recommendation {
  make: string;
  model: string;
  year: number;
  price: number;
  reason?: string;
}

// Create user profile after ProfileSetup
export async function createUserProfile(profile: UserProfile) {
  const response = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return response.json();
}

// Get user profile
export async function getUserProfile(userId: string) {
  const response = await fetch(`${API_BASE}/users/${userId}`);
  return response.json();
}

// Generate recommendations
export async function generateRecommendations(
  userId: string,
  primaryUse?: string
) {
  const response = await fetch(`${API_BASE}/recommendations/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, primaryUse })
  });
  return response.json();
}

// Get user's recommendations
export async function getUserRecommendations(userId: string, limit = 10) {
  const response = await fetch(
    `${API_BASE}/recommendations/user/${userId}?limit=${limit}`
  );
  return response.json();
}

// Track search
export async function trackSearch(userId: string, filters: any) {
  const response = await fetch(`${API_BASE}/users/${userId}/searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters })
  });
  return response.json();
}
```

### Usage in ProfileSetup Component

```typescript
// ProfileSetup.tsx (updated)
import { v4 as uuidv4 } from 'uuid';
import { createUserProfile } from './services/api';

const ProfileSetup: React.FC = () => {
  // ... existing state ...

  const handleNext = async () => {
    if (!validate()) return;
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Generate UUID if not exists
      const userId = localStorage.getItem('userId') || uuidv4();
      
      // Save to database
      const userData = {
        userId,
        name: profile.name,
        budgetMin: Number(profile.budgetMin),
        budgetMax: Number(profile.budgetMax),
        make: profile.make,
        model: profile.model || undefined,
        zipCode: profile.zipCode,
        yearMin: Number(profile.yearMin),
        yearMax: Number(profile.yearMax),
        comfortLevel: profile.comfortLevel
      };
      
      try {
        const result = await createUserProfile(userData);
        if (result.success) {
          localStorage.setItem('userId', userId);
          localStorage.setItem('profile', JSON.stringify(profile));
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to create user profile:', error);
      }
    }
  };
  
  // ... rest of component ...
};
```

### Usage in CarListings Component

```typescript
// CarListings.tsx (updated)
import { trackSearch } from './services/api';

const CarListings: React.FC = () => {
  // ... existing state ...
  
  const handleSearch = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Track search in database
      await trackSearch(userId, {
        make,
        model,
        year: year ? Number(year) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      });
    }
  };
  
  // Call handleSearch when filters change
  useEffect(() => {
    handleSearch();
  }, [make, model, year, maxPrice]);
  
  // ... rest of component ...
};
```

---

## Testing the API

### 1. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 2. Initialize Database

```bash
cd server
python init_db.py
```

### 3. Start Flask Server

```bash
python run.py
```

### 4. Test Endpoints

Use the curl commands above or tools like Postman, Insomnia, or Thunder Client (VS Code extension).

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error
