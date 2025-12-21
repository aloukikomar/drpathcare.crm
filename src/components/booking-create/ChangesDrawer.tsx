// src/components/booking/ChangesDrawer.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  original: any;
  getUpdated: any;
  onConfirm: (remark: string) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-gray-700 mb-2">{children}</h3>
);

const Row = ({ label, before, after }: any) => (
  <div className="text-sm p-2 rounded border border-orange-400 bg-orange-50">
    <div className="font-medium">{label}</div>
    <div className="flex justify-between gap-3 text-xs mt-1">
      <div className="flex-1 truncate">
        <span className="text-gray-500">Before:</span> {before ?? "—"}
      </div>
      <div className="flex-1 text-right truncate">
        <span className="text-gray-500">After:</span> {after ?? "—"}
      </div>
    </div>
  </div>
);

const ItemsDiff = ({ originalItems, updatedItems }: any) => {
  const originalMap = new Map(originalItems.map((i: any) => [i.id, i]));
  const updatedMap = new Map(updatedItems.map((i: any) => [i.id, i]));

  const added = updatedItems.filter((i: any) => !originalMap.has(i.id));
  const removed = originalItems.filter((i: any) => !updatedMap.has(i.id));

  if (added.length === 0 && removed.length === 0) return null;

  return (
    <div className="space-y-2">
      {added.length > 0 && (
        <div className="border-l-4 border-green-500 bg-green-50 p-2 rounded">
          <div className="font-semibold text-green-700 mb-1">Added Items</div>
          {added.map((i: any) => (
            <div key={i.id} className="text-sm text-green-700">
              + {i.item?.name} ({i.patient?.first_name})
            </div>
          ))}
        </div>
      )}

      {removed.length > 0 && (
        <div className="border-l-4 border-red-500 bg-red-50 p-2 rounded">
          <div className="font-semibold text-red-700 mb-1">Removed Items</div>
          {removed.map((i: any) => (
            <div key={i.id} className="text-sm text-red-700">
              − {i.item?.name} ({i.patient?.first_name})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChangesDrawer: React.FC<Props> = ({
  open,
  onClose,
  original,
  getUpdated,
  onConfirm,
}) => {
  const [remark, setRemark] = useState("");

  if (!open) return null;

  // Original normalized values
  const updated = getUpdated();
  const originalAddress = original.address_detail;
  const updatedAddress = updated.address;

  const originalItems = original.items.map((i: any) => ({
    id: i.id,
    item: i.lab_test_detail || i.package_detail,
    patient: i.patient_detail,
  }));

  // -------------------------
  // CHANGE DETECTION
  // -------------------------
  const addressChanged = originalAddress?.id !== updatedAddress?.id;

  const dateChanged = original.scheduled_date !== updated.scheduledDate;

  const slotChanged =
    original.scheduled_time_slot !== updated.scheduledSlot;

  const amountChanged =
    String(original.final_amount) !== String(updated.finalAmount);

  // Items change is internally computed by ItemsDiff

  const anyItemsChanged =
    updated.items.some((i: any) => !originalItems.find((o: any) => o.id === i.id)) ||
    originalItems.some((o: any) => !updated.items.find((i: any) => i.id === o.id));

  // -------------------------
  // CHECK IF NOTHING CHANGED (EDGE CASE)
  // -------------------------
  const nothingChanged =
    !addressChanged &&
    !dateChanged &&
    !slotChanged &&
    !amountChanged &&
    !anyItemsChanged;

  return (
    <div className="fixed inset-0 z-[120] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <aside
        className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl flex flex-col z-[130]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Confirm Changes</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">

          {/* NOTHING CHANGED */}
          {nothingChanged && (
            <div className="text-center text-gray-600 text-sm py-6">
              No changes detected.
            </div>
          )}

          {/* ADDRESS */}
          {addressChanged && (
            <div>
              <SectionTitle>Address</SectionTitle>
              <Row
                label="Selected Address"
                before={`${originalAddress.line1}, ${originalAddress.city}`}
                after={`${updatedAddress.line1}, ${updatedAddress.city}`}
              />
            </div>
          )}

          {/* ITEMS */}
          {anyItemsChanged && (
            <div>
              <SectionTitle>Items</SectionTitle>
              <ItemsDiff originalItems={originalItems} updatedItems={updated.items} />
            </div>
          )}

          {/* SCHEDULE */}
          {(dateChanged || slotChanged) && (
            <div>
              <SectionTitle>Schedule</SectionTitle>
              {dateChanged && (
                <Row
                  label="Date"
                  before={original.scheduled_date}
                  after={updated.scheduledDate}
                />
              )}
              {slotChanged && (
                <Row
                  label="Time Slot"
                  before={original.scheduled_time_slot}
                  after={updated.scheduledSlot}
                />
              )}
            </div>
          )}

          {/* PRICING */}
          {amountChanged && (
            <div>
              <SectionTitle>Final Amount</SectionTitle>
              <Row
                label="Amount"
                before={`₹${original.final_amount}`}
                after={`₹${updated.finalAmount}`}
              />
            </div>
          )}

          {/* REMARK */}
          <div>
            <SectionTitle>Remarks (required)</SectionTitle>
            <textarea
              className="border rounded p-2 w-full text-sm"
              rows={3}
              placeholder="Describe changes made…"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t flex justify-end gap-2">
          <button className="px-4 py-2 border rounded text-sm" onClick={onClose}>
            Cancel
          </button>

          <button
            disabled={!remark.trim()}
            onClick={() => onConfirm(remark.trim())}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm"
          >
            Confirm Changes
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ChangesDrawer;
