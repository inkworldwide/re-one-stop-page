"use client";

import React, { useState, useEffect } from "react";
import { LayoutGrid, Trash2, RotateCcw, Star, Plus, Archive, Search, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  price: number;
  status: string;
  ownerId: string;
  owner?: { customId: string | null; name?: string | null; role?: string | null };
  city?: { name: string; state?: string };
  locality?: { name: string };
  isFeatured: boolean;
  rejectionReason?: string | null;
  images: Array<{ url: string }>;
}

export default function AdminListedProperties() {
  const [activeProperties, setActiveProperties] = useState<Property[]>([]);
  const [archivedProperties, setArchivedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties");
      if (res.ok) {
        const data = await res.json();
        setActiveProperties(data.active || []);
        setArchivedProperties(data.archived || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "toggleFeatured",
        }),
      });

      if (res.ok) {
        const updater = (props: Property[]) =>
          props.map(p => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
        setActiveProperties(updater);
        setArchivedProperties(updater);
        showToast("Property featured status updated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProperty = async (prop: Property) => {
    if (!confirm(`Are you sure you want to delete "${prop.title}"? It will be moved to Deleted / Archived list where you can restore it anytime.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prop.id,
          action: "archive",
          reason: "Deleted by Administrator",
        }),
      });

      if (res.ok) {
        const deletedProp = { ...prop, status: "ARCHIVED" };
        setActiveProperties(prev => prev.filter(p => p.id !== prop.id));
        setArchivedProperties(prev => [deletedProp, ...prev]);
        showToast(`✓ Property "${prop.title}" deleted and moved to archive.`);
      } else {
        showToast("Failed to delete property.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting property.", "error");
    }
  };

  const handleRestoreProperty = async (prop: Property) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prop.id,
          action: "restore",
        }),
      });

      if (res.ok) {
        const restoredProp = { ...prop, status: "ACTIVE" };
        setArchivedProperties(prev => prev.filter(p => p.id !== prop.id));
        setActiveProperties(prev => [restoredProp, ...prev]);
        showToast(`✓ Property "${prop.title}" restored successfully.`);
      } else {
        showToast("Failed to restore property.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error restoring property.", "error");
    }
  };

  const handleHardDeleteProperty = async (prop: Property) => {
    if (!confirm(`PERMANENT DELETE WARNING: Are you sure you want to PERMANENTLY delete "${prop.title}"? This will delete the listing from the database forever!`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prop.id,
          action: "delete",
        }),
      });

      if (res.ok) {
        setArchivedProperties(prev => prev.filter(p => p.id !== prop.id));
        showToast(`✓ Property "${prop.title}" permanently deleted.`);
      } else {
        showToast("Failed to permanently delete property.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting property.", "error");
    }
  };

  const filteredActive = activeProperties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.city?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.locality?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.owner?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.ownerId || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredArchived = archivedProperties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.city?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.locality?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.owner?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.ownerId || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading listed properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left relative pb-8">

      {/* Toast Notice */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white transition animate-in fade-in duration-200 ${
          toast.type === "success" ? "bg-[#0F172A] border border-[#D4AF37]/50" : "bg-red-900 border border-red-500"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#0F172A] font-bold flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-[#D4AF37]" /> Listed Properties
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage, verify, feature, or soft delete/restore active property listings worldwide.</p>
        </div>
        <Link
          href="/properties/add"
          className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-amber-500 text-[#0F172A] font-bold px-4 py-2 rounded-xl text-xs transition duration-150 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Property
        </Link>
      </div>

      {/* Tab Controls & Search Bar (Exact ILMIKA Style) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "active"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Active Listings</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              activeTab === "active" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-slate-200 text-slate-700"
            }`}>
              {activeProperties.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("archived")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "archived"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            <span>Deleted / Archived</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              activeTab === "archived" ? "bg-[#D4AF37] text-[#0F172A]" : "bg-slate-200 text-slate-700"
            }`}>
              {archivedProperties.length}
            </span>
          </button>
        </div>

        {/* Instant Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties by name, city, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#D4AF37] text-[#0F172A] transition font-medium"
          />
        </div>
      </div>

      {/* 1. ACTIVE LISTINGS TABLE (Exact ILMIKA Style) */}
      {activeTab === "active" && (
        filteredActive.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-12 text-center bg-white shadow-xs">
            <p className="text-xs text-slate-400 leading-relaxed font-mono">No active listed properties match your filter criteria.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Property Name</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActive.map((prop) => {
                    const coverUrl = prop.images && prop.images.length > 0
                      ? prop.images[0].url
                      : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

                    const locationStr = prop.locality?.name 
                      ? `${prop.locality.name}, ${prop.city?.name || "India"}` 
                      : (prop.city?.name || "India");

                    return (
                      <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                        <td className="px-6 py-4">
                          <img src={coverUrl} alt={prop.title} className="w-12 h-10 object-cover rounded-xl border border-slate-200 shadow-2xs" />
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0F172A] max-w-xs truncate">
                          <Link href={`/properties/${prop.id}`} className="hover:underline hover:text-[#D4AF37]">
                            {prop.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {locationStr}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(prop.id)}
                            title={prop.isFeatured ? "Unfeature Property" : "Feature Property"}
                            className={`p-1.5 rounded-xl transition cursor-pointer ${
                              prop.isFeatured 
                                ? "text-amber-500 hover:text-amber-600 bg-amber-500/10" 
                                : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/properties/${prop.id}`}
                              target="_blank"
                              className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                            >
                              <span>View Page</span>
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDeleteProperty(prop)}
                              className="p-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                              title="Delete Property"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* 2. DELETED / ARCHIVED LISTINGS TABLE (Exact ILMIKA Style) */}
      {activeTab === "archived" && (
        filteredArchived.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-12 text-center bg-white shadow-xs">
            <p className="text-xs text-slate-400 leading-relaxed font-mono">No deleted/archived properties found.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Property Name</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Restore Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArchived.map((prop) => {
                    const coverUrl = prop.images && prop.images.length > 0
                      ? prop.images[0].url
                      : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

                    const locationStr = prop.locality?.name 
                      ? `${prop.locality.name}, ${prop.city?.name || "India"}` 
                      : (prop.city?.name || "India");

                    return (
                      <tr key={prop.id} className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors border-b border-slate-100">
                        <td className="px-6 py-4">
                          <img src={coverUrl} alt={prop.title} className="w-12 h-10 object-cover rounded-xl border border-slate-200 grayscale opacity-80" />
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 max-w-xs truncate">
                          {prop.title}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {locationStr}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-red-50 border border-red-200 text-red-700 uppercase">
                            DELETED / ARCHIVED
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleHardDeleteProperty(prop)}
                              className="border border-red-200 hover:bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-xl transition text-xs inline-flex items-center gap-1.5 cursor-pointer"
                              title="Permanently Delete Property"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Permanently</span>
                            </button>
                            <button
                              onClick={() => handleRestoreProperty(prop)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Property</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

    </div>
  );
}
