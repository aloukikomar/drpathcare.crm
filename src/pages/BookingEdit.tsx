// src/pages/BookingEdit.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import CustomerDetailsSection from "../components/booking-create/CustomerDetailsSection";
import BookingDetailsSection from "../components/booking-create/BookingDetailsSection";
import ReviewSection from "../components/booking-create/ReviewSection";

import PatientTestsDrawer from "../components/PatientTestsDrawer";
import ChangesDrawer from "../components/booking-create/ChangesDrawer";

import { customerApi } from "../api/axios";
import type { ItemRow } from "./BookingCreate"; // Reuse interface
import { Home, TestTube2, ClipboardCheck, FileText, IndianRupee, Pencil, PhoneOutgoing, History, DownloadIcon, LinkIcon, RefreshCwIcon } from "lucide-react";
import FormDrawer from "../components/FormDrawer";
import CommonDrawer from "../components/CommonDrawer";
import BookingEditDrawer from "../components/BookingEditDrawer";

const ALL_TABS = [

    {
        index: 0,
        label: "Customer Details",
        icon: <Home className="w-5 h-5" />,
    },
    {
        index: 1,
        label: "Booking Details",
        icon: <TestTube2 className="w-5 h-5" />,
    },
    {
        index: 2,
        label: "Review & Confirm",
        icon: <ClipboardCheck className="w-5 h-5" />,
    },
];

const B_TABS = [
    {
        index: 2,
        label: "Review & Confirm",
        icon: <ClipboardCheck className="w-5 h-5" />,
    },
];


const BookingEdit: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<number>(0);

    // ================================
    // EDITABLE BOOKING STATE
    // ================================
    const [customer, setCustomer] = useState<any>(null);
    const [address, setAddress] = useState<any>(null);
    const [items, setItems] = useState<ItemRow[]>([]);

    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledSlot, setScheduledSlot] = useState("");

    const [adminDiscount, setAdminDiscount] = useState(0);
    const [couponDiscount, setCouponDiscount] = useState(0);

    // ================================
    // DRAWERS
    // ================================
    const [drawerTests, setDrawerTests] = useState(false);
    const [drawerChanges, setDrawerChanges] = useState(false);

    // ================================
    // ORIGINAL BOOKING SNAPSHOT
    // ================================
    const [originalBooking, setOriginalBooking] = useState<any>(null);

    // openPatientDrawer

    const [openPatientDrawer, setOpenPatientDrawer] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [tabs, setTabs] = useState(ALL_TABS)

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

    const visibleTabs = (status) => {
        if (!["sample_collected", "payment_collected", "report_uploaded", "health_manager", "dietitian", "completed", "cancelled"].includes(status)) return ALL_TABS;
        setActiveTab(2)
        return B_TABS;
    };

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

    // ================================
    // LOAD BOOKING DETAILS
    // ================================
    useEffect(() => {
        (async () => {
            try {
                const res = await customerApi.get(`/bookings/${id}/`);
                const data = res.data ?? res;

                setOriginalBooking(data);

                // Correct customer:
                setCustomer(data.user_detail);

                // Correct address:
                setAddress(data.address_detail);

                // Correct items:
                const mapped = (data.items || []).map((i: any) => {
                    let itemType: "lab_test" | "lab_package" = "lab_test";
                    let itemData = null;

                    if (i.lab_test_detail) {
                        itemType = "lab_test";
                        itemData = i.lab_test_detail;
                    } else if (i.package_detail) {
                        itemType = "lab_package";
                        itemData = i.package_detail;
                    }

                    return {
                        id: i.id,
                        itemType,
                        item: itemData,
                        price: i.base_price,
                        offer_price: i.offer_price,
                        patient: i.patient_detail,
                    };
                });

                setItems(mapped);

                // Correct schedule fields
                setScheduledDate(data.scheduled_date || "");
                setScheduledSlot(data.scheduled_time_slot || "");

                setAdminDiscount(Number(data.admin_discount || 0));
                setCouponDiscount(Number(data.coupon_discount || 0));
                setTabs(visibleTabs(data.status))

            } catch (err) {
                console.error(err);
                alert("Failed to load booking");
            }
        })();
    }, [id]);


    // ================================
    // COMPUTED TOTALS
    // ================================
    const baseSum = useMemo(
        () => items.reduce((s, i) => s + Number(i.price), 0),
        [items]
    );

    const offerSum = useMemo(
        () => items.reduce((s, i) => s + Number(i.offer_price), 0),
        [items]
    );

    // const coreDiscount = baseSum - offerSum;
    // const totalDiscount = coreDiscount + adminDiscount + couponDiscount;
    // const finalAmount = Math.max(0, baseSum - totalDiscount);

    const coreDiscount = baseSum - offerSum;

    const totalDiscount = adminDiscount + couponDiscount;

    const finalAmount = Math.max(
        0,
        offerSum - adminDiscount - couponDiscount
    );

    // ================================
    // UPDATE BOOKING
    // ================================
    const handleUpdateBooking = async (finalRemark: string) => {
        try {
            if (!originalBooking) return;

            const actions: string[] = [];
            const payload: any = {
                actions,
                remarks: finalRemark || "Updated from CRM",
            };

            // -----------------------------
            // 1️⃣ Schedule change
            // -----------------------------
            if (
                originalBooking.scheduled_date !== scheduledDate ||
                originalBooking.scheduled_time_slot !== scheduledSlot
            ) {
                actions.push("update_schedule");
                payload.scheduled_date = scheduledDate;
                payload.scheduled_time_slot = scheduledSlot;
            }

            // -----------------------------
            // 2️⃣ Items change
            // -----------------------------
            const originalItemIds = originalBooking.items.map((i: any) => i.id).sort();
            const updatedItemIds = items.map((i) => i.id).sort();

            const itemsChanged =
                originalItemIds.length !== updatedItemIds.length ||
                originalItemIds.some((id: number, i: number) => id !== updatedItemIds[i]);

            if (itemsChanged) {
                actions.push("update_items");
                payload.items = items.map((i) => ({
                    id: i.id,
                    patient: i.patient?.id,
                    base_price: i.price,
                    offer_price: i.offer_price,
                    product_type: i.itemType,
                    product_id: i.item?.id,
                }));
            }

            // -----------------------------
            // 3️⃣ Discount change
            // -----------------------------
            if (
                Number(originalBooking.admin_discount) !== adminDiscount ||
                Number(originalBooking.coupon_discount) !== couponDiscount
            ) {
                actions.push("update_discounts");
                payload.admin_discount = adminDiscount;
                payload.coupon = originalBooking.coupon?.id || null;
            }

            // -----------------------------
            // Nothing changed
            // -----------------------------
            if (actions.length === 0) {
                alert("No changes detected.");
                return;
            }

            // 🔥 SINGLE BULK CALL
            await customerApi.patch(`/bookings-bulk-update/${id}/`, payload);

            alert("Booking updated successfully!");
            navigate("/bookings");
        } catch (err) {
            console.error("Bulk update failed", err);
            alert("Failed to update booking");
        }
    };


    const goNext = () => setActiveTab((t) => Math.min(t + 1, ALL_TABS.length - 1));
    const goBack = () => setActiveTab((t) => Math.max(t - 1, 0));

    if (!originalBooking) {
        return <div className="p-6">Loading booking…</div>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* ================= MAIN ================= */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onMenuToggle={() => setSidebarOpen(true)}
                    title={`Edit Booking #${id}`}
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {/* TABS */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        {/* ================= LEFT: TABS ================= */}
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab, index) => {
                                const isActive = activeTab === tab.index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTab(tab.index)}
                                        className={`
            flex items-center gap-2 
            px-4 py-2 rounded-lg text-sm font-medium
            transition-all
            ${isActive
                                                ? "bg-primary text-white shadow"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ================= RIGHT: ACTION BUTTONS ================= */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">

                            <button
                                className="p-1 rounded-md hover:bg-gray-100"
                                title="Call"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMakeCall(originalBooking.id);
                                }}
                            >
                                <PhoneOutgoing className="w-5 h-5 text-gray-600 hover:text-primary" />
                            </button>

                            <button
                                className="p-1 rounded-md hover:bg-gray-100 cursor-pointer" title="Edit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDrawerEdit({ open: true, id: originalBooking.id, row: originalBooking })
                                }}
                            >
                                <Pencil className="w-5 h-5 text-gray-600 hover:text-primary" />
                            </button>

                            <button
                                className="p-1 hover:bg-gray-100 rounded"
                                title="History"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDrawerHistory({ open: true, id: originalBooking.id })
                                }}
                            >
                                <History className="w-5 h-5 text-gray-600 hover:text-primary" />
                            </button>

                            <button
                                className={`p-1 rounded-md ${(originalBooking.payment_count ?? 0) > 0
                                    ? "hover:bg-gray-100"
                                    : "opacity-40 cursor-not-allowed"
                                    }`}
                                disabled={!((originalBooking.payment_count ?? 0) > 0)}
                                title="Payments"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (originalBooking.payment_count ?? 0) > 0 && setDrawerPayments({ open: true, id: originalBooking.id })
                                }}
                            >
                                <IndianRupee className="w-5 h-5 text-gray-600 hover:text-primary" />
                            </button>

                            <button
                                className={`p-1 rounded-md ${(originalBooking.document_count ?? 0) > 0
                                    ? "hover:bg-gray-100"
                                    : "opacity-40 cursor-not-allowed"
                                    }`}
                                disabled={!((originalBooking.document_count ?? 0) > 0)}
                                title="Documents"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (originalBooking.document_count ?? 0) > 0 && setDrawerDocuments({ open: true, id: originalBooking.id })
                                }}
                            >
                                <FileText className="w-5 h-5 text-gray-600 hover:text-primary" />
                            </button>

                        </div>
                    </div>



                    {/* PANELS */}
                    <div className="space-y-6">
                        {/* CUSTOMER SECTION */}
                        {activeTab === 0 && (
                            <CustomerDetailsSection
                                mode="edit"
                                customer={customer}
                                address={address}
                                onSelectCustomer={setCustomer}
                                onSelectAddress={setAddress}
                                onContinue={goNext}
                                onOpenSelectCustomer={() => { }}
                            />
                        )}

                        {/* BOOKING DETAILS */}
                        {activeTab === 1 && (
                            <BookingDetailsSection
                                customer={customer}
                                items={items}
                                setItems={setItems}
                                scheduledDate={scheduledDate}
                                setScheduledDate={setScheduledDate}
                                scheduledSlot={scheduledSlot}
                                setScheduledSlot={setScheduledSlot}
                                onBack={goBack}
                                onContinue={goNext}
                                onOpenTestsDrawer={() => setDrawerTests(true)}
                            />
                        )}

                        {/* REVIEW */}
                        {activeTab === 2 && (
                            <ReviewSection
                                mode="edit"
                                onAdminDiscountChange={(v) => setAdminDiscount(v)}
                                customer={customer}
                                address={address}
                                items={items}
                                scheduledDate={scheduledDate}
                                scheduledSlot={scheduledSlot}
                                baseSum={baseSum}
                                offerSum={offerSum}
                                coreDiscount={coreDiscount}
                                adminDiscount={adminDiscount}
                                couponDiscount={couponDiscount}
                                totalDiscount={totalDiscount}
                                finalAmount={finalAmount}
                                onBack={goBack}
                                originalBooking={originalBooking}
                                onSubmit={() => setDrawerChanges(true)}
                            />
                        )}
                    </div>
                </main>

                {/* PATIENT TESTS DRAWER */}
                <PatientTestsDrawer
                    open={drawerTests}
                    onClose={() => setDrawerTests(false)}
                    customer={customer}
                    items={items}
                    setItems={setItems}
                    onOpenAddPatient={() => setOpenPatientDrawer(true)}
                    refreshKey={refreshKey}
                />
                <FormDrawer
                    open={openPatientDrawer}
                    onClose={() => setOpenPatientDrawer(false)}
                    heading="Add Patients"
                    apiUrl="/crm/patients/"
                    method="POST"
                    initialData={{ user: customer?.id }}
                    formFields={[
                        { name: "user", label: "User", type: "text", disabled: true },
                        { name: "first_name", label: "First Name", type: "text", required: true },
                        { name: "last_name", label: "Last Name", type: "text" },
                        {
                            name: "gender", label: "Gender", type: "select", options: [
                                { label: "Male", value: "Male" },
                                { label: "Female", value: "Female" },
                                { label: "Other", value: "Other" },
                            ]
                        },
                        { name: "age", label: "Age", type: "number", required: true },
                    ]}
                    onSuccess={() => {
                        setOpenPatientDrawer(false);
                        setRefreshKey(k => k + 1)
                    }}
                />

                {/* CHANGES CONFIRM DRAWER */}
                <ChangesDrawer
                    open={drawerChanges}
                    onClose={() => setDrawerChanges(false)}
                    original={originalBooking}
                    getUpdated={() => ({
                        customer,
                        address,
                        items,
                        scheduledDate,
                        scheduledSlot,
                        adminDiscount,
                        couponDiscount,
                        baseSum,
                        offerSum,
                        coreDiscount,
                        totalDiscount,
                        finalAmount,
                    })}
                    onConfirm={handleUpdateBooking}
                />
            </div>

            {/* ------------------------- EditBooking DRAWER ------------------------- */}
            <BookingEditDrawer
                open={drawerEdit.open}
                agentList={drawerEdit.row?.view_stack}
                refId={drawerEdit.row?.ref_id}
                onClose={() => setDrawerEdit({ open: false, id: null, row: null })}
                bookingId={drawerEdit.id}
                currentStatus={drawerEdit.row?.status}
                onSuccess={() => window.location.reload()}
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

export default BookingEdit;
