import React, { useEffect, useState, useMemo } from "react";
import { customerApi } from "../../api/axios";
import FormDrawer from "../FormDrawer";
import { Pencil, User, Phone, Mail } from "lucide-react";
import AddressDrawer from "../drawer/AddressDrawer";

/**
 * Address shape — allow optional fields while creating
 */
interface Address {
  id?: number;
  customer?: number;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_default?: boolean;
}

interface Props {
  mode: "create" | "edit";
  customer: any;
  address: Address | null;

  onSelectCustomer: (customer: any) => void;
  onSelectAddress: (addr: Address | null) => void;

  onContinue: () => void;
  onOpenSelectCustomer: () => void;
}

const CustomerDetailsSection: React.FC<Props> = ({
  mode,
  customer,
  address,
  onSelectCustomer,
  onSelectAddress,
  onContinue,
  onOpenSelectCustomer,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // make shape explicit so we never pass `undefined` into drawers
  const [addressDrawer, setAddressDrawer] = useState<{
    open: boolean;
    editing: Address | null;
  }>({ open: false, editing: null });

  const [addCustomerDrawer, setAddCustomerDrawer] = useState(false);
  const [editCustomerDrawer, setEditCustomerDrawer] = useState(false);

  // compute age safely
  const age = useMemo(() => {
    if (!customer?.date_of_birth) return null;
    const dob = new Date(customer.date_of_birth);
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
  }, [customer]);

  // fetch addresses whenever customer changes
  useEffect(() => {
    if (!customer?.id) {
      setAddresses([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingAddresses(true);
      try {
        const res = await customerApi.get("/crm/addresses/", {
          params: { customer: customer.id },
        });
        // backend could return in various shapes
        const list = res.results || res.data || res;
        if (!cancelled) setAddresses(list || []);
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        if (!cancelled) setLoadingAddresses(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customer]);

  const getUserRole = () => {
    const user = localStorage.getItem('user')
    if (user) {

      const parsed = JSON.parse(user);
      return parsed?.role?.name
    }
  }

  const canContinue = !!customer && !!address;

  // If mode toggles between create/edit, ensure drawers close/reset
  useEffect(() => {
    setAddCustomerDrawer(false);
    setAddressDrawer({ open: false, editing: null });
  }, [mode]);

  // Helper to open add-customer drawer reliably (re-mount if needed)
  const openAddCustomer = () => {
    setAddCustomerDrawer(false);
    // slight delay to ensure re-mount if it was already open
    setTimeout(() => setAddCustomerDrawer(true), 0);
  };
  // Helper to open add-customer drawer reliably (re-mount if needed)
  const openEditCustomer = () => {
    setEditCustomerDrawer(false);
    // slight delay to ensure re-mount if it was already open
    setTimeout(() => setEditCustomerDrawer(true), 0);
  };


  // Helper to open address drawer for create (pass customer id) or edit (pass editing)
  const openAddressCreate = () => {
    setAddressDrawer({ open: false, editing: null });
    setTimeout(() => setAddressDrawer({ open: true, editing: { customer: customer?.id } }), 0);
  };

  return (
    <section className="bg-white p-4 border rounded-lg shadow-sm space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {mode === "edit" ? "Customer" : "Customer Details"}
          </h2>
          <p className="text-sm text-gray-500">
            {mode === "edit" ? "Customer cannot be changed in edit mode" : "Select or create a customer"}
          </p>
        </div>

        {mode === "create" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onOpenSelectCustomer}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
            >
              Select Customer
            </button>

            <button
              type="button"
              onClick={openEditCustomer}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm border"
            >
              + Add Customer
            </button>
          </div>
        )}
      </div>

      {/* CUSTOMER CARD */}
      {customer ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-gray-900" />
              <span className="font-bold">{customer.first_name} {customer.last_name}</span>
            </div>

            {getUserRole() != 'Phlebo' &&
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <span>{customer.mobile}</span>
              </div>
            }
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <span>{customer.email}</span>
              </div>
            )}

            {age !== null && <span>Age: {age}</span>}
            {customer.gender && <span>Gender: {customer.gender}</span>}
          </div>

          {/* {mode === "create" && ( */}
          <button type="button" className="p-2 hover:bg-gray-200 rounded" onClick={openAddCustomer}>
            <Pencil className="w-5 h-5 text-gray-700" />
          </button>
          {/* )} */}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No customer selected</p>
      )}

      {/* ADDRESS SECTION */}
      {customer && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Select Address</h3>

            <button
              type="button"
              onClick={openAddressCreate}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm border"
            >
              + Add Address
            </button>
          </div>

          {loadingAddresses && <div className="text-sm text-gray-500 py-2">Loading…</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addresses.map((addr) => {
              const selected = address?.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr)}
                  className={`relative border rounded-lg p-3 cursor-pointer transition ${selected ? "border-indigo-600 shadow" : "border-gray-300 hover:border-indigo-500"
                    }`}
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddressDrawer({ open: true, editing: addr });
                    }}
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>

                  <p className="font-medium">{addr.line1}</p>
                  {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}

                  <p className="text-sm mt-1">
                    {(addr.city ?? "") + (addr.state ? `, ${addr.state}` : "") + (addr.pincode ? ` – ${addr.pincode}` : "")}
                  </p>

                  {addr.is_default && <p className="text-xs text-green-600 mt-1">✓ Default</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTINUE */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className={`px-6 py-2 rounded text-white text-sm ${canContinue ? "bg-primary hover:bg-primary/90" : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>

      {/* CUSTOMER FORM DRAWER (create/edit) */}
      <FormDrawer
        // key ensures remount when toggled quickly
        key={addCustomerDrawer ? "customer-form-open" : "customer-form-closed"}
        open={addCustomerDrawer}
        onClose={() => setAddCustomerDrawer(false)}
        method={customer ? "PATCH" : "POST"}
        heading={customer ? "Edit Customer" : "Add Customer"}
        apiUrl={customer ? `/crm/users/${customer.id}/` : "/crm/users/"}
        initialData={customer || {}}
        formFields={[
          { name: "first_name", label: "First Name", type: "text", required: true },
          { name: "last_name", label: "Last Name", type: "text" },
          { name: "email", label: "Email", type: "text" },
          {
            name: "mobile",
            label: "Mobile Number",
            type: "text",
            required: true,
            placeholder: "10 digit mobile number",
            numericOnly: true,
            minLength: 10,
            maxLength: 10,
            pattern: /^[0-9]{10}$/,
            patternMessage: "Mobile number must be exactly 10 digits",
            helper: "Enter a valid 10 digit Indian mobile number",
          },
          {
            name: "gender", label: "Gender", type: "select", default: "Male", options: [
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]
          },
          { name: "age", label: "Age", type: "number", required: true },
        ]}
        onSuccess={(updatedCustomer: any) => {
          onSelectCustomer(updatedCustomer);
          setAddCustomerDrawer(false);
        }}
      />

      {/* CUSTOMER FORM DRAWER (create/edit) */}
      <FormDrawer
        // key ensures remount when toggled quickly
        key={editCustomerDrawer ? "customer-form-open" : "customer-form-closed"}
        open={editCustomerDrawer}
        onClose={() => setEditCustomerDrawer(false)}
        method={"POST"}
        heading={"Add Customer"}
        apiUrl={"/crm/users/"}
        formFields={[
          { name: "first_name", label: "First Name", type: "text", required: true },
          { name: "last_name", label: "Last Name", type: "text" },
          { name: "email", label: "Email", type: "text" },
          {
            name: "mobile",
            label: "Mobile Number",
            type: "text",
            required: true,
            placeholder: "10 digit mobile number",
            numericOnly: true,
            minLength: 10,
            maxLength: 10,
            pattern: /^[0-9]{10}$/,
            patternMessage: "Mobile number must be exactly 10 digits",
            helper: "Enter a valid 10 digit Indian mobile number",
          },
          {
            name: "gender", label: "Gender", type: "select", default: "Male", options: [
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]
          },
          { name: "age", label: "Age", type: "number", required: true },
        ]}
        onSuccess={(updatedCustomer: any) => {
          onSelectCustomer(updatedCustomer);
          setEditCustomerDrawer(false);
        }}
      />

      {/* ADDRESS DRAWER — pass customerId explicitly and use key so it remounts */}
      <AddressDrawer
        key={addressDrawer.open ? `addr-${addressDrawer.editing?.id ?? "new"}` : "addr-closed"}
        open={addressDrawer.open}
        onClose={() => setAddressDrawer({ open: false, editing: null })}
        address={addressDrawer.editing ?? { customer: customer?.id }}
        customerId={customer?.id ?? null}
        onSaved={(savedAddr: Address) => {
          setAddresses((prev) => {
            const idx = prev.findIndex((a) => a.id === savedAddr.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = savedAddr;
              return updated;
            }
            return [savedAddr, ...prev];
          });

          onSelectAddress(savedAddr);
          setAddressDrawer({ open: false, editing: null });
        }}
      />
    </section>
  );
};

export default CustomerDetailsSection;
