"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/avatar/get-initials";
import { getColorClasses } from "@/utils/avatar/get-color-classes";
import { useState } from "react";
import Image from "next/image";

export default function AccountPanel() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const meta: any = user?.user_metadata;
  const firstName = (meta?.first_name || "").trim();
  const lastName = (meta?.last_name || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const email = user?.email || meta?.email || "";
  const phone = meta?.phone || "";
  const role = meta?.role;

  // Check if avatar_url exists and is a valid URL
  const avatarUrl = meta?.avatar_url;
  const hasValidImage = avatarUrl && avatarUrl !== "/user-placeholder.png" && avatarUrl.startsWith("http");

  const initials = getInitials(firstName, lastName, email);
  const colorClasses = getColorClasses(initials[0]);


  return (
    <div className="min-h-screen  py-8 px-4">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Account Information</h1>
          <p className="text-gray-600">Personal details and general information</p>
        </div>

        <Card className="shadow-lg border border-gray-200 rounded-2xl bg-white">
          <CardContent className="p-8">
            {/* Profile Picture Section */}
            <div className="mb-8">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Profile Picture</Label>
              <div className="flex items-center gap-6">
                <div className={`relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-white shadow-sm`}>
                  {hasValidImage ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName || "User"}
                      className="object-cover w-full h-full"
                      width={80}
                      height={80}
                      onError={(e: any) => {
                        e.currentTarget.style.display = 'none';
                      }}

                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${colorClasses}`}>
                      <span className="text-xl font-semibold text-white">{initials}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={fullName || "Testing master"}
                  disabled={!isEditing}
                  className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">🇮🇳</span>
                  </div>
                  <Input
                    id="phone"
                    value={phone || "+91 88490-38495"}
                    disabled={!isEditing}
                    className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email || "app@gprime.com"}
                  disabled={!isEditing}
                  className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-500"
                />
              </div>

              {/* Position/Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Position/Role
                </Label>
                <Input
                  id="role"
                  value={role ? role.replaceAll("_", " ") : "Manager"}
                  disabled={!isEditing}
                  className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
