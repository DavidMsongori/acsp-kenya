
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Newspaper,
  Search,
  RefreshCw,
  Star,
  CalendarDays,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import PresidentDashboardLayout from "../../components/layouts/president/PresidentDashboardLayout";

import {
  getPublishedAnnouncements,
  getFeaturedAnnouncements,
  getAnnouncementBySlug,
} from "../../services/association.announcements.service";

import "./AssociationAnnouncementsPage.css";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "news", label: "News & Updates" },
  { value: "announcement", label: "Official Announcements" },
  { value: "press_release", label: "Press Releases" },
  { value: "opportunity", label: "Opportunities" },
  { value: "event", label: "Events & Activities" },
  { value: "notice", label: "Notices" },
];

const getCategoryLabel = (value) => {
  return (
    categories.find((category) => category.value === value)?.label ||
    value?.replaceAll("_", " ") ||
    "Announcement"
  );
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const AssociationAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const [announcementResponse, featuredResponse] = await Promise.all([
        getPublishedAnnouncements(),
        getFeaturedAnnouncements(),
      ]);

      setAnnouncements(announcementResponse.announcements || []);
      setFeatured(featuredResponse.announcements || []);
    } catch (error) {
      console.error("Announcements loading error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openAnnouncement = async (slug) => {
    try {
      setDetailsLoading(true);
      setSelectedAnnouncement(null);

      const response = await getAnnouncementBySlug(slug);

      setSelectedAnnouncement(response.announcement);
    } catch (error) {
      console.error("Announcement details error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load announcement details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((item) => {
      const searchableText = [
        item.title,
        item.summary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesCategory =
        category === "all" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [announcements, search, category]);

  const featuredIds = new Set(featured.map((item) => item.id));

  return (
    <PresidentDashboardLayout
      title="Announcements"
      subtitle="Stay informed about official ACSP-Kenya announcements, news and opportunities."
    >
      <div className="association-announcements-page">
        {selectedAnnouncement ? (
          <article className="announcement-detail-card">
            <button
              type="button"
              className="announcement-back-button"
              onClick={() => setSelectedAnnouncement(null)}
            >
              <ArrowLeft size={17} />
              Back to Announcements
            </button>

            {selectedAnnouncement.featured_image && (
              <img
                className="announcement-detail-image"
                src={selectedAnnouncement.featured_image}
                alt={selectedAnnouncement.title}
              />
            )}

            <div className="announcement-detail-content">
              <span className="announcement-category">
                {getCategoryLabel(selectedAnnouncement.category)}
              </span>

              <h1>{selectedAnnouncement.title}</h1>

              <div className="announcement-date">
                <CalendarDays size={16} />
                Published {formatDate(selectedAnnouncement.published_at)}
              </div>

              {selectedAnnouncement.summary && (
                <p className="announcement-detail-summary">
                  {selectedAnnouncement.summary}
                </p>
              )}

              <div
                className="announcement-full-content"
                dangerouslySetInnerHTML={{
                  __html: selectedAnnouncement.content || "",
                }}
              />
            </div>
          </article>
        ) : detailsLoading ? (
          <div className="announcement-loading">
            Loading announcement details...
          </div>
        ) : (
          <>
            <section className="announcements-welcome">
              <div>
                <span className="announcements-eyebrow">
                  ACSP-KENYA INFORMATION CENTRE
                </span>
                <h1>News & Announcements</h1>
                <p>
                  Your source for official updates, notices, opportunities
                  and important developments from ACSP-Kenya.
                </p>
              </div>

              <div className="announcements-welcome-icon">
                <Newspaper size={42} />
              </div>
            </section>

            {featured.length > 0 && (
              <section className="announcements-featured-section">
                <div className="announcements-section-heading">
                  <div>
                    <span>HIGHLIGHTS</span>
                    <h2>Featured Announcements</h2>
                  </div>
                  <Star size={21} />
                </div>

                <div className="announcements-featured-grid">
                  {featured.map((item) => (
                    <button
                      type="button"
                      className="announcement-featured-card"
                      key={item.id}
                      onClick={() => openAnnouncement(item.slug)}
                    >
                      {item.featured_image ? (
                        <img src={item.featured_image} alt="" />
                      ) : (
                        <div className="announcement-featured-placeholder">
                          <Newspaper size={30} />
                        </div>
                      )}

                      <div className="announcement-featured-body">
                        <span className="announcement-featured-label">
                          <Star size={13} />
                          Featured
                        </span>
                        <h3>{item.title}</h3>
                        <p>{item.summary || "Read the full announcement."}</p>
                        <small>{formatDate(item.published_at)}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="announcements-directory">
              <div className="announcements-section-heading">
                <div>
                  <span>STAY INFORMED</span>
                  <h2>All Announcements</h2>
                  <p>
                    Browse official ACSP-Kenya updates and publications.
                  </p>
                </div>

                <button
                  type="button"
                  className="announcements-refresh-button"
                  onClick={fetchAnnouncements}
                  disabled={loading}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              <div className="announcements-toolbar">
                <div className="announcements-search">
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Search announcements..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Filter announcements by category"
                >
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="announcement-loading">
                  Loading announcements...
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="announcements-empty">
                  <BookOpen size={36} />
                  <h3>No Announcements Found</h3>
                  <p>
                    {announcements.length === 0
                      ? "There are currently no published announcements."
                      : "Try another search term or category."}
                  </p>
                </div>
              ) : (
                <div className="announcements-list">
                  {filteredAnnouncements.map((item) => (
                    <article
                      className="announcement-list-card"
                      key={item.id}
                    >
                      {item.featured_image ? (
                        <img
                          className="announcement-list-image"
                          src={item.featured_image}
                          alt=""
                        />
                      ) : (
                        <div className="announcement-list-placeholder">
                          <Newspaper size={25} />
                        </div>
                      )}

                      <div className="announcement-list-content">
                        <div className="announcement-list-meta">
                          <span className="announcement-category">
                            {getCategoryLabel(item.category)}
                          </span>

                          {featuredIds.has(item.id) && (
                            <span className="announcement-featured-label">
                              <Star size={13} />
                              Featured
                            </span>
                          )}
                        </div>

                        <h3>{item.title}</h3>
                        <p>
                          {item.summary || "Read this announcement for more information."}
                        </p>

                        <div className="announcement-list-footer">
                          <span>
                            <CalendarDays size={15} />
                            {formatDate(item.published_at)}
                          </span>

                          <button
                            type="button"
                            onClick={() => openAnnouncement(item.slug)}
                          >
                            Read Announcement
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PresidentDashboardLayout>
  );
};

export default AssociationAnnouncementsPage;
