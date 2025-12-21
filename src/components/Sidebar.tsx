import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  IndianRupee,
  Users,
  TestTube,
  Bell,
  FileText,
  Settings,
  X,
} from "lucide-react";

import { hasPermission } from "../utils/hasPermission";
import type { PermissionKey } from "../utils/permissions";

/* ===================== COLORS ===================== */
const PRIMARY = "#635bff";
const SECONDARY = "#1b2230";
const TEXT = "#c7cbe0";
const DISABLED = "#6b7280";
const SIDEBAR_BG = "#121621";
const BORDER = "#1a1f2b";

/* ===================== TYPES ===================== */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  permission?: PermissionKey;
}

/* ===================== MENU CONFIG ===================== */
const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Bookings", path: "/bookings" },
  { icon: MessageSquare, label: "Enquiry", path: "/enquiry" },
  { icon: IndianRupee, label: "Incentives", path: "/incentives" },
  { icon: Users, label: "Customers", path: "/customers", permission: "customers" },
  { icon: TestTube, label: "Lab Products", path: "/lab-products", permission: "lab_products" },
  { icon: Bell, label: "Notifications", path: "/notifications", permission: "notifications" },
  { icon: FileText, label: "Content Management", path: "/content-management", permission: "content_management" },
  { icon: Settings, label: "Settings", path: "/settings"},
];

/* ===================== COMPONENT ===================== */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const handleNavigation = (path: string, disabled: boolean) => {
    if (disabled) return;
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          transform transition-transform duration-300
          lg:relative lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ backgroundColor: SIDEBAR_BG, borderRight: `1px solid ${BORDER}` }}
      >
        {/* ===================== HEADER ===================== */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <img
            src="/logo1.png"
            alt="Logo"
            className="h-16 object-contain mx-auto"
          />

          <button onClick={onClose} className="lg:hidden">
            <X className="w-5 h-5" style={{ color: TEXT }} />
          </button>
        </div>

        {/* ===================== MENU ===================== */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path, permission }) => {
              const isActive = location.pathname.startsWith(path);
              const allowed = !permission || hasPermission(user, permission);

              return (
                <li key={path}>
                  <button
                    onClick={() => handleNavigation(path, !allowed)}
                    disabled={!allowed}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition"
                    style={{
                      backgroundColor: isActive ? PRIMARY : "transparent",
                      color: !allowed
                        ? DISABLED
                        : isActive
                        ? "#ffffff"
                        : TEXT,
                      cursor: allowed ? "pointer" : "not-allowed",
                      opacity: allowed ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive && allowed) {
                        e.currentTarget.style.backgroundColor = SECONDARY;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: !allowed
                          ? DISABLED
                          : isActive
                          ? "#ffffff"
                          : TEXT,
                      }}
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
