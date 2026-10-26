"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudUpload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { DUMMY_USER_MAPPING } from "@/lib/constants/dummyData";

// Dynamic imports for optimization
const ShopUsersTable = dynamic(
  () => import('@/components/tables/shopStaffMaping').then(mod => ({ default: mod.ShopUsersTable })),
  {
    loading: () => <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />,
    ssr: false
  }
);

const UserMappingPage = () => {

  const [headerData, setHeaderData] = useState<{
    salesPerson: string;
    search: string;
  }>({
    salesPerson: "",
    search: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const salesPerson = DUMMY_USER_MAPPING.findSalesPerson;

  const users = React.useMemo(() => {
    let result = [...DUMMY_USER_MAPPING.users];
    if (headerData.salesPerson) {
      result = result.filter(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(headerData.salesPerson.toLowerCase()));
    }
    if (headerData.search.trim()) {
      const q = headerData.search.toLowerCase().trim();
      result = result.filter(u =>
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [headerData.salesPerson, headerData.search]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Only CSV or Excel files are allowed!");
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      showToast("success", "Mapping file processed successfully!");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 600);
  };
  return (
    <>
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 p-4 bg-white rounded-xl border-b border-gray-200">
        {/* LEFT SECTION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <HeaderSelect
            data={salesPerson}
            title={"Sales Person Name"}
            value={headerData.salesPerson}
            onChange={(e) => {

              setHeaderData((prev) => ({ ...prev, salesPerson: e }));
            }}
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handleFileClick}
            disabled={isUploading}
            className="flex flex-row justify-center items-center px-4 py-2 gap-2 h-10 bg-gradient-to-b from-[#FF4250] to-[#D73742] rounded-lg shadow-sm hover:opacity-90 transition-opacity active:scale-95 duration-300 text-white text-sm font-medium w-full sm:w-auto"
            style={{ boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)" }}
          >
            <CloudUpload className="w-4 h-4 text-[#FAFAFA]" />
            {isUploading ? "Uploading..." : "Upload CSV"}
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv, .xls, .xlsx"
            onChange={handleFileChange}
          />

          <Input
            type="text"
            placeholder="Search Staff"
            value={headerData.search}
            maxLength={30}
            onChange={(e) =>
              setHeaderData({ ...headerData, search: e.target.value })
            }
            onBlur={() => setHeaderData({ ...headerData, search: headerData.search.trimStart() })}
            className="w-full sm:w-64 max-w-[300px]"
          />
        </div>
      </header>

      <main className="mt-4 rounded-xl border border-gray-200">
        <ShopUsersTable users={users} salesPerson={headerData.salesPerson.toString()} title="Staff Management Mapping" />
      </main>
    </>
  );
};

export default UserMappingPage;

function HeaderSelect({
  data,
  title,
  value,
  onChange,
}: {
  data: { id: number; full_name: string }[];
  title: string;
  value: string;
  onChange: (e: string) => void;
}) {
  // Find the current selected item's ID based on the full_name
  const selectedId = data.find(item => item.full_name === value)?.id.toString() || "";

  return (
    <Select
      value={selectedId}
      onValueChange={(e) => {
        if (e === "all") {
          onChange("");
        } else {
          const selectedItem = data.find((item) => item.id.toString() === e);
          onChange(selectedItem?.full_name || "");
        }
      }}
    >
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent className='w-full sm:max-h-[180px] '>
        <SelectItem value="all">
          All
        </SelectItem>
        {data.map((item) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
