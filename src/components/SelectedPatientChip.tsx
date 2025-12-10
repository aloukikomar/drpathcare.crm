import React from "react";
import { X } from "lucide-react";

interface Props {
  patient: any;
  onRemove: () => void;
}

const SelectedPatientChip: React.FC<Props> = ({ patient, onRemove }) => {
  const initials =
    `${patient.first_name?.[0] ?? ""}${patient.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className="
        flex items-center gap-2 
        bg-primary/10 border border-primary/30 
        px-3 py-1.5 rounded-full 
        text-sm shadow-sm
      "
    >
      {/* Avatar */}
      <div
        className="
          w-6 h-6 rounded-full 
          bg-primary/20 text-primary 
          flex items-center justify-center 
          text-xs font-bold
        "
      >
        {initials}
      </div>

      {/* Name */}
      <span className="font-medium text-gray-800">
        {patient.first_name}
        {patient.last_name ? ` ${patient.last_name}` : ""}
      </span>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-red-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SelectedPatientChip;
