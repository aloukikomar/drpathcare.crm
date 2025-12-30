import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TabNavigation from "../components/TabNavigation";
import DataTable from "../components/DataTable";
import FormDrawer from "../components/FormDrawer";
import AddressDrawer from "../components/drawer/AddressDrawer";
import type { FormField } from "../components/FormDrawer";
import { Pencil, PhoneOutgoing } from "lucide-react";
import { customerApi } from "../api/axios";

const Customers: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");

  // -----------------------------
  // Form Drawer (Customers + Patients)
  // -----------------------------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerConfig, setDrawerConfig] = useState<{
    heading: string;
    apiUrl: string | null;
    method: "PATCH" | "POST";
    initialData: any;
    fields: FormField[];
  }>({
    heading: "",
    apiUrl: null,
    method: "POST",
    initialData: {},
    fields: [],
  });

  // -----------------------------
  // Address Drawer
  // -----------------------------
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [addressCreateCustomerId, setAddressCreateCustomerId] = useState<number | null>(null);

  // Refresh Key
  const [reloadKey, setReloadKey] = useState(0);
  const refreshTable = () => setReloadKey((k) => k + 1);

  // Tabs
  const tabs = [
    { id: "customers", label: "Customers" },
    { id: "patients", label: "Patients" },
    { id: "addresses", label: "Addresses" },
  ];

  // CHIP UI
  const chipClass = (color: string) =>
    `inline-block text-center px-2 py-1 min-w-[100px] rounded-full border text-xs font-medium ${color}`;

  const statusColor = (active: boolean) =>
    active
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";

  // ------------------------------
  // OPEN EDIT FORM (Customer + Patient)
  // ------------------------------
  const openEditDrawer = (
    heading: string,
    apiUrl: string,
    initialData: any,
    fields: FormField[]
  ) => {
    setDrawerConfig({
      heading,
      apiUrl,
      method: "PATCH",
      initialData,
      fields,
    });
    setDrawerOpen(true);
  };

  // ------------------------------
  // OPEN CREATE FORM (Customer + Patient)
  // ------------------------------
  const openCreateDrawer = (type: "customer" | "patient") => {
    if (type === "customer") {
      setDrawerConfig({
        heading: "Add Customer",
        apiUrl: "/crm/users/",
        method: "POST",
        initialData: {},
        fields: [
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
            name: "gender", label: "Gender", type: "select", options: [
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]
          },
          { name: "age", label: "Age", type: "number" },
        ],
      });
    } else {
      setDrawerConfig({
        heading: "Add Patient",
        apiUrl: "/crm/patients/",
        method: "POST",
        initialData: {},
        fields: [
          { name: "first_name", label: "First Name", type: "text", required: true },
          { name: "last_name", label: "Last Name", type: "text" },
          {
            name: "gender", label: "Gender", type: "select", options: [
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]
          },
          { name: "age", label: "Age", type: "number" },
        ],
      });
    }

    setDrawerOpen(true);
  };

  // ------------------------------
  // OPEN ADDRESS EDIT/CREATE
  // ------------------------------
  const openEditAddress = (row: any) => {
    setSelectedAddress(row);
    setAddressDrawerOpen(true);
  };

  const openCreateAddress = () => {
    setSelectedAddress(null);
    setAddressCreateCustomerId(null); // You can later attach to a selected user
    setAddressDrawerOpen(true);
  };

  const handleMakeCall = async (id) => {
    try {
      const res = await customerApi.post("/calls/connect/", {
        "call_type": "customer",
        "user_id": id
      })
      alert("Call initiated");
    } catch (err: any) {
      console.error(err);
      alert("Failed to initiat call " + String(err.serverMessage));
    } finally {
      //setSaving(false);
    }
  }


  // ------------------------------
  // Customer Columns
  // ------------------------------
  const customerColumns = [
    { key: "id", label: "ID", sort_allowed: true },
    {
      key: "full_name",
      label: "Customer",
      render: (row: any) => `${row.first_name || ""} ${row.last_name || ""}`,
    },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Mobile" },
    { key: "gender", label: "Gender" },
    { key: "age", label: "Age", render: (row: any) => row.age || "—" },

    {
      key: "is_active",
      label: "Status",
      render: (row: any) => (
        <span className={chipClass(statusColor(row.is_active))}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            className={`p-1 rounded-md ${true ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`} title="Edit"
            disabled={!true}
            onClick={() => handleMakeCall(row.id)}
          >
            <PhoneOutgoing className="w-5 h-5 text-gray-600 hover:text-primary " />
          </button>

          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() =>
              openEditDrawer(
                "Edit Customer",
                `/crm/users/${row.id}/`,
                row,
                [
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
                    name: "gender", label: "Gender", type: "select", options: [
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]
                  },
                  { name: "age", label: "Age", type: "number" },
                ]
              )
            }
          >
            <Pencil className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      ),
    },
  ];

  // ------------------------------
  // Patients Columns
  // ------------------------------
  const patientColumns = [
    { key: "id", label: "ID", sort_allowed: true },
    {
      key: "name",
      label: "Name",
      render: (row: any) => `${row.first_name} ${row.last_name}`.trim(),
    },
    { key: "user_mobile", label: "Mobile" },
    { key: "user_email", label: "Email" },
    { key: "gender", label: "Gender" },
    { key: "age", label: "Age", render: (row: any) => row.age || "—" },

    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button
          className="p-1 hover:bg-gray-100 rounded"
          onClick={() =>
            openEditDrawer(
              "Edit Patient",
              `/crm/patients/${row.id}/`,
              row,
              [
                { name: "first_name", label: "First Name", type: "text", required: true },
                { name: "last_name", label: "Last Name", type: "text" },
                {
                  name: "gender", label: "Gender", type: "select", options: [
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                  ]
                },
                { name: "age", label: "Age", type: "number" },
              ]
            )
          }
        >
          <Pencil className="w-5 h-5 text-gray-600" />
        </button>
      ),
    },
  ];

  // ------------------------------
  // Address Columns
  // ------------------------------
  const addressColumns = [
    { key: "id", label: "ID", sort_allowed: true },
    { key: "user_name", label: "Customer" },
    {
      key: "full_address",
      label: "Address",
      render: (row: any) => `${row.line1}, ${row.line2}`,
    },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "pincode", label: "Pincode" },

    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => openEditAddress(row)}>
          <Pencil className="w-5 h-5 text-gray-600" />
        </button>
      ),
    },
  ];

  // ------------------------------
  // Render Tabs
  // ------------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "customers":
        return (
          <DataTable
            header="Customers"
            apiUrl="crm/users/"
            columns={customerColumns}
            showAdd
            onAddClick={() => openCreateDrawer("customer")}
            extraParams={{ reloadKey }}
            emptyMessage="No customers found"
          />
        );

      case "patients":
        return (
          <DataTable
            header="Patients"
            apiUrl="crm/patients/"
            columns={patientColumns}
            showAdd
            onAddClick={() => openCreateDrawer("patient")}
            extraParams={{ reloadKey }}
            emptyMessage="No patients found"
          />
        );

      case "addresses":
        return (
          <DataTable
            header="Addresses"
            apiUrl="crm/addresses/"
            columns={addressColumns}
            showAdd
            onAddClick={openCreateAddress}
            extraParams={{ reloadKey }}
            emptyMessage="No addresses found"
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Customers" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          {renderTabContent()}
        </main>
      </div>

      {/* Customer + Patient Drawer */}
      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        heading={drawerConfig.heading}
        apiUrl={drawerConfig.apiUrl}
        method={drawerConfig.method}
        initialData={drawerConfig.initialData}
        formFields={drawerConfig.fields}
        onSuccess={() => {
          setDrawerOpen(false);
          refreshTable();
        }}
      />

      {/* Address Drawer */}
      <AddressDrawer
        open={addressDrawerOpen}
        onClose={() => setAddressDrawerOpen(false)}
        address={selectedAddress}
        // customerId={addressCreateCustomerId}
        onSaved={() => {
          setAddressDrawerOpen(false);
          refreshTable();
        }}
      />
    </div>
  );
};

export default Customers;
