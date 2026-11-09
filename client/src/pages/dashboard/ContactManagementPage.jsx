
import { useEffect, useState } from "react";
import {
  Mail,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  MessageSquare,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./ContactManagementPage.css";

const ContactManagementPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/contact");

      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Fetch contact messages error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((item) => {
    const searchText = [
      item.name,
      item.email,
      item.phone,
      item.subject,
      item.message,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesStatus =
      status === "all" || item.status === status;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openMessage = async (id) => {
    try {
      const response = await api.get(`/admin/contact/${id}`);

      const message = response.data.contactMessage;

      setSelectedMessage(message);

      setMessages((previous) =>
        previous.map((item) =>
          item.id === id ? message : item
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to open this message."
      );
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await api.patch(
        `/admin/contact/${id}/status`,
        { status: newStatus }
      );

      const updatedMessage = response.data.contactMessage;

      setMessages((previous) =>
        previous.map((item) =>
          item.id === id ? updatedMessage : item
        )
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage(updatedMessage);
      }

      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update message status."
      );
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this contact message?"
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(`/admin/contact/${id}`);

      setMessages((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }

      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete contact message."
      );
    }
  };

  const getStatusLabel = (value) => {
    const labels = {
      new: "New",
      read: "Read",
      replied: "Replied",
      archived: "Archived",
    };

    return labels[value] || value;
  };

  return (
    <AdminDashboardLayout
      title="Contact Messages"
      subtitle="View, respond to and manage messages submitted through the ACSP-Kenya website."
    >
      <div className="contact-management-page">
        <div className="contact-page-heading">
          <div>
            <h2>Contact Messages</h2>
            <p>
              Manage enquiries, questions and messages received
              from visitors and members.
            </p>
          </div>

          <button
            type="button"
            className="contact-refresh-btn"
            onClick={fetchMessages}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="contact-summary-grid">
          <div className="contact-summary-card">
            <Mail size={21} />
            <span>Total Messages</span>
            <strong>{messages.length}</strong>
          </div>

          <div className="contact-summary-card">
            <MessageSquare size={21} />
            <span>New</span>
            <strong>
              {messages.filter((item) => item.status === "new").length}
            </strong>
          </div>

          <div className="contact-summary-card">
            <Eye size={21} />
            <span>Read</span>
            <strong>
              {messages.filter((item) => item.status === "read").length}
            </strong>
          </div>

          <div className="contact-summary-card">
            <CheckCircle size={21} />
            <span>Replied</span>
            <strong>
              {messages.filter((item) => item.status === "replied").length}
            </strong>
          </div>

          <div className="contact-summary-card">
            <Archive size={21} />
            <span>Archived</span>
            <strong>
              {messages.filter((item) => item.status === "archived").length}
            </strong>
          </div>
        </div>

        <div className="contact-toolbar">
          <div className="contact-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search name, email, subject or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="contact-table-wrapper">
          {loading ? (
            <div className="contact-loading">
              Loading contact messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="contact-empty">
              <Mail size={38} />
              <h3>No messages found</h3>
              <p>
                Messages submitted through the public contact form
                will appear here.
              </p>
            </div>
          ) : (
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMessages.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="contact-sender-cell">
                        <strong>{item.name}</strong>
                        <small>{item.email}</small>
                        {item.phone && (
                          <small>{item.phone}</small>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="contact-subject-cell">
                        <strong>{item.subject}</strong>
                        <small>
                          {item.message?.length > 75
                            ? `${item.message.slice(0, 75)}...`
                            : item.message}
                        </small>
                      </div>
                    </td>

                    <td>{formatDate(item.created_at)}</td>

                    <td>
                      <span
                        className={`contact-status-badge ${item.status}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    <td>
                      <div className="contact-action-buttons">
                        <button
                          type="button"
                          title="View message"
                          onClick={() => openMessage(item.id)}
                        >
                          <Eye size={16} />
                        </button>

                        {item.status !== "replied" && (
                          <button
                            type="button"
                            title="Mark as replied"
                            onClick={() =>
                              updateStatus(item.id, "replied")
                            }
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {item.status !== "archived" && (
                          <button
                            type="button"
                            title="Archive"
                            onClick={() =>
                              updateStatus(item.id, "archived")
                            }
                          >
                            <Archive size={16} />
                          </button>
                        )}

                        <button
                          type="button"
                          className="contact-delete-btn"
                          title="Delete"
                          onClick={() => deleteMessage(item.id)}
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

        {selectedMessage && (
          <div
            className="contact-modal-overlay"
            onClick={() => setSelectedMessage(null)}
          >
            <div
              className="contact-message-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="contact-modal-header">
                <div>
                  <span>CONTACT ENQUIRY</span>
                  <h3>{selectedMessage.subject}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  aria-label="Close message"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="contact-modal-details">
                <div>
                  <span>From</span>
                  <strong>{selectedMessage.name}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <a href={`mailto:${selectedMessage.email}`}>
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{selectedMessage.phone || "Not provided"}</strong>
                </div>

                <div>
                  <span>Received</span>
                  <strong>{formatDate(selectedMessage.created_at)}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <span
                    className={`contact-status-badge ${selectedMessage.status}`}
                  >
                    {getStatusLabel(selectedMessage.status)}
                  </span>
                </div>
              </div>

              <div className="contact-message-content">
                <span>MESSAGE</span>
                <p>{selectedMessage.message}</p>
              </div>

              <div className="contact-modal-actions">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.subject}`
                  )}`}
                  className="contact-reply-btn"
                >
                  <Mail size={16} />
                  Reply by Email
                </a>

                <select
                  value={selectedMessage.status}
                  onChange={(e) =>
                    updateStatus(selectedMessage.id, e.target.value)
                  }
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default ContactManagementPage;
