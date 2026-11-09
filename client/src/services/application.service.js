
import api from "./api";

// ==========================================
// Submit County President Application
// ==========================================

export const submitApplication = async (applicationData) => {
  const { data } = await api.post(
    "/applications",
    applicationData
  );

  return data;
};

// ==========================================
// Get Current User's Application
// ==========================================

export const getMyApplication = async () => {
  const { data } = await api.get("/applications/me");

  return data;
};
