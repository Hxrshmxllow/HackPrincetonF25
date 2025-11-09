import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage/LandingPage";
import "./App.css";
import ProfileSetupPage from "./Pages/ProfileSetupPage/ProfileSetupPage";
/*import ProfilePage from "./ProfilePage";
import SearchResults from "./SearchResults";*/
import CarListingsPage from "./Pages/CarListingsPage/CarListingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<ProfileSetupPage />} />
        <Route path="/listings" element={<CarListingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
