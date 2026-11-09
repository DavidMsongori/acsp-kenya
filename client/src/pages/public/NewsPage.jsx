
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ArrowRight,
  RefreshCw,
  Newspaper,
  Megaphone,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import "./NewsPage.css";

const categories = [
  { value: "all", label: "All News" },
  { value: "news", label: "News & Updates" },
  { value: "announcement", label: "Announcements" },
  { value: "press_release", label: "Press Releases" },
  { value: "opportunity", label: "Opportunities" },
  { value: "event", label: "Events & Activities" },
  { value: "notice", label: "Notices" },
];

function NewsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements");

      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      console.error("Fetch public news error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load news and announcements at the moment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const categorizedNews = useMemo(() => {
    const grouped = {};

    categories.forEach((category) => {
      if (category.value !== "all") {
        grouped[category.value] = [];
      }
    });

    announcements.forEach((item) => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });

    return grouped;
  }, [announcements]);

  const visibleNews = useMemo(() => {
    if (activeFilter === "all") {
      return announcements;
    }

    return categorizedNews[activeFilter] || [];
  }, [activeFilter, announcements, categorizedNews]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryLabel = (category) => {
    return (
      categories.find((item) => item.value === category)?.label ||
      "News"
    );
  };

  const NewsCard = ({ article }) => (
    <article className="public-news-card">
      <div className="public-news-image">
        {article.featured_image ? (
          <img src={article.featured_image} alt={article.title} />
        ) : (
          <div className="public-news-image-placeholder">
            <Newspaper size={42} />
            <span>ACSP-Kenya News</span>
          </div>
        )}

        <span className="public-news-category">
          {getCategoryLabel(article.category)}
        </span>
      </div>

      <div className="public-news-card-content">
        <div className="public-news-date">
          <CalendarDays size={15} />
          {formatDate(article.published_at)}
        </div>

        <h3>{article.title}</h3>

        <p className="public-news-description">
          {article.summary ||
            (article.content
              ? `${article.content.slice(0, 145)}${
                  article.content.length > 145 ? "..." : ""
                }`
              : "Discover the latest updates from ACSP-Kenya.")}
        </p>

        <Link
          to={`/news/${article.slug}`}
          className="public-news-details-link"
        >
          Read Article
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );

  return (
    <main className="public-news-page">
      <section className="news-hero">
        <div className="news-hero-pattern" />

        <div className="news-hero-content">
          <span className="news-eyebrow">
            INFORM · CONNECT · STAY UPDATED
          </span>

          <h1>
            News & <span>Announcements</span>
          </h1>

          <p>
            Stay informed about the latest developments, official
            announcements, opportunities and stories shaping student
            leadership across Kenya.
          </p>

          <Link to="/programs" className="news-hero-button">
            <Megaphone size={17} />
            Explore Our Programs
          </Link>
        </div>
      </section>

      <section className="public-news-content" id="news-list">
        <div className="news-section-heading">
          <div>
            <span className="news-section-eyebrow">
              THE LATEST FROM ACSP-KENYA
            </span>

            <h2>Explore Our News & Updates</h2>

            <p>
              Read the latest news, official announcements, press
              releases and opportunities from the Association of
              County Students Associations Presidents-Kenya.
            </p>
          </div>

          <div className="news-total">
            <Newspaper size={19} />
            <span>{announcements.length} Articles</span>
          </div>
        </div>

        <div className="news-filter-tabs">
          {categories.map((category) => (
            <button
              type="button"
              key={category.value}
              className={
                activeFilter === category.value ? "active" : ""
              }
              onClick={() => setActiveFilter(category.value)}
            >
              {category.label}
              {category.value !== "all" && (
                <span>
                  {" "}({categorizedNews[category.value]?.length || 0})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="public-news-state">
            <RefreshCw
              className="news-loading-spinner"
              size={26}
            />
            <p>Loading ACSP-Kenya news and announcements...</p>
          </div>
        ) : error ? (
          <div className="public-news-state news-error">
            <p>{error}</p>
            <button onClick={fetchNews}>Try Again</button>
          </div>
        ) : visibleNews.length === 0 ? (
          <div className="public-news-state">
            <FileText size={38} />
            <h3>No articles available</h3>
            <p>
              There are currently no published articles in this
              category. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="public-news-grid">
            {visibleNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default NewsPage;
