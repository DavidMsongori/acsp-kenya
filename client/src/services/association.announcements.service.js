
import api from "./api";

// ==========================================
// GET ALL PUBLISHED ANNOUNCEMENTS
// ==========================================

export const getPublishedAnnouncements = async (params = {}) => {
  const { data } = await api.get("/announcements", { params });
  return data;
};

// ==========================================
// GET FEATURED ANNOUNCEMENTS
// ==========================================

export const getFeaturedAnnouncements = async () => {
  const { data } = await api.get("/announcements/featured");
  return data;
};

// ==========================================
// GET FULL ANNOUNCEMENT DETAILS
// ==========================================

export const getAnnouncementBySlug = async (slug) => {
  const { data } = await api.get(
    `/announcements/${encodeURIComponent(slug)}`
  );

  return data;
};
