
import { useEffect, useState } from "react";
import {
  Newspaper,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  Star,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./NewsManagementPage.css";

const NewsManagementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/announcements");

      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error("Fetch announcements error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load news and announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((item) => {
    const searchText = [
      item.title,
      item.summary,
      item.content,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesStatus =
      status === "all" || item.status === status;

    const matchesCategory =
      category === "all" || item.category === category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (date) => {
    if (!date) return "Not published";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryLabel = (value) => {
    const labels = {
      news: "News & Updates",
      announcement: "Official Announcement",
      press_release: "Press Release",
      opportunity: "Opportunity",
      event: "Events & Activities",
      notice: "Notice",
    };

    return labels[value] || value;
  };

  return (
    <AdminDashboardLayout
      title="News & Announcements"
      subtitle="Create, publish and manage official ACSP-Kenya news and announcements."
    >
      <div className="news-management-page">
        <div className="news-page-heading">
          <div>
            <h2>News & Announcements</h2>
            <p>
              Manage articles, official notices, press releases and
              opportunities published on the ACSP-Kenya website.
            </p>
          </div>

          <button
            type="button"
            className="news-refresh-btn"
            onClick={fetchAnnouncements}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="news-summary-grid">
          <div className="news-summary-card">
            <Newspaper size={21} />
            <span>Total Articles</span>
            <strong>{announcements.length}</strong>
          </div>

          <div className="news-summary-card">
            <CheckCircle size={21} />
            <span>Published</span>
            <strong>
              {announcements.filter(
                (item) => item.status === "published"
              ).length}
            </strong>
          </div>

          <div className="news-summary-card">
            <Clock size={21} />
            <span>Drafts</span>
            <strong>
              {announcements.filter(
                (item) => item.status === "draft"
              ).length}
            </strong>
          </div>

          <div className="news-summary-card">
            <Archive size={21} />
            <span>Archived</span>
            <strong>
              {announcements.filter(
                (item) => item.status === "archived"
              ).length}
            </strong>
          </div>
        </div>

        <div className="news-toolbar">
          <div className="news-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="news">News & Updates</option>
            <option value="announcement">Official Announcements</option>
            <option value="press_release">Press Releases</option>
            <option value="opportunity">Opportunities</option>
            <option value="event">Events & Activities</option>
            <option value="notice">Notices</option>
          </select>

          <button
            type="button"
            className="news-create-btn"
            onClick={() =>
              toast("The announcement editor will be added next.")
            }
          >
            <Plus size={17} />
            Create Article
          </button>
        </div>

        <div className="news-table-wrapper">
          {loading ? (
            <div className="news-loading">
              Loading news and announcements...
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="news-empty">
              <Newspaper size={38} />
              <h3>No articles found</h3>
              <p>
                News articles and announcements you create will appear here.
              </p>
            </div>
          ) : (
            <table className="news-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Publication Date</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAnnouncements.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="news-article-cell">
                        {item.featured_image ? (
                          <img
                            src={item.featured_image}
                            alt=""
                          />
                        ) : (
                          <div className="news-image-placeholder">
                            <Newspaper size={19} />
                          </div>
                        )}

                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.slug}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="news-category-badge">
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>

                    <td>{formatDate(item.published_at)}</td>

                    <td>
                      {item.is_featured ? (
                        <span className="news-featured">
                          <Star size={14} />
                          Featured
                        </span>
                      ) : (
                        <span className="news-not-featured">
                          Not featured
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`news-status-badge ${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="news-action-buttons">
                        <button
                          type="button"
                          title="View"
                          onClick={() =>
                            toast("Article preview will be added next.")
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() =>
                            toast("Article editing will be added next.")
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() =>
                            toast("Article deletion will be added next.")
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default NewsManagementPage;
