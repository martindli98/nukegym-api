import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import default CSS for toastify
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Membership from "./pages/Membership";
import Footer from "./components/Footer";
import Feedback from "./pages/Feedback";
import Routine from "./pages/Routine";
import Trainer from "./pages/Trainer";
import Classes from "./pages/Classes";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PanelRoles = lazy(() => import("./pages/PanelRoles"));

const App = () => {
  return (
    <div>
      <Router>
        <div>
          <Header />
        </div>
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/routine" element={<Routine />} />
              <Route path="/classes" element={<Classes />} />
              <Route
                path="/trainers"
                element={
                  <ProtectedRoute rolPermitido="cliente">
                    <Trainer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute rolPermitido="admin">
                    <PanelRoles />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
        <div>
          <Footer />
          <ToastContainer
            position="top-center"
            autoClose={1000}
            hideProgressBar={true}
            closeOnClick
            // pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </div>
  );
};

export default App;
