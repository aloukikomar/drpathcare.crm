import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  TestTube,
  Bell,
  FileText,
  Settings,
  X
} from 'lucide-react';

// COLORS
const PRIMARY = "#635bff";
const SECONDARY = "#1b2230";
const TEXT = "#c7cbe0";
const SIDEBAR_BG = "#121621";
const BORDER = "#1a1f2b";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Bookings', path: '/bookings' },
  { icon: MessageSquare, label: 'Enquiry', path: '/enquiry' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: TestTube, label: 'Lab Products', path: '/lab-products' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: FileText, label: 'Content Management', path: '/content-management' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: SIDEBAR_BG, borderRight: `1px solid ${BORDER}` }}
      >
        {/* Logo Row */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <img
            src="/logo1.png"
            alt="Logo"
            className="h-20 object-contain mx-auto"
          />

          <button
            onClick={onClose}
            className="p-1 rounded lg:hidden"
            style={{ backgroundColor: "transparent" }}
          >
            <X className="w-5 h-5" style={{ color: TEXT }} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;

              return (
                <li key={path}>
                  <button
                    onClick={() => handleNavigation(path)}
                    className="
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    "
                    style={{
                      backgroundColor: isActive ? PRIMARY : "transparent",
                      color: isActive ? "#ffffff" : TEXT,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = SECONDARY;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isActive ? "#ffffff" : TEXT }}
                    />
                    <span className="font-medium">{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
