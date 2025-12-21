import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { customerApi } from "../api/axios";
import {
  Search,
  X,
  User,
  Shield,
  Save,
  Phone,
  Mail,
  Users,
} from "lucide-react";

const ADMIN_ROLES = [1];

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [mode, setMode] = useState<"edit" | "create">("edit");

  // ======================================================
  // LOAD CURRENT USER
  // ======================================================
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const res = await customerApi.get(`/crm/users/${parsed.id}/`);
        setCurrentUser(res);
        setSelectedUser(res);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const isAdmin =
    currentUser &&
    ADMIN_ROLES.includes(
      typeof currentUser.role === "object"
        ? currentUser.role?.id
        : currentUser.role
    );

  // ======================================================
  // LOAD ROLES
  // ======================================================
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        setLoadingRoles(true);
        const res = await customerApi.get("/crm/roles/");
        setRoles(res.results || res.data || []);
      } finally {
        setLoadingRoles(false);
      }
    })();
  }, [isAdmin]);

  // ======================================================
  // SEARCH USERS
  // ======================================================
  useEffect(() => {
    if (!search || !isAdmin) {
      setSearchResults([]);
      return;
    }
    (async () => {
      try {
        const res = await customerApi.get(`/crm/users/?search=${search}`);
        setSearchResults(res.results || []);
      } catch { }
    })();
  }, [search, isAdmin]);

  const handleSave = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      if (mode === "create") {
        const res = await customerApi.post("/crm/users/", selectedUser);

        alert("User created successfully");
        setSelectedUser(res);
        setMode("edit"); // switch to edit after create
      } else {
        await customerApi.patch(`/crm/users/${selectedUser.id}/`, selectedUser);
        alert("Profile updated");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save user");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Settings" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {/* <Users className="w-6 h-6" />  */}
            User Settings
          </h2>

          {/* ===================== USER SELECT ===================== */}
          {isAdmin && (
            <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">

              {/* HEADER ROW */}
              <div className="flex items-center justify-between mb-4 gap-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Select User
                </h3>

                <button
                  onClick={() => {
                    setMode("create");
                    setSelectedUser({
                      first_name: "",
                      last_name: "",
                      mobile: "",
                      email: "",
                      gender: "Male",
                      age: null,
                      role: "",
                    });
                  }}
                  className="flex items-center gap-2 text-sm bg-primary text-white px-3 py-2 rounded-lg whitespace-nowrap"
                >
                  <Users className="w-4 h-4" />
                  Add User
                </button>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or mobile"
                  className="w-full border rounded-lg pl-10 pr-10 py-2"
                />

                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-2.5"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}

                {/* DROPDOWN */}
                {searchResults.length > 0 && (
                  <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                    {searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          setMode("edit");
                          setSearch("");
                          setSearchResults([]);
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium">
                          {u.first_name} {u.last_name}
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>{u.mobile}</span>
                          <span>{u.role_name || ""}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ===================== PROFILE ===================== */}
          {selectedUser && (
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {mode === "create" ? "Add New User" : "Profile Details"}
              </h3>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={selectedUser.first_name || ""}
                  onChange={(v) =>
                    setSelectedUser({ ...selectedUser, first_name: v })
                  }
                />

                <Input
                  label="Last Name"
                  value={selectedUser.last_name || ""}
                  onChange={(v) =>
                    setSelectedUser({ ...selectedUser, last_name: v })
                  }
                />

                <Input
                  label="Email"
                  icon={<Mail className="w-4 h-4" />}
                  value={selectedUser.email || ""}
                  onChange={(v) =>
                    setSelectedUser({ ...selectedUser, email: v })
                  }
                />

                <Input
                  label="Mobile"
                  icon={<Phone className="w-4 h-4" />}
                  value={selectedUser.mobile}
                  onChange={(v) =>
                    setSelectedUser({ ...selectedUser, mobile: v })
                  }
                  disabled={currentUser.role.name == 'Admin' ? true : false}
                />

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Gender
                  </label>
                  <select
                    className="w-full border px-3 py-2 rounded-lg"
                    value={selectedUser.gender || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        gender: e.target.value,
                      })
                    }
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>


                {/* AGE ✅ RESTORED */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Age</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border px-3 py-2 rounded-lg"
                    value={selectedUser.age ?? ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        age: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Role
                  </label>
                  {isAdmin ? (
                    <select
                      className="w-full border px-3 py-2 rounded-lg"
                      value={selectedUser.role ?? ""}
                      disabled={loadingRoles}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          role: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">— Select Role —</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100"
                      value={selectedUser.role_name || "—"}
                    />
                  )}
                </div>
              </div>


              {/* SAVE */}
              <div className="mt-6 flex justify-end">

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ===================== Small Input Helper ===================== */
function Input({
  label,
  value,
  onChange,
  disabled,
  icon,
}: any) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-2.5 text-gray-400">{icon}</div>}
        <input
          disabled={disabled}
          className={`w-full border px-3 py-2 rounded-lg ${icon ? "pl-9" : ""
            } ${disabled ? "bg-gray-100" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
