import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CustomerAddressDrawer from "../components/CustomerAddressDrawer";
import PatientTestsDrawer from "../components/PatientTestsDrawer";
import { customerApi } from "../api/axios";
import { TIME_SLOTS, isSlotExpired } from "../utils/timeSlots";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";


// --- Components (we will create these next) ---
import CustomerDetailsSection from "../components/booking-create/CustomerDetailsSection";
import BookingDetailsSection from "../components/booking-create/BookingDetailsSection";
import ReviewSection from "../components/booking-create/ReviewSection";

export interface ItemRow {
    id: number;
    patient: any;
    itemType: "lab_test" | "lab_package";
    item: any;
    price: string;
    offer_price: string;
}


const BookingCreate: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [searchParams] = useSearchParams();
    const customerParam = searchParams.get("customer");

    // -------------- booking data --------------
    const [customer, setCustomer] = useState<any>(null);
    const [address, setAddress] = useState<any>(null);
    const [items, setItems] = useState<ItemRow[]>([]);

    const baseSum = useMemo(() => items.reduce((s, i) => s + Number(i.price), 0), [items]);
    const offerSum = useMemo(() => items.reduce((s, i) => s + Number(i.offer_price), 0), [items]);

    const coreDiscount = baseSum - offerSum;
    const [adminDiscount, setAdminDiscount] = useState(0);
    const [couponDiscount, setCouponDiscount] = useState(0);

    const totalDiscount = coreDiscount + adminDiscount + couponDiscount;
    const finalAmount = Math.max(0, baseSum - totalDiscount);

    // schedule
    const today = new Date().toISOString().split("T")[0];
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledSlot, setScheduledSlot] = useState("");

    // drawers
    const [drawerCustomer, setDrawerCustomer] = useState(false);
    const [drawerTests, setDrawerTests] = useState(false);

    // -------------- parent tab navigation --------------
    const goNext = () => setActiveTab((prev) => prev + 1);
    const goBack = () => setActiveTab((prev) => prev - 1);


    // -------------- create booking --------------
    const handleCreateBooking = async () => {
        try {
            const payload = {
                user: customer.id,
                address: address.id,
                scheduled_date: scheduledDate,
                scheduled_time_slot: scheduledSlot,
                admin_discount: adminDiscount,
                coupon_discount: couponDiscount,
                discount_amount: totalDiscount,
                base_total: baseSum,
                offer_total: offerSum,
                final_amount: finalAmount,
                total_savings: baseSum - finalAmount,
                remarks: "Created from CRM",
                items: items.map((i) => ({
                    patient: i.patient?.id,
                    base_price: i.price,
                    offer_price: i.offer_price,
                    product_type: i.itemType,
                    product_id: i.item?.id,
                })),
            };

            const res = await customerApi.post("/bookings/", payload);
            if (res?.id) {
                alert("Booking created!");
                window.location.href = "/bookings";
            }
        } catch (err) {
            console.error(err);
            alert("Failed to create booking");
        }
    };
    useEffect(() => {
        if (!customerParam) return;

        async function fetchCustomer() {
            try {
                const res = await customerApi.get(`/crm/users/${customerParam}/`);
                if (res && res.id) {
                    setCustomer(res);
                }
            } catch (err) {
                console.error("Failed to fetch customer", err);
            }
        }

        fetchCustomer();
    }, [customerParam]);
    // -----------------------------------------
    // ------------ UI RENDER ------------------
    // -----------------------------------------
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Create Booking" onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">

                    {/* ---- Tab Buttons ---- */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["Customer Details", "Booking Details", "Review & Confirm"].map(
                            (label, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 sm:flex-none text-center
                  ${activeTab === index
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {label}
                                </button>
                            )
                        )}
                    </div>

                    {/* ---- STEP SECTIONS ---- */}
                    {activeTab === 0 && (
                        <CustomerDetailsSection
                            mode="create"
                            customer={customer}
                            address={address}
                            onSelectCustomer={(c) => {
                                setCustomer(c);
                                setAddress(null);
                            }}
                            onSelectAddress={setAddress}
                            onContinue={() => goNext()}
                            onOpenSelectCustomer={() => setDrawerCustomer(true)}
                        />
                    )}

                    {activeTab === 1 && (
                        <BookingDetailsSection
                            items={items}
                            setItems={setItems}
                            customer={customer}
                            scheduledDate={scheduledDate}
                            scheduledSlot={scheduledSlot}
                            setScheduledDate={setScheduledDate}
                            setScheduledSlot={setScheduledSlot}
                            onOpenTestsDrawer={() => setDrawerTests(true)}
                            onBack={goBack}
                            onContinue={goNext}
                        />
                    )}

                    {activeTab === 2 && (
                        <ReviewSection
                            mode="create"
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
                            onSubmit={handleCreateBooking}
                        />

                    )}
                </main>
            </div>

            {/* Drawers */}
            <CustomerAddressDrawer
                open={drawerCustomer}
                onClose={() => setDrawerCustomer(false)}
                onSelectCustomer={(c) => {
                    setCustomer(c);
                    setAddress(null);
                }}
                onSelectAddress={setAddress}
            />

            {customer && (
                <PatientTestsDrawer
                    open={drawerTests}
                    onClose={() => setDrawerTests(false)}
                    customer={customer}
                    items={items}
                    setItems={setItems}
                />
            )}
        </div>
    );
};

export default BookingCreate;
