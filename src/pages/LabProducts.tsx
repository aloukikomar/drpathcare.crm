import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TabNavigation from "../components/TabNavigation";
import DataTable from "../components/DataTable";
import FormDrawer from "../components/FormDrawer";
import LabPackageDrawer from "../components/LabPackageDrawer";
import LabTestDrawer from "../components/drawer/LabTestDrawer";
import { Pencil } from "lucide-react";
import type { FormField } from "../components/FormDrawer";

const LabProducts: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "lab-tests" | "packages" | "lab-category"
  >("lab-tests");

  const [reloadKey, setReloadKey] = useState(Date.now());
  const refreshTable = () => setReloadKey(Date.now());

  /* ---------------------------
     CATEGORY DRAWER (GENERIC)
  --------------------------- */
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"create" | "edit">("create");
  const [categoryInitial, setCategoryInitial] = useState<any>(null);
  const [categoryApiUrl, setCategoryApiUrl] = useState<string | null>(null);

  /* ---------------------------
     PACKAGE DRAWER
  --------------------------- */
  const [packageDrawerOpen, setPackageDrawerOpen] = useState(false);
  const [packageInitial, setPackageInitial] = useState<any>(null);

  /* ---------------------------
     LAB TEST DRAWER
  --------------------------- */
  const [labTestDrawerOpen, setLabTestDrawerOpen] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState<any | null>(null);

  /* ---------------------------
     FORM FIELDS (CATEGORY)
  --------------------------- */
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

  /* ---------------------------
     EDIT HANDLER
  --------------------------- */
  const openEditForRow = (tab: typeof activeTab, row: any) => {
    if (tab === "packages") {
      setPackageInitial(row);
      setPackageDrawerOpen(true);
      return;
    }

    if (tab === "lab-tests") {
      setEditingLabTest(row);
      setLabTestDrawerOpen(true);
      return;
    }

    // lab-category
    setCategoryMode("edit");
    setCategoryInitial(row);
    setCategoryApiUrl(`/crm/lab-category/${row.id}/`);
    setCategoryDrawerOpen(true);
  };

  /* ---------------------------
     CREATE HANDLER
  --------------------------- */
  const openCreateForTab = (tab: typeof activeTab) => {
    if (tab === "packages") {
      setPackageInitial(null);
      setPackageDrawerOpen(true);
      return;
    }

    if (tab === "lab-tests") {
      setEditingLabTest(null);
      setLabTestDrawerOpen(true);
      return;
    }

    // lab-category
    setCategoryMode("create");
    setCategoryInitial(null);
    setCategoryApiUrl("/crm/lab-category/");
    setCategoryDrawerOpen(true);
  };

  /* ---------------------------
     TABLE COLUMNS
  --------------------------- */
  const labTestColumns = [
    { key: "id", label: "ID", width: "60px",sort_allowed: true },
    { key: "test_code", label: "Code", width: "110px" },
    { key: "name", label: "Test Name",sort_allowed: true },
    {
      key: "category_name",
      label: "Category",
      render: (row: any) => row.category_name || "—",
    },
    {
      key: "price",
      label: "Price",
      render: (row: any) => `₹${row.price ?? "0.00"}`,
    },
    {
      key: "offer_price",
      label: "Offer",
      render: (row: any) => (
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
          ₹{row.offer_price ?? "0.00"}
        </span>
      ),
    },
    {
      key: "edit",
      label: "Edit",
      width: "70px",
      render: (row: any) => (
        <button
          onClick={() => openEditForRow("lab-tests", row)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const packageColumns = [
    { key: "id", label: "ID", sort_allowed: true  },
    { key: "name", label: "Package Name", sort_allowed: true  },
    { key: "price", label: "Price" },
    { key: "offer_price", label: "Offer Price" },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <button
          onClick={() => openEditForRow("packages", row)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const categoryColumns = [
    { key: "id", label: "ID", sort_allowed: true },
    { key: "name", label: "Name", sort_allowed: true },
    {
      key: "entity_type",
      label: "Entity",
      render: (row: any) => row.entity_type?.toUpperCase(),
    },
    { key: "description", label: "Description" },
    {
      key: "edit",
      label: "Edit",
      render: (row: any) => (
        <button
          onClick={() => openEditForRow("lab-category", row)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ),
    },
  ];

  /* ---------------------------
     TAB CONTENT
  --------------------------- */
  const renderTabContent = () => {
    if (activeTab === "lab-tests") {
      return (
        <DataTable
          header="Lab Tests"
          apiUrl="crm/lab-tests/"
          columns={labTestColumns}
          showAdd
          onAddClick={() => openCreateForTab("lab-tests")}
          extraParams={{ reloadKey }}
        />
      );
    }

    if (activeTab === "packages") {
      return (
        <DataTable
          header="Packages"
          apiUrl="crm/lab-packages/"
          columns={packageColumns}
          showAdd
          onAddClick={() => openCreateForTab("packages")}
          extraParams={{ reloadKey }}
        />
      );
    }

    return (
      <DataTable
        header="Lab Categories"
        apiUrl="crm/lab-category/"
        columns={categoryColumns}
        showAdd
        onAddClick={() => openCreateForTab("lab-category")}
        extraParams={{ reloadKey }}
      />
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Lab Products" onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4">
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

        {/* LAB TEST DRAWER */}
        <LabTestDrawer
          isOpen={labTestDrawerOpen}
          onClose={() => setLabTestDrawerOpen(false)}
          initialData={editingLabTest || undefined}
          onSuccess={() => {
            setLabTestDrawerOpen(false);
            refreshTable();
          }}
        />

        {/* CATEGORY DRAWER */}
        {activeTab === "lab-category" && (
          <FormDrawer
            open={categoryDrawerOpen}
            onClose={() => setCategoryDrawerOpen(false)}
            method={categoryMode === "create" ? "POST" : "PATCH"}
            apiUrl={categoryApiUrl}
            initialData={categoryInitial}
            formFields={categoryFormFields}
            heading={
              categoryMode === "create"
                ? "Add Category"
                : "Edit Category"
            }
            onSuccess={() => {
              setCategoryDrawerOpen(false);
              refreshTable();
            }}
          />
        )}

        {/* PACKAGE DRAWER */}
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
