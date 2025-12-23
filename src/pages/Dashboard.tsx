import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  MessageSquare,
  TestTube,
  IndianRupee,
} from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import StatsWidget from "../components/StatsWidget";
import { customerApi } from "../api/axios";

import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

/* ----------------------------------
   Helpers
---------------------------------- */
const formatDate = (d: Date) =>
  d.toLocaleDateString("en-CA"); // YYYY-MM-DD local (FIXES T-1 issue)

// semantic colors (same meaning everywhere)
export const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",              // blue-500
  payment_collected: "#22c55e", // green-500
  completed: "#22c55e",

  initiated: "#facc15",         // yellow-400
  verified: "#facc15",

  sample_collected: "#f97316",  // orange-500
  report_uploaded: "#a855f7",   // purple-500

  failed: "#ef4444",            // red-500
  cancelled: "#ef4444",
};


const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const today = new Date();
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: today,
      endDate: today,
      key: "selection",
    },
  ]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
const isAdmin = !!data?.revenue;
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoadingActivity(true);

        const raw = localStorage.getItem("user");
        if (!raw) return;
        const u = JSON.parse(raw);

        const res = await customerApi.get("/booking-actions/", {
          params: {
            user: isAdmin? null:u.id,
            limit: 6,
          },
        });

        setActivities(res.results || []);
      } catch (e) {
        console.error("Failed to load activity", e);
      } finally {
        setLoadingActivity(false);
      }
    };

    loadActivity();
  }, [isAdmin]);

  const ScrollableLegend = ({ payload }: any) => {
    if (!payload?.length) return null;

    return (
      <div className="mt-2 max-h-28 overflow-y-auto overflow-x-auto">
        <div className="flex flex-wrap gap-3 justify-center px-2">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs shrink-0"
            >
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="whitespace-nowrap">
                {entry.value.replace("_", " ").toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

    );
  };


  /* ----------------------------------
     Load dashboard data
  ---------------------------------- */
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await customerApi.get("/crm/dashboard/", {
        params: {
          date_from: formatDate(range[0].startDate),
          date_to: formatDate(range[0].endDate),
        },
      });
      setData(res);
    } catch (err) {
      console.error("Dashboard load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  

  const formatRangeLabel = () => {
    const r = range[0];
    return `${r.startDate.toLocaleDateString("en-IN")} – ${r.endDate.toLocaleDateString("en-IN")}`;
  };

  /* ----------------------------------
     Stats cards
  ---------------------------------- */
  const stats = isAdmin
    ? [
      {
        title: "Completed Revenue",
        value: `₹${data?.revenue?.completed || 0}`,
        icon: IndianRupee,
      },
      {
        title: "Potential Revenue",
        value: `₹${data?.revenue?.potential || 0}`,
        icon: IndianRupee,
      },
      {
        title: "Total Bookings",
        value: data?.total_bookings || 0,
        icon: Calendar,
      },
      {
        title: "Pending Enquiries",
        value: data?.pending_enquiries || 0,
        icon: MessageSquare,
      },
    ]
    : [
      {
        title: "Total Incentive",
        value: `₹${data?.total_incentive || 0}`,
        icon: IndianRupee,
      },
      {
        title: "Total Bookings",
        value: data?.total_bookings || 0,
        icon: Calendar,
      },
    ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Dashboard" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

            {/* DATE PICKER */}
            <div className="relative">
              <button
                onClick={() => setShowCalendar((v) => !v)}
                className="px-3 py-2 border rounded-md text-sm bg-white flex items-center gap-2 min-w-[220px]"
              >
                <Calendar className="w-4 h-4" />
                {formatRangeLabel()}
              </button>

              {showCalendar && (
                <div className="absolute right-0 mt-2 z-50 bg-white border rounded-lg shadow-xl">
                  <DateRangePicker
                    ranges={range}
                    onChange={(item) => setRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="vertical"
                  />

                  <div className="flex justify-end gap-2 p-3 border-t">
                    <button
                      onClick={() => {
                        setRange([
                          {
                            startDate: today,
                            endDate: today,
                            key: "selection",
                          },
                        ]);
                        setShowCalendar(false);
                        loadDashboard();
                      }}
                      className="text-sm text-gray-600"
                    >
                      Today
                    </button>

                    <button
                      onClick={() => {
                        setShowCalendar(false);
                        loadDashboard();
                      }}
                      className="px-4 py-1.5 text-sm bg-[#635bff] text-white rounded-md"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STATS */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-2"
              } gap-6 mb-3`}
          >
            {stats.map((s, i) => (
              <StatsWidget key={i} {...s} />
            ))}
          </div>

          {/* PIE + ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
            {/* PIE */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Booking Status</h3>

              {data?.booking_status_pie?.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.booking_status_pie}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {data.booking_status_pie.map((e: any, i: number) => (
                          <Cell
                            key={i}
                            fill={STATUS_COLORS[e.status] || "#9ca3af"}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value: any, name: any) => [
                          value,
                          name.replace("_", " ").toUpperCase(),
                        ]}
                      />

                      <Legend content={<ScrollableLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </div>


            {/* RECENT ACTIVITY */}
            <div className="bg-white p-6 rounded-lg border flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

              {loadingActivity ? (
                <p className="text-sm text-gray-500">Loading activity…</p>
              ) : activities.length === 0 ? (
                <p className="text-sm text-gray-500">No recent actions</p>
              ) : (
                <div
                  className="
                          space-y-4
                          overflow-y-auto
                          pr-2
                          max-h-[220px]     /* 👈 DESKTOP */
                          sm:max-h-[260px]
                        "
                >
                  {activities.map((h) => (
                    <div
                      key={h.id}
                      className="flex gap-3 border-b last:border-b-0 pb-3 last:pb-0"
                    >
                      {/* DOT */}
                      <div className="pt-1">
                        <span
                          className={`
                inline-block w-2.5 h-2.5 rounded-full
                ${h.action === "create"
                              ? "bg-green-500"
                              : h.action === "update"
                                ? "bg-blue-500"
                                : h.action === "cancel"
                                  ? "bg-red-500"
                                  : "bg-gray-400"}
              `}
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {h.user_str}
                          </span>

                          <span className="text-xs text-gray-500">
                            {new Date(h.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 mt-0.5">
                          <span className="capitalize font-medium">{h.action}</span>
                          {h.booking_ref && (
                            <>
                              {" "}• Booking{" "}
                              <span className="font-medium">{h.booking_ref}</span>
                            </>
                          )}
                        </div>

                        {h.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {h.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/bookings/create" className="p-4 bg-[#635bff] text-white rounded-lg text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                New Booking
              </Link>

              <Link to="/customers" className="p-4 bg-[#0ea5e9] text-white rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2" />
                Customers
              </Link>

              <Link to="/lab-products" className="p-4 bg-green-500 text-white rounded-lg text-center">
                <TestTube className="w-6 h-6 mx-auto mb-2" />
                Lab Tests
              </Link>

              <Link to="/notifications" className="p-4 bg-orange-500 text-white rounded-lg text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                Notifications
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
