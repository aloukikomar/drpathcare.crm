// src/components/content/ContentDrawer.tsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { customerApi } from "../api/axios";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: any;        // if present → edit mode
  onSuccess?: () => void;   // refresh list
}

const TAG_OPTIONS = [
  { label: "About Gallery", value: "about_gallery" },
  { label: "Banner", value: "banner" },
  { label: "Partner", value: "partner" },
  { label: "Certification", value: "certification" },
  { label: "Unused", value: "unused" },
];

const MEDIA_OPTIONS = [
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "File", value: "file" },
];

const ContentDrawer: React.FC<Props> = ({ open, onClose, initialData, onSuccess }) => {
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [tagType, setTagType] = useState("unused");
  const [file, setFile] = useState<File | null>(null);

  // --------------------------------------------------------------
  // PREFILL EDIT MODE
  // --------------------------------------------------------------
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setMediaType(initialData.media_type || "image");
      setTagType(initialData.tags?.type || "unused");
      setFile(null); // reset file, user may replace it
    } else {
      // create mode reset
      setTitle("");
      setMediaType("image");
      setTagType("unused");
      setFile(null);
    }
  }, [initialData, open]);


  // --------------------------------------------------------------
  // CREATE PAYLOAD
  // --------------------------------------------------------------
  const handleCreate = async () => {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("media_type", mediaType);

    // backend expects a JSON string → EXACTLY LIKE YOUR CURL
    formData.append("tags", JSON.stringify({ type: tagType }));

    if (file) formData.append("file", file);

    try {
      await customerApi.post("/crm/content/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Failed to create content");
    }
  };


  // --------------------------------------------------------------
  // UPDATE PAYLOAD
  // --------------------------------------------------------------
  const handleUpdate = async () => {
    if (!initialData?.id) return;

    const formData = new FormData();

    formData.append("title", title);
    formData.append("media_type", mediaType);
    formData.append("tags", JSON.stringify({ type: tagType }));

    if (file) formData.append("file", file);

    try {
      await customerApi.patch(`/crm/content/${initialData.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update content");
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (isEdit) handleUpdate();
    else handleCreate();
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* DRAWER PANEL */}
      <div className="ml-auto w-full sm:w-[480px] h-full bg-white shadow-xl flex flex-col z-[210]">

        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Content" : "Add Content"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">

          {/* TITLE */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Title</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
            />
          </div>

          {/* MEDIA TYPE */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Media Type</label>
            <select
              className="border px-3 py-2 rounded w-full"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
            >
              {MEDIA_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* TAG TYPE */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tag</label>
            <select
              className="border px-3 py-2 rounded w-full"
              value={tagType}
              onChange={(e) => setTagType(e.target.value)}
            >
              {TAG_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">File</label>

            <input
              type="file"
              className="w-full"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {isEdit && initialData.file_url && !file && (
              <p className="text-xs text-gray-500 mt-1">
                Current file:{" "}
                <a className="text-blue-600 underline" href={initialData.file_url} target="_blank">
                  View
                </a>
              </p>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ContentDrawer;
