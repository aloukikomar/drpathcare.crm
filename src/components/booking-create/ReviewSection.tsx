import React, { useMemo, useState } from "react";
import {
  CheckCircle,
  Mail,
  Phone,
  User,
  HomeIcon,
  CalendarIcon,
} from "lucide-react";
import type { ItemRow } from "../../pages/BookingCreate";

interface Props {
  mode: "create" | "edit";
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

  onAdminDiscountChange: (value: number) => void;

  onBack: () => void;
  onSubmit: () => void;
}

const ReviewSection: React.FC<Props> = ({
  mode,
  customer,
  address,
  items,
  scheduledDate,
  scheduledSlot,

  baseSum,
  offerSum,
  coreDiscount,
  adminDiscount,
  couponDiscount,
  totalDiscount,
  finalAmount,

  onAdminDiscountChange,
  onBack,
  onSubmit,
}) => {
  // ----------------------------------
  // USER + PERMISSION LOGIC
  // ----------------------------------
  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const maxAmount = Number(currentUser?.role?.max_amount || 0);
  const maxPercentage = Number(currentUser?.role?.max_percentage || 0);

  const maxByPercentage = useMemo(
    () => (offerSum * maxPercentage) / 100,
    [offerSum, maxPercentage]
  );

  const maxAdminDiscount = Math.min(maxAmount, maxByPercentage);

  const [adminInput, setAdminInput] = useState<number>(adminDiscount || 0);

  const adminDisabled =
    adminInput <= 0 || adminInput > maxAdminDiscount;

  // ----------------------------------
  // RENDER
  // ----------------------------------
  return (
    <section className="bg-white p-4 lg:p-6 border rounded-lg shadow-sm space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Review & Confirm</h2>
      </div>

      {/* CUSTOMER */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-1">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Customer
        </h3>

        <div className="bg-white border rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <User className="w-5 h-5 text-gray-600" />
          </div>

          {customer ? (
            <div className="text-sm space-y-1">
              <p className="font-semibold">
                {customer.first_name} {customer.last_name}
              </p>

              <div className="flex flex-wrap gap-3 text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {customer.mobile}
                </span>

                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </span>
                )}

                {customer.age !== null && (
                  <span>Age: {customer.age}</span>
                )}

                {customer.gender && (
                  <span>Gender: {customer.gender}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No customer selected</p>
          )}
        </div>
      </div>

      {/* ADDRESS */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-1">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Address
        </h3>

        <div className="bg-white border rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <HomeIcon className="w-5 h-5 text-gray-600" />
          </div>

          {address ? (
            <div className="text-sm">
              <p className="font-semibold">{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p className="text-gray-600">
                {address.city}, {address.state} – {address.pincode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No address selected</p>
          )}
        </div>
      </div>

      {/* SCHEDULE */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-1">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Schedule
        </h3>

        <div className="bg-white border rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
          </div>

          {scheduledDate ? (
            <div className="text-sm">
              <p className="font-semibold">{scheduledDate}</p>
              <p className="text-gray-600">{scheduledSlot}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No schedule selected</p>
          )}
        </div>
      </div>

      {/* TESTS */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Tests & Patients ({items.length})
        </h3>

        {items.map((it) => (
          <div
            key={it.id}
            className="p-3 border rounded bg-white flex justify-between text-sm"
          >
            <div>
              <p className="font-medium">{it.item?.name}</p>
              <p className="text-gray-600">
                {it.patient?.first_name} {it.patient?.last_name} |{" "}
                {it.patient?.age} | {it.patient?.gender}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">₹{it.offer_price}</p>
              {it.offer_price !== it.price && (
                <p className="text-xs line-through text-gray-500">
                  ₹{it.price}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN DISCOUNT */}
      {currentUser?.role && maxAdminDiscount > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Admin Discount
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              min={0}
              max={maxAdminDiscount}
              value={adminInput}
              onChange={(e) =>
                setAdminInput(Number(e.target.value) || 0)
              }
              className="w-full sm:w-40 border px-3 py-2 rounded text-sm"
            />

            <button
              disabled={adminDisabled}
              onClick={() => onAdminDiscountChange(adminInput)}
              className="px-4 py-2 bg-[#635bff] text-white rounded text-sm disabled:opacity-50"
            >
              Apply
            </button>
          </div>

          <p className="text-xs text-gray-600">
            Max discount allowed: <strong>₹{maxAdminDiscount}</strong>{" "}
            ({maxPercentage}% of ₹{offerSum} or ₹{maxAmount})
          </p>

          {adminInput > maxAdminDiscount && (
            <p className="text-xs text-red-600">
              Discount exceeds allowed limit
            </p>
          )}
        </div>
      )}

      {/* PRICING */}
      <div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-1">
        <h3 className="font-semibold mb-2">Pricing Summary</h3>

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

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button onClick={onBack} className="px-4 py-2 border rounded">
          Back
        </button>

        <button
          onClick={onSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded shadow"
        >
          {mode === "create" ? "Create Booking" : "Update Booking"}
        </button>
      </div>
    </section>
  );
};

export default ReviewSection;
