import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { customerApi } from "../../api/axios";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AgentRow {
  user: number;
  name: string;
  amount: number;
  remark: string;
}

const IncentiveDrawer: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingResults, setBookingResults] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const [rows, setRows] = useState<AgentRow[]>([]);
  const [saving, setSaving] = useState(false);

  // ==================================================
  // SEARCH BOOKINGS (with incentive flag)
  // ==================================================
  useEffect(() => {
    if (!bookingSearch || selectedBooking) return;

    const load = async () => {
      try {
        const res = await customerApi.get(
          `/bookings-list/?search=${bookingSearch}&incentive=true`
        );
        setBookingResults(res.results || res.data || []);
      } catch (err) {
        console.error("Booking search failed", err);
      }
    };

    load();
  }, [bookingSearch, selectedBooking]);

  // ==================================================
  // TOTAL CALCULATION
  // ==================================================
  const totalAmount = useMemo(
    () => rows.reduce((sum, r) => sum + (r.amount || 0), 0),
    [rows]
  );

  const remainingAmount = selectedBooking
    ? selectedBooking.final_amount - totalAmount
    : 0;

  const exceeded = remainingAmount < 0;

  // ==================================================
  // BOOKING SELECT
  // ==================================================
  const handleBookingSelect = (b: any) => {
    const assignedUsers = Array.isArray(b.assigned_users)
      ? b.assigned_users
      : [];

    setSelectedBooking(b);

    setRows(
      assignedUsers.map((u: any) => ({
        user: u.id,
        name: u.name || u.first_name || "Agent",
        amount: 0,
        remark: "",
      }))
    );

    setBookingResults([]);
    setBookingSearch("");
  };

  const clearBooking = () => {
    setSelectedBooking(null);
    setRows([]);
    setBookingResults([]);
    setBookingSearch("");
  };

  // ==================================================
  // ROW UPDATE
  // ==================================================
  const updateRow = (index: number, patch: Partial<AgentRow>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };

  // ==================================================
  // SUBMIT (SUBMIT ALL AGENTS)
  // ==================================================
  const handleSubmit = async () => {
    if (!selectedBooking || exceeded) return;

    setSaving(true);
    try {
      await customerApi.post("/crm/incentives/", {
        booking: selectedBooking.id,
        items: rows.map((r) => ({
          agent: r.user,
          amount: r.amount || 0,
          remark: r.remark || "",
        })),
      });

      onSuccess();
      clearBooking();
      onClose();
    } catch (err) {
      console.error("Failed to create incentives", err);
      alert("Failed to save incentives");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* DRAWER */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Create Incentives</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* BOOKING SEARCH */}
          {!selectedBooking && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Select Booking
              </label>
              <input
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search booking ref or customer"
                className="w-full border px-3 py-2 rounded-lg"
              />

              {bookingResults.length > 0 && (
                <div className="border rounded mt-1 max-h-48 overflow-y-auto">
                  {bookingResults.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleBookingSelect(b)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-medium">{b.ref_id}</div>
                      <div className="text-xs text-gray-500">
                        Final Amount: ₹{b.final_amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOOKING INFO */}
          {selectedBooking && (
            <div className="bg-gray-50 p-3 rounded border text-sm relative">
              <button
                onClick={clearBooking}
                className="absolute top-2 right-2 text-xs text-red-600"
              >
                ✕ Change
              </button>

              <div>
                <strong>Booking:</strong> {selectedBooking.ref_id}
              </div>
              <div>
                <strong>Final Amount:</strong> ₹{selectedBooking.final_amount}
              </div>
              <div
                className={
                  exceeded ? "text-red-600" : "text-green-600"
                }
              >
                Remaining: ₹{remainingAmount}
              </div>
            </div>
          )}

          {/* AGENT ROWS */}
          {selectedBooking && (
            <>
              <h4 className="font-medium">Agent Incentives</h4>

              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div
                    key={row.user}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="text-sm font-semibold">{row.name}</div>

                    <input
                      type="number"
                      min={0}
                      className="w-full border px-2 py-2 rounded text-sm"
                      placeholder="Incentive Amount ₹"
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(idx, {
                          amount: Number(e.target.value) || 0,
                        })
                      }
                    />

                    <textarea
                      rows={2}
                      className="w-full border px-2 py-2 rounded text-sm resize-none"
                      placeholder="Remark (optional)"
                      value={row.remark}
                      onChange={(e) =>
                        updateRow(idx, { remark: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            disabled={saving || exceeded || !selectedBooking}
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Incentives"}
          </button>
        </div>
      </div>
    </>
  );
};

export default IncentiveDrawer;
