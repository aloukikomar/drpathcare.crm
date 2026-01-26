import React, { useState, useCallback } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import CommonDrawer from "../components/CommonDrawer";

import { Pencil, IndianRupee, FileText, History, DownloadIcon, RefreshCwIcon, LinkIcon, PhoneOutgoing } from "lucide-react";
import BookingEditDrawer from "../components/BookingEditDrawer";
import { useNavigate } from "react-router-dom";
import { customerApi } from "../api/axios";


const BookingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<Record<string, any>>({});

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();

  // --- Drawer states ---
  const [drawerPayments, setDrawerPayments] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const [drawerDocuments, setDrawerDocuments] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const [drawerHistory, setDrawerHistory] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const [drawerEdit, setDrawerEdit] = useState<{
    open: boolean;
    id: string | null;
    row: any,
  }>({ open: false, id: null, row: null, });

  const handleOpenFilter = () => setFilterModalOpen(true);
  const handleOpenAdd = () => navigate("/bookings/create");
  const handleMakeCall = async (booking_id) => {
    try {
      const res = await customerApi.post("/calls/connect/", {
        "call_type": "booking",
        "booking_id": booking_id
      })
      alert("Call initiated");
    } catch (err: any) {
      console.error(err);
      alert("Failed to initiat call " + String(err.serverMessage));
    } finally {
      //setSaving(false);
    }
  }


  const rowStatusBg = (status?: string | null) => {
    switch ((status || "").toLowerCase()) {

      // 1️⃣ New / untouched
      case "open":
        return "bg-blue-50";

      // 1️⃣ Rescheduled
      case "rescheduled":
        return "bg-orange-50";

      // 2️⃣ Verified
      case "verified":
        return "bg-yellow-50";

      // 3️⃣ Root manager
      case "root_manager":
        return "bg-indigo-50";

      // 4️⃣ Phlebo assigned
      case "phlebo":
        return "bg-amber-100";

      // 5️⃣ Sample collected
      case "sample_collected":
        return "bg-cyan-50";

      // 6️⃣ Payment collected
      case "payment_collected":
        return "bg-emerald-50";

      // 7️⃣ Report uploaded
      case "report_uploaded":
        return "bg-violet-50";

      // 8️⃣ Health manager
      case "health_manager":
        return "bg-teal-50";

      // 9️⃣ Dietitian
      case "dietitian":
        return "bg-pink-50";

      // ✅ Completed
      case "completed":
        return "bg-green-50";

      // ❌ Terminal states
      case "failed":
      case "cancelled":
        return "bg-red-50";

      default:
        return null;
    }
  };


  const allowed_edit = (status) => {
    const user = localStorage.getItem('user')

    if (user) {

      const parsed = JSON.parse(user);
      return true
      if (parsed?.role?.name == 'Admin') {
        return true
      }
      else if (status == 'open') {
        return true
      }
      else if (status == 'verified' && ['Team Lead', 'Manager', 'Verifier', 'Root Manager', 'Phlebo', 'Super Manager'].includes(parsed?.role?.name)) {
        return true
      }
      else if (status == 'sample_collected' && ['Verifier', 'Root Manager', 'Phlebo', 'Super Manager'].includes(parsed?.role?.name)) {
        return true
      }
      else if (status == 'report_uploaded' && ['Verifier', 'Root Manager', 'Dietitian', 'Health Manager', 'Super Manager'].includes(parsed?.role?.name)) {
        return true
      }
      else if (status == 'completed' && ['Verifier', 'Root Manager', 'Dietitian', 'Health Manager', 'Super Manager'].includes(parsed?.role?.name)) {
        return true
      }
      else if (status == 'cancelled' && ['Verifier', 'Root Manager', 'Dietitian', 'Health Manager', 'Super Manager'].includes(parsed?.role?.name)) {
        return true
      }
      else {
        return false
      }
    }
    return false

  }

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setFilterModalOpen(false);
  };

  const columns = [
    {
      key: "ref_id",
      label: "Ref ID",
      sort_allowed: true,
      render: (row: any) => (
        <div className="font-medium text-sm">{row.ref_id}</div>
      ),
      width: "100px",
    },
    {
      key: "created_by_str",
      label: "Created by",
      render: (row: any) => row.created_by_str || "—",
      width: "200px",
    },
    {
      key: "user_str",
      label: "User",
      orderKey: "user__first_name",
      sort_allowed: true,
      render: (row: any) => {
        const user = localStorage.getItem('user')
        if (user) {

          const parsed = JSON.parse(user);
          if (parsed?.role?.name == 'Phlebo') {
            return row.user_str.slice(0, -13) || "—"
          }
        }
        return row.user_str || "—"
      },
      width: "200px",
    },
    {
      key: "location_str",
      label: "Location",
      orderKey: "address__location__city",
      sort_allowed: true,
      render: (row: any) => row.location_str || "—",
      width: "280px",
    },
    {
      key: "status",
      label: "Status",
      sort_allowed: true,
      render: (row: any) => {
        const raw = String(row.status || "").toLowerCase();
        const label = raw
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const statusColor = (s: string) => {
          switch (s) {
            case "open":
              return "bg-blue-100 text-blue-700 border-blue-200";
            case "rescheduled":
              return "bg-orange-100 text-orange-700 border-orange-200";
            case "verified":
              return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "root_manager":
              return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "phlebo":
              return "bg-amber-100 text-amber-700 border-amber-200";
            case "sample_collected":
              return "bg-cyan-100 text-cyan-700 border-cyan-200";
            case "payment_collected":
              return "bg-emerald-100 text-emerald-800 border-emerald-300";
            case "report_uploaded":
              return "bg-violet-100 text-violet-700 border-violet-200";
            case "health_manager":
              return "bg-teal-100 text-teal-800 border-teal-300";
            case "dietitian":
              return "bg-pink-100 text-pink-800 border-pink-300";
            case "completed":
              return "bg-green-100 text-green-700 border-green-200";
            case "failed":
            case "cancelled":
              return "bg-red-100 text-red-700 border-red-200";
            default:
              return "bg-gray-100 text-gray-700 border-gray-200";
          }
        };

        return (
          <span
            className={`inline-block text-center px-2 py-1 min-w-[140px] rounded-full border text-xs font-medium ${statusColor(
              raw
            )}`}
          >
            {label}
          </span>
        );
      },
      width: "140px",
    },
    {
      key: "payment_status",
      label: "Payment",
      sort_allowed: true,
      render: (row: any) => {
        const raw = String(row.payment_status || "").toLowerCase();
        const label = raw
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const paymentColor = (s: string) => {
          switch (s) {
            case "success":
              return "bg-green-100 text-green-700 border-green-200";
            case "initiated":
            case "verified":
              return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "failed":
            case "cancelled":
              return "bg-red-100 text-red-700 border-red-200";
            default:
              return "bg-gray-100 text-gray-700 border-gray-200";
          }
        };

        return (
          <span
            className={`inline-block text-center px-2 py-1 min-w-[100px] rounded-full border text-xs font-medium ${paymentColor(
              raw
            )}`}
          >
            {label}
          </span>
        );
      },
      width: "140px",
    },
    {
      key: "initial_amount",
      label: "Initial Amount",
      sort_allowed: true,
      render: (row: any) => `₹${Number(row.initial_amount ?? 0).toFixed(2)}`,
      width: "100px",
    },
    {
      key: "final_amount",
      label: "Amount",
      sort_allowed: true,
      render: (row: any) => `₹${Number(row.final_amount ?? 0).toFixed(2)}`,
      width: "100px",
    },
    {
      key: "created_at",
      label: "Created At",
      sort_allowed: true,
      render: (row: any) => new Date(row.created_at).toLocaleDateString(),
      width: "140px",
    },
    {
      key: "time_slot",
      orderKey: "scheduled_date",
      label: "Time Slot",
      sort_allowed: true,
      render: (row: any) => row.scheduled_date + '\n | \n' + row.scheduled_time_slot,
      width: "280px",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            className={`p-1 rounded-md ${allowed_edit(row.status) ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`} title="Edit"
            disabled={!allowed_edit(row.status)}
            onClick={(e) => {
              e.stopPropagation();
              handleMakeCall(row.id)
            }}
          >
            <PhoneOutgoing className="w-5 h-5 text-gray-600 hover:text-primary " />
          </button>
          <button
            className={`p-1 rounded-md ${allowed_edit(row.status) ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`} title="Edit"
            disabled={!allowed_edit(row.status)}
            onClick={(e) => {
              e.stopPropagation();
              setDrawerEdit({ open: true, id: row.id, row })
            }}
          >
            <Pencil className="w-5 h-5 text-gray-600 hover:text-primary " />
          </button>

          {/* History Drawer */}
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="History"
            onClick={(e) => {
              e.stopPropagation();
              setDrawerHistory({ open: true, id: row.id })
            }}
          >
            <History className="w-5 h-5 text-gray-600 hover:text-primary" />
          </button>

          {/* Payments Drawer */}
          <button
            className={`p-1 rounded-md ${(row.payment_count ?? 0) > 0 ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`}
            title={(row.payment_count ?? 0) > 0 ? "Payments" : "No payments available"}
            disabled={!((row.payment_count ?? 0) > 0)}
            onClick={(e) => {
              e.stopPropagation();
              (row.payment_count ?? 0) > 0 && setDrawerPayments({ open: true, id: row.id })
            }}
          >
            <IndianRupee className="w-5 h-5 text-gray-600 hover:text-primary" />
          </button>

          {/* Documents Drawer */}
          <button
            className={`p-1 rounded-md ${(row.document_count ?? 0) > 0 ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`}
            title={(row.document_count ?? 0) > 0 ? "Documents" : "No documents available"}
            disabled={!((row.document_count ?? 0) > 0)}
            onClick={(e) => {
              e.stopPropagation();
              (row.document_count ?? 0) > 0 && setDrawerDocuments({ open: true, id: row.id })
            }}
          >
            <FileText className="w-5 h-5 text-gray-600 hover:text-primary" />
          </button>

        </div>
      ),
      width: "110px",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Bookings" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DataTable
            header="Customer Bookings"
            subheader="Create and Update customer booking"
            apiUrl="bookings-list/"
            columns={columns}
            scroll_y
            showSearch
            showFilter
            showAdd
            showDateRange
            onRowClick={(row) => {
              window.location.href = `/bookings/${row.id}/edit`;
            }}
            rowBgColor={(row) => rowStatusBg(row.status)}
            extraParams={{ ...filters, reloadKey }}
            onFilterClick={handleOpenFilter}
            onAddClick={handleOpenAdd}
            defaultPageSize={10}
            emptyMessage="No bookings found"
          />

          {/* --------------------- FILTER MODAL --------------------- */}
          {filterModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>

                {/* STATUS FILTER */}
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium">
                    Booking Status
                  </label>
                  <select
                    className="w-full border px-3 py-2 rounded"
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">All</option>
                    <option value="open">Open</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="verified">Verified</option>
                    <option value="root_manager">Root Manager</option>
                    <option value="phlebo">Phlebo</option>
                    <option value="sample_collected">Sample Collected</option>
                    <option value="payment_collected">Payment Collected</option>
                    <option value="report_uploaded">Report Uploaded</option>
                    <option value="health_manager">Health Manager</option>
                    <option value="dietitian">Dietitian</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* PAYMENT STATUS FILTER */}
                <div className="mb-6">
                  <label className="block mb-1 text-sm font-medium">
                    Payment Status
                  </label>
                  <select
                    className="w-full border px-3 py-2 rounded"
                    value={filters.payment_status || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        payment_status: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="initiated">Initiated</option>
                    <option value="success">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-between items-center">
                  {/* RESET */}
                  <button
                    onClick={() => setFilters({})}
                    className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterModalOpen(false)}
                      className="px-3 py-2 border rounded"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => handleApplyFilters(filters)}
                      className="px-3 py-2 bg-primary text-white rounded"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* --------------------- ADD MODAL --------------------- */}
          {addModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add Booking</h3>

                <p className="text-sm text-gray-600 mb-4">
                  Implement your booking creation form here.
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setAddModalOpen(false)}
                    className="px-3 py-2 border rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* ------------------------- EditBooking DRAWER ------------------------- */}
      <BookingEditDrawer
        open={drawerEdit.open}
        agentList={drawerEdit.row?.view_stack}
        refId={drawerEdit.row?.ref_id}
        onClose={() => setDrawerEdit({ open: false, id: null, row: null })}
        bookingId={drawerEdit.id}
        currentStatus={drawerEdit.row?.status}
        onSuccess={() => setReloadKey(Date.now())}
      />

      {/* ------------------------- PAYMENTS DRAWER ------------------------- */}
      <CommonDrawer
        open={drawerPayments.open}
        onClose={() => setDrawerPayments({ open: false, id: null })}
        apiUrl={
          drawerPayments.id
            ? `/payments/?booking=${drawerPayments.id}&page_size=100`
            : null
        }
        heading={`Payments for Booking #${drawerPayments.id}`}
        noDataMsg="No payments found"
        noDataSubMsg="No transactions recorded for this booking"

        /** ⭐ Fully Upgraded Payment Card (Old CRM Style) */
        renderItem={(p: any, refreshList: () => void) => (
          <div className="space-y-3">

            {/* HEADER — Amount + Update Button */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                ₹{p.amount}
              </div>

              {/* UPDATE PAYMENT STATUS */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await customerApi.post(
                      `/payments/booking/${drawerPayments.id}/refresh-latest/`
                    );
                    refreshList();
                  } catch (err) {
                    console.error("Failed to update payment", err);
                  }
                }}
                title="Refresh Payment Status"
                className="p-1.5 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
            </div>

            {/* STATUS + METHOD */}
            <div className="flex flex-wrap gap-2 items-center text-sm">

              {/* STATUS BADGE */}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium 
          ${p.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : p.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }
        `}
              >
                {p.status.toUpperCase()}
              </span>

              {/* METHOD */}
              <span className="text-gray-600 text-sm">
                {p.method}
              </span>
            </div>

            {/* CREATED AT */}
            <div className="text-xs text-gray-500">
              {new Date(p.created_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {/* PAYMENT LINK */}
            {p.payment_link && (
              <div>
                <a
                  href={p.payment_link}
                  target="_blank"
                  className="border px-3 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon className="w-4 h-4 text-gray-600" />
                  Payment Link
                </a>
              </div>
            )}

            {/* FILE DOWNLOAD */}
            {p.file_url && (
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(p.file_url, "_blank");
                  }}
                  className="border px-3 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-gray-50"
                >
                  <DownloadIcon className="w-4 h-4 text-gray-600" />
                  Download Receipt
                </button>
              </div>
            )}
          </div>
        )}

      />


      {/* ------------------------- DOCUMENTS DRAWER ------------------------- */}
      <CommonDrawer
        open={drawerDocuments.open}
        onClose={() => setDrawerDocuments({ open: false, id: null })}
        apiUrl={
          drawerDocuments.id
            ? `/booking-documents/?booking=${drawerDocuments.id}&page_size=100`
            : null
        }
        heading="Documents"
        noDataMsg="No documents uploaded"
        noDataSubMsg="Upload related files such as reports or receipts"
        renderItem={(doc: any) => (
          <div
            key={doc.id}
            className=""
          >
            {/* HEADER ROW */}
            <div className="flex items-start justify-between">
              <div className="font-semibold text-gray-900 text-base">
                {doc.name}
              </div>

              {/* Chip */}
              <span className="px-2 py-1 text-xs rounded-full border border-primary text-primary uppercase">
                {doc.doc_type?.replace(/_/g, " ") || "OTHER"}
              </span>
            </div>

            {/* DESCRIPTION */}
            {doc.description && (
              <div className="text-sm text-gray-600 mt-1">
                {doc.description}
              </div>
            )}

            {/* META INFO */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <span>Uploaded by {doc.uploaded_by_name || "Unknown"}</span>
              <span>•</span>
              <span>
                {new Date(doc.created_at).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* DOWNLOAD BUTTON */}
            <div className="mt-3">
              <button
                onClick={() => window.open(doc.file_url, "_blank")}
                className="border px-3 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-gray-50"
              >
                <DownloadIcon className="w-5 h-5 text-gray-600 hover:text-primary" />
                Download
              </button>
            </div>
          </div>
        )}

      />

      {/* ------------------------- HISTORY DRAWER ------------------------- */}
      <CommonDrawer
        open={drawerHistory.open}
        onClose={() => setDrawerHistory({ open: false, id: null })}
        apiUrl={
          drawerHistory.id
            ? `/booking-actions/?booking=${drawerHistory.id}&page_size=100`
            : null
        }
        heading="Action History"
        noDataMsg="No history"
        noDataSubMsg="No actions logged for this booking"
        renderItem={(h: any) => (
          <div >

            {/* ACTION BADGE */}
            <span
              className={`
        inline-block px-2 py-0.5 rounded-full text-xs font-semibold
        ${h.action === "create"
                  ? "bg-green-100 text-green-700"
                  : h.action === "update"
                    ? "bg-blue-100 text-blue-700"
                    : h.action === "cancel"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                }
      `}
            >
              {h.action.toUpperCase()}
            </span>

            {/* USER */}
            <div className="text-sm text-gray-900 font-medium">
              {h.user_str}
            </div>

            {/* NOTES */}
            {h.notes && (
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {h.notes}
              </div>
            )}

            {/* TIMESTAMP */}
            <div className="text-xs text-gray-500">
              {new Date(h.created_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )}

      />
    </div>
  );
};

export default BookingsPage;
