import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import ProfileSetup from "./ProfileSetup";
import ProfilePage from "./ProfilePage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/setup" element={<ProfileSetup />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
