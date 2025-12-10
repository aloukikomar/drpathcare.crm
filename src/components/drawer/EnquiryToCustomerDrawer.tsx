import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { customerApi } from "../../api/axios";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  enquiry: any | null;
}

export default function EnquiryToCustomerDrawer({
  open,
  onClose,
  enquiry,
}: Props) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------
  // AUTO-REDIRECT IF CUSTOMER ALREADY EXISTS
  // ----------------------------------------
  useEffect(() => {
    if (open && enquiry?.user) {
      navigate(`/bookings/create?customer=${enquiry.user}`);
      onClose();
    }
  }, [open, enquiry]);

  // ----------------------------------------
  // PREFILL FROM ENQUIRY
  // ----------------------------------------
  useEffect(() => {
    if (!open || !enquiry) return;

    setFirstName(enquiry.name || "");
    setLastName("");
    setEmail("");
    setGender("Male");
    setDob("");
    setAge("");

    setError(null);
  }, [open, enquiry]);

  // ----------------------------------------
  // SUBMIT: Convert → Redirect
  // ----------------------------------------
  const handleSubmit = async () => {
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!age.trim()) {
      setError("Age is required");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      enquiry_id: enquiry.id,
      first_name: firstName,
      last_name: lastName,
      email: email || "",
      gender,
      age,
      mobile: enquiry.mobile, // FIXED: Taken from enquiry
    };

    try {
      const res = await customerApi.post(
        `/crm/enquiries/${enquiry.id}/convert/`,
        payload
      );

      const userId = res?.user_id || res.data?.user_id;

      onClose();

      // ⭐ REDIRECT TO BOOKING PAGE
      navigate(`/bookings/create?customer=${userId}`);

    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to convert enquiry");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !enquiry) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[90] flex">
      <aside className="ml-auto w-full sm:w-[480px] bg-white h-full shadow-xl p-6 flex flex-col overflow-y-auto z-[100]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Convert Enquiry → Customer</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {/* Enquiry ID */}
        <label className="text-sm font-medium mb-1 block">Enquiry ID</label>
        <input
          value={enquiry.id}
          disabled
          className="w-full border px-3 py-2 rounded bg-gray-100 mb-3"
        />

        {/* Mobile (Disabled) */}
        <label className="text-sm font-medium mb-1 block">Mobile *</label>
        <input
          value={enquiry.mobile}
          disabled
          className="w-full border px-3 py-2 rounded bg-gray-100 mb-3"
        />

        {/* First Name */}
        <label className="text-sm font-medium mb-1 block">First Name *</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* Last Name */}
        <label className="text-sm font-medium mb-1 block">Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* Email */}
        <label className="text-sm font-medium mb-1 block">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* Gender */}
        <label className="text-sm font-medium mb-1 block">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        {/* Age */}
        <label className="text-sm font-medium mb-1 block">Age *</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-6"
        />

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <button onClick={onClose} className="flex-1 border py-2 rounded">
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={handleSubmit}
            className="flex-1 bg-primary text-white py-2 rounded font-medium disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Customer & Continue Booking"}
          </button>
        </div>
      </aside>
    </div>
  );
}
