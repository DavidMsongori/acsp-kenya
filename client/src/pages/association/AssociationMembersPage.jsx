
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  RefreshCw,
  UsersRound,
} from "lucide-react";

import PresidentDashboardLayout from "../../components/layouts/president/PresidentDashboardLayout";
import { getAssociationMembers } from "../../services/association.members.service";

import "./AssociationMembersPage.css";

const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AssociationMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [association, setAssociation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const response = await getAssociationMembers();

      setMembers(response.members || []);
      setAssociation(response.association || null);
    } catch (error) {
      console.error("Association members loading error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load Association members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const statistics = useMemo(() => {
    return {
      total: members.length,
      verified: members.filter(
        (member) => member.application_status === "approved"
      ).length,
      pending: members.filter((member) =>
        ["pending", "under_review"].includes(member.application_status)
      ).length,
      rejected: members.filter(
        (member) => member.application_status === "rejected"
      ).length,
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const profile = member.profiles || {};

      const matchesSearch =
        !query ||
        [
          profile.full_name,
          profile.phone,
          member.institution_name,
          member.membership_number,
          member.student_or_member_id,
        ].some((value) => value?.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ||
        member.application_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  return (
    <PresidentDashboardLayout
      title="Association Members"
      subtitle="View membership applications associated with your County Association."
    >
      <div className="association-members-page">
        <section className="members-welcome-card">
          <div>
            <span className="members-eyebrow">MEMBERSHIP DIRECTORY</span>
            <h1>{association?.name || "Association Members"}</h1>
            <p>
              {association?.county
                ? `${association.county} County Association`
                : "Manage and monitor your association membership directory."}
            </p>
          </div>

          <button
            type="button"
            className="members-refresh-button"
            onClick={fetchMembers}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        <section className="members-statistics-grid">
          <div className="members-stat-card">
            <div className="members-stat-icon total">
              <Users size={21} />
            </div>
            <div>
              <span>Total Members</span>
              <strong>{statistics.total}</strong>
            </div>
          </div>

          <div className="members-stat-card">
            <div className="members-stat-icon verified">
              <UserCheck size={21} />
            </div>
            <div>
              <span>Approved</span>
              <strong>{statistics.verified}</strong>
            </div>
          </div>

          <div className="members-stat-card">
            <div className="members-stat-icon pending">
              <Clock size={21} />
            </div>
            <div>
              <span>Pending Review</span>
              <strong>{statistics.pending}</strong>
            </div>
          </div>

          <div className="members-stat-card">
            <div className="members-stat-icon rejected">
              <UserX size={21} />
            </div>
            <div>
              <span>Rejected</span>
              <strong>{statistics.rejected}</strong>
            </div>
          </div>
        </section>

        <section className="members-directory-card">
          <div className="members-directory-heading">
            <div>
              <h2>Members Directory</h2>
              <p>
                View membership applications submitted under your association.
              </p>
            </div>

            <span className="members-count">
              {filteredMembers.length} Records
            </span>
          </div>

          <div className="members-toolbar">
            <div className="members-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search name, phone, institution..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter members by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="members-empty-state">
              <UsersRound size={30} />
              <p>Loading association members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="members-empty-state">
              <UsersRound size={34} />
              <h3>No Members Found</h3>
              <p>
                {members.length === 0
                  ? "There are currently no membership applications assigned to your association."
                  : "No members match your search or selected status."}
              </p>
            </div>
          ) : (
            <div className="members-table-wrapper">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Membership No.</th>
                    <th>Category</th>
                    <th>Institution</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMembers.map((member) => {
                    const profile = member.profiles || {};

                    return (
                      <tr key={member.id}>
                        <td>
                          <div className="member-identity">
                            <div className="member-avatar">
                              {profile.photo_url ? (
                                <img
                                  src={profile.photo_url}
                                  alt={profile.full_name || "Member"}
                                />
                              ) : (
                                profile.full_name?.charAt(0)?.toUpperCase() ||
                                "M"
                              )}
                            </div>

                            <div>
                              <strong>
                                {profile.full_name || "Unnamed Member"}
                              </strong>
                              <span>{profile.phone || "No phone provided"}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {member.membership_number || "Not assigned"}
                        </td>

                        <td>
                          {formatStatus(member.membership_category)}
                        </td>

                        <td>
                          <div className="member-institution">
                            <strong>
                              {member.institution_name || "Not provided"}
                            </strong>
                            <span>
                              {member.institution_location || ""}
                            </span>
                          </div>
                        </td>

                        <td>{formatDate(member.created_at)}</td>

                        <td>
                          <span
                            className={`member-status ${member.application_status || "pending"}`}
                          >
                            {formatStatus(member.application_status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PresidentDashboardLayout>
  );
};

export default AssociationMembersPage;
