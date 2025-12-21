import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
// import IncentiveEditDrawer from "../components/IncentiveEditDrawer";
// import IncentiveFilterPopup from "../components/filters/IncentiveFilterPopup";
import { Pencil } from "lucide-react";
import IncentiveDrawer from "../components/drawer/IncentiveDrawer";

// -----------------------------
// CHIP HELPERS
// -----------------------------
const chipClass = (color: string) =>
  `inline-block px-2 py-1 rounded-full border text-xs font-medium ${color}`;

const amountChip = "bg-green-100 text-green-700 border-green-200";

const Incentives: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterPopup, setFilterPopup] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [addDrawer,setAddDrawer] = useState<any>(false);
  const [reloadKey, setReloadKey] = useState(Date.now());
  const refreshTable = () => setReloadKey(Date.now());

  // -------------------------
  // TABLE COLUMNS
  // -------------------------
  const columns = [
    { key: "id", label: "ID", sort_allowed: false },

    {
      key: "booking_ref",
      label: "Booking",
      sort_allowed: false,
      render: (row: any) => (
        <span className="font-medium text-gray-800">
          {row.booking_ref}
        </span>
      ),
    },

    {
      key: "agent_name",
      label: "Agent",
      sort_allowed: false,
    },

    {
      key: "amount",
      label: "Amount",
      sort_allowed: true,
      render: (row: any) => (
        <span className={chipClass(amountChip)}>
          ₹{row.amount}
        </span>
      ),
    },

    {
      key: "remark",
      label: "Remark",
      render: (row: any) => (
        <span className="text-sm text-gray-600">
          {row.remark || "—"}
        </span>
      ),
    },

    {
      key: "created_at",
      label: "Created",
      sort_allowed: true,
      render: (row: any) =>
        new Date(row.created_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },

    // -------------------------
    // EDIT
    // -------------------------
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button
          onClick={() => {
            setEditData(row);
            setDrawerOpen(true);
          }}
          className="p-1 hover:bg-gray-100 rounded"
          title="Edit Incentive"
        >
          <Pencil className="w-5 h-5 text-gray-600 hover:text-primary" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          title="Incentives"
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DataTable
            header="Agent Incentives"
            subheader="View and manage incentives assigned per booking."
            apiUrl="crm/incentives/"
            showSearch
            showFilter
            showAdd // 🚫 create handled via separate drawer later
            showDateRange
            extraParams={{
              ...filters,
              reloadKey,
            }}
            
            onAddClick={()=>setAddDrawer(true)}
            onFilterClick={() => setFilterPopup(true)}

            columns={columns}
            emptyMessage="No incentives found"
          />
        </main>

        <IncentiveDrawer 
        onClose={()=>setAddDrawer(false)}
        onSuccess={()=>setReloadKey(Date.now())}
        open={addDrawer}
        />

        {/* -------------------------
            EDIT DRAWER (ONLY EDIT)
        ------------------------- */}
        {/* <IncentiveEditDrawer
          open={drawerOpen}
          initialData={editData}
          onClose={() => setDrawerOpen(false)}
          onSuccess={refreshTable}
        /> */}

        {/* -------------------------
            FILTER POPUP
        ------------------------- */}
        {/* <IncentiveFilterPopup
          open={filterPopup}
          onClose={() => setFilterPopup(false)}
          value={filters}
          onApply={(vals) => {
            setFilters(vals);
            setFilterPopup(false);
            refreshTable();
          }}
        /> */}
      </div>
    </div>
  );
};

export default Incentives;
