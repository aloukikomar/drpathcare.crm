import React from "react";
import { TIME_SLOTS, isSlotExpired } from "../../utils/timeSlots";
import { Trash } from "lucide-react";

interface ItemRow {
  id: number;
  patient: any;
  itemType: "lab_test" | "lab_package";
  item: any;
  price: string;
  offer_price: string;
}

interface Props {
  customer: any;

  items: ItemRow[];
  setItems: (items: ItemRow[]) => void;

  scheduledDate: string;
  setScheduledDate: (v: string) => void;

  scheduledSlot: string;
  setScheduledSlot: (v: string) => void;

  onBack: () => void;
  onContinue: () => void;

  onOpenTestsDrawer: () => void;
}

const BookingDetailsSection: React.FC<Props> = ({
  customer,
  items,
  setItems,

  scheduledDate,
  setScheduledDate,

  scheduledSlot,
  setScheduledSlot,

  onBack,
  onContinue,
  onOpenTestsDrawer,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [duplicateMessage, setDuplicateMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (items.length === 0) return;

    const { clean, duplicates } = sanitizeItems(items);

    if (duplicates.length === 0) return;

    // 1️⃣ Persist cleaned data (THIS FIXES NEXT PAGE)
    setItems(clean);

    // 2️⃣ Persist message ONCE
    const lines = duplicates.map(
      d => `${d.item?.name} – ${d.patient?.first_name}`
    );

    setDuplicateMessage(
      `Duplicate items were automatically removed:\n• ${lines.join("\n• ")}`
    );
  }, [items]); // 👈 DEPENDS ON items ONLY


  function sanitizeItems(items: ItemRow[]) {
    const seen = new Set<string>();
    const clean: ItemRow[] = [];
    const duplicates: ItemRow[] = [];

    for (const item of items) {
      const key = `${item.itemType}-${item.item?.id}-${item.patient?.id}`;

      if (seen.has(key)) {
        duplicates.push(item);
      } else {
        seen.add(key);
        clean.push(item);
      }
    }

    return { clean, duplicates };
  }

  const { clean, duplicates } = React.useMemo(
    () => sanitizeItems(items),
    [items]
  );

  const canContinue =
    items.length > 0 && scheduledDate !== "" && scheduledSlot !== "";


  return (
    <section className="bg-white p-4 border rounded-lg shadow-sm space-y-6">
      {/* ====================================================
       HEADER
      ==================================================== */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Booking Details</h2>
          <p className="text-sm text-gray-500">Select patient tests & schedule</p>
        </div>

        <button
          disabled={!customer}
          onClick={() => {
            if (!customer) return alert("Please select a customer first");
            onOpenTestsDrawer();
          }}
          className={`px-4 py-2 rounded text-sm ${customer
            ? "bg-indigo-600 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Add Items
        </button>
      </div>

      {/* ====================================================
       SCHEDULE
      ==================================================== */}
      <div className="space-y-3">
        <h3 className="font-medium">Schedule</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* DATE */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={scheduledDate}
              min={today}
              onChange={(e) => {
                setScheduledDate(e.target.value);
                setScheduledSlot("");
              }}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* TIME SLOT */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Time Slot</label>
            <select
              value={scheduledSlot}
              onChange={(e) => setScheduledSlot(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">Select Slot</option>
              {TIME_SLOTS.map((slot) => {
                const expired =
                  scheduledDate === today ? isSlotExpired(slot) : false;

                return (
                  <option key={slot} value={slot} disabled={expired}>
                    {slot} {expired ? "(Unavailable)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* ====================================================
       ITEMS TABLE
      ==================================================== */}
      <div className="overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items added</p>
        ) : (
          <table className="w-full min-w-[650px] text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Patient</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-center">Price</th>
                <th className="p-2 text-center">Offer</th>
                <th className="p-2 text-right">Remove</th>
              </tr>
            </thead>
            <tbody>
              {clean.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.patient?.first_name}</td>
                  <td className="p-2">{r.itemType}</td>
                  <td className="p-2">{r.item?.name}</td>
                  <td className="p-2 text-center">₹{r.price}</td>
                  <td className="p-2 text-center">₹{r.offer_price}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() =>
                        setItems(clean.filter((x) => x.id !== r.id))
                      }
                      className="text-red-600"
                    >
                      <Trash className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {duplicateMessage && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-line">
          {duplicateMessage}
        </div>
      )}



      {/* ====================================================
       FOOTER BUTTONS
      ==================================================== */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded text-sm"
        >
          Back
        </button>

        <button
          disabled={!canContinue}
          onClick={onContinue}
          className={`px-6 py-2 rounded text-white text-sm ${canContinue
            ? "bg-primary hover:bg-primary/90"
            : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </section>
  );
};

export default BookingDetailsSection;
