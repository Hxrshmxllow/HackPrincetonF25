import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ProfileSetup.css";

const questions = [
  "What's your name?",
  "What's your budget range?",
  "What type of car are you looking for?",
  "What's your preferred location?",
  "What's your primary use for the car?"
];

const ProfileSetup: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      localStorage.setItem("profile", JSON.stringify(answers));
      navigate("/");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/");
  };

  const updateAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="setup-page">
      <nav className="navbar">
        <div className="logo">
          <Car size={28} />
          <span>CarInsight</span>
        </div>
      </nav>

      <div className="setup-container">
        <div className="progress">
          {questions.map((_, i) => (
            <div key={i} className={`dot ${i <= step ? "active" : ""}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="question-container"
          >
            <h2>{questions[step]}</h2>
            <input
              type="text"
              value={answers[step]}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder="Type your answer..."
              autoFocus
            />
          </motion.div>
        </AnimatePresence>

        <div className="buttons">
          <button onClick={handleBack} className="btn-secondary">
            <ArrowLeft size={20} />
            {step === 0 ? "Home" : "Back"}
          </button>
          <button onClick={handleNext} className="btn-primary">
            {step === 4 ? "Finish" : "Next"}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
