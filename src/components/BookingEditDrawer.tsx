import React, { useState } from "react";
import { X } from "lucide-react";
import { customerApi } from "../api/axios";
import { useNavigate } from "react-router-dom";



interface BookingEditDrawerProps {
    open: boolean;
    onClose: () => void;
    bookingId: string | null;
    refId: string | null;
    currentStatus?: string;
    onSuccess?: () => void;
}

const ACTIONS = [
    { value: "update_status", label: "Update Status" },
    { value: "update_payment", label: "Update Payment Status" },
    { value: "update_schedule", label: "Reschedule" },
    { value: "upload_document", label: "Upload Document" },
];

export default function BookingEditDrawer({
    open,
    onClose,
    bookingId,
    refId,
    currentStatus,
    onSuccess,
}: BookingEditDrawerProps) {
    const [actionType, setActionType] = useState("");
    const [remarks, setRemarks] = useState("");
    const [status, setStatus] = useState(currentStatus || "");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [docName, setDocName] = useState("");
    const [docType, setDocType] = useState("other");
    const [file, setFile] = useState<File | null>(null);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    if (!open || !bookingId) return null;

    // --------------------------------------------
    // SUBMIT HANDLER
    // --------------------------------------------
    const handleSubmit = async () => {
        if (!actionType) return setError("Select action type");
        if (!remarks.trim()) return setError("Remarks required");

        setLoading(true);
        setError("");

        try {
            // Upload document
            if (actionType === "upload_document") {
                if (!file) return setError("Select file");

                const fd = new FormData();
                fd.append("booking", bookingId);
                fd.append("name", docName);
                fd.append("doc_type", docType);
                fd.append("file", file);

                await customerApi.post("/booking-documents/", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            // Update payment (cash)
            else if (actionType === "update_payment" && paymentMethod === "cash") {
                const fd = new FormData();
                fd.append("action_type", "update_payment");
                fd.append("payment_method", "cash");
                fd.append("remarks", remarks);
                fd.append("payment_status", "success");
                if (paymentProof) fd.append("file", paymentProof);

                await customerApi.patch(`/bookings/${bookingId}/`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            // Normal JSON PATCH
            else {
                const payload: any = { action_type: actionType, remarks };

                if (actionType === "update_status") payload.status = status;
                if (actionType === "update_schedule") {
                    payload.scheduled_date = newDate;
                    payload.scheduled_time_slot = newTime;
                }
                if (actionType === "update_payment" && paymentMethod !== "cash") {
                    payload.payment_method = paymentMethod;
                }

                await customerApi.patch(`/bookings/${bookingId}/`, payload);
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------
    // UI
    // --------------------------------------------
    return (
        <>
            {/* BACKDROP */}
            <div
                className={`fixed inset-0 bg-black/40 z-[60] transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* DRAWER */}
            <aside
                className={`fixed top-0 right-0 h-full z-[70] bg-white shadow-xl flex flex-col 
        w-full sm:w-[420px] md:w-[520px]
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <div className="text-lg font-semibold">
                            Edit Booking — <span className="text-[#635bff]">{refId}</span>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Update Full Details Button */}
                <div className="p-4 border-b">
                    <button
                        onClick={() => navigate(`/bookings/${bookingId}/edit`)}
                        className="px-4 py-2 rounded-md bg-[#635bff] text-white text-sm font-medium shadow hover:opacity-90"
                    >
                        Update Full Details
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* ACTION TYPE */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Action Type</label>
                        <select
                            value={actionType}
                            onChange={(e) => {
                                setActionType(e.target.value);
                                setError("");
                            }}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="">— Select —</option>
                            {ACTIONS.map((a) => (
                                <option key={a.value} value={a.value}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ---------------------------------- */}
                    {/* DYNAMIC SECTIONS */}
                    {/* ---------------------------------- */}

                    {actionType === "update_status" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">New Status</label>
                            <select
                                value={status || "open"}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="open">Open</option>
                                <option value="verified">Verified</option>
                                <option value="sample_collected">Sample Collected</option>
                                <option value="report_uploaded">Report Uploaded</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {actionType === "update_schedule" && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">New Date</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">New Time</label>
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>
                        </>
                    )}

                    {actionType === "update_payment" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">— Select —</option>
                                <option value="cash">Cash</option>
                                <option value="online">Online</option>
                            </select>

                            {paymentMethod === "cash" && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium mb-1">Upload Proof</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {actionType === "upload_document" && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Document Name</label>
                                <input
                                    className="w-full border px-3 py-2 rounded"
                                    value={docName}
                                    onChange={(e) => setDocName(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Document Type</label>
                                <select
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="cash_receipt">Cash Receipt</option>
                                    <option value="lab_report">Lab Report</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Upload File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </div>
                        </>
                    )}

                    {/* REMARKS */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Remarks</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            rows={3}
                        />
                    </div>

                    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                </div>

                {/* FOOTER */}
                <div className="p-3 border-t bg-white flex justify-end gap-2">
                    <button
                        className="px-3 py-2 border rounded text-sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-[#635bff] text-white text-sm"
                    >
                        {loading ? "Saving…" : "Update"}
                    </button>
                </div>
            </aside>
        </>
    );
}
