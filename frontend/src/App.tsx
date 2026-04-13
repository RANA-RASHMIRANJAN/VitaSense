import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Prediction from './pages/Prediction';
import Result from './pages/Result';
import HealthTips from './pages/HealthTips';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import { RequireAuth } from './auth/RequireAuth';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/prediction"
              element={
                <RequireAuth>
                  <Prediction />
                </RequireAuth>
              }
            />
            <Route
              path="/result"
              element={
                <RequireAuth>
                  <Result />
                </RequireAuth>
              }
            />
            <Route path="/health-tips" element={<HealthTips />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
