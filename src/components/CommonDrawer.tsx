import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { customerApi } from "../api/axios";

interface CommonDrawerProps {
  open: boolean;
  onClose: () => void;
  apiUrl: string | null;

  heading?: string;
  subHeading?: string;

  noDataMsg?: string;
  noDataSubMsg?: string;

  onSelect?: (item: any) => void;

  // 🔥 Now supports refreshList callback
  renderItem: (item: any, refreshList: () => void) => React.ReactNode;

  topContent?: React.ReactNode;
}

const CommonDrawer: React.FC<CommonDrawerProps> = ({
  open,
  onClose,
  apiUrl,
  heading = "Details",
  subHeading,
  noDataMsg = "No data found.",
  noDataSubMsg,
  onSelect,
  renderItem,
  topContent,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // -------------------------------------------------------------------
  // 🔄 REFRESH FUNCTION THAT renderItem CAN CALL
  // -------------------------------------------------------------------
  const refreshList = async () => {
    if (!apiUrl) return;
    setLoading(true);

    try {
      const res = await customerApi.get(apiUrl, { params: { search } });
      setItems(res.results || res.data || []);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // Load data on open or search change
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!open || !apiUrl) return;
    refreshList();
  }, [open, apiUrl, search]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{heading}</h2>
            {subHeading && (
              <p className="text-sm text-gray-500">{subHeading}</p>
            )}
          </div>

          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* SEARCH + TOP CONTENT */}
        <div className="p-4 border-b space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full border rounded px-3 py-2"
          />

          {topContent}
        </div>

        {/* CONTENT */}
        <div className="p-4 h-[calc(100%-150px)] overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="animate-spin w-8 h-8 border-t-primary border-2 rounded-full"></div>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center text-gray-600 py-10">
              <p>{noDataMsg}</p>
              {noDataSubMsg && <p className="text-sm">{noDataSubMsg}</p>}
            </div>
          )}

          {!loading &&
            items.length > 0 &&
            items.map((item, index) => (
              <div
                key={item.id || index}
                className="border rounded p-3 mb-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelect?.(item);
                }}
              >
                {/* NOW CALLING renderItem WITH refreshList */}
                {renderItem(item, refreshList)}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default CommonDrawer;
