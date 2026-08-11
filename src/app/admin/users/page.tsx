"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Trash2, Mail, Phone, ShieldCheck, ShieldAlert, Search, Edit3, 
  UserCheck, UserX, Lock, Key, Eye, EyeOff, Building, ExternalLink, Pencil, 
  MapPin, X, Star, GraduationCap, ChevronRight 
} from "lucide-react";

interface User {
  id: string;
  customId: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  isSuspended: boolean;
  createdAt: string;
  plainPassword?: string;
  properties?: {
    city?: {
      name: string;
    };
  }[];
  agentProfile?: {
    id: string;
    agencyName: string | null;
    ratingAverage: number;
    isFeatured?: boolean;
  } | null;
}

const getCityCode = (cityName?: string, userId?: string) => {
  if (cityName && cityName.trim().length >= 2) {
    const clean = cityName.trim().toUpperCase();
    if (clean.startsWith("BENGALURU") || clean.startsWith("BANGALORE")) return "BE";
    if (clean.startsWith("KOCHI") || clean.startsWith("COCHIN")) return "KO";
    if (clean.startsWith("MUMBAI") || clean.startsWith("BOMBAY")) return "MU";
    if (clean.startsWith("DELHI")) return "DE";
    if (clean.startsWith("HYDERABAD")) return "HY";
    if (clean.startsWith("CHENNAI")) return "CH";
    if (clean.startsWith("PUNE")) return "PU";
    if (clean.startsWith("KOLKATA")) return "KO";
    if (clean.startsWith("AHMEDABAD")) return "AH";
    if (clean.startsWith("GURUGRAM") || clean.startsWith("GURGAON")) return "GU";
    if (clean.startsWith("NOIDA")) return "NO";
    return clean.substring(0, 2);
  }
  const cityCodes = ["KO", "MU", "BE", "DE", "HY", "CH", "PU", "AH", "GU", "NO"];
  const charSum = (userId || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return cityCodes[charSum % cityCodes.length];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Role Filter states (ILMIKA Feature)
  const [pendingRoleFilter, setPendingRoleFilter] = useState<"ALL" | "USER" | "AGENT" | "OWNER" | "ADMIN">("ALL");
  const [approvedRoleFilter, setApprovedRoleFilter] = useState<"ALL" | "USER" | "AGENT" | "OWNER" | "ADMIN">("ALL");
  const [suspendedRoleFilter, setSuspendedRoleFilter] = useState<"ALL" | "USER" | "AGENT" | "OWNER" | "ADMIN">("ALL");

  // Modals
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // User Properties Modal State
  const [selectedUserForProps, setSelectedUserForProps] = useState<User | null>(null);
  const [userProps, setUserProps] = useState<any[]>([]);
  const [userPropsLoading, setUserPropsLoading] = useState(false);

  // Reset Password States
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenUserProperties = async (u: User) => {
    setSelectedUserForProps(u);
    setUserPropsLoading(true);
    try {
      const res = await fetch(`/api/properties?userId=${u.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserProps(data.properties || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserPropsLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, role: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, role }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role } : u));
      } else {
        alert(data.error || "Failed to update user role");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleApproval = async (targetUserId: string, currentApproval: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, isApproved: !currentApproval }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { 
          ...u, 
          isApproved: !currentApproval,
        } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle approval status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspension = async (targetUserId: string, currentSuspension: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, isSuspended: !currentSuspension }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, isSuspended: !currentSuspension } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update user suspension status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAgentFeatured = async (targetUserId: string, currentFeatured: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/agents/feature", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, isFeatured: !currentFeatured }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { 
          ...u, 
          agentProfile: u.agentProfile ? { ...u.agentProfile, isFeatured: !currentFeatured } : { id: u.id, agencyName: null, ratingAverage: 4.8, isFeatured: !currentFeatured }
        } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update featured status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: editingUser.id,
          role: newRole,
          password: newPassword || undefined
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev =>
          prev.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u)
        );
        setEditingUser(null);
        setNewPassword("");
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPassword) return;
    
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: resettingUser.id,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        setResettingUser(null);
        setNewPassword("");
      } else {
        alert(data.error || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while resetting the password.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? This will cascade delete all their property listings, messages, and enquiries!")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${targetUserId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== targetUserId));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const pendingUsers = filtered.filter(u => !u.isApproved && !u.isSuspended);
  const pendingStudentCount = pendingUsers.filter(u => u.role === "USER").length;
  const pendingAdvisorCount = pendingUsers.filter(u => u.role === "AGENT").length;
  const pendingCollegeAdminCount = pendingUsers.filter(u => u.role === "OWNER" || u.role === "COLLEGE_ADMIN").length;
  const pendingAdminCount = pendingUsers.filter(u => u.role === "ADMIN").length;

  const displayedPendingUsers = pendingUsers.filter(u => {
    if (pendingRoleFilter === "USER") return u.role === "USER";
    if (pendingRoleFilter === "AGENT") return u.role === "AGENT";
    if (pendingRoleFilter === "OWNER") return u.role === "OWNER" || u.role === "COLLEGE_ADMIN";
    if (pendingRoleFilter === "ADMIN") return u.role === "ADMIN";
    return true;
  });

  const approvedUsers = filtered.filter(u => u.isApproved && !u.isSuspended);
  const approvedStudentCount = approvedUsers.filter(u => u.role === "USER").length;
  const approvedAdvisorCount = approvedUsers.filter(u => u.role === "AGENT").length;
  const approvedCollegeAdminCount = approvedUsers.filter(u => u.role === "OWNER" || u.role === "COLLEGE_ADMIN").length;
  const approvedAdminCount = approvedUsers.filter(u => u.role === "ADMIN").length;

  const displayedApprovedUsers = approvedUsers.filter(u => {
    if (approvedRoleFilter === "USER") return u.role === "USER";
    if (approvedRoleFilter === "AGENT") return u.role === "AGENT";
    if (approvedRoleFilter === "OWNER") return u.role === "OWNER" || u.role === "COLLEGE_ADMIN";
    if (approvedRoleFilter === "ADMIN") return u.role === "ADMIN";
    return true;
  });

  const suspendedUsers = filtered.filter(u => u.isSuspended);
  const suspendedStudentCount = suspendedUsers.filter(u => u.role === "USER").length;
  const suspendedAdvisorCount = suspendedUsers.filter(u => u.role === "AGENT").length;
  const suspendedCollegeAdminCount = suspendedUsers.filter(u => u.role === "OWNER" || u.role === "COLLEGE_ADMIN").length;
  const suspendedAdminCount = suspendedUsers.filter(u => u.role === "ADMIN").length;

  const displayedSuspendedUsers = suspendedUsers.filter(u => {
    if (suspendedRoleFilter === "USER") return u.role === "USER";
    if (suspendedRoleFilter === "AGENT") return u.role === "AGENT";
    if (suspendedRoleFilter === "OWNER") return u.role === "OWNER" || u.role === "COLLEGE_ADMIN";
    if (suspendedRoleFilter === "ADMIN") return u.role === "ADMIN";
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading user directory...</p>
      </div>
    );
  }

  const renderUserRow = (u: User) => {
    const dateStr = new Date(u.createdAt).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric"
    });

    const cityName = u.properties?.[0]?.city?.name;
    const cityCode = getCityCode(cityName, u.id);
    const deterministicNum = parseInt(u.id.substring(0, 4), 16) % 9000 + 1000;
    
    let displayId = u.customId;
    if (!displayId || displayId.startsWith("RE")) {
      displayId = `${cityCode}${deterministicNum}`;
    }

    return (
      <tr key={u.id} className="hover:bg-slate-50/80 transition">
        <td className="p-4">
          <span className="text-[11px] font-bold text-secondary bg-primary shadow-xs px-2.5 py-1 rounded border border-primary tracking-wider">{displayId}</span>
        </td>
        <td 
          className="p-4 cursor-pointer group hover:bg-slate-50/80 transition"
          onClick={() => handleOpenUserProperties(u)}
          title="Click to view listed properties"
        >
          <p className="font-semibold text-primary group-hover:text-accent transition flex items-center gap-1.5">
            {u.name.replace(/\s*\([^)]*\)/g, "").trim()}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] font-mono text-slate-400">Joined: {dateStr}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-accent group-hover:underline">
              <Building className="w-3 h-3" /> View Listings
            </span>
          </div>
        </td>
        <td className="p-4 space-y-1">
          <p className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
          </p>
          {u.phone && (
            <p className="flex items-center gap-1 font-mono text-[10px]">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone}
            </p>
          )}
        </td>
        <td className="p-4 text-center space-y-1.5">
          <div className="flex justify-center">
            {u.isSuspended ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                Suspended
              </span>
            ) : u.isApproved ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase animate-pulse">
                Pending
              </span>
            )}
          </div>
          <div>
            {u.isSuspended ? (
              <button
                onClick={() => handleToggleSuspension(u.id, true)}
                disabled={actionLoading}
                className="text-[10px] font-semibold text-emerald-600 underline hover:text-accent cursor-pointer font-bold"
              >
                Unsuspend
              </button>
            ) : (
              <button
                onClick={() => handleToggleApproval(u.id, u.isApproved)}
                disabled={actionLoading}
                className={`text-[10px] font-semibold underline hover:text-accent cursor-pointer ${
                  u.isApproved ? "text-slate-400" : "text-emerald-600 font-bold"
                }`}
              >
                {u.isApproved ? "Revoke Access" : "Approve Access"}
              </button>
            )}
          </div>
        </td>
        <td className="p-4">
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u.id, e.target.value)}
            disabled={actionLoading}
            className="border border-line rounded px-2 py-1 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-accent w-full cursor-pointer"
          >
            <option value="USER">User (Seeker)</option>
            <option value="OWNER">Owner</option>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
        </td>
        <td className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-mono text-[10px] text-slate-500 bg-secondary px-2 py-1 rounded border border-line min-w-[70px] inline-block text-center tracking-widest">
              {visiblePasswords[u.id] ? (u.plainPassword || `${u.role.toLowerCase()}123`) : "••••••••"}
            </span>
            <button 
              onClick={() => togglePasswordVisibility(u.id)}
              className="text-slate-400 hover:text-accent transition p-1 cursor-pointer"
              title="Toggle password visibility"
            >
              {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </td>
        <td className="p-4 text-right">
          <div className="flex justify-end gap-1.5">
            {(u.role === "AGENT" || u.role === "OWNER") && u.isApproved && !u.isSuspended && (
              <button
                onClick={() => handleToggleAgentFeatured(u.id, u.agentProfile ? u.agentProfile.isFeatured !== false : true)}
                disabled={actionLoading}
                className={`w-8 h-8 rounded-full border grid place-items-center transition cursor-pointer ${
                  (u.agentProfile ? u.agentProfile.isFeatured !== false : true)
                    ? "bg-amber-100 text-amber-600 border-amber-300 hover:bg-amber-200"
                    : "bg-white text-slate-300 hover:text-amber-500 hover:border-amber-300 border-line"
                }`}
                title={(u.agentProfile ? u.agentProfile.isFeatured !== false : true) ? "Featured Top Agent on Home Page (Click to unstar)" : "Feature as Top Agent on Home Page"}
              >
                <Star className={`w-4 h-4 ${(u.agentProfile ? u.agentProfile.isFeatured !== false : true) ? "fill-amber-400 text-amber-500" : ""}`} />
              </button>
            )}
            <button
              onClick={() => handleToggleSuspension(u.id, u.isSuspended)}
              disabled={actionLoading}
              className={`w-8 h-8 rounded-full border border-line grid place-items-center transition cursor-pointer ${
                u.isSuspended
                  ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
                  : "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-slate-400"
              }`}
              title={u.isSuspended ? "Unsuspend User" : "Suspend User Account"}
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEditingUser(u);
                setNewRole(u.role);
              }}
              disabled={actionLoading}
              className="w-8 h-8 rounded-full border border-line hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 grid place-items-center transition cursor-pointer text-slate-400"
              title="Edit user details"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(u.id)}
              disabled={actionLoading}
              className="w-8 h-8 rounded-full border border-line hover:bg-red-50 hover:text-red-600 hover:border-red-200 grid place-items-center transition cursor-pointer text-slate-400"
              title="Delete user account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 text-left relative pb-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#D4AF37] font-semibold">User Directory</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-bold tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#D4AF37]" /> User Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Audit platform registrants, adjust credentials, and approve professional roles.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37] font-medium transition"
          />
        </div>
      </div>

      {/* 🔴 Pending Approval Section with Role Filter Pills */}
      {pendingUsers.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
            <button
              onClick={() => setPendingRoleFilter("ALL")}
              className="font-serif text-base text-[#0F172A] font-bold flex items-center gap-2 hover:opacity-80 transition cursor-pointer text-left"
              title="Click to show all pending users"
            >
              <ShieldAlert className="w-5 h-5 text-red-500" /> Pending Approval ({pendingUsers.length})
            </button>

            {/* Clickable Role Filter Badges on Right Side (ILMIKA Feature) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setPendingRoleFilter(prev => prev === "USER" ? "ALL" : "USER")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  pendingRoleFilter === "USER"
                    ? "bg-[#0F172A] text-white shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
                title="Filter pending seekers"
              >
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Seekers</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  pendingRoleFilter === "USER" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-slate-200 text-slate-700"
                }`}>
                  {pendingStudentCount}
                </span>
              </button>

              <button
                onClick={() => setPendingRoleFilter(prev => prev === "AGENT" ? "ALL" : "AGENT")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  pendingRoleFilter === "AGENT"
                    ? "bg-[#0F172A] text-white shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-[#FFFBEB] text-amber-800 hover:bg-amber-100/70 border border-amber-200/80"
                }`}
                title="Filter pending agents"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Agents</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  pendingRoleFilter === "AGENT" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-amber-200/80 text-amber-900"
                }`}>
                  {pendingAdvisorCount}
                </span>
              </button>

              <button
                onClick={() => setPendingRoleFilter(prev => prev === "OWNER" ? "ALL" : "OWNER")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  pendingRoleFilter === "OWNER"
                    ? "bg-[#0F172A] text-white shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-blue-50/80 text-blue-800 hover:bg-blue-100/70 border border-blue-200/80"
                }`}
                title="Filter pending owners"
              >
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Owners</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  pendingRoleFilter === "OWNER" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-blue-200/80 text-blue-900"
                }`}>
                  {pendingCollegeAdminCount}
                </span>
              </button>

              <button
                onClick={() => setPendingRoleFilter(prev => prev === "ADMIN" ? "ALL" : "ADMIN")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  pendingRoleFilter === "ADMIN"
                    ? "bg-[#0F172A] text-white shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-purple-50/80 text-purple-800 hover:bg-purple-100/70 border border-purple-200/80"
                }`}
                title="Filter pending platform admins"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admins</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  pendingRoleFilter === "ADMIN" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-purple-200/80 text-purple-900"
                }`}>
                  {pendingAdminCount}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full border-collapse text-xs text-left min-w-[850px]">
              <thead>
                <tr className="bg-red-50/50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-4">User ID</th>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4 text-center">Approval Status</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4 text-center">Password</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedPendingUsers.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🟢 Approved Users Section with ILMIKA Role Filter Badges */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
          <button
            onClick={() => setApprovedRoleFilter("ALL")}
            className="font-serif text-base text-[#0F172A] font-bold flex items-center gap-2 hover:opacity-80 transition cursor-pointer text-left"
            title="Click to show all approved users"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Approved Users ({approvedUsers.length})
          </button>

          {/* Clickable Role Filter Badges on Right Side (ILMIKA Feature - EXACT MATCH) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setApprovedRoleFilter(prev => prev === "USER" ? "ALL" : "USER")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                approvedRoleFilter === "USER"
                  ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
              title="Filter approved seekers"
            >
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Seekers</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                approvedRoleFilter === "USER" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-slate-200 text-slate-700"
              }`}>
                {approvedStudentCount}
              </span>
            </button>

            <button
              onClick={() => setApprovedRoleFilter(prev => prev === "AGENT" ? "ALL" : "AGENT")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                approvedRoleFilter === "AGENT"
                  ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                  : "bg-[#FFFBEB] text-amber-800 border-amber-200/80 hover:bg-amber-100/70"
              }`}
              title="Filter approved agents"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Agents</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                approvedRoleFilter === "AGENT" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-amber-200/80 text-amber-900"
              }`}>
                {approvedAdvisorCount}
              </span>
            </button>

            <button
              onClick={() => setApprovedRoleFilter(prev => prev === "OWNER" ? "ALL" : "OWNER")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                approvedRoleFilter === "OWNER"
                  ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                  : "bg-blue-50/80 text-blue-800 border-blue-200/80 hover:bg-blue-100/70"
              }`}
              title="Filter approved owners"
            >
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Owners</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                approvedRoleFilter === "OWNER" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-blue-200/80 text-blue-900"
              }`}>
                {approvedCollegeAdminCount}
              </span>
            </button>

            <button
              onClick={() => setApprovedRoleFilter(prev => prev === "ADMIN" ? "ALL" : "ADMIN")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                approvedRoleFilter === "ADMIN"
                  ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                  : "bg-purple-50/80 text-purple-800 border-purple-200/80 hover:bg-purple-100/70"
              }`}
              title="Filter platform admins"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admins</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                approvedRoleFilter === "ADMIN" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-purple-200/80 text-purple-900"
              }`}>
                {approvedAdminCount}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
          <table className="w-full border-collapse text-xs text-left min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-4">User ID</th>
                <th className="p-4">User Details</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4 text-center">Approval Status</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4 text-center">Password</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedApprovedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 font-mono text-xs">
                    No approved users found for this role filter.
                  </td>
                </tr>
              ) : (
                displayedApprovedUsers.map(renderUserRow)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟠 Suspended Users Section */}
      {suspendedUsers.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
            <button
              onClick={() => setSuspendedRoleFilter("ALL")}
              className="font-serif text-base text-[#0F172A] font-bold flex items-center gap-2 hover:opacity-80 transition cursor-pointer text-left"
              title="Click to show all suspended accounts"
            >
              <UserX className="w-5 h-5 text-amber-600" /> Suspended Accounts ({suspendedUsers.length})
            </button>

            {/* Clickable Role Filter Badges on Right Side */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSuspendedRoleFilter(prev => prev === "USER" ? "ALL" : "USER")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                  suspendedRoleFilter === "USER"
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
                title="Filter suspended seekers"
              >
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Seekers</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  suspendedRoleFilter === "USER" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-slate-200 text-slate-700"
                }`}>
                  {suspendedStudentCount}
                </span>
              </button>

              <button
                onClick={() => setSuspendedRoleFilter(prev => prev === "AGENT" ? "ALL" : "AGENT")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                  suspendedRoleFilter === "AGENT"
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-[#FFFBEB] text-amber-800 border-amber-200/80 hover:bg-amber-100/70"
                }`}
                title="Filter suspended agents"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Agents</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  suspendedRoleFilter === "AGENT" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-amber-200/80 text-amber-900"
                }`}>
                  {suspendedAdvisorCount}
                </span>
              </button>

              <button
                onClick={() => setSuspendedRoleFilter(prev => prev === "OWNER" ? "ALL" : "OWNER")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                  suspendedRoleFilter === "OWNER"
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-blue-50/80 text-blue-800 border-blue-200/80 hover:bg-blue-100/70"
                }`}
                title="Filter suspended owners"
              >
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Owners</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  suspendedRoleFilter === "OWNER" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-blue-200/80 text-blue-900"
                }`}>
                  {suspendedCollegeAdminCount}
                </span>
              </button>

              <button
                onClick={() => setSuspendedRoleFilter(prev => prev === "ADMIN" ? "ALL" : "ADMIN")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                  suspendedRoleFilter === "ADMIN"
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-[#D4AF37]/40"
                    : "bg-purple-50/80 text-purple-800 border-purple-200/80 hover:bg-purple-100/70"
                }`}
                title="Filter suspended platform admins"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admins</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  suspendedRoleFilter === "ADMIN" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-purple-200/80 text-purple-900"
                }`}>
                  {suspendedAdminCount}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full border-collapse text-xs text-left min-w-[850px]">
              <thead>
                <tr className="bg-amber-50/50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-4">User ID</th>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4 text-center">Approval Status</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4 text-center">Password</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedSuspendedUsers.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Properties Listings Modal */}
      {selectedUserForProps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-xs" onClick={() => setSelectedUserForProps(null)}></div>
          <div className="bg-white border border-line rounded-2xl shadow-2xl p-6 max-w-lg w-full z-10 text-xs space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-primary flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-accent" /> Properties Listed by {selectedUserForProps.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Role: {selectedUserForProps.role}</p>
              </div>
              <button onClick={() => setSelectedUserForProps(null)} className="p-1 text-slate-400 hover:text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {userPropsLoading ? (
                <div className="py-8 text-center text-slate-400 font-mono">Loading user properties...</div>
              ) : userProps.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-mono">No properties listed by this user yet.</div>
              ) : (
                userProps.map((p) => (
                  <div key={p.id} className="p-3 bg-secondary/30 border border-line rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-primary text-xs">{p.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {p.locality?.name}, {p.city?.name} • ₹{p.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Link
                      href={`/properties/${p.id}`}
                      target="_blank"
                      className="px-2.5 py-1 bg-white border border-line hover:bg-secondary rounded text-[10px] font-bold text-primary transition shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-line">
              <button
                onClick={() => setSelectedUserForProps(null)}
                className="px-4 py-2 border border-line hover:bg-secondary text-slate-600 font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/45 backdrop-blur-xs" onClick={() => setEditingUser(null)}></div>
          <div className="bg-white border border-line rounded-2xl shadow-2xl p-6 max-w-md w-full z-10 text-xs font-semibold space-y-4">
            <h4 className="font-serif text-sm font-semibold text-primary">Edit User: {editingUser.name}</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 mb-1">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-line rounded px-3 py-2 bg-secondary text-slate-700"
                >
                  <option value="USER">User (Seeker)</option>
                  <option value="OWNER">Owner</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-line rounded px-3 py-2 bg-secondary text-slate-700"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-line hover:bg-secondary text-slate-500 font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserEdit}
                disabled={actionLoading}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
