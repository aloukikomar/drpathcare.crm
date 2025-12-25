import React from "react";
import { Settings, User, LogOut } from "lucide-react";

interface UserPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user?: any;
  onSettings?: () => void;
  onProfile?: () => void;
  onSignOut?: () => void;
}

const UserPopover: React.FC<UserPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  user,
  onSettings,
  onProfile,
  onSignOut,
}) => {
  if (!open || !anchorEl) return null;

  // Position popover below avatar
  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="
          absolute z-50 bg-white shadow-xl rounded-lg border 
          p-3 w-60 animate-fadeIn
        "
        style={{
          top: rect.bottom + 8,
          left: Math.max(rect.right - 240, 8),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* User info */}
        <div className="pb-3">
          <div className="text-sm font-semibold text-gray-900">
            {user?.role || "User"} ({user?.user_code || ""})
          </div>
          <div className="text-xs text-gray-500">
            {user?.name || "Name"} ( {user?.mobile || "Mobile"} )
          </div>
          <div className="text-xs text-gray-500">
            {user?.email || ""}
          </div>
        </div>

        <div className="border-t my-2" />

        {/* Menu */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onSettings}
            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 text-sm text-gray-700"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 text-sm text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPopover;
