import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Users, Calendar, MessageSquare, TestTube, TrendingUp, IndianRupee } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StatsWidget from '../components/StatsWidget';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: 'Revenue',
      value: '₹1,24,500',
      icon: IndianRupee,
      change: '+12% from last month',
      changeType: 'positive' as const
    },
    {
      title: 'Bookings Today',
      value: '47',
      icon: Calendar,
      change: '+5% from yesterday',
      changeType: 'positive' as const
    },
    {
      title: 'Pending Enquiries',
      value: '23',
      icon: MessageSquare,
      change: '-8% from last week',
      changeType: 'negative' as const
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} title="Dashboard" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Here's what's happening with your business today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsWidget
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                changeType={stat.changeType}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New booking received</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer inquiry submitted</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lab test completed</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-3">

                {/* NEW BOOKING */}
                <Link
                  to="/bookings/create"
                  className="p-4 bg-[#635bff] text-white rounded-lg hover:bg-[#5a52e8] transition-colors text-center"
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">New Booking</span>
                </Link>

                {/* ADD CUSTOMER */}
                <Link
                  to="/customers"
                  className="p-4 bg-[#0ea5e9] text-white rounded-lg hover:bg-[#0284c7] transition-colors text-center"
                >
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Customers</span>
                </Link>

                {/* LAB TESTS */}
                <Link
                  to="/lab-products"
                  className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  <TestTube className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Lab Tests</span>
                </Link>

                {/* SEND SMS / NOTIFICATIONS */}
                <Link
                  to="/notifications"
                  className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-center"
                >
                  <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Notification</span>
                </Link>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;