import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";

// Chip helpers
const chipClass = (color: string) =>
  `inline-block text-center px-2 py-1 min-w-[110px] rounded-full border text-xs font-medium ${color}`;

const typeColor = (type: string) => {
  const t = type?.toLowerCase();
  switch (t) {
    case "sms":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "email":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "whatsapp":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const statusColor = (s: string) => {
  const st = s?.toLowerCase();
  switch (st) {
    case "sent":
      return "bg-green-100 text-green-700 border-green-200";
    case "failed":
      return "bg-red-100 text-red-700 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const Notifications: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Table column structure for real API
  const columns = [
    { key: "id", label: "ID", sort_allowed: false },

    {
      key: "recipient_email",
      label: "Recipient",
      render: (row: any) =>
        row.recipient_email ? (
          <span>{row.recipient_email}</span>
        ) : (
          row.recipient_mobile || "—"
        ),
    },

    {
      key: "notification_type",
      label: "Type",
      render: (row: any) => (
        <span className={chipClass(typeColor(row.notification_type))}>
          {row.notification_type?.toUpperCase()}
        </span>
      ),
    },

    {
      key: "message",
      label: "Message",
      render: (row: any) => (
        <span className="line-clamp-2 text-gray-700">{row.message}</span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (row: any) => (
        <span className={chipClass(statusColor(row.status))}>
          {row.status?.toUpperCase()}
        </span>
      ),
    },

    {
      key: "created_at",
      label: "Created At",
      sort_allowed:true,
      render: (row: any) =>
        new Date(row.created_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Notifications" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          <DataTable
            header="Notifications"
            subheader="Stay updated with all system notifications"
            apiUrl="crm/notifications/"
            showSearch
            showFilter
            showAdd
            extraParams={filters}
            columns={columns}
            emptyMessage="No notifications found"
          />
        </main>
      </div>
    </div>
  );
};

export default Notifications;
