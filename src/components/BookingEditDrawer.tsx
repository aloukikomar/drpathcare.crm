import React, { useEffect, useState } from "react";
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
    { value: "update_agent", label: "Update Agent" },
    { value: "update_payment", label: "Update Payment Status" },
    // { value: "update_schedule", label: "Reschedule" },
    { value: "upload_document", label: "Upload Document" },
    { value: "add_remark", label: "Add Remark" },
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

    const [agentSearch, setAgentSearch] = useState("");
    const [agentResults, setAgentResults] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [searchingAgent, setSearchingAgent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!agentSearch) {
            setAgentResults([]);
            return;
        }

        const t = setTimeout(async () => {
            setSearchingAgent(true);
            try {
                const res = await customerApi.get("/crm/users/", {
                    params: {
                        search: agentSearch,
                        staff: true, // ✅ only agents/staff
                    },
                });
                setAgentResults(res.results || []);
            } catch (e) {
                console.error("Agent search failed", e);
            } finally {
                setSearchingAgent(false);
            }
        }, 300);

        return () => clearTimeout(t);
    }, [agentSearch]);


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
                if (actionType === "update_agent") {
                    if (!selectedAgent) {
                        alert("Please select an agent");
                        return;
                    }
                    payload.assigned_users = [selectedAgent.id]

                }

                if (actionType === "update_payment" && paymentMethod !== "cash") {
                    payload.payment_method = paymentMethod;
                }

                await customerApi.patch(`/bookings/${bookingId}/`, payload);
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err?.serverMessage || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const allowed_fulledit = () => {
        const user = localStorage.getItem('user')

        if (user) {
            const parsed = JSON.parse(user);
            if (parsed?.role?.name == 'Admin') {
                return true
            }
            else if (['open','verified'].includes(String(currentStatus))){
                return true
            }
            else false
        }
        return false
    }

    const getActionOptions = () => {
        const user = localStorage.getItem('user')

        if (user) {
            const parsed = JSON.parse(user);
            if (parsed?.role?.name == 'Admin') {
                return [
                    { value: "update_status", label: "Update Status" },
                    { value: "update_agent", label: "Update Agent" },
                    { value: "update_payment", label: "Update Payment Status" },
                    // { value: "update_schedule", label: "Reschedule" },
                    { value: "upload_document", label: "Upload Document" },
                    { value: "add_remark", label: "Add Remark" },
                ];
            }
            else if (currentStatus == 'open') return [
                { value: "update_status", label: "Update Status" },
                { value: "update_agent", label: "Update Agent" },
                { value: "add_remark", label: "Add Remark" },
            ]
            else if (currentStatus == 'verified') return [
                { value: "update_status", label: "Update Status" },
                { value: "update_agent", label: "Update Agent" },
                { value: "add_remark", label: "Add Remark" },
            ]
            else if (currentStatus == 'sample_collected') return [
                { value: "update_status", label: "Update Status" },
                { value: "update_agent", label: "Update Agent" },
                { value: "update_payment", label: "Update Payment Status" },
                { value: "upload_document", label: "Upload Document" },
                { value: "add_remark", label: "Add Remark" },
            ]
            else if (currentStatus == 'report_uploaded') return [
                { value: "update_status", label: "Update Status" },
                { value: "update_agent", label: "Update Agent" },
                { value: "upload_document", label: "Upload Document" },
                { value: "add_remark", label: "Add Remark" },
            ]
            else if (currentStatus == 'completed') return [
                { value: "update_agent", label: "Update Agent" },
                { value: "upload_document", label: "Upload Document" },
                { value: "add_remark", label: "Add Remark" },
            ]
            else if (currentStatus == 'cancelled') return [

                { value: "add_remark", label: "Add Remark" },
            ]
        }
        return []
    }

    const getStatusOptions = () => {
        const user = localStorage.getItem('user')

        if (user) {
            const parsed = JSON.parse(user);
            if (parsed?.role?.name == 'Admin') {
                return [
                    { value: "open", label: "Open" },
                    { value: "verified", label: "Verified" },
                    { value: "sample_collected", label: "Sample Collected" },
                    { value: "report_uploaded", label: "Report Uploaded" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                ]
            }
            else if (currentStatus == 'open') return [
                { value: "verified", label: "Verified" },
                { value: "cancelled", label: "Cancelled" },
            ]
            else if (currentStatus == 'verified') return [
                { value: "open", label: "Open" },
                { value: "sample_collected", label: "Sample Collected" },
                { value: "cancelled", label: "Cancelled" },
            ]
            else if (currentStatus == 'sample_collected') return [
                { value: "report_uploaded", label: "Report Uploaded" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
            ]
            else if (currentStatus == 'report_uploaded') return [
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
            ]
            else return []
        }
        return []
    }

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
                        disabled={!allowed_fulledit()}
                        onClick={() => navigate(`/bookings/${bookingId}/edit`)}
                        className={`px-4 py-2 rounded-md ${allowed_fulledit()?"bg-[#635bff]":"bg-gray-300"} text-white text-sm font-medium shadow hover:opacity-90`}
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
                            {getActionOptions().map((a) => (
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
                            <label className="block text-sm font-medium mb-1">
                                New Status
                            </label>

                            <select
                                value={status ?? ""}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border px-3 py-2 rounded"
                            >
                                {/* ✅ BLANK PLACEHOLDER */}
                                <option value="" disabled>
                                    Select status
                                </option>

                                {getStatusOptions().map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}


                    {actionType === "update_agent" && (
                        <div className="mb-4 space-y-3">
                            <label className="block text-sm font-medium">
                                Assign Agent
                            </label>

                            {/* SEARCH INPUT */}
                            <div className="relative">
                                <input
                                    value={agentSearch}
                                    onChange={(e) => {
                                        setAgentSearch(e.target.value);
                                        setSelectedAgent(null);
                                    }}
                                    placeholder="Search agent by name or mobile"
                                    className="w-full border px-3 py-2 rounded"
                                />

                                {searchingAgent && (
                                    <div className="absolute right-3 top-2.5 text-xs text-gray-400">
                                        Searching…
                                    </div>
                                )}
                            </div>

                            {/* SEARCH RESULTS */}
                            {agentResults.length > 0 && !selectedAgent && (
                                <div className="border rounded max-h-48 overflow-y-auto">
                                    {agentResults.map((u) => (
                                        <div
                                            key={u.id}
                                            onClick={() => {
                                                setSelectedAgent(u);
                                                setAgentSearch("");
                                                setAgentResults([]);
                                            }}
                                            className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                                        >
                                            <div className="font-medium text-sm">
                                                {u.first_name} {u.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {u.mobile}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SELECTED AGENT PREVIEW */}
                            {selectedAgent && (
                                <div className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2">
                                    <div>
                                        <div className="text-sm font-medium">
                                            {selectedAgent.first_name} {selectedAgent.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {selectedAgent.mobile}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedAgent(null)}
                                        className="text-xs text-red-600"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
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
