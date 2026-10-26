import { axiosInstance } from "@/lib/axios";
import { apiEndPoints } from "@/lib/axios/axios.endpoint";

export const triggerInventorySync = async (reportedBy: string) => {
  if (!reportedBy) return;
  try {
    await axiosInstance.post(apiEndPoints.inventorySync, {
      reported_by: reportedBy,
    });
  } catch (error) {
    // Silent failure – inventory sync should not block main flow
    // Optionally, this can be logged in future if needed.
  }
};

