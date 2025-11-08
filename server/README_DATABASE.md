# MongoDB Database Setup

This document explains the MongoDB database structure and setup for the CarInsight application.

## Database Overview

**Database Name:** `carinsight` (configurable via `MONGODB_DATABASE` env variable)

### Collections

1. **users** - Stores user profiles and preferences
2. **recommendations** - Stores AI-generated car recommendations for users

---

## Collection Schemas

### 1. Users Collection

Stores user profile information and search preferences.

```json
{
  "_id": "uuid-string",
  "name": "John Doe",
  "profile": {
    "budgetMin": 10000,
    "budgetMax": 50000,
    "make": "Toyota",
    "model": "Camry",
    "zipCode": "08544",
    "yearMin": 2018,
    "yearMax": 2024,
    "comfortLevel": "sedan"
  },
  "searchHistory": [
    {
      "timestamp": "2024-01-01T12:00:00Z",
      "filters": {
        "make": "Honda",
        "model": "Civic",
        "year": 2022,
        "maxPrice": 25000
      }
    }
  ],
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

**Indexes:**
- `zipcode_index` - on `profile.zipCode`
- `make_index` - on `profile.make`
- `budget_range_index` - compound index on `profile.budgetMin` and `profile.budgetMax`
- `created_at_index` - on `createdAt` (descending)

### 2. Recommendations Collection

Stores AI-generated car recommendations linked to users.

```json
{
  "_id": "uuid-string",
  "userId": "user-uuid-string",
  "recommendations": [
    {
      "make": "Toyota",
      "model": "Camry",
      "year": 2021,
      "price": 23999,
      "reason": "Excellent reliability and fuel efficiency within your budget"
    }
  ],
  "searchCriteria": {
    "budget": 50000,
    "carType": "sedan",
    "location": "08544",
    "primaryUse": "Daily commuting"
  },
  "createdAt": "2024-01-01T12:00:00Z"
}
```

**Indexes:**
- `user_id_index` - on `userId`
- `created_at_index` - on `createdAt` (descending)
- `user_created_compound_index` - compound index on `userId` and `createdAt`

---

## Setup Instructions

### 1. Install MongoDB

**Local Installation:**
- macOS: `brew tap mongodb/brew && brew install mongodb-community`
- Ubuntu: Follow [MongoDB Ubuntu installation guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
- Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

**Or use MongoDB Atlas (Cloud):**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Update the MongoDB configuration:
```
MONGODB_URI=mongodb://localhost:27017/  # or your Atlas connection string
MONGODB_DATABASE=carinsight
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Initialize the Database

Run the initialization script to create indexes:

```bash
python init_db.py
```

This will:
- Verify MongoDB connection
- Create the necessary collections
- Set up indexes for optimal query performance
- Display collection information

---

## Database Utility Functions

The `app/db_utils.py` module provides convenient functions for database operations:

### User Operations

```python
from app.db_utils import create_user, get_user_by_id, update_user_profile

# Create a new user
user = create_user(
    name="John Doe",
    budget_min=10000,
    budget_max=50000,
    make="Toyota",
    zip_code="08544",
    year_min=2018,
    year_max=2024,
    comfort_level="sedan",
    model="Camry"  # optional
)

# Get user by ID
user = get_user_by_id(user_id)

# Update user profile
update_user_profile(user_id, {
    "budgetMax": 60000,
    "make": "Honda"
})

# Add search history
add_user_search(user_id, {
    "make": "Honda",
    "maxPrice": 30000
})
```

### Recommendation Operations

```python
from app.db_utils import create_recommendation, get_recommendations_by_user

# Create recommendations
recommendation = create_recommendation(
    user_id="user-uuid",
    recommendations=[
        {
            "make": "Toyota",
            "model": "Camry",
            "year": 2021,
            "price": 23999,
            "reason": "Great reliability"
        }
    ],
    search_criteria={
        "budget": 50000,
        "carType": "sedan"
    }
)

# Get user's recommendations
recommendations = get_recommendations_by_user(user_id, limit=10)
```

---

## Database Models

Models are defined in `app/models/`:

- **UserModel** (`app/models/user.py`) - User profile schema and validation
- **RecommendationModel** (`app/models/recommendation.py`) - Recommendation schema and validation

Both models include:
- Schema definitions
- Create methods
- Validation methods
- Helper functions

---

## Connection Management

The `MongoDB` class in `app/database.py` manages connections:

```python
from app.database import MongoDB

# Get database instance
db = MongoDB.get_database()

# Get specific collection
users = MongoDB.get_collection("users")

# Close connection (usually done at app shutdown)
MongoDB.close_connection()
```

---

## Development Tips

1. **MongoDB Compass** - Use [MongoDB Compass](https://www.mongodb.com/products/compass) for GUI database management

2. **Viewing Data:**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # Switch to database
   use carinsight
   
   # View collections
   show collections
   
   # Query users
   db.users.find().pretty()
   
   # Query recommendations
   db.recommendations.find().pretty()
   ```

3. **Reset Database** (development only):
   ```javascript
   // In MongoDB shell
   use carinsight
   db.dropDatabase()
   ```
   Then run `python init_db.py` again.

---

## Production Considerations

1. **Connection Pooling** - PyMongo automatically handles connection pooling
2. **Indexes** - Already created via `init_db.py`
3. **Backups** - Set up regular backups if using local MongoDB
4. **Security** - Use authentication and restrict network access
5. **Monitoring** - Use MongoDB Atlas monitoring or set up alerts

---

## Troubleshooting

**Connection Error:**
- Verify MongoDB is running: `sudo systemctl status mongod` (Linux) or `brew services list` (macOS)
- Check `MONGODB_URI` in `.env`

**Import Errors:**
- Ensure all dependencies are installed: `pip install -r requirements.txt`

**Index Creation Failed:**
- Drop existing indexes and rerun `init_db.py`
- Check MongoDB logs for errors
