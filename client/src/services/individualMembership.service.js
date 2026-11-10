
import api from "./api";

// Submit an individual student membership application.
export const submitIndividualMembershipApplication = async (
  applicationData
) => {
  const { data } = await api.post(
    "/membership/individual/apply",
    applicationData
  );

  return data;
};

// Retrieve the logged-in student's application.
export const getMyIndividualMembershipApplication = async () => {
  const { data } = await api.get(
    "/membership/individual/my-application"
  );

  return data;
};
