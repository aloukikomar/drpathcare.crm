import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import BookingCreate from './src/pages/BookingCreate'
import BookingEdit from './src/pages/BookingEdit'
import Bookings from './src/pages/Bookings';
import Enquiry from './src/pages/Enquiry';
import Customers from './src/pages/Customers';
import LabProducts from './src/pages/LabProducts';
import Notifications from './src/pages/Notifications';
import ContentManagement from './src/pages/ContentManagement';
import Settings from './src/pages/Settings';
import NotFound from './src/pages/NotFound';

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-inter">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/create" element={<BookingCreate />} />
            <Route path="/bookings/:id/edit" element={<BookingEdit />} />
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/lab-products" element={<LabProducts />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/content-management" element={<ContentManagement />} />
            <Route path="/settings" element={<Settings />} />
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
}

export default App;