import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Membership from "./pages/Membership";
import Footer from "./components/Footer";
import Feedback from "./pages/Feedback";
import Progress from "./pages/Progress";
import ProgressComplete from "./pages/ProgressComplete";
import Trainer from "./pages/Trainer";
import Classes from "./pages/Classes";
import Routine from "./pages/Routine";
import Notifications from "./pages/Notifications";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PanelRoles = lazy(() => import("./pages/PanelRoles"));

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
        <Header />
        {/* Contenido dinámico (se expande para evitar el hueco blanco) */}
        <main className="pt-16 flex-grow">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/routine" element={<Routine />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/progresscomplete/:idRutina" element={<ProgressComplete />} />

              <Route
                path="/trainers"
                element={
                  <ProtectedRoute rolPermitido={["cliente", "entrenador"]}>
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
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute rolPermitido="admin">
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute rolPermitido={["cliente", "entrenador"]}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={true}
          closeOnClick
          theme="colored"
        />
      </div>
    </Router>
  );
};

export default App;
