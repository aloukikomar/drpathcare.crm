// src/components/content/ContentFilterPopup.tsx
import React from "react";
import { X } from "lucide-react";

const TAG_OPTIONS = [
  { label: "All", value: "" },
  { label: "About Gallery", value: "about_gallery" },
  { label: "Banner", value: "banner" },
  { label: "Partner", value: "partner" },
  { label: "Certification", value: "certification" },
  { label: "Unused", value: "unused" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  value: string;
  onApply: (tag: string) => void;
}

const ContentFilterPopup: React.FC<Props> = ({
  open,
  onClose,
  value,
  onApply,
}) => {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center">
      <div className="bg-white w-[90%] sm:w-[360px] rounded-lg shadow-lg p-4 z-[110]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filter Content</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="mb-4">
          <label className="text-sm font-medium">Select Tag</label>
          <select
            value={value}
            onChange={(e) => onApply(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
          >
            {TAG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onApply("")}
            className="px-4 py-2 text-sm border rounded"
          >
            Clear
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-primary text-white rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentFilterPopup;
