import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import ContentDrawer from "../components/ContentUpdateDrawer";
import { Pencil } from "lucide-react";
import ContentFilterPopup from "../components/filters/ContentFilterPopup";

// -----------------------------
// CHIP HELPERS
// -----------------------------
const chipClass = (color: string) =>
  `inline-block text-center px-2 py-1 min-w-[110px] rounded-full border text-xs font-medium ${color}`;

const mediaColor = (type: string) => {
  const t = type?.toLowerCase();
  switch (t) {
    case "image":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "video":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "file":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const tagColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "about_gallery":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "banner":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "partner":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "certification":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "unused":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const ContentManagement: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [reloadKey, setReloadKey] = useState(Date.now());

  const refreshTable = () => setReloadKey(Date.now());
  const [filterPopup, setFilterPopup] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");

  // -------------------------
  // TABLE COLUMNS
  // -------------------------
  const columns = [
    { key: "id", label: "ID", sort_allowed: false },

    { key: "title", label: "Title", sort_allowed: true },

    {
      key: "media_type",
      label: "Media",
      render: (row: any) => (
        <span className={chipClass(mediaColor(row.media_type))}>
          {row.media_type?.toUpperCase()}
        </span>
      ),
    },

    {
      key: "tags",
      label: "Tag",
      render: (row: any) => (
        <span className={chipClass(tagColor(row.tags?.type))}>
          {row.tags?.type?.replace("_", " ").toUpperCase() || "N/A"}
        </span>
      ),
    },

    {
      key: "file_url",
      label: "Preview",
      render: (row: any) => (
        <img
          src={row.file_url}
          alt={row.title}
          className="w-20 h-14 rounded object-cover border"
        />
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

    {
      key: "updated_at",
      label: "Updated",
      render: (row: any) =>
        new Date(row.updated_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },

    // -------------------------
    // EDIT BUTTON
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
          title="Edit"
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
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Content Management" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          <DataTable
            header="Content Management"
            subheader="Manage banners, images, homepage content, and more."
            apiUrl="crm/content/"
            showSearch
            showFilter
            showAdd

            extraParams={{ ...filters, reloadKey, tag_type: selectedTag || undefined }}

            onFilterClick={() => setFilterPopup(true)}

            // --------------------
            // ADD → open drawer in create mode
            // --------------------
            onAddClick={() => {
              setEditData(null);
              setDrawerOpen(true);
            }}

            columns={columns}
            emptyMessage="No content found"
          />
        </main>

        {/* Drawer for Create + Edit */}
        <ContentDrawer
          open={drawerOpen}
          initialData={editData}  // null = create, object = edit
          onClose={() => setDrawerOpen(false)}
          onSuccess={refreshTable}
        />

        <ContentFilterPopup
          open={filterPopup}
          onClose={() => setFilterPopup(false)}
          value={selectedTag}
          onApply={(tag) => {
            setSelectedTag(tag);
            setFilterPopup(false);
            refreshTable();
          }}
        />
      </div>
    </div>
  );
};

export default ContentManagement;
