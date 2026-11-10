
import api from "./api";

// GET COUNTY PRESIDENT ACCOUNT PROFILE
export const getAssociationProfile = async () => {
  const { data } = await api.get("/association/profile");
  return data;
};

// UPDATE COUNTY PRESIDENT PERSONAL PROFILE
export const updateAssociationProfile = async (profileData) => {
  const { data } = await api.put("/association/profile", profileData);
  return data;
};
