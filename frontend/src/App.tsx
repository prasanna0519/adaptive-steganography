import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SecureMessagePage } from './pages/SecureMessagePage';
import { ImageAnalysisPage } from './pages/ImageAnalysisPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { SteganalysisPage } from './pages/SteganalysisPage';
import { ExtractMessagePage } from './pages/ExtractMessagePage';
import { EvaluationPage } from './pages/EvaluationPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cyber-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/secure-message" element={<SecureMessagePage />} />
            <Route path="/analysis" element={<ImageAnalysisPage />} />
            <Route path="/recommendation" element={<RecommendationPage />} />
            <Route path="/steganalysis" element={<SteganalysisPage />} />
            <Route path="/extract" element={<ExtractMessagePage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
