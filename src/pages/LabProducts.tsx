// src/pages/LabProducts.tsx
import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TabNavigation from "../components/TabNavigation";
import DataTable from "../components/DataTable";
import FormDrawer from "../components/FormDrawer";
import LabPackageDrawer from "../components/LabPackageDrawer";
import { Pencil } from "lucide-react";
import type { FormField } from "../components/FormDrawer";

const LabProducts: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "lab-tests" | "packages" | "lab-category"
  >("lab-tests");

  const [reloadKey, setReloadKey] = useState(Date.now());

  // Generic Drawer (lab tests + categories only)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [drawerApiUrl, setDrawerApiUrl] = useState<string | null>(null);
  const [drawerInitial, setDrawerInitial] = useState<any>(null);

  // Package Drawer
  const [packageDrawerOpen, setPackageDrawerOpen] = useState(false);
  const [packageInitial, setPackageInitial] = useState<any>(null);

  const refreshTable = () => setReloadKey(Date.now());

  // ---------------------------
  // Field definitions
  // ---------------------------
  const labTestFormFields: FormField[] = [
    { name: "category", label: "Category ID", type: "number" },
    { name: "name", label: "Test Name", type: "text", required: true },
    { name: "test_code", label: "Test Code", type: "text" },
    { name: "sample_type", label: "Sample Type", type: "textarea" },
    { name: "temperature", label: "Temperature", type: "text" },
    { name: "special_instruction", label: "Special Instruction", type: "textarea" },
    { name: "method", label: "Method", type: "text" },
    { name: "reported_on", label: "Reported On", type: "text" },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "offer_price", label: "Offer Price", type: "number" },
    {
      name: "is_featured",
      label: "Featured",
      type: "select",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  ];

  const categoryFormFields: FormField[] = [
    { name: "name", label: "Name", type: "text", required: true },
    {
      name: "entity_type",
      label: "Entity Type",
      type: "select",
      options: [
        { label: "Lab Test", value: "lab_test" },
        { label: "Lab Package", value: "lab_package" },
      ],
    },
    { name: "description", label: "Description", type: "textarea" },
  ];

  // ---------------------------
  // Edit handlers
  // ---------------------------
  function openEditForRow(tab: typeof activeTab, row: any) {
    if (tab === "packages") {
      setPackageInitial(row);
      setPackageDrawerOpen(true);
      return;
    }

    setDrawerMode("edit");
    setDrawerInitial(row);

    if (tab === "lab-tests") {
      setDrawerApiUrl(`/crm/lab-tests/${row.id}/`);
    } else if (tab === "lab-category") {
      setDrawerApiUrl(`/crm/lab-category/${row.id}/`);
    }

    setDrawerOpen(true);
  }

  // ---------------------------
  // Create handlers
  // ---------------------------
  function openCreateForTab(tab: typeof activeTab) {
    if (tab === "packages") {
      setPackageInitial(null);
      setPackageDrawerOpen(true);
      return;
    }

    setDrawerMode("create");
    setDrawerInitial(null);

    if (tab === "lab-tests") {
      setDrawerApiUrl("/crm/lab-tests/");
    } else if (tab === "lab-category") {
      setDrawerApiUrl("/crm/lab-category/");
    }

    setDrawerOpen(true);
  }

  // ---------------------------
  // Columns
  // ---------------------------
  const labTestColumns = [
    { key: "id", label: "ID", sort_allowed: true, width: "60px" },
    { key: "test_code", label: "Code", width: "110px" },
    { key: "name", label: "Test Name", sort_allowed: true },

    {
      key: "category_name",
      label: "Category",
      render: (row: any) => row.category_name || "—",
    },

    {
      key: "price",
      label: "Base Price",
      render: (row: any) => `₹${row.price ?? "0.00"}`,
    },

    {
      key: "offer_price",
      label: "Offer Price",
      render: (row: any) => (
        <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-xs">
          ₹ {row.offer_price ?? "0.00"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      width: "70px",
      render: (row: any) => (
        <button
          onClick={() => openEditForRow("lab-tests", row)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Pencil className="w-5 h-5 text-gray-600" />
        </button>
      ),
    },
  ];

  const packageColumns = [
    { key: "id", label: "ID", sort_allowed: true },
    { key: "name", label: "Package Name", sort_allowed: true },

    {
      key: "category",
      label: "Category",
      render: (row: any) => row.category?.name ?? "—",
    },

    { key: "price", label: "Price", render: (row: any) => `₹${row.price}` },
    { key: "offer_price", label: "Offer Price", render: (row: any) => `₹${row.offer_price}` },

    {
      key: "tests_count",
      label: "Tests Count",
      render: (row: any) => (
        <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs">
          {row.tests?.length ?? 0} Tests
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button
          onClick={() => openEditForRow("packages", row)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Pencil className="w-5 h-5 text-gray-600" />
        </button>
      ),
    },
  ];

  const categoryColumns = [
    { key: "id", label: "Category ID", sort_allowed: true },
    { key: "name", label: "Name", sort_allowed: true },

    {
      key: "entity_type",
      label: "Entity Type",
      render: (row: any) => row.entity_type?.toUpperCase() ?? "—",
    },

    { key: "description", label: "Description" },

    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button
          onClick={() => openEditForRow("lab-category", row)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Pencil className="w-5 h-5 text-gray-600" />
        </button>
      ),
    },
  ];

  // ---------------------------
  // Tab renderer
  // ---------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "lab-tests":
        return (
          <DataTable
            header="Lab Tests"
            subheader="Manage lab tests"
            apiUrl="crm/lab-tests/"
            columns={labTestColumns}
            showAdd
            onAddClick={() => openCreateForTab("lab-tests")}
            extraParams={{ reloadKey }}
          />
        );

      case "packages":
        return (
          <DataTable
            header="Packages"
            subheader="Manage lab packages"
            apiUrl="crm/lab-packages/"
            columns={packageColumns}
            showAdd
            onAddClick={() => openCreateForTab("packages")}
            extraParams={{ reloadKey }}
          />
        );

      case "lab-category":
        return (
          <DataTable
            header="Lab Categories"
            subheader="Manage lab categories"
            apiUrl="crm/lab-category/"
            columns={categoryColumns}
            showAdd
            onAddClick={() => openCreateForTab("lab-category")}
            extraParams={{ reloadKey }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Lab Products" onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <TabNavigation
            tabs={[
              { id: "lab-tests", label: "Lab Tests" },
              { id: "packages", label: "Packages" },
              { id: "lab-category", label: "Lab Category" },
            ]}
            activeTab={activeTab}
            onTabChange={(id) =>
              setActiveTab(id as "lab-tests" | "packages" | "lab-category")
            }

          />

          {renderTabContent()}
        </main>

        {/* Drawer for lab tests and categories */}
        <FormDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          method={drawerMode === "create" ? "POST" : "PATCH"}
          apiUrl={drawerApiUrl}
          initialData={drawerInitial}
          formFields={
            activeTab === "lab-tests" ? labTestFormFields : categoryFormFields
          }
          heading={
            drawerMode === "create"
              ? activeTab === "lab-tests"
                ? "Add Lab Test"
                : "Add Category"
              : "Edit"
          }
          onSuccess={() => {
            setDrawerOpen(false);
            refreshTable();
          }}
        />

        {/* Drawer for packages */}
        <LabPackageDrawer
          open={packageDrawerOpen}
          initialData={packageInitial}
          onClose={() => setPackageDrawerOpen(false)}
          onSuccess={() => {
            setPackageDrawerOpen(false);
            refreshTable();
          }}
        />
      </div>
    </div>
  );
};

export default LabProducts;
