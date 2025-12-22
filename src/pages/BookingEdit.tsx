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
import { Home, TestTube2, ClipboardCheck } from "lucide-react";
import FormDrawer from "../components/FormDrawer";


const TABS = [
    {
        label: "Customer Details",
        icon: <Home className="w-5 h-5" />,
    },
    {
        label: "Booking Details",
        icon: <TestTube2 className="w-5 h-5" />,
    },
    {
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


    const goNext = () => setActiveTab((t) => Math.min(t + 1, TABS.length - 1));
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
                    <div className="mb-6 flex flex-wrap gap-2">
                        {TABS.map((tab, index) => {
                            const isActive = activeTab === index;

                            return (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`
                                                flex items-center justify-center gap-2 
                                                px-4 py-2 rounded-lg text-sm font-medium flex-1 sm:flex-none
                                                transition-all
                                                ${isActive ? "bg-primary text-white shadow" : "bg-gray-100 text-gray-700"}
                                                `}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
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
        </div>
    );
};

export default BookingEdit;
