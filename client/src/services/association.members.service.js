
import api from "./api";

// ==========================================
// GET MEMBERS OF THE CURRENT COUNTY ASSOCIATION
// ==========================================

export const getAssociationMembers = async () => {
  const { data } = await api.get("/association/members");

  return data;
};
