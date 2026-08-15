import React, { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="flex items-center gap-3 text-slate-600">
      <Loader className="size-5 animate-spin text-blue-500" />
      <span className="text-sm font-medium">Loading screen...</span>
    </div>
  </div>
);

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

      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>

      <Toaster />
    </div>
  );
};

export default App;
