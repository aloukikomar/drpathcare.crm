// src/components/address/AddressDrawer.tsx
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { customerApi } from "../../api/axios";

interface LocationOption {
  id: number;
  city: string;
  state: string;
  pincode: string;
}

interface UserOption {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;

  /** address for edit mode OR {} for create */
  address?: any | null;

  /** When creating address inside booking flow */
  customerId?: number | null;

  onSaved?: (a: any) => void;
}

export default function AddressDrawer({
  open,
  onClose,
  address,
  customerId,
  onSaved,
}: Props) {
  const isEdit = Boolean(address?.id);

  const [userQuery, setUserQuery] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [locationQuery, setLocationQuery] = useState("");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ------------------------------------------------------------
  // Prefill form
  // ------------------------------------------------------------
  useEffect(() => {
    if (!open) return;

    setError(null);
    setSaving(false);

    if (isEdit) {
      // Prefill user from address
      setSelectedUser({
        id: address.user,
        first_name: address.user_name,
        last_name: "",
        mobile: address.user_mobile,
        email: address.user_email ?? "",
      });
      setUserQuery(`${address.user_name} (${address.user_mobile})`);

      // Prefill address fields
      setLine1(address.line1 || "");
      setLine2(address.line2 || "");
      setIsDefault(address.is_default || false);

      // Prefill location
      if (address.location) {
        setSelectedLocation(address.location);
        setLocationQuery(
          `${address.location.city}, ${address.location.state} - ${address.location.pincode}`
        );
      }
    } else {
      // CREATE MODE — if customerId exists → auto-select customer
      if (customerId) {
        setSelectedUser(null);
        setUserQuery("Customer Selected (Booking)");
        setUserOptions([]);
      } else {
        setSelectedUser(null);
        setUserQuery("");
      }

      setLine1("");
      setLine2("");
      setIsDefault(false);
      setSelectedLocation(null);
      setLocationQuery("");
    }
  }, [open, address, customerId]);

  // ------------------------------------------------------------
  // Customer search (ONLY if not coming from booking & customerId not given)
  // ------------------------------------------------------------
  useEffect(() => {
    if (isEdit || customerId) return; // skip search

    if (userQuery.length < 2) {
      setUserOptions([]);
      return;
    }

    let active = true;

    (async () => {
      try {
        const res = await customerApi.get(
          `/crm/users/?search=${encodeURIComponent(userQuery)}`
        );
        if (active)
          setUserOptions(res.results || res.data?.results || res.data || []);
      } catch (err) {
        console.error("User search failed", err);
      }
    })();

    return () => {
      active = false;
    };
  }, [userQuery, customerId, isEdit]);

  // ------------------------------------------------------------
  // Location search
  // ------------------------------------------------------------
  useEffect(() => {
    if (locationQuery.length < 2) {
      setLocationOptions([]);
      return;
    }

    let active = true;

    (async () => {
      try {
        const res = await customerApi.get(
          `/client/location/?search=${encodeURIComponent(locationQuery)}`
        );
        const list = res.results || res.data?.results || res.data || [];
        if (active) setLocationOptions(list);
      } catch (err) {
        console.error("Location search failed", err);
      }
    })();

    return () => {
      active = false;
    };
  }, [locationQuery]);

  // ------------------------------------------------------------
  // Save Handler
  // ------------------------------------------------------------
  const handleSave = async () => {
    if (!isEdit && !customerId && !selectedUser) {
      setError("Select a customer first");
      return;
    }

    if (!line1.trim() || !selectedLocation) {
      setError("Line 1 and Location are required");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: any = {
      line1,
      line2,
      is_default: isDefault,
      location_id: selectedLocation.id,
    };

    // include user_id for CREATE (either selectedUser or customerId)
    if (!isEdit) {
      payload.user_id = customerId ?? selectedUser?.id;
    }

    try {
      const res = isEdit
        ? await customerApi.patch(`/crm/addresses/${address.id}/`, payload)
        : await customerApi.post(`/crm/addresses/`, payload);

      onSaved?.(res.data ?? res);
      onClose();
    } catch (err: any) {
      setError(err?.serverMessage || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="fixed !mt-0 inset-0 bg-black/40 z-[90] flex">
      <aside className="ml-auto w-full sm:w-[480px] bg-white h-full shadow-xl p-5 flex flex-col overflow-y-auto z-[100]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Address" : "Add New Address"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        {/* CUSTOMER SEARCH — ONLY WHEN customerId is NOT given */}
        {!isEdit && !customerId && (
          <div className="relative mb-4">
            <label className="text-sm font-medium mb-1 block">Customer *</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Search name or mobile"
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                setSelectedUser(null);
              }}
            />

            {userOptions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border rounded shadow max-h-48 overflow-y-auto z-[200]">
                {userOptions.map((u) => (
                  <div
                    key={u.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSelectedUser(u);
                      setUserQuery(`${u.first_name} ${u.last_name} (${u.mobile})`);
                      setUserOptions([]);
                    }}
                  >
                    {u.first_name} {u.last_name} — {u.mobile}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADDRESS FIELDS */}
        <label className="text-sm mb-1">Line 1 *</label>
        <input
          className="w-full border px-3 py-2 rounded mb-3"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
        />

        <label className="text-sm mb-1">Line 2</label>
        <input
          className="w-full border px-3 py-2 rounded mb-3"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
        />

        {/* LOCATION */}
        <label className="text-sm font-medium mb-1">Location *</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Search pincode"
          value={locationQuery}
          onChange={(e) => {
            setLocationQuery(e.target.value);
            setSelectedLocation(null);
          }}
        />

        {locationOptions.length > 0 && (
          <div className="bg-white border rounded shadow max-h-48 overflow-y-auto z-[200] relative">
            {locationOptions.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc);
                  setLocationQuery(
                    `${loc.city}, ${loc.state} - ${loc.pincode}`
                  );
                  setLocationOptions([]);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {loc.city}, {loc.state} - {loc.pincode}
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 my-4 text-sm">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          Set as default address
        </label>

        <div className="flex gap-3 mt-auto">
          <button onClick={onClose} className="flex-1 border py-2 rounded">
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-white rounded py-2 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </aside>
    </div>
  );
}
