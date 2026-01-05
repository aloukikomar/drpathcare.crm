import React from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./src/pages/Home";
import Login from "./src/pages/Login";
import Dashboard from "./src/pages/Dashboard";
import BookingCreate from "./src/pages/BookingCreate";
import BookingEdit from "./src/pages/BookingEdit";
import Bookings from "./src/pages/Bookings";
import Enquiry from "./src/pages/Enquiry";
import Customers from "./src/pages/Customers";
import LabProducts from "./src/pages/LabProducts";
import Notifications from "./src/pages/Notifications";
import ContentManagement from "./src/pages/ContentManagement";
import Settings from "./src/pages/Settings";
import NotFound from "./src/pages/NotFound";
import Incentives from "./src/pages/Incentives"
import OldLeads from "./src/pages/OldLeads"

import ProtectedRoute from "./src/components/ProtectedRoute";
import { PERMISSIONS } from "./src/utils/permissions";

/* ===================== ROLES ===================== */
export const ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  AGENT: 3,
};

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-inter">
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* PROTECTED */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings/create"
              element={
                <ProtectedRoute>
                  <BookingCreate />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings/:id/edit"
              element={
                <ProtectedRoute>
                  <BookingEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enquiry"
              element={
                <ProtectedRoute>
                  <Enquiry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incentives"
              element={
                <ProtectedRoute>
                  <Incentives />
                </ProtectedRoute>
              }
            />


            <Route
              path="/customers"
              element={
                <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
                  <Customers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/lab-products"
              element={
                <ProtectedRoute permission={PERMISSIONS.LAB_PRODUCTS}>
                  <LabProducts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/content-management"
              element={
                <ProtectedRoute permission={PERMISSIONS.CONTENT_MANAGEMENT}>
                  <ContentManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute permission={PERMISSIONS.NOTIFICATIONS}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/old-leads"
              element={
                <ProtectedRoute permission={PERMISSIONS.OLD_LEADS}>
                  <OldLeads />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </main>
      </Router>
    </Theme>
  );
};

export default App;
