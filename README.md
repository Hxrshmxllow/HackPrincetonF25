# CarInsight 🚗

> The world's most honest car dealer.

CarInsight is an intelligent car buying platform that provides real insights, pricing predictions, and expert-level conversations to help you make informed car purchasing decisions. Get personalized car recommendations, insurance estimates, depreciation forecasts, and AI-powered car analysis—all in one place.

## ✨ Features

### 🔍 Smart Car Search
- **AI-Powered Recommendations**: Get personalized car recommendations based on your budget, location, primary use, and comfort preferences
- **Real-Time Listings**: Browse real car listings from Auto.dev API with detailed vehicle information
- **Advanced Filtering**: Filter by make, model, year, budget, and location

### 📊 Comprehensive Car Analytics
- **Overall Ratings**: AI-generated ratings based on reliability, performance, value, and more
- **Insurance Predictions**: Heuristic-based annual and monthly insurance cost estimates with detailed breakdowns
- **Depreciation Forecasting**: Visual depreciation graphs showing predicted value over time
- **Vehicle History**: Accident reports, owner count, usage type, and more

### 🤖 AI-Powered Assistant
- **Car Chatbot**: Ask questions about any car listing and get intelligent, context-aware responses
- **Detailed Analysis**: Get comprehensive insights about vehicle features, reliability, and value

### 👤 User Profiles
- **Profile Setup**: Multi-step profile creation with preferences (budget, make/model, location, comfort level)
- **Profile Management**: Edit and update your preferences anytime
- **Firebase Authentication**: Secure user authentication with email/password

### 🎨 Modern UI/UX
- **Responsive Design**: Beautiful, modern interface that works on all devices
- **Interactive Components**: Carousel image galleries, animated modals, and smooth transitions
- **Fixed/Static Navbar**: Smart navbar that adapts to page context (fixed on landing, static on listings)

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons
- **Firebase Auth & Firestore** for authentication and data storage

### Backend
- **Flask** (Python) REST API
- **OpenAI GPT-4** for AI recommendations and car analysis
- **Auto.dev API** for real car listings and vehicle data
- **Flask-CORS** for cross-origin requests
- **python-dotenv** for environment variable management

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Firebase account** (for authentication and Firestore)
- **OpenAI API key** (for AI features)
- **Auto.dev API key** (for car listings)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Hxrshmxllow/HackPrincetonF25.git
cd HackPrincetonF25
```

### 2. Backend Setup

```bash
cd server

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file in the server directory
touch .env
```

Add the following to `server/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
AUTO_DEV_KEY=your_auto_dev_api_key_here
SECRET_KEY=your_secret_key_here
```

Start the backend server:
```bash
python run.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create a .env file in the client directory
touch .env
```

Add the following to `client/.env`:
```env
VITE_API_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore Database** (start in test mode for development)
4. Update `client/src/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 📁 Project Structure

```
HackPrincetonF25/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main app component with routing
│   │   ├── Landing.tsx    # Landing page
│   │   ├── CarListings.tsx # Car listings page with modal
│   │   ├── SearchResults.tsx # Search results wrapper
│   │   ├── ProfileSetup.tsx # Multi-step profile setup
│   │   ├── ProfilePage.tsx  # Profile editing page
│   │   ├── Navbar.tsx      # Reusable navbar component
│   │   ├── AuthContext.tsx # Authentication context
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── zipCodeToState.ts # Zip code to state mapping
│   └── package.json
│
├── server/                 # Flask backend
│   ├── app/
│   │   ├── __init__.py    # Flask app factory
│   │   ├── routes/
│   │   │   ├── listings.py      # Car listings endpoints
│   │   │   └── recommendation.py # AI recommendation endpoints
│   │   └── utils/
│   │       ├── clean_data.py          # Data processing from Auto.dev
│   │       ├── insurance_prediction.py # Insurance cost estimation
│   │       └── openai.py              # OpenAI API integration
│   ├── run.py             # Server entry point
│   └── requirements.txt   # Python dependencies
│
├── test_insurance.py      # Insurance prediction tests
├── TESTING_GUIDE.md       # Comprehensive testing guide
└── README.md             # This file
```

## 🔌 API Endpoints

### Listings

#### `GET /listings/`
Fetch car listings based on filters.

**Query Parameters:**
- `state` (required): US state abbreviation (e.g., "NJ", "CA")
- `make` (optional): Car make (e.g., "Toyota")
- `model` (optional): Car model (e.g., "Camry")
- `model_year` (optional): Model year (integer)
- `budget` (optional): Budget range
- `primary_use` (optional): Primary use case (e.g., "daily_commuting")
- `comfort` (optional): Comfort level preference

**Response:**
```json
{
  "listings": {
    "VIN123": {
      "vehicle": {...},
      "retailListing": {...},
      "history": {...},
      "insurance": {
        "annualEstimate": 1200,
        "monthlyEstimate": 100,
        "breakdown": {...}
      },
      "ratings": {...}
    }
  }
}
```

#### `POST /listings/chat`
Chat with AI about a specific car.

**Request Body:**
```json
{
  "car": {...},
  "message": "What is the fuel economy?",
  "messageHistory": [...]
}
```

**Response:**
```json
{
  "reply": "The fuel economy is...",
  "messageHistory": [...]
}
```

### Recommendations

#### `GET /recommendations/`
Get AI-powered car recommendations (currently uses hardcoded values, but endpoint exists).

## 🎯 Key Features Explained

### Insurance Prediction
The insurance prediction uses a heuristic model that considers:
- **Base Cost**: ~6% of vehicle value
- **Location Multiplier**: State-based insurance cost factors
- **Make Multiplier**: Brand reliability and theft rates
- **Body Style**: SUV, Sedan, Coupe, etc.
- **Engine Power**: Cylinder count
- **Vehicle Age**: Depreciation factor
- **History Factors**: Accidents, owner count, usage type

### Depreciation Forecasting
Uses a dual-exponential depreciation model to predict vehicle value over time, showing:
- Current value
- Predicted value at 1, 3, 5, and 10 years
- Visual graph representation

### AI Car Analysis
Leverages OpenAI GPT-4 to provide:
- Overall vehicle ratings
- Detailed feature analysis
- Reliability assessments
- Value propositions
- Contextual chat responses

## 🧪 Testing

See `TESTING_GUIDE.md` for comprehensive testing instructions, including:
- Firebase setup
- Authentication testing
- Profile creation and editing
- Firestore data verification
- Multi-user isolation testing

## 🚢 Deployment

### Backend Deployment
The Flask backend can be deployed to:
- **AWS Elastic Beanstalk**
- **Heroku**
- **Google Cloud Run**
- **Railway**

Make sure to set environment variables in your deployment platform.

### Frontend Deployment
The React frontend can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Firebase Hosting**

Update `VITE_API_URL` in your production environment to point to your backend URL.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **HackPrinceton F25 Team**

## 🙏 Acknowledgments

- **Auto.dev** for car listing data
- **OpenAI** for AI capabilities
- **Firebase** for authentication and database
- **React** and **Flask** communities for excellent documentation

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ for HackPrinceton F25**

