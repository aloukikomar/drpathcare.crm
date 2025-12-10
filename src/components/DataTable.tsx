import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { customerApi } from "../api/axios"; // adjust path to your axios file

// ---------- Types ----------
export type Column<T = any> = {
  key: string; // property on row OR unique identifier
  label: string;
  width?: string;
  sort_allowed?: boolean;
  // If API uses a different ordering key (e.g. user__email), set orderKey
  orderKey?: string;
  // render receives whole row
  render?: (row: T) => React.ReactNode;
};

type ApiPaginated<T> = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
};

type ApiListResponse<T> = ApiPaginated<T> | T[] | { data?: T[]; total?: number | null };

export type DataTableProps<T = any> = {
  header?: string;
  subheader?: string | null;
  apiUrl: string; // e.g. "bookings/"
  columns: Column<T>[];
  showSearch?: boolean;
  showFilter?: boolean;
  showAdd?: boolean;
  extraParams?: Record<string, any>;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onFilterClick?: () => void;
  onAddClick?: () => void;
  onRowClick?: (row: T) => void;
  onRefresh?: () => void;
  initialSearch?: string;
  className?: string;
  emptyMessage?: string;
};

// ---------- Component ----------
export default function DataTable<T = any>({
  header,
  subheader,
  apiUrl,
  columns,
  showSearch = true,
  showFilter = true,
  showAdd = true,
  extraParams = {},
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
  onFilterClick,
  onAddClick,
  onRowClick,
  onRefresh,
  initialSearch = "",
  className,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  // table state
  const [page, setPage] = useState<number>(0); // 0-indexed UI
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [orderingKey, setOrderingKey] = useState<string | null>(null);
  const [orderingDir, setOrderingDir] = useState<"asc" | "desc">("asc");
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // compute ordering param (DRF: ordering or -ordering)
  const orderingParam = useMemo(() => {
    if (!orderingKey) return undefined;
    return orderingDir === "asc" ? orderingKey : `-${orderingKey}`;
  }, [orderingKey, orderingDir]);

  // ensure trailing slash for DRF style endpoints
  const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;

  // fetch
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: page + 1, // server 1-indexed
        page_size: pageSize,
        search: debouncedSearch || "",
        ...extraParams,
      };

      if (orderingParam) params.ordering = orderingParam;

      try {
        // NOTE: customerApi is typed so that .get<T> returns Promise<T> (see your axios setup)
        const res = await customerApi.get<ApiListResponse<T>>(normalizedApiUrl, { params });

        // runtime-safe handling for multiple backend shapes
        let items: T[] = [];
        let total = 0;

        if (Array.isArray(res)) {
          // backend returned raw array
          items = res as T[];
          total = items.length;
        } else if ((res as ApiPaginated<T>).results) {
          const pag = res as ApiPaginated<T>;
          items = pag.results ?? [];
          total = pag.count ?? items.length;
        } else if ((res as any).data) {
          items = (res as any).data ?? [];
          total = (res as any).total ?? items.length;
        } else {
          // fallback: try to interpret as any[] or empty
          items = (res as any) ?? [];
          total = Array.isArray(items) ? items.length : 0;
        }

        if (!cancelled) {
          setData(items);
          setCount(total);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("DataTable fetch error:", err);
          setError(err?.message || "Failed to load data");
          setData([]);
          setCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
    // Intentional dependencies: when extraParams shape changes, reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedApiUrl, page, pageSize, debouncedSearch, orderingParam, JSON.stringify(extraParams)]);

  // handle column sort: use column.orderKey if provided else column.key
  const handleSort = (col: Column<T>) => {
    if (!col.sort_allowed) return;
    const key = col.orderKey ?? col.key;
    if (orderingKey === key) {
      setOrderingDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrderingKey(key);
      setOrderingDir("asc");
    }
    setPage(0);
  };

  // UI helpers
  const showSearchBox = showSearch;
  const showFilterBtn = showFilter && typeof onFilterClick === "function";
  const showAddBtn = showAdd && typeof onAddClick === "function";

  // small helper to render cell value
  const renderCell = (col: Column<T>, row: T) => {
    try {
      return col.render ? col.render(row) : String((row as any)[col.key] ?? "—");
    } catch (e) {
      return "—";
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* <div className="flex items-center gap-3">
            {header && <h3 className="text-lg font-semibold">{header}</h3>}
          </div> */}

          {header && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{header}</h2>
              {subheader &&
                <p className="text-gray-600">{subheader}</p>
              }
            </div>
          )}


          <div className="flex w-full sm:w-auto gap-2 items-center">
            {showSearchBox && (
              <div className="relative w-full sm:w-56">
                <input
                  role="searchbox"
                  aria-label="Search"
                  type="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  className="pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm w-full"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            )}

            <div className="flex gap-2 w-full sm:w-auto">
              {showFilterBtn && (
                <button
                  onClick={onFilterClick}
                  className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto"
                  aria-label="Open filters"
                >
                  Filter
                </button>
              )}
              {showAddBtn && (
                <button
                  onClick={onAddClick}
                  className="px-3 py-2 bg-[#635bff] text-white rounded-md text-sm w-full sm:w-auto"
                  aria-label="Add new"
                >
                  Add
                </button>
              )}
              {onRefresh && (
                <button
                  onClick={() => {
                    setPage(0);
                    onRefresh();
                  }}
                  className="px-3 py-2 border rounded-md text-sm hidden sm:inline-block"
                  aria-label="Refresh"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-white border rounded-md shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => {
                const isActive = orderingKey === (col.orderKey ?? col.key);
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-600 ${col.sort_allowed ? "cursor-pointer select-none" : ""
                      }`}
                    onClick={() => handleSort(col)}
                  >
                    <div className="inline-flex items-center gap-2">
                      <span>{col.label}</span>
                      {col.sort_allowed && (
                        <span className="text-xs text-gray-400" aria-hidden>
                          {isActive ? (orderingDir === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (

              <>
                {/* Skeleton Loading Rows */}
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-3 w-full bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </>

            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-sm text-gray-500">
                  {error ? <span className="text-red-500">{error}</span> : emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={(row as any).id ?? idx}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm align-top">
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{Math.min(page * pageSize + 1, count)}</span> to{" "}
          <span className="font-medium">{Math.min((page + 1) * pageSize, count)}</span> of{" "}
          <span className="font-medium">{count}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={pageSize}
            onChange={(e) => {
              const s = Number(e.target.value);
              setPageSize(s);
              setPage(0);
            }}
            className="border px-2 py-1 rounded-md text-sm w-full sm:w-auto"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
              aria-label="Previous page"
            >
              Prev
            </button>

            <span className="px-3 py-1 text-sm">{page + 1}</span>

            <button
              onClick={() => setPage(Math.min(Math.ceil(count / pageSize) - 1, page + 1))}
              disabled={(page + 1) * pageSize >= count}
              className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}
