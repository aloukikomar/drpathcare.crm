import React, { useState } from "react";
import CommonDrawer from "./CommonDrawer";
import { customerApi } from "../api/axios";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectCustomer: (c: any) => void;
  onSelectAddress: (a: any) => void;
}

export default function CustomerAddressDrawer({
  open,
  onClose,
  onSelectCustomer,
  onSelectAddress,
}: Props) {
  const [step, setStep] = useState<"customer" | "address">("customer");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // -------------------------------------------------
  // STEP 1 → Select CUSTOMER
  // -------------------------------------------------
  if (step === "customer") {
    return (
      <CommonDrawer
        open={open}
        onClose={() => {
          setStep("customer");
          onClose();
        }}
        apiUrl="/crm/users/"
        heading="Select Customer"
        subHeading="Search & choose a customer"
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          onSelectCustomer(customer);
          setStep("address");
        }}
        renderItem={(c) => (
          <div>
            <div className="font-medium">
              {c.first_name} {c.last_name}
            </div>
            <div className="text-sm text-gray-600">{c.mobile}</div>
            <div className="text-sm text-gray-500">{c.email}</div>
          </div>
        )}
      />
    );
  }

  // -------------------------------------------------
  // STEP 2 → Select ADDRESS
  // -------------------------------------------------
  return (
    <CommonDrawer
      open={open}
      onClose={() => {
        setStep("customer");
        onClose();
      }}
      apiUrl={`/crm/addresses/?customer=${selectedCustomer?.id}`}
      heading="Select Address"
      subHeading={
        selectedCustomer
          ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
          : ""
      }
      topContent={
        <button
          className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
          onClick={() => alert("Add New Address — future feature")}
        >
          + Add Address
        </button>
      }
      onSelect={(addr) => {
        onSelectAddress(addr);
        setStep("customer");
      }}
      renderItem={(a) => (
        <div>
          <div className="font-medium">{a.line1}</div>
          {a.line2 && (
            <div className="text-sm text-gray-600">{a.line2}</div>
          )}
          <div className="text-sm text-gray-500">
            {a.city}, {a.state} - {a.pincode}
          </div>

          {a.is_default && (
            <span className="text-xs text-green-600">Default</span>
          )}
        </div>
      )}
    />
  );
}
