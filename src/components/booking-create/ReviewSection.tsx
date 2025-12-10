import React from "react";
import { CheckCircle, Mail, Phone, User, HomeIcon, CalendarIcon } from "lucide-react";
import type { ItemRow } from "../../pages/BookingCreate";

interface Props {
    mode:"create"|"edit"
    customer: any;
    address: any;
    items: ItemRow[];
    scheduledDate: string;
    scheduledSlot: string;

    baseSum: number;
    offerSum: number;
    coreDiscount: number;
    adminDiscount: number;
    couponDiscount: number;
    totalDiscount: number;
    finalAmount: number;

    onBack: () => void;
    onSubmit: () => void;
}

const ReviewSection: React.FC<Props> = ({
    customer,
    address,
    items,
    scheduledDate,
    scheduledSlot,
    mode,
    baseSum,
    offerSum,
    coreDiscount,
    adminDiscount,
    couponDiscount,
    totalDiscount,
    finalAmount,

    onBack,
    onSubmit,
}) => {
    return (
        <section className="bg-white p-4 lg:p-6 border rounded-lg shadow-sm space-y-6">

            {/* ----------------- HEADER ----------------- */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Review & Confirm</h2>
            </div>

            {/* CUSTOMER PANEL */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-1">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Customer
                </h3>
                <div className="bg-white border rounded-lg p-4 flex items-start gap-3 shadow-sm">

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">

                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-bold">
                                {customer?.first_name} {customer?.last_name}
                            </span>
                        </div>
                    {customer ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-gray-600" />
                            <span>{customer?.mobile}</span>
                        </div>

                        {customer?.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-gray-600" />
                                <span>{customer?.email}</span>
                            </div>
                        )}

                        {customer?.age !== null && (
                            <span className="text-gray-700">Age: {customer?.age}</span>
                        )}

                        {customer?.gender && (
                            <span className="text-gray-700">Gender: {customer?.gender}</span>
                        )}
                    </div>) : (
                        <p className="text-sm text-gray-400">No customer selected</p>
                    )}
                    </div>
                </div>
            </div>


            {/* ADDRESS PANEL */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-1">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Address
                </h3>
                <div className="bg-white border rounded-lg p-4 flex items-start gap-3 shadow-sm">

                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
                        <HomeIcon className="w-5 h-5 text-gray-600" />
                    </div>

                    {/* Details */}
                    {address ? (<div className="flex-1 text-sm">
                        <span className="font-semibold text-gray-800">{address?.line1}</span>

                        {address?.line2 && (
                            <span className="text-gray-600">, {address.line2}</span>
                        )}

                        <div className="text-gray-600">
                            {address?.city}, {address?.state} – {address?.pincode}
                        </div>
                    </div>) : (
                        <p className="text-sm text-gray-400">No address selected</p>
                    )}
                </div>
            </div>

            {/* ----------------- SCHEDULE ----------------- */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-1">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Schedule
                </h3>
                <div className="bg-white border rounded-lg p-4 flex items-start gap-3 shadow-sm">

                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
                        <CalendarIcon className="w-5 h-5 text-gray-600" />
                    </div>

                    {/* Details */}
                    {scheduledDate ? (<div className="flex-1 text-sm">
                        <div className="font-semibold text-gray-800">{scheduledDate}</div>

                        <div className="text-gray-600">
                            {scheduledSlot}
                        </div>
                    </div>) : (
                        <p className="text-sm text-gray-400">No schedule selected</p>
                    )}
                </div>
            </div>

            {/* ----------------- ITEMS ----------------- */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Tests & Patients ({items.length})
                </h3>

                {items.length === 0 ? (
                    <p className="text-sm text-gray-400">No items added</p>
                ) : (
                    <div className="space-y-2">
                        {items.map((it, idx) => (
                            <div
                                key={it.id}
                                className="p-3 border rounded bg-white text-sm flex justify-between items-start"
                            >
                                <div>
                                    <p className="font-medium">
                                        {it.item?.name || "Test"}
                                    </p>
                                    <p className="text-gray-600">
                                        Patient:{" "}
                                        <span className="font-medium">
                                            {it.patient?.first_name} {it.patient?.last_name}
                                        </span>
                                    </p>
                                    <p className="text-gray-500 text-xs capitalize">
                                        {it.itemType.replace("_", " ")}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">₹{it.offer_price}</p>
                                    {it.offer_price !== it.price && (
                                        <p className="line-through text-xs text-gray-500">₹{it.price}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* ----------------- PRICING ----------------- */}
            <div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-1">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Pricing Summary</h3>

                <div className="flex justify-between">
                    <span>Base Total</span>
                    <span>₹{baseSum}</span>
                </div>

                <div className="flex justify-between">
                    <span>Offer Total</span>
                    <span>₹{offerSum}</span>
                </div>

                <div className="flex justify-between text-green-600">
                    <span>Core Discount</span>
                    <span>-₹{coreDiscount}</span>
                </div>

                {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-₹{couponDiscount}</span>
                    </div>
                )}

                {adminDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Admin Discount</span>
                        <span>-₹{adminDiscount}</span>
                    </div>
                )}

                <div className="flex justify-between font-medium mt-2">
                    <span>Total Discount</span>
                    <span>-₹{totalDiscount}</span>
                </div>

                <div className="flex justify-between font-semibold text-lg mt-1">
                    <span>Final Amount</span>
                    <span>₹{finalAmount}</span>
                </div>
            </div>

            {/* ----------------- ACTION BUTTONS ----------------- */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={onBack}
                    className="px-4 py-2 border rounded text-sm"
                >
                    Back
                </button>

                <button
                    onClick={onSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded text-sm shadow hover:bg-green-700"
                >
                    {mode=="create"?"Create Booking":"Update Booking"}
                </button>
            </div>
        </section>
    );
};

export default ReviewSection;
