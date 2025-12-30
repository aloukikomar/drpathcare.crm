import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import FormDrawer from "../components/FormDrawer";
import EnquiryToCustomerDrawer from "../components/drawer/EnquiryToCustomerDrawer";

import { Pencil, PhoneOutgoing, UserPlus } from "lucide-react";
import { customerApi } from "../api/axios";

const Enquiry: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Drawer: Update enquiry status
  const [editDrawer, setEditDrawer] = useState<{
    open: boolean;
    row: any | null;
  }>({ open: false, row: null });

  // Drawer: Convert enquiry → customer
  const [convertDrawer, setConvertDrawer] = useState<{
    open: boolean;
    row: any | null;
  }>({ open: false, row: null });

  // -------------------------------------
  // CHIP COLORS
  // -------------------------------------
  const enquiryStatusColor = (label: string) => {
    switch (label) {
      case "Active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Done":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const userStatusColor = (label: string) => {
    switch (label) {
      case "Not Registered":
        return "bg-red-100 text-red-700 border-red-200";
      case "Registered":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleMakeCall = async (id) => {
    try {
      const res = await customerApi.post("/calls/connect/", {
        "call_type": "enquiry",
        "enquiry_id": id
      })
      alert("Call initiated");
    } catch (err: any) {
      console.error(err);
      alert("Failed to initiat call " + String(err.serverMessage));
    } finally {
      //setSaving(false);
    }
  }


  // -------------------------------------
  // TABLE COLUMNS
  // -------------------------------------
  const columns = [
    { key: "id", label: "ID", sort_allowed: true },

    {
      key: "user",
      label: "Is Customer",
      render: (row: any) => {
        const label = row.user ? "Registered" : "Not Registered";
        return (
          <span
            className={`inline-block text-center px-2 py-1 min-w-[120px] rounded-full border text-xs font-medium ${userStatusColor(
              label
            )}`}
          >
            {label}
          </span>
        );
      },
      sort_allowed: false,
    },

    { key: "name", label: "Name", sort_allowed: true },
    { key: "mobile", label: "Mobile" },
    { key: "enquiry", label: "Enquiry" },

    {
      key: "created_at",
      label: "Created At",
      sort_allowed: true,
      render: (row: any) =>
        new Date(row.created_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },

    {
      key: "status",
      label: "Status",
      render: (row: any) => {
        const label = row.is_active ? "Active" : "Done";
        return (
          <span
            className={`inline-block text-center px-2 py-1 min-w-[120px] rounded-full border text-xs font-medium ${enquiryStatusColor(
              label
            )}`}
          >
            {label}
          </span>
        );
      },
    },

    {
      key: "actions",
      label: "Actions",
      width: "150px",
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            className={`p-1 rounded-md ${true ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`} title="Edit"
            disabled={!true}
            onClick={() => handleMakeCall(row.id)}
          >
            <PhoneOutgoing className="w-5 h-5 text-gray-600 hover:text-primary " />
          </button>
          {/* Update Status */}
          <button
            className="p-1 rounded hover:bg-gray-100"
            title="Update Status"
            onClick={() => setEditDrawer({ open: true, row })}
          >
            <Pencil className="w-5 h-5 text-gray-600" />
          </button>

          {/* Convert or Go to Booking */}
          <button
            className="p-1 rounded hover:bg-gray-100"
            title={row.user ? "Create Booking" : "Convert to Customer"}
            onClick={() => {
              if (row.user) {
                // ⭐ If already a customer → redirect to booking
                window.location.href = `/bookings/create?customer=${row.user}`;
              } else {
                // ⭐ Not a customer → open conversion drawer
                setConvertDrawer({ open: true, row });
              }
            }}
          >
            <UserPlus className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      ),
    }
  ];

  // -------------------------------------
  // RENDER PAGE
  // -------------------------------------
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Enquiry" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DataTable
            header="Customer Enquiries"
            subheader="Manage and respond to customer inquiries"
            apiUrl="crm/enquiries/"
            showDateRange
            columns={columns}
            showAdd={false}
            emptyMessage="No enquiries found"
            extraParams={{ reloadKey }}
          />
        </main>
      </div>

      {/* --------------------- UPDATE ENQUIRY STATUS --------------------- */}
      <FormDrawer
        open={editDrawer.open}
        onClose={() => setEditDrawer({ open: false, row: null })}
        heading="Update Enquiry"
        subHeading={`ID: ${editDrawer.row?.id ?? ""}`}
        apiUrl={editDrawer.row ? `crm/enquiries/${editDrawer.row.id}/` : null}
        initialData={editDrawer.row}
        method="PATCH"
        formFields={[
          {
            name: "is_active",
            label: "Enquiry Status",
            type: "select",
            required: true,
            options: [
              { label: "Active", value: true },
              { label: "Done", value: false },
            ],
          },
        ]}
        onSuccess={() => {
          setEditDrawer({ open: false, row: null });
          setReloadKey((prev) => prev + 1);
        }}
      />

      {/* --------------------- CONVERT → CUSTOMER DRAWER --------------------- */}
      <EnquiryToCustomerDrawer
        open={convertDrawer.open}
        enquiry={convertDrawer.row}
        onClose={() => setConvertDrawer({ open: false, row: null })}
      />
    </div>
  );
};

export default Enquiry;
