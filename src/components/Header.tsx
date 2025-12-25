import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import UserPopover from "./UserPopover";
import { useNavigate } from "react-router-dom";



interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title = "" }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string; mobile?:string; user_code?:string } | null>(null);
  const navigate = useNavigate();

  // Load user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser({
          name: parsed.name || "",
          mobile: parsed.mobile || "",
          email: parsed.email || "",
          user_code: parsed.user_code || "",
          role:
            typeof parsed.role === "object"
              ? parsed.role.name
              : parsed.role || "User",
        });

      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // Dummy handlers (you can replace later)
  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleProfile = () => console.log("Profile clicked");

  return (
    <>
      <header className="px-4 py-3 flex items-center justify-between border-b bg-white">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg lg:hidden active:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[160px] sm:max-w-none">
            {/* {title} */}
          </h1>
        </div>

        {/* Right: Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-[#635bff] text-white flex items-center justify-center font-bold cursor-pointer active:opacity-80"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {initials}
        </div>
      </header>

      {/* Popover */}
      <UserPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        user={user || undefined}
        onSignOut={handleSignOut}
        onSettings={handleSettings}
        onProfile={handleProfile}
      />
    </>
  );
};

export default Header;
