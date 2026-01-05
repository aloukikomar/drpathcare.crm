import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";

import { PhoneOutgoing, UserPlus } from "lucide-react";
import { customerApi } from "../api/axios";

const OldLeads: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -------------------------
  // ACTION: CALL
  // -------------------------
  const handleMakeCall = async (mobile: string) => {
    try {
      await customerApi.post("/calls/connect/", {
        call_type: "customer",
        mobile,
      });
      alert("Call initiated");
    } catch (err: any) {
      alert("Failed to initiate call");
    }
  };

  // -------------------------
  // TABLE COLUMNS
  // -------------------------
const columns = [
  {
    key: "date",
    label: "Date",
    sort_allowed: true,
    orderKey: "data__date",
    render: (row: any) => row.data?.date || "—",
  },
  {
    key: "name",
    label: "Name",
    sort_allowed: true,
    orderKey: "data__name",
    render: (row: any) => row.data?.name || "—",
  },
  {
    key: "age",
    label: "Age",
    sort_allowed: true,
    orderKey: "data__age",
    render: (row: any) => row.data?.age || "—",
  },
  {
    key: "gender",
    label: "Gender",
    sort_allowed: true,
    orderKey: "data__gender",
    render: (row: any) => row.data?.gender || "—",
  },
  {
    key: "no_of_member",
    label: "No Of Member",
    sort_allowed: true,
    orderKey: "data__no of member",
    render: (row: any) => row.data?.["no of member"] || "—",
  },
  {
    key: "address",
    label: "Address",
    sort_allowed: true,
    orderKey: "data__address",
    render: (row: any) => row.data?.address || "—",
  },
  {
    key: "land_mark",
    label: "Land Mark",
    sort_allowed: true,
    orderKey: "data__land mark",
    render: (row: any) => row.data?.["land mark"] || "—",
  },
  {
    key: "location",
    label: "Location",
    sort_allowed: true,
    orderKey: "data__location",
    render: (row: any) => row.data?.location || "—",
  },
  {
    key: "pincode",
    label: "Pincode",
    sort_allowed: true,
    orderKey: "data__pincode",
    render: (row: any) => row.data?.pincode || "—",
  },
  {
    key: "mob_no",
    label: "Mob No",
    sort_allowed: true,
    orderKey: "mobile",
    render: (row: any) => row.mobile || "—",
  },
  {
    key: "alt_mob_no",
    label: "Alt Mob No",
    sort_allowed: true,
    orderKey: "data__alt mob no",
    render: (row: any) => row.data?.["alt mob no"] || "—",
  },
  {
    key: "email",
    label: "Email ID",
    sort_allowed: true,
    orderKey: "data__email id",
    render: (row: any) => row.data?.["email id"] || "—",
  },
  {
    key: "whatsapp",
    label: "Whatsapp No",
    sort_allowed: true,
    orderKey: "data__whatsapp no",
    render: (row: any) => row.data?.["whatsapp no"] || "—",
  },
  {
    key: "package_test",
    label: "Package & Test Name",
    sort_allowed: true,
    orderKey: "data__package & test name",
    render: (row: any) => row.data?.["package & test name"] || "—",
  },
  {
    key: "package_amount",
    label: "Package Amount",
    sort_allowed: true,
    orderKey: "data__package amount",
    render: (row: any) => row.data?.["package amount"] || "—",
  },
  {
    key: "verify_package_amount",
    label: "Verify Package Amount",
    sort_allowed: true,
    orderKey: "data__verify package amount",
    render: (row: any) => row.data?.["verify package amount"] || "—",
  },
  {
    key: "team_lead",
    label: "Team Lead",
    sort_allowed: true,
    orderKey: "data__team lead",
    render: (row: any) => row.data?.["team lead"] || "—",
  },
  {
    key: "remark",
    label: "Remark If Any",
    sort_allowed: true,
    orderKey: "data__remark if any",
    render: (row: any) => row.data?.["remark if any"] || "—",
  },
  {
    key: "phlebo",
    label: "Phlebo Name",
    sort_allowed: true,
    orderKey: "data__phlebo name",
    render: (row: any) => row.data?.["phlebo name"] || "—",
  },
  {
    key: "lead_type",
    label: "Lead Type",
    sort_allowed: true,
    orderKey: "data__lead type",
    render: (row: any) => row.data?.["lead type"] || "—",
  },
  {
    key: "timing",
    label: "Timing",
    sort_allowed: true,
    orderKey: "data__timing",
    render: (row: any) => row.data?.timing || "—",
  },
  {
    key: "zone",
    label: "Zone",
    sort_allowed: true,
    orderKey: "data__zone",
    render: (row: any) => row.data?.zone || "—",
  },
  {
    key: "report_done_by",
    label: "Report Done By",
    sort_allowed: true,
    orderKey: "data__report done by",
    render: (row: any) => row.data?.["report done by"] || "—",
  },
  {
    key: "status",
    label: "Status",
    sort_allowed: true,
    orderKey: "data__status",
    render: (row: any) => row.data?.status || "—",
  },
  {
    key: "column1",
    label: "Column1",
    sort_allowed: true,
    orderKey: "data__column1",
    render: (row: any) => row.data?.column1 || "—",
  },
  {
    key: "column2",
    label: "Column2",
    sort_allowed: true,
    orderKey: "data__column2",
    render: (row: any) => row.data?.column2 || "—",
  },
];


  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Old Leads"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DataTable
            scroll_y
            header="Old Uploaded Leads"
            subheader="Leads imported from Excel uploads"
            apiUrl="crm/old-data/"
            columns={columns}
            showSearch
            // showDateRange
            showAdd={false}
            emptyMessage="No records found"
          />
        </main>
      </div>
    </div>
  );
};

export default OldLeads;
