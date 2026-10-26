"use client"
import React, { useState } from 'react';
import { ChevronDown, Upload, Plus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/sidebar/sidebar-context';
import { AddSalespersonModal, InviteSentSuccessModal } from '@/components/ui/modal';
import { Input } from '../ui/input';

interface HeaderDataProps {
  heading: string;
  showLocationDropdown?: boolean;
  showShopDropdown?: boolean;
  showSKUDropdown?: boolean;
  showProductTypeDropdown?: boolean;
  showSalespersonDropdown?: boolean;
  showExportReportsButton?: boolean;
  onAddSalesperson?: (data: {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phoneNumber: string;
  }) => Promise<void>;
  onInviteSent?: () => void;
  onSearchChange?: (searchTerm: string) => void;
  onLocationChange?: (location: string) => void;
  onProductTypeChange?: (productType: string) => void;
  searchIsWorking?: boolean;
  invitedUserData?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  onSuccessModalClose?: () => void;
  isCreatingUser?: boolean;
}

export const HeaderData: React.FC<HeaderDataProps> = ({
  heading,
  showLocationDropdown = true,
  showExportReportsButton = true,
  showProductTypeDropdown = false,
  onAddSalesperson,
  onInviteSent,
  onSearchChange,
  onLocationChange,
  onProductTypeChange,
  searchIsWorking = false,
  invitedUserData = null,
  onSuccessModalClose,
  isCreatingUser = false
}) => {
  const { toggle } = useSidebar();
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProductType, setSelectedProductType] = useState('All Products');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const locations = ["Dehli"]; // yaha add kar lena
  const productTypes = ["All products", "Vodka", "Beer", "Whisky"];

  // Handler functions
  const handleAddSalesperson = async (data: {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phoneNumber: string;
  }) => {
    if (onAddSalesperson) {
      await onAddSalesperson(data);
    }
  };

  const handleInviteSent = (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
  }) => {
    // This is no longer needed as success modal is controlled by invitedUserData
    if (onInviteSent) {
      onInviteSent();
    }
  };

  const handleSearchChange = (value: string) => {
    value = value.trim();
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    if (onLocationChange) {
      onLocationChange(location);
    }
  };

  const mapProductTypeToApi = (label: string) => {
    if (label === 'All' || label === 'All Products' || label === 'All products') return '';
    if (label === 'Beer' || label === 'BEER') return 'BEER';
    if (label === 'Vodka' || label === 'VODKA') return 'VODKA';
    if (label === 'Whisky' || label === 'WHISKY') return 'WHISKY';
    if (label === "All products") return '';
    return label;
  };

  const handleProductTypeChange = (label: string) => {
    const value = mapProductTypeToApi(label);
    setSelectedProductType(label);
    if (onProductTypeChange) {
      onProductTypeChange(value);
    }
  };

  const handleButtonClick = () => {
    if (heading === "User Management") {
      setIsModalOpen(true);
    }
    // For other headings, do nothing for now as requested
  };
  return (
    <div className="flex flex-col font-inter  gap-4 w-full">
      {/* Header Row */}
      <div className="flex flex-row justify-between items-center w-full gap-2">
        {/* Mobile Sidebar Toggle Button */}
        <div className="md:hidden">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-5 h-5 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors duration-200"
            aria-label="Open sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h12M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Heading */}
        <h1 className="font-inter text-lg sm:text-xl font-bold leading-6 sm:leading-8 text-charcoal-black flex-1 text-center md:text-left">
          {heading}
        </h1>

        {/* Desktop Controls - Only on large screens */}
        <div className="hidden  lg:flex flex-row items-center gap-4">
          {/* Dropdowns */}
          <div className="flex flex-row items-center gap-2">
            {showLocationDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex flex-row justify-center items-center px-4 py-2 gap-2 bg-white border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-normal text-sm leading-5 text-sidebar-foreground cursor-pointer"
                    aria-label="Select location"
                    aria-haspopup="menu"
                  >
                    <span className=" font-inter text-sm leading-5 text-sidebar-foreground">{selectedLocation === "All" ? "Dehli" : "Dehli"}</span>
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="flex flex-col items-start p-1  absolute -left-20 top-0 bg-white border border-[#E5E5E5] rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] z-10"
                  align="start"

                >
                  {locations.map((location) => (
                    <DropdownMenuItem
                      key={location}
                      onClick={() => handleLocationChange(location === "Dehli" ? "All" : "Dehli")}
                      className="flex flex-row items-center px-2 py-1.5 gap-2 max-w-[150px] h-8 rounded-md hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                    >
                      <span className="min-w-[200px] h-5 font-inter  text-sm leading-5 text-sidebar-foreground">{location}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {showProductTypeDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex flex-row justify-center items-center px-4 py-2 gap-2 bg-white border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-normal text-sm leading-5 text-sidebar-foreground cursor-pointer"
                    aria-label="Select product type"
                    aria-haspopup="menu"
                  >
                    <span className=" font-inter text-sm leading-5 text-sidebar-foreground">{selectedProductType}</span>
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="flex flex-col items-start p-1  absolute -left-20 top-0 bg-white border border-[#E5E5E5] rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] z-10"
                  align="start"
                >
                  {productTypes.map((productType) => (
                    <DropdownMenuItem
                      key={productType}
                      onClick={() => handleProductTypeChange(productType)}
                      className="flex flex-row items-center px-2 py-1.5 gap-2 max-w-[150px] h-8 rounded-md hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                    >
                      <span className="min-w-[200px] h-5 font-inter  text-sm leading-5 text-sidebar-foreground">{productType}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {
              searchIsWorking && (

                <div className="relative flex-1 sm:flex-none bg-white rounded-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray " />
                  <Input
                    placeholder="Search by shop or product..."
                    value={searchTerm}
                    maxLength={15}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full sm:w-[239px] h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
                  />
                </div>
              )}
          </div>

          {showExportReportsButton && heading === "User Management" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm w-full cursor-pointer"
            >

              <>
                <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Add Salesperson</span>
              </>

            </button>
          )}

        </div>
      </div>

      {/* Mobile/Tablet Controls Row */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-2 w-full">

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 w-full">
            {showLocationDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm w-full lg:min-w-[120px] cursor-pointer"
                    aria-label="Select location"
                    aria-haspopup="menu"
                  >
                    <span className="truncate">{selectedLocation}</span>
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[var(--radix-dropdown-menu-trigger-width)] lg:w-full p-1 z-50 cursor-pointer"
                  align="start"
                  sideOffset={4}
                >
                  {locations.map((location) => (
                    <DropdownMenuItem
                      key={location}
                      onClick={() => handleLocationChange(location)}
                      className="cursor-pointer text-sm px-3 py-1.5 rounded-sm hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {location}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {showProductTypeDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-md  text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm w-full lg:min-w-[120px] cursor-pointer "
                    aria-label="Select product type"
                    aria-haspopup="menu"
                  >
                    <span className="truncate">{selectedProductType}</span>
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[var(--radix-dropdown-menu-trigger-width)] lg:w-full p-1 z-50 cursor-pointer"
                  align="start"
                  sideOffset={4}
                >
                  {productTypes.map((productType) => (
                    <DropdownMenuItem
                      key={productType}
                      onClick={() => handleProductTypeChange(productType)}
                      className="cursor-pointer text-sm px-3 py-1.5 rounded-sm hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {productType}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {searchIsWorking && (
              <div className="relative flex-1 sm:flex-none bg-white rounded-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray " />
                <Input
                  placeholder="Search by shop or product..."
                  value={searchTerm}
                  maxLength={15}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full sm:w-[239px] h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
                />
              </div>
            )}
          </div>

          {showExportReportsButton && (
            <button
              onClick={handleButtonClick}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm w-full cursor-pointer"
            >
              {heading === "User Management" ? (
                <>
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Add Salesperson</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Export Reports</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>


      {
        heading === "User Management" && (
          <>
            <AddSalespersonModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleAddSalesperson}
              onInviteSent={handleInviteSent}
              isLoading={isCreatingUser}
            />
            {invitedUserData && (
              <InviteSentSuccessModal
                isOpen={true}
                onClose={() => {
                  if (onSuccessModalClose) {
                    onSuccessModalClose();
                  }
                }}
                firstName={invitedUserData.firstName}
                lastName={invitedUserData.lastName}
                email={invitedUserData.email}
              />
            )}
          </>
        )
      }
    </div>
  );
};


//Header-Data-Placeholder