
import api from "./api";

// ==========================================
// GET PUBLISHED EVENTS
// ==========================================

export const getPublishedEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

// ==========================================
// GET FULL EVENT DETAILS
// ==========================================

export const getPublishedEventById = async (id) => {
  const { data } = await api.get(`/events/${encodeURIComponent(id)}`);
  return data;
};
