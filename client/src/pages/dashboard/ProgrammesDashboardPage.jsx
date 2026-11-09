
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  FolderKanban,
  CheckCircle,
  Clock,
  Archive,
  CalendarDays,
  X,
  Save,
  MapPin,
  Eye,
  PlusCircle,
  Upload,
  Image,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./ProgrammesDashboardPage.css";

// ==========================================
// FORMATTERS
// ==========================================

const formatStatus = (status) => {
  if (!status) return "Not Available";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Not Set";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ==========================================
// INITIAL FORM
// ==========================================

const initialForm = {
  title: "",
  description: "",
  objectives: "",
  start_date: "",
  end_date: "",
};

// ==========================================
// PROGRAMMES DASHBOARD
// ==========================================

const ProgrammesDashboardPage = () => {
  


const getCloudinaryPublicId = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const uploadPath = url.pathname.split("/upload/")[1];

    if (!uploadPath) return null;

    const segments = uploadPath.split("/");
    const versionIndex = segments.findIndex(
      (segment) => /^v\d+$/.test(segment)
    );

    const publicIdSegments =
      versionIndex >= 0
        ? segments.slice(versionIndex + 1)
        : segments;

    const publicId = publicIdSegments.join("/");

    return publicId.replace(/\.[^/.]+$/, "");
  } catch (error) {
    console.error("Cloudinary URL parsing error:", error);
    return null;
  }
};


  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingProgramme, setEditingProgramme] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingProgrammeId, setDeletingProgrammeId] = useState(null);
  const [programmeToDelete, setProgrammeToDelete] = useState(null);

  const [updatingStatus, setUpdatingStatus] = useState(null);

    // ACTIVITY MANAGEMENT
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // COUNTY DATA
  const [counties, setCounties] = useState([]);
  const [countiesLoading, setCountiesLoading] = useState(false);

    const initialActivityForm = {
    title: "",
    description: "",
    county_id: "",
    activity_date: "",
    location: "",
    image_urls: [],
  };

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityForm, setActivityForm] = useState(initialActivityForm);
  const [savingActivity, setSavingActivity] = useState(false);
  const [updatingActivityStatus, setUpdatingActivityStatus] = useState(false);

  const [selectedActivityImages, setSelectedActivityImages] = useState([]);
  const [removedActivityImages, setRemovedActivityImages] = useState([]);


  // ==========================================
  // FETCH PROGRAMMES
  // ==========================================

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/programmes");

      setProgrammes(response.data.programmes || []);
    } catch (err) {
      console.error("Admin programmes error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to retrieve national programmes."
      );

      toast.error("Unable to load programmes.");
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    fetchProgrammes();
    fetchCounties();
  }, []);

    // ==========================================
  // CREATE ACTIVITY
  // ==========================================

  const handleActivityFormChange = (event) => {
    const { name, value } = event.target;

    setActivityForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  
const handleActivityImagesChange = (event) => {
  const files = Array.from(event.target.files || []);

  if (files.length > 10) {
    toast.error("You can select a maximum of 10 photographs.");
    event.target.value = "";
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const invalidFile = files.find(
    (file) => !allowedTypes.includes(file.type) ||
      file.size > 5 * 1024 * 1024
  );

  if (invalidFile) {
    toast.error(
      "Only JPG, PNG and WebP images up to 5 MB each are allowed."
    );
    event.target.value = "";
    return;
  }

  const previews = files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
  }));

  setSelectedActivityImages((current) => {
    current.forEach((image) => URL.revokeObjectURL(image.preview));
    return previews;
  });

  event.target.value = "";
};

const removeActivityImage = (index) => {
  setSelectedActivityImages((current) => {
    const imageToRemove = current[index];

    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    return current.filter((_, imageIndex) => imageIndex !== index);
  });
};


  

const handleCreateActivity = async (event) => {
  event.preventDefault();

  if (!selectedProgramme?.id || savingActivity) return;

  if (
    !activityForm.title.trim() ||
    !activityForm.description.trim() ||
    !activityForm.county_id ||
    !activityForm.activity_date
  ) {
    toast.error("Please complete all required activity fields.");
    return;
  }

  try {
    setSavingActivity(true);

    let imageUrls = [...(activityForm.image_urls || [])];

    // UPLOAD NEW PHOTOGRAPHS TO CLOUDINARY
    if (selectedActivityImages.length > 0) {
      const imageData = new FormData();

      selectedActivityImages.forEach((image) => {
        imageData.append("activityImages", image.file);
      });

      const uploadResponse = await api.post(
        "/uploads/activity-images",
        imageData
      );

      const uploadedUrls = (uploadResponse.data.images || []).map(
        (image) => image.url
      );

      imageUrls = [...imageUrls, ...uploadedUrls];
    }

    const payload = {
      title: activityForm.title.trim(),
      description: activityForm.description.trim(),
      county_id: Number(activityForm.county_id),
      activity_date: activityForm.activity_date,
      location: activityForm.location.trim() || null,
      image_urls: imageUrls,
    };

    let response;

    
if (editingActivity) {
  // UPDATE EXISTING ACTIVITY
  response = await api.patch(
    `/admin/programmes/${selectedProgramme.id}/activities/${editingActivity.id}`,
    payload
  );

  // DELETE REMOVED PHOTOGRAPHS FROM CLOUDINARY
  if (removedActivityImages.length > 0) {
    const deletionResults = await Promise.allSettled(
      removedActivityImages.map((imageUrl) => {
        const publicId = getCloudinaryPublicId(imageUrl);

        if (!publicId) {
          return Promise.reject(
            new Error("Unable to identify Cloudinary image.")
          );
        }

        return api.delete("/uploads/programme-image", {
          data: { publicId },
        });
      })
    );

    const failedDeletions = deletionResults.filter(
      (result) => result.status === "rejected"
    );

    if (failedDeletions.length > 0) {
      toast.error(
        `${failedDeletions.length} photograph(s) could not be deleted from Cloudinary.`
      );
    }
  }
} else {
  // CREATE NEW ACTIVITY
  response = await api.post(
    `/admin/programmes/${selectedProgramme.id}/activities`,
    payload
  );
}


    toast.success(
      response.data.message ||
        (editingActivity
          ? "Activity updated successfully."
          : "Activity created successfully.")
    );

    selectedActivityImages.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setSelectedActivityImages([]);
    setRemovedActivityImages([]);
    setActivityForm(initialActivityForm);
    setEditingActivity(null);
    setShowActivityForm(false);

    await fetchProgrammeActivities(selectedProgramme);
  } catch (err) {
    console.error("Save activity error:", err);

    toast.error(
      err.response?.data?.message ||
        (editingActivity
          ? "Unable to update activity."
          : "Unable to create activity.")
    );
  } finally {
    setSavingActivity(false);
  }
};



const handleEditActivity = (activity) => {
  setEditingActivity(activity);

  setActivityForm({
    title: activity.title || "",
    description: activity.description || "",
    county_id: String(activity.county_id || ""),
    activity_date: activity.activity_date || "",
    location: activity.location || "",
    image_urls: activity.image_urls || [],
  });

  setSelectedActivityImages([]);
  setRemovedActivityImages([]);
  setShowActivityForm(true);
};



const handleRemoveExistingActivityImage = (imageUrl) => {
  setActivityForm((current) => ({
    ...current,
    image_urls: current.image_urls.filter(
      (url) => url !== imageUrl
    ),
  }));

  setRemovedActivityImages((current) =>
    current.includes(imageUrl) ? current : [...current, imageUrl]
  );
};




const handleActivityStatusChange = async (activity, newStatus) => {
  if (!selectedProgramme?.id || !activity?.id) return;

  try {
    setUpdatingActivityStatus(true);

    const response = await api.patch(
      `/admin/programmes/${selectedProgramme.id}/activities/${activity.id}/status`,
      { status: newStatus }
    );

    toast.success(
      response.data.message || "Activity status updated successfully."
    );

    await fetchProgrammeActivities(selectedProgramme);
  } catch (err) {
    console.error("Activity status update error:", err);

    toast.error(
      err.response?.data?.message ||
        "Unable to update activity status."
    );
  } finally {
    setUpdatingActivityStatus(false);
  }
};




  // ==========================================
  // FETCH COUNTIES
  // ==========================================

  const fetchCounties = async () => {
    try {
      setCountiesLoading(true);

      const response = await api.get("/counties");

      setCounties(response.data.counties || []);
    } catch (err) {
      console.error("Counties loading error:", err);
      toast.error("Unable to load counties.");
    } finally {
      setCountiesLoading(false);
    }
  };


    // ==========================================
  // FETCH PROGRAMME ACTIVITIES
  // ==========================================

  const fetchProgrammeActivities = async (programme) => {
    if (!programme?.id) return;

    try {
      setSelectedProgramme(programme);
      setShowActivitiesModal(true);
      setActivitiesLoading(true);
      setActivities([]);

      const response = await api.get(
        `/admin/programmes/${programme.id}/activities`
      );

      setActivities(response.data.activities || []);
    } catch (err) {
      console.error("Programme activities error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to retrieve programme activities."
      );
    } finally {
      setActivitiesLoading(false);
    }
  };


  // ==========================================
  // PROGRAMME STATISTICS
  // ==========================================

  const statistics = useMemo(
    () => ({
      total: programmes.length,
      published: programmes.filter(
        (item) => item.status === "published"
      ).length,
      drafts: programmes.filter(
        (item) => item.status === "draft"
      ).length,
      archived: programmes.filter(
        (item) => item.status === "archived"
      ).length,
    }),
    [programmes]
  );

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredProgrammes = programmes.filter((programme) => {
    const query = search.toLowerCase();

    return (
      (programme.title || "").toLowerCase().includes(query) ||
      (programme.description || "").toLowerCase().includes(query)
    );
  });

  // ==========================================
  // FORM HANDLING
  // ==========================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingProgramme(null);
    setForm(initialForm);
    setShowModal(true);
    setRemoveCoverImage(false);
  };

  
const handleEditProgramme = (programme) => {
  setEditingProgramme(programme);

  setForm({
    title: programme.title || "",
    description: programme.description || "",
    objectives: programme.objectives || "",
    start_date: programme.start_date || "",
    end_date: programme.end_date || "",
  });

  setSelectedCoverImage(null);
  setRemoveCoverImage(false);
  setCoverImagePreview(programme.cover_image_url || "");

  setShowModal(true);
};


  const closeCreateModal = () => {
    if (submitting) return;

    setShowModal(false);
    setForm(initialForm);
    setRemoveCoverImage(false);
  };

  
const handleCoverImageChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Only JPG, PNG and WebP images are allowed.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Cover image must not exceed 5 MB.");
    event.target.value = "";
    return;
  }

  if (coverImagePreview) {
    URL.revokeObjectURL(coverImagePreview);
  }

  setSelectedCoverImage(file);
  setCoverImagePreview(URL.createObjectURL(file));

  event.target.value = "";
};


  // ==========================================
  // CREATE PROGRAMME
  // ==========================================

  

const handleCreateProgramme = async (event) => {
  event.preventDefault();

  if (submitting) return;

  if (!form.title.trim() || !form.description.trim()) {
    toast.error("Programme title and description are required.");
    return;
  }

  if (
    form.start_date &&
    form.end_date &&
    form.start_date > form.end_date
  ) {
    toast.error("The end date cannot be earlier than the start date.");
    return;
  }

  let uploadedCoverImage = null;

  const oldCoverImageUrl = editingProgramme?.cover_image_url || null;

  try {
    setSubmitting(true);

    // UPLOAD NEW OR REPLACEMENT COVER IMAGE
    if (selectedCoverImage) {
      const imageData = new FormData();
      imageData.append("coverImage", selectedCoverImage);

      const uploadResponse = await api.post(
  "/uploads/programme-cover",
  imageData
);

      uploadedCoverImage = uploadResponse.data.image;
    }

    // PREPARE PROGRAMME DATA
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      objectives: form.objectives.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      cover_image_url: removeCoverImage
  ? null
  : uploadedCoverImage?.url || oldCoverImageUrl || null,
    };

    let response;

    if (editingProgramme) {
      // UPDATE EXISTING PROGRAMME
      response = await api.patch(
        `/admin/programmes/${editingProgramme.id}`,
        payload
      );

      toast.success(
        response.data.message || "Programme updated successfully."
      );
    } else {
      // CREATE NEW PROGRAMME
      response = await api.post(
        "/admin/programmes",
        payload
      );

      toast.success(
        response.data.message || "Programme created successfully."
      );
    }

    // DELETE OLD COVER AFTER SUCCESSFUL REPLACEMENT
   if (
  editingProgramme &&
  oldCoverImageUrl &&
  (
    removeCoverImage ||
    (uploadedCoverImage && oldCoverImageUrl !== uploadedCoverImage.url)
  )
) {
      const oldPublicId = getCloudinaryPublicId(oldCoverImageUrl);

      if (oldPublicId) {
        try {
          await api.delete("/uploads/programme-image", {
            data: { publicId: oldPublicId },
          });
        } catch (deleteError) {
          console.error(
            "Old cover image deletion error:",
            deleteError
          );

          toast.error(
            "Programme saved, but the previous cover image could not be deleted."
          );
        }
      }
    }

    // RESET FORM
    if (coverImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverImagePreview);
    }

    setShowModal(false);
    setForm(initialForm);
    setSelectedCoverImage(null);
    setRemoveCoverImage(false);
    setCoverImagePreview("");
    setEditingProgramme(null);

    await fetchProgrammes();

  } catch (err) {
    console.error("Save programme error:", err);

    // CLEAN UP NEW IMAGE IF SAVING FAILED
    if (uploadedCoverImage?.publicId) {
      try {
        await api.delete("/uploads/programme-image", {
          data: {
            publicId: uploadedCoverImage.publicId,
          },
        });
      } catch (deleteError) {
        console.error("Cover image cleanup error:", deleteError);
      }
    }

    toast.error(
      err.response?.data?.message ||
        (editingProgramme
          ? "Unable to update programme."
          : "Unable to create programme.")
    );
  } finally {
    setSubmitting(false);
  }
};



  // ==========================================
  // UPDATE PROGRAMME STATUS
  // ==========================================

  const handleStatusChange = async (programme, status) => {
    if (!programme?.id || !status || updatingStatus) return;

    if (programme.status === status) return;

    try {
      setUpdatingStatus(programme.id);

      const response = await api.patch(
        `/admin/programmes/${programme.id}/status`,
        { status }
      );

      toast.success(
        response.data.message || "Programme status updated."
      );

      await fetchProgrammes();
    } catch (err) {
      console.error("Programme status update error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to update programme status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ==========================================
  // STATISTICS CARDS
  // ==========================================

  const statCards = [
    {
      label: "Total Programmes",
      value: statistics.total,
      icon: FolderKanban,
      color: "blue",
    },
    {
      label: "Published",
      value: statistics.published,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Draft Programmes",
      value: statistics.drafts,
      icon: Clock,
      color: "orange",
    },
    {
      label: "Archived",
      value: statistics.archived,
      icon: Archive,
      color: "purple",
    },
  ];

  const handleDeleteProgramme = (programme) => {
  if (deletingProgrammeId) return;

  setProgrammeToDelete(programme);
};

const confirmDeleteProgramme = async () => {
  if (!programmeToDelete || deletingProgrammeId) return;

  const programmeId = programmeToDelete.id;

  try {
    setDeletingProgrammeId(programmeId);

    const response = await api.delete(
      `/admin/programmes/${programmeId}`
    );

    toast.success(
      response.data.message || "Programme deleted successfully."
    );

    setProgrammeToDelete(null);
    await fetchProgrammes();
  } catch (error) {
    console.error("Delete programme error:", error);

    toast.error(
      error.response?.data?.message || "Unable to delete programme."
    );
  } finally {
    setDeletingProgrammeId(null);
  }
};

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <AdminDashboardLayout
      title="National Programmes"
      subtitle="Create, manage and monitor ACSP-Kenya national programmes."
    >
      <div className="programmes-admin">

        {/* WELCOME SECTION */}

        <section className="programmes-admin-welcome">
          <div>
            <span>ACSP-KENYA · NATIONAL PROGRAMMES</span>

            <h2>Programme Management</h2>

            <p>
              Manage national programmes and coordinate activities
              implemented across Kenya's 47 counties.
            </p>
          </div>

          <button
            type="button"
            className="programmes-create-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Create Programme
          </button>
        </section>

        {/* STATISTICS */}

        <section className="programmes-statistics">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                className="programmes-stat-card"
                key={card.label}
              >
                <div className={`programmes-stat-icon ${card.color}`}>
                  <Icon size={22} />
                </div>

                <div>
                  <span>{card.label}</span>
                  <h3>{card.value}</h3>
                </div>
              </div>
            );
          })}
        </section>

        {/* PROGRAMME REGISTER */}

        <section className="programmes-register">

          <div className="programmes-register-heading">
            <div>
              <h2>National Programme Register</h2>

              <p>
                View and manage all programmes created by ACSP-Kenya.
              </p>
            </div>

            <button
              type="button"
              className="programmes-refresh-button"
              onClick={fetchProgrammes}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "programmes-spinning" : ""}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* SEARCH */}

          <div className="programmes-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search programmes by title or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="programmes-empty-state">
              <RefreshCw size={28} className="programmes-spinning" />
              <h3>Loading programmes</h3>
              <p>Please wait while we retrieve the programme register.</p>
            </div>
          ) : error ? (
            <div className="programmes-empty-state">
              <FolderKanban size={32} />
              <h3>Unable to load programmes</h3>
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchProgrammes}
              >
                Try Again
              </button>
            </div>
          ) : filteredProgrammes.length === 0 ? (
            <div className="programmes-empty-state">
              <FolderKanban size={35} />

              <h3>
                {search
                  ? "No matching programmes"
                  : "No national programmes yet"}
              </h3>

              <p>
                {search
                  ? "Try another search term."
                  : "Create the first national programme to begin managing activities across counties."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openCreateModal}
                >
                  <Plus size={16} />
                  Create First Programme
                </button>
              )}
            </div>
          ) : (
            <div className="programmes-list">

              <p className="programmes-results-count">
                {filteredProgrammes.length} programme(s) found
              </p>

              {filteredProgrammes.map((programme) => (
                <article
                  className="programme-admin-card"
                  key={programme.id}
                >
                  <div className="programme-admin-cover">
                    {programme.cover_image_url ? (
                      <img
                        src={programme.cover_image_url}
                        alt={programme.title}
                      />
                    ) : (
                      <FolderKanban size={30} />
                    )}
                  </div>

                  <div className="programme-admin-details">
                    <h3>{programme.title}</h3>

                    <p>{programme.description}</p>

                    <div className="programme-admin-meta">
                      <span>
                        <CalendarDays size={14} />
                        {formatDate(programme.start_date)}
                      </span>

                      <span>
                        <FolderKanban size={14} />
                        {programme.activities?.length || 0} activities
                      </span>
                    </div>
                  </div>

                  <div className="programme-admin-actions">
                    <span
                      className={`programme-status ${programme.status}`}
                    >
                      {formatStatus(programme.status)}
                    </span>

                    <select
                      aria-label={`Change status for ${programme.title}`}
                      value={programme.status}
                      disabled={updatingStatus === programme.id}
                      onChange={(event) =>
                        handleStatusChange(
                          programme,
                          event.target.value
                        )
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>

<button
  type="button"
  className="programme-delete-button"
  onClick={() => handleDeleteProgramme(programme)}
  disabled={deletingProgrammeId === programme.id}
>
  <X size={16} />
  {deletingProgrammeId === programme.id
    ? "Deleting..."
    : "Delete Programme"}
</button> 

<button
  type="button"
  className="programme-edit-button"
  onClick={() => handleEditProgramme(programme)}
>
  <Save size={16} />
  Edit Programme
</button>


                    <button
  type="button"
  className="programme-activities-button"
  onClick={() => fetchProgrammeActivities(programme)}
>
  <Eye size={16} />
  Manage Activities
</button>

                    <small>
                      {updatingStatus === programme.id
                        ? "Updating..."
                        : `Created ${formatDate(programme.created_at)}`}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      
{/* ======================================
    PROGRAMME ACTIVITIES MODAL
====================================== */}

{showActivitiesModal && (
  <div
    className="programmes-modal-overlay"
    onClick={() => {
      if (!activitiesLoading) {
        setShowActivitiesModal(false);
        setSelectedProgramme(null);
        setActivities([]);
      }
    }}
  >
    <div
      className="programmes-create-modal activities-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="programmes-modal-header">
        <div>
          <span>ACSP-KENYA · ACTIVITY MANAGEMENT</span>
          <h2>{selectedProgramme?.title}</h2>
          <p>
            Manage activities implemented under this national programme.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowActivitiesModal(false);
            setSelectedProgramme(null);
            setActivities([]);
          }}
          aria-label="Close activities"
        >
          <X size={21} />
        </button>
      </div>

      <div className="programme-activities-content">
        <div className="programme-activities-heading">
          <div>
            <h3>Programme Activities</h3>
            <p>
              {activities.length} activities registered
            </p>
          </div>
        </div>

        
<div className="programme-activity-create-toggle">
  <button
    type="button"
    onClick={() => {
      setActivityForm(initialActivityForm);
      setShowActivityForm((current) => !current);
    }}
  >
    <Plus size={17} />
    {showActivityForm ? "Close Form" : "Add New Activity"}
  </button>
</div>

{showActivityForm && (
  <form
    className="programme-activity-form"
    onSubmit={handleCreateActivity}
  >
    <h3>New Programme Activity</h3>

    <div className="programmes-form-group">
      <label>Activity Title <span>*</span></label>
      <input
        type="text"
        name="title"
        placeholder="Enter activity title"
        value={activityForm.title}
        onChange={handleActivityFormChange}
        maxLength={255}
        required
      />
    </div>

    <div className="programmes-form-group">
      <label>Activity Description <span>*</span></label>
      <textarea
        name="description"
        placeholder="Describe the activity and its objectives..."
        value={activityForm.description}
        onChange={handleActivityFormChange}
        rows={4}
        required
      />
    </div>

    


    <div className="programmes-form-row">
      <div className="programmes-form-group">
        <label>County <span>*</span></label>
        <select
          name="county_id"
          value={activityForm.county_id}
          onChange={handleActivityFormChange}
          required
          disabled={countiesLoading}
        >
          <option value="">
            {countiesLoading ? "Loading counties..." : "Select County"}
          </option>

          {counties.map((county) => (
            <option key={county.id} value={county.id}>
              {county.name}
            </option>
          ))}
        </select>
      </div>

      <div className="programmes-form-group">
        <label>Activity Date <span>*</span></label>
        <input
          type="date"
          name="activity_date"
          value={activityForm.activity_date}
          onChange={handleActivityFormChange}
          required
        />
      </div>
    </div>

    <div className="programmes-form-group">
      <label>Specific Location</label>
      <input
        type="text"
        name="location"
        placeholder="e.g. Mombasa Technical University"
        value={activityForm.location}
        onChange={handleActivityFormChange}
      />
    </div>

    
<div className="programmes-form-group">
  <label>Activity Photographs</label>

  <label
    htmlFor="activity-images"
    className="activity-image-upload"
  >
    <Upload size={22} />
    <strong>Select Activity Photographs</strong>
    <span>JPG, PNG or WebP · Maximum 10 images · 5 MB each</span>
  </label>

  <input
    id="activity-images"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={handleActivityImagesChange}
    hidden
  />

  
{/* EXISTING PHOTOGRAPHS */}
{activityForm.image_urls?.length > 0 && (
  <div className="activity-image-preview-grid">
    {activityForm.image_urls.map((imageUrl, index) => (
      <div
        className="activity-image-preview"
        key={`existing-${index}`}
      >
        <img
          src={imageUrl}
          alt={`Existing activity photograph ${index + 1}`}
        />

        <button
          type="button"
          onClick={() =>
            handleRemoveExistingActivityImage(imageUrl)
          }
          aria-label="Remove existing photograph"
        >
          <X size={16} />
        </button>
      </div>
    ))}
  </div>
)}

{/* NEW PHOTOGRAPHS */}
{selectedActivityImages.length > 0 && (
  <div className="activity-image-preview-grid">
    {selectedActivityImages.map((image, index) => (
      <div
        className="activity-image-preview"
        key={`${image.file.name}-${index}`}
      >
        <img
          src={image.preview}
          alt={image.file.name}
        />

        <button
          type="button"
          onClick={() => removeActivityImage(index)}
          aria-label="Remove new photograph"
        >
          <X size={16} />
        </button>
      </div>
    ))}
  </div>
)}

</div>


    <div className="programmes-form-note">
      <Clock size={17} />
      <p>
        New activities are saved as drafts. You can publish them
        after reviewing their details.
      </p>
    </div>

    <div className="programmes-modal-actions">
      <button
        type="button"
        className="programmes-cancel-button"
        onClick={() => setShowActivityForm(false)}
        disabled={savingActivity}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="programmes-save-button"
        disabled={savingActivity}
      >
        <Save size={17} />
        {savingActivity ? "Saving..." : "Save Activity"}
      </button>
    </div>
  </form>
)}


        {activitiesLoading ? (
          <div className="programmes-empty-state">
            <RefreshCw
              size={28}
              className="programmes-spinning"
            />
            <h3>Loading activities</h3>
            <p>Please wait while we retrieve the activities.</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="programmes-empty-state">
            <FolderKanban size={32} />
            <h3>No activities yet</h3>
            <p>
              This programme does not have any activities registered.
            </p>
          </div>
        ) : (
         
<div className="programme-activities-list">
  {activities.map((activity) => (
    <article
      className="programme-activity-card"
      key={activity.id}
    >
      <div className="programme-activity-details">
        <h4>{activity.title}</h4>

        <p>{activity.description}</p>

        <div className="programme-activity-meta">
          <span>
            <MapPin size={14} />
            {activity.counties?.name || "County not available"}
          </span>

          <span>
            <CalendarDays size={14} />
            {formatDate(activity.activity_date)}
          </span>
        </div>

        {activity.image_urls?.length > 0 && (
          <div className="programme-activity-gallery">
            {activity.image_urls.map((imageUrl, index) => (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                key={`${activity.id}-image-${index}`}
                title="View photograph"
              >
                <img
                  src={imageUrl}
                  alt={`${activity.title} photograph ${index + 1}`}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      

<div className="programme-activity-actions">
  <button
    type="button"
    className="programme-activity-edit-button"
    onClick={() => handleEditActivity(activity)}
  >
    <Save size={15} />
    Edit
  </button>

  <select
    className={`programme-status-select ${activity.status}`}
    value={activity.status}
    disabled={updatingActivityStatus}
    onChange={(event) =>
      handleActivityStatusChange(activity, event.target.value)
    }
  >
    <option value="draft">Draft</option>
    <option value="published">Published</option>
    <option value="archived">Archived</option>
  </select>
</div>


    </article>
  ))}
</div>

        )}
      </div>
    </div>
  </div>
)}


      {/* ======================================
          CREATE PROGRAMME MODAL
      ====================================== */}

      {showModal && (
        <div
          className="programmes-modal-overlay"
          onClick={closeCreateModal}
        >
          <div
            className="programmes-create-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="programmes-modal-header">
              <div>
                <span>ACSP-KENYA · PROGRAMME MANAGEMENT</span>
                <h2>
  {editingProgramme ? "Edit National Programme" : "Create National Programme"}
</h2>
                <p>
                  Enter the basic information for this national programme.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={submitting}
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="programmes-create-form"
              onSubmit={handleCreateProgramme}
            >
              <div className="programmes-form-group">
                <label htmlFor="programme-title">
                  Programme Title <span>*</span>
                </label>

                <input
                  id="programme-title"
                  name="title"
                  type="text"
                  placeholder="Enter national programme title"
                  value={form.title}
                  onChange={handleFormChange}
                  maxLength={255}
                  required
                />
              </div>

              <div className="programmes-form-group">
                <label htmlFor="programme-description">
                  Programme Description <span>*</span>
                </label>

                <textarea
                  id="programme-description"
                  name="description"
                  placeholder="Describe the national programme, its purpose and intended impact..."
                  value={form.description}
                  onChange={handleFormChange}
                  rows={5}
                  required
                />
              </div>

              <div className="programmes-form-group">
                <label htmlFor="programme-objectives">
                  Programme Objectives
                </label>

                <textarea
                  id="programme-objectives"
                  name="objectives"
                  placeholder="Outline the key objectives of this programme..."
                  value={form.objectives}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>

              {/* PROGRAMME COVER IMAGE */}
<div className="programmes-form-group">
  <label>Programme Cover Image</label>

  <label
    htmlFor="programme-cover-image"
    className="activity-image-upload"
  >
    <Upload size={22} />

    <strong>
      {selectedCoverImage
        ? "Change Cover Image"
        : "Select Programme Cover Image"}
    </strong>

    <span>
      JPG, PNG or WebP · Maximum file size 5 MB
    </span>
  </label>

  <input
    id="programme-cover-image"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleCoverImageChange}
    hidden
  />

  {coverImagePreview && (
    <div className="programme-cover-preview">
      <img
        src={coverImagePreview}
        alt="Programme cover preview"
      />

      <button
  type="button"
  onClick={() => {
    if (coverImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverImagePreview);
    }

    setSelectedCoverImage(null);
    setCoverImagePreview("");

    if (editingProgramme?.cover_image_url) {
      setRemoveCoverImage(true);
    }
  }}
  aria-label="Remove cover image"
>
  <X size={17} />
</button>
    </div>
  )}
</div>


              <div className="programmes-form-row">
                <div className="programmes-form-group">
                  <label htmlFor="programme-start-date">
                    Start Date
                  </label>

                  <input
                    id="programme-start-date"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="programmes-form-group">
                  <label htmlFor="programme-end-date">
                    End Date
                  </label>

                  <input
                    id="programme-end-date"
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="programmes-form-note">
                <Clock size={17} />

                <p>
                  New programmes are saved as drafts. You can add
                  activities and publish them when ready.
                </p>
              </div>

              <div className="programmes-modal-actions">
                <button
                  type="button"
                  className="programmes-cancel-button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="programmes-save-button"
                  disabled={submitting}
                >
                  <Save size={17} />
                 {submitting
  ? "Saving..."
  : editingProgramme
    ? "Update Programme"
    : "Create Programme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* DELETE PROGRAMME CONFIRMATION MODAL */}
{programmeToDelete && (
  <div
    className="programme-delete-modal-overlay"
    onClick={() => {
      if (!deletingProgrammeId) {
        setProgrammeToDelete(null);
      }
    }}
  >
    <div
      className="programme-delete-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="programme-delete-modal-icon">
        <X size={28} />
      </div>

      <h2>Delete National Programme?</h2>

      <p>
        Are you sure you want to permanently delete
        <strong> "{programmeToDelete.title}"</strong>?
      </p>

      <div className="programme-delete-warning">
        <strong>This action cannot be undone.</strong>
        <span>
          All activities associated with this programme will
          also be permanently deleted.
        </span>
      </div>

      <div className="programme-delete-modal-actions">
        <button
          type="button"
          className="programme-delete-cancel"
          onClick={() => setProgrammeToDelete(null)}
          disabled={!!deletingProgrammeId}
        >
          Cancel
        </button>

        <button
          type="button"
          className="programme-delete-confirm"
          onClick={confirmDeleteProgramme}
          disabled={!!deletingProgrammeId}
        >
          {deletingProgrammeId
            ? "Deleting..."
            : "Yes, Delete Programme"}
        </button>
      </div>
    </div>
  </div>
)}

    </AdminDashboardLayout>
    
  );
};

export default ProgrammesDashboardPage;
