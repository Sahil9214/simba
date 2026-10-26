"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { DUMMY_USERS_LIST } from "@/lib/constants/dummyData";
import type { UserFilters } from "@/lib/types/userManagement.types";
import { Switch } from "../ui/switch";
import { Modal } from "../ui/modal";
import { useDebounced } from "@/hooks/useDebounce";
import { toast } from "sonner";

interface UserManagementTableProps {
  onView?: (user: any) => void;
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
  toggleUserStatus?: (user: any) => void;
  itemsPerPage?: number;
  showPagination?: boolean;
  filters?: UserFilters;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  onView,
  onEdit: externalOnEdit,
  onDelete: externalOnDelete,
  toggleUserStatus: externalToggleUserStatus,
  itemsPerPage = 10,
  showPagination = true,
  filters: externalFilters,
}) => {
  const [usersList, setUsersList] = useState<any[]>(DUMMY_USERS_LIST);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openUserEditModal, setOpenUserEditModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const debouncedSearchTerm = useDebounced(searchTerm, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, roleFilter, statusFilter, externalFilters]);

  // Filter dummy users locally
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (debouncedSearchTerm) {
        const query = debouncedSearchTerm.toLowerCase();
        const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        if (!fullName.includes(query) && !email.includes(query)) return false;
      }
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }
      if (statusFilter === "active" && !u.is_active) {
        return false;
      }
      if (statusFilter === "inactive" && u.is_active) {
        return false;
      }
      return true;
    });
  }, [usersList, debouncedSearchTerm, roleFilter, statusFilter]);

  const users = filteredUsers;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = users.slice(startIndex, endIndex);

  const getStatusBadge = (isActive: boolean) => {
    const status = isActive ? "Active" : "Inactive";
    const styles = isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

    return (
      <Badge
        className={`${styles} hover:${styles} px-3 py-1 rounded-full text-xs font-medium`}
      >
        {status}
      </Badge>
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleToggleStatus = (user: any) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
    );
    toast.success(`User status changed to ${!user.is_active ? "Active" : "Inactive"}`);
    externalToggleUserStatus?.(user);
  };

  const handleEditUser = (updatedData: any) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === selectedUser?.id ? { ...u, ...updatedData } : u))
    );
    toast.success("User updated successfully");
    externalOnEdit?.(updatedData);
  };

  const handleDeleteUser = (user: any) => {
    setUsersList((prev) => prev.filter((u) => u.id !== user.id));
    toast.success("User deleted successfully");
    externalOnDelete?.(user);
  };

  const canModifyUser = (_targetUser: any): boolean => {
    return true;
  };

  return (
    <div className="w-full">
      <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[12.75px] p-4">
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col lg:flex-row items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => setSearchTerm(searchTerm.trimStart())}
                className="w-[300px] h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-[124px] h-10 border border-[#E5E5E5] rounded-lg shadow-sm font-semibold">
                <SelectValue placeholder="By Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>

                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[124px] h-10 border border-[#E5E5E5] rounded-lg shadow-sm font-semibold">
                <SelectValue placeholder="By Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
          <div className="bg-tertiary-color border-b border-[#E5E5E5] ">
            <div className="flex  ">
              <div className="flex-1 min-w-[200px] p-3 flex items-center">
                <span className="text-sm font-medium text-placeholder-gray">
                  Name
                </span>
              </div>
              <div className="flex-1 min-w-[150px] p-3 flex items-center">
                <span className="text-sm font-medium text-placeholder-gray">
                  Phone
                </span>
              </div>
              <div className="flex-1 min-w-[150px] p-3 flex items-center">
                <span className="text-sm font-medium text-placeholder-gray">
                  Role
                </span>
              </div>
              <div className="flex-1 min-w-[120px] p-3 flex items-center">
                <span className="text-sm font-medium text-placeholder-gray">
                  Status
                </span>
              </div>
              <div className="w-[85px] flex items-center p-3 justify-center">
                <span className="text-sm font-medium text-placeholder-gray">
                  Actions
                </span>
              </div>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {currentData.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            ) : (
              currentData.map((user: any, index: number) => (
                <div
                  key={user.id}
                  className={`flex items-center border-b border-[#E5E5E5] h-16 ${
                    index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                  }`}
                >
                  <div className="flex-1 min-w-[200px] px-3 flex items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-sidebar-foreground">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-xs text-placeholder-gray">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px] px-2 flex items-center">
                    <span className="text-sm font-normal text-sidebar-foreground">
                      {user.phone}
                    </span>
                  </div>
                  <div className="flex-1 min-w-[150px] px-2 flex items-center">
                    <span className="text-sm font-normal text-sidebar-foreground">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex-1 min-w-[120px] px-2 flex items-center">
                    <Switch
                      className="cursor-pointer"
                      checked={user.is_active}
                      onCheckedChange={() => handleToggleStatus(user)}
                    />
                  </div>
                  <div className="w-[85px] flex items-center justify-center pr-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-gray-50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="max-w-[180px] sm:min-w-[160px] w-auto mr-2"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenUserEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2 text-gray-500 cursor-pointer" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToDelete(user);
                            setOpenDeleteModal(true);
                          }}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showPagination && totalPages > 1 && (
          <div className="flex lg:flex-row flex-col justify-between items-center mt-4">
            <div className="text-base font-normal text-black text-center lg:text-left">
              Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of{" "}
              {users.length} users
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 lg:px-4 px-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1 hover:bg-gray-200" />
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                <Button
                  key={i}
                  variant={i + 1 === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-9 h-9 rounded-lg ${
                    i + 1 === currentPage
                      ? "border border-[#E5E5E5] shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 lg:px-4 px-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        {openUserEditModal && selectedUser && (
          <UserEditModal
            isOpen={openUserEditModal}
            onClose={() => {
              setOpenUserEditModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onUpdate={handleEditUser}
          />
        )}
        {openDeleteModal && userToDelete && (
          <DeleteUserConfirmationModal
            isOpen={openDeleteModal}
            onClose={() => {
              setOpenDeleteModal(false);
              setUserToDelete(null);
            }}
            user={userToDelete}
            onConfirm={() => {
              handleDeleteUser(userToDelete);
              setOpenDeleteModal(false);
              setUserToDelete(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate?: (user: any) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
}) => {
  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [errors, setErrors] = React.useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [isPending, setIsPending] = React.useState(false);

  // Initialize form data when modal opens or user changes
  React.useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      });
      setErrors({
        first_name: "",
        last_name: "",
        phone: "",
      });
    }
  }, [isOpen, user]);

  const validateName = (name: string, fieldName: string): string => {
    if (!name.trim()) {
      return `${fieldName} is required`;
    }
    if (name.trim().length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (name.trim().length > 50) {
      return `${fieldName} must not exceed 50 characters`;
    }
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    return "";
  };

  const validatePhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber.trim()) {
      return "Phone number is required";
    }
    const cleaned = phoneNumber.replace(/\s/g, "");
    if (!cleaned.startsWith("+91")) {
      return "Phone number must start with +91";
    }
    const digitsOnly = cleaned.slice(3);
    if (!/^\d{10}$/.test(digitsOnly)) {
      return "Phone number must have exactly 10 digits after +91";
    }
    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleBlur = (field: string) => {
    let error = "";
    if (field === "first_name") {
      error = validateName(formData.first_name, "First Name");
    } else if (field === "last_name") {
      error = validateName(formData.last_name, "Last Name");
    } else if (field === "phone") {
      error = validatePhoneNumber(formData.phone);
    }
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling

    // Validate all fields before submission
    const firstNameError = validateName(formData.first_name, "First Name");
    const lastNameError = validateName(formData.last_name, "Last Name");
    const phoneError = validatePhoneNumber(formData.phone);

    setErrors({
      first_name: firstNameError,
      last_name: lastNameError,
      phone: phoneError,
    });

    // Stop submission if there are errors
    if (firstNameError || lastNameError || phoneError) {
      return;
    }

    // Update user data locally
    onUpdate?.({
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      className="cursor-pointer z-10"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name and Last Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <Input
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              onBlur={() => handleBlur("first_name")}
              className={`w-full ${errors.first_name ? "border-red-500" : ""}`}
              required
              type="text"
              disabled={isPending}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <Input
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              onBlur={() => handleBlur("last_name")}
              className={`w-full ${errors.last_name ? "border-red-500" : ""}`}
              required
              type="text"
              disabled={isPending}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Phone Number Row */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <Input
            placeholder="+91 "
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            className={`w-full ${errors.phone ? "border-red-500" : ""}`}
            required
            disabled={isPending}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 border-gray-300"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 bg-gradient-to-b from-[#FF4250] to-[#D73742] text-white hover:opacity-90"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface DeleteUserConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onConfirm: () => void;
}

const DeleteUserConfirmationModal: React.FC<
  DeleteUserConfirmationModalProps
> = ({ isOpen, onClose, user, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isDeleting]);

  // Focus trapping effect
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent keyboard events from reaching background elements
        if (!modalRef.current?.contains(e.target as Node)) {
          e.stopPropagation();
          // Focus the modal if user tries to interact with background
          firstElement?.focus();
        }
      };

      document.addEventListener("keydown", handleTabKey);
      document.addEventListener("keydown", handleKeyDown, true); // Use capture phase

      // Focus first element when modal opens
      setTimeout(() => firstElement?.focus(), 100);

      return () => {
        document.removeEventListener("keydown", handleTabKey);
        document.removeEventListener("keydown", handleKeyDown, true);
        // Restore previous focus when modal closes
        if (previousFocusRef.current && !isOpen) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.email ||
      "this user"
    : "this user";
  const userEmail = user?.email || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal when clicking outside (but not when deleting)
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className="bg-white text-gray-900 rounded-xl p-6 w-[90%] max-w-md shadow-xl font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-2 text-center text-gray-900">
          Delete User Permanently?
        </h2>

        {/* Warning Message */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900">{userName}</strong>?
          </p>
          {userEmail && (
            <p className="text-xs text-gray-500 mb-3">{userEmail}</p>
          )}
          <p className="text-sm text-red-600 font-medium">
            This action cannot be undone. All user data will be permanently
            deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
