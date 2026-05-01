import axiosInstance from "~/utils/axiosinstance";

// POST /api/emergency/trigger
// Sends the client's GPS coordinates to the backend.
// Backend will fetch their medical profile, send emails + SMS to emergency contacts.
export const triggerEmergencyAlert = async (
  latitude: number,
  longitude: number
): Promise<{
  message: string;
  location: string;
  mapsLink: string;
  emailSentTo: string[];
}> => {
  const response = await axiosInstance.post("/emergency/trigger", {
    latitude,
    longitude,
  });
  return response.data;
};