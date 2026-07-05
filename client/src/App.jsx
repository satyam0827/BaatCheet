import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

const App = () => {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  const [loadingMessage, setLoadingMessage] = useState(
    "Connecting to the server...",
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth) return;

    const timer1 = setTimeout(() => {
      setLoadingMessage("Waking up the backend server...");
    }, 5000);

    const timer2 = setTimeout(() => {
      setLoadingMessage(
        "The backend is hosted on Render's free tier. This usually takes 20–60 seconds.",
      );
    }, 12000);

    const timer3 = setTimeout(() => {
      setLoadingMessage("Almost there! Thanks for your patience. 🚀");
    }, 25000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isCheckingAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <Loader className="size-12 animate-spin text-blue-500 mb-6" />

        <h2 className="text-xl font-semibold mb-2">
          Loading your experience...
        </h2>

        <p className="max-w-md text-gray-500">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />

        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        <Route path="/settings" element={<SettingsPage />} />

        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
