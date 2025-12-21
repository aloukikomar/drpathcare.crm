import * as React from "react";
import { Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";

interface Props {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function DateRangePicker({
  value,
  onChange,
  onApply,
  onClear,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-xl p-4 w-[300px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-800">
          Date Range
        </span>
      </div>

      {/* Calendar */}
      <DayPicker
        mode="range"
        selected={value}
        onSelect={onChange}
        numberOfMonths={1}
        fixedWeeks
        showOutsideDays
        className="p-0"
        classNames={{
          months: "flex justify-center",
          month: "space-y-2",
          caption: "flex items-center justify-between px-1",
          caption_label: "text-sm font-medium text-gray-800",
          nav: "flex items-center gap-1",
          nav_button:
            "h-7 w-7 rounded-md hover:bg-gray-100 text-gray-600",
          table: "w-full border-collapse",
          head_row: "",
          head_cell:
            "text-xs font-medium text-gray-400 p-1 text-center",
          row: "",
          cell: "p-0.5 text-center",
          day: `
            h-8 w-8 rounded-md text-sm
            hover:bg-gray-100
            transition
          `,
          day_today:
            "border border-[#635bff] text-[#635bff]",
          day_selected:
            "bg-[#635bff] text-white hover:bg-[#574fff]",
          day_range_start:
            "bg-[#635bff] text-white rounded-l-md",
          day_range_end:
            "bg-[#635bff] text-white rounded-r-md",
          day_range_middle:
            "bg-[#635bff]/10 text-[#635bff]",
          day_outside:
            "text-gray-300 opacity-50",
          day_disabled:
            "text-gray-300 cursor-not-allowed",
        }}
      />

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Clear
        </button>

        <button
          onClick={onApply}
          className="px-4 py-1.5 rounded-lg text-sm bg-[#635bff] text-white hover:bg-[#574fff]"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
