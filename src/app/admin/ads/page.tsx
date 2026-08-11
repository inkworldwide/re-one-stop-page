"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, Plus, Trash2, Edit3, ExternalLink, Eye, CheckCircle2, XCircle, 
  Sparkles, Layers, Image as ImageIcon, MousePointerClick, RefreshCw, Filter, LayoutGrid, X, Search
} from "lucide-react";

interface Advertisement {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  placement: "HOME_ONLY" | "INNER_ONLY" | "BOTH" | "PROPERTIES_ONLY" | "PROPERTY_DETAIL_ONLY";
  format: "FULL_WIDTH" | "HALF_WIDTH" | "QUAD_GRID";
  isExclusive: boolean;
  isActive: boolean;
  displayOrder: number;
  clickCount: number;
  createdAt: string;
}

const getPlacementLabel = (p: string) => {
  switch (p) {
    case "HOME_ONLY": return "Home Page Only";
    case "INNER_ONLY": return "All Inner Pages";
    case "PROPERTIES_ONLY": return "Property Listings";
    case "PROPERTY_DETAIL_ONLY": return "Property Details";
    case "BOTH": default: return "All Pages";
  }
};

const PRESET_SAMPLE_ADS = [
  {
    name: "Harvard Leadership Certification 2026",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://online.harvard.edu",
    placement: "BOTH",
    format: "FULL_WIDTH",
  },
  {
    name: "Tesla Model Y Electric Experience",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://www.tesla.com",
    placement: "HOME_ONLY",
    format: "FULL_WIDTH",
  },
  {
    name: "Coursera Plus Professional Courses",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://www.coursera.org",
    placement: "INNER_ONLY",
    format: "HALF_WIDTH",
  },
  {
    name: "Zerodha Stock & Equity Trading",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://zerodha.com",
    placement: "PROPERTIES_ONLY",
    format: "QUAD_GRID",
  },
];

export default function AdminAdsBuzzPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlacement, setFilterPlacement] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
    targetUrl: "",
    placement: "BOTH" as "HOME_ONLY" | "INNER_ONLY" | "BOTH" | "PROPERTIES_ONLY" | "PROPERTY_DETAIL_ONLY",
    format: "FULL_WIDTH" as "FULL_WIDTH" | "HALF_WIDTH" | "QUAD_GRID",
    isExclusive: false,
    displayOrder: "1" as string | number,
    isActive: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (err) {
      console.error("Fetch ads error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setForm({
      name: "",
      imageUrl: "",
      targetUrl: "",
      placement: "BOTH",
      format: "FULL_WIDTH",
      isExclusive: false,
      displayOrder: String(ads.length + 1),
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload image file");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image file");
    } finally {
      setUploadingImage(false);
    }
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      name: ad.name,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      placement: ad.placement,
      format: ad.format,
      isExclusive: Boolean(ad.isExclusive),
      displayOrder: String(ad.displayOrder || 1),
      isActive: ad.isActive,
    });
    setModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.imageUrl || !form.targetUrl) {
      alert("Please fill in Name, Image URL, and Target URL.");
      return;
    }

    let cleanedTargetUrl = form.targetUrl.trim();
    if (!cleanedTargetUrl.startsWith("http://") && !cleanedTargetUrl.startsWith("https://") && !cleanedTargetUrl.startsWith("/")) {
      cleanedTargetUrl = `https://${cleanedTargetUrl}`;
    }

    const parsedOrder = parseInt(String(form.displayOrder).trim(), 10);
    const finalDisplayOrder = isNaN(parsedOrder) || parsedOrder < 1 ? 1 : parsedOrder;

    setSaving(true);
    try {
      const url = "/api/admin/ads";
      const method = editingAd ? "PUT" : "POST";
      const payload = {
        ...form,
        isExclusive: Boolean(form.isExclusive),
        displayOrder: finalDisplayOrder,
        targetUrl: cleanedTargetUrl,
      };
      const body = editingAd ? { ...payload, id: editingAd.id } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchAds();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save ad");
      }
    } catch (err) {
      console.error("Save ad error:", err);
      alert("Error saving advertisement");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
      });
      if (res.ok) {
        setAds(prev => prev.map(item => item.id === ad.id ? { ...item, isActive: !ad.isActive } : item));
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const handleToggleExclusive = async (ad: Advertisement) => {
    try {
      const nextExclusive = !ad.isExclusive;
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id, isExclusive: nextExclusive }),
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (err) {
      console.error("Toggle exclusive error:", err);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad banner?")) return;
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAds(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Delete ad error:", err);
    }
  };

  const filteredAds = ads
    .filter(ad => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || ad.name.toLowerCase().includes(q) || ad.targetUrl.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (filterPlacement === "HOME") return ad.placement === "HOME_ONLY" || ad.placement === "BOTH";
      if (filterPlacement === "INNER") return ad.placement === "INNER_ONLY" || ad.placement === "BOTH";
      if (filterPlacement === "ACTIVE") return ad.isActive;
      if (filterPlacement === "INACTIVE") return !ad.isActive;
      return true;
    })
    .sort((a, b) => {
      if (a.isExclusive !== b.isExclusive) return a.isExclusive ? -1 : 1;
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalClicks = ads.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  const activeCount = ads.filter(a => a.isActive).length;
  const inactiveCount = ads.filter(a => !a.isActive).length;
  const homeCount = ads.filter(a => a.placement === "HOME_ONLY" || a.placement === "BOTH").length;
  const innerCount = ads.filter(a => a.placement === "INNER_ONLY" || a.placement === "BOTH").length;

  return (
    <div className="space-y-7 font-sans text-left pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-primary flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5 text-amber-600" />
            </div>
            <span>Ads Buzz Manager</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Manage right-side ad promotions, home loan offers, partner banners, and target click destinations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary hover:bg-slate-800 text-amber-400 font-bold text-xs px-5 py-3 rounded-2xl shadow-xs hover:shadow-md transition duration-200 cursor-pointer border border-amber-400/30"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Ad Banner</span>
        </button>
      </div>

      {/* Executive Stat Cards Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Ads */}
        <button
          onClick={() => setFilterPlacement("ALL")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "ALL"
              ? "bg-primary text-white border-primary shadow-md ring-2 ring-amber-400"
              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "ALL" ? "text-amber-400" : "text-slate-500"}`}>
              Total Ads
            </span>
            <Layers className={`w-4 h-4 ${filterPlacement === "ALL" ? "text-amber-400" : "text-slate-400"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{ads.length}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "ALL" ? "text-slate-300" : "text-slate-500"}`}>All Campaigns</p>
          </div>
        </button>

        {/* Card 2: Active Ads */}
        <button
          onClick={() => setFilterPlacement("ACTIVE")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "ACTIVE"
              ? "bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-emerald-400"
              : "bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-200/80 text-emerald-950 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "ACTIVE" ? "text-emerald-300" : "text-emerald-700"}`}>
              Active Live
            </span>
            <CheckCircle2 className={`w-4 h-4 ${filterPlacement === "ACTIVE" ? "text-emerald-300" : "text-emerald-600"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{activeCount}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "ACTIVE" ? "text-emerald-200" : "text-emerald-700"}`}>Currently Displayed</p>
          </div>
        </button>

        {/* Card 3: Inactive Ads */}
        <button
          onClick={() => setFilterPlacement("INACTIVE")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "INACTIVE"
              ? "bg-rose-900 text-white border-rose-900 shadow-md ring-2 ring-rose-400"
              : "bg-rose-50/50 hover:bg-rose-100/60 border-rose-200/80 text-rose-950 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "INACTIVE" ? "text-rose-300" : "text-rose-700"}`}>
              Inactive Ads
            </span>
            <XCircle className={`w-4 h-4 ${filterPlacement === "INACTIVE" ? "text-rose-300" : "text-rose-600"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{inactiveCount}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "INACTIVE" ? "text-rose-200" : "text-rose-700"}`}>Paused / Hidden</p>
          </div>
        </button>

        {/* Card 4: Home Page Ads */}
        <button
          onClick={() => setFilterPlacement("HOME")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "HOME"
              ? "bg-amber-900 text-white border-amber-900 shadow-md ring-2 ring-amber-400"
              : "bg-amber-50/50 hover:bg-amber-100/60 border-amber-200/80 text-amber-950 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "HOME" ? "text-amber-300" : "text-amber-800"}`}>
              Home Page
            </span>
            <LayoutGrid className={`w-4 h-4 ${filterPlacement === "HOME" ? "text-amber-300" : "text-amber-700"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{homeCount}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "HOME" ? "text-amber-200" : "text-amber-800"}`}>Targeted on Home</p>
          </div>
        </button>

        {/* Card 5: Total Link Clicks */}
        <div className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/50 text-left shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-purple-700">
              Total Clicks
            </span>
            <MousePointerClick className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold text-purple-950">{totalClicks.toLocaleString()}</p>
            <p className="text-[10px] font-medium text-purple-700 mt-0.5">Live Engagement</p>
          </div>
        </div>

      </div>

      {/* Segmented Control Filter Bar & Search Input */}
      <div className="bg-slate-100/80 border border-slate-200/80 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Placement Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "ALL", label: "All Ads", count: ads.length },
            { id: "HOME", label: "Home Page", count: homeCount },
            { id: "INNER", label: "Inner Pages", count: innerCount },
            { id: "ACTIVE", label: "Active", count: activeCount },
            { id: "INACTIVE", label: "Inactive", count: inactiveCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterPlacement(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                filterPlacement === tab.id
                  ? "bg-white text-primary shadow-2xs border border-slate-200/90"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                filterPlacement === tab.id ? "bg-primary text-amber-400" : "bg-slate-200 text-slate-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Actions: Search Bar & Refresh */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-[240px] justify-end">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ad by name or target URL..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-amber-500 pl-8 pr-7 py-2 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-md"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={fetchAds}
            className="text-xs font-bold text-slate-600 hover:text-primary flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs shrink-0"
            title="Refresh Ad List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Ad List Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs">
          Loading Ads Buzz database...
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-md mx-auto my-8 bg-slate-50/50 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold text-xl">
            📢
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-primary">No Ad Banners Found</h3>
            <p className="text-xs text-slate-500 mt-1">Create your first ad banner to display real estate promotions!</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-primary text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition"
          >
            Create Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className={`bg-white border rounded-2xl p-4 shadow-2xs space-y-3 transition flex flex-col justify-between ${
                ad.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div className="space-y-3">
                {/* Banner Preview Image */}
                <div className="aspect-[3.2/1] rounded-xl overflow-hidden bg-slate-100 relative border border-slate-200">
                  <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-primary text-white px-2 py-0.5 rounded shadow-2xs">
                    Order #{ad.displayOrder}
                  </span>
                  <span className={`absolute top-2 right-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-2xs border ${
                    ad.isActive 
                      ? "bg-emerald-500 text-white border-emerald-600" 
                      : "bg-slate-700 text-slate-200 border-slate-600"
                  }`}>
                    {ad.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h4 className="font-serif font-bold text-sm text-primary truncate" title={ad.name}>
                    {ad.name}
                  </h4>
                  <a
                    href={ad.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 mt-0.5 font-mono truncate"
                  >
                    <span>{ad.targetUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Placement & Format Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
                  {ad.isExclusive && (
                    <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md border border-amber-500 shadow-2xs flex items-center gap-1 font-bold">
                      👑 EXCLUSIVE SOLO AD
                    </span>
                  )}
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    📍 {getPlacementLabel(ad.placement)}
                  </span>
                  <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                    📐 {ad.format === "FULL_WIDTH" ? "Sidebar Banner" : ad.format === "HALF_WIDTH" ? "Dual Half Grid" : "4-Card Combined Grid"}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-slate-500 font-mono font-semibold flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3 text-purple-600" />
                  <span>{ad.clickCount} clicks</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleExclusive(ad)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      ad.isExclusive
                        ? "bg-amber-400 text-slate-950 border border-amber-500 shadow-2xs font-extrabold"
                        : "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200"
                    }`}
                    title={ad.isExclusive ? "Remove Solo Exclusive Takeover" : "Make Solo Exclusive Takeover"}
                  >
                    <span>👑</span>
                    <span>{ad.isExclusive ? "Solo Active" : "Set Solo"}</span>
                  </button>
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      ad.isActive
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {ad.isActive ? "Pause" : "Enable"}
                  </button>
                  <button
                    onClick={() => openEditModal(ad)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAd(ad.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Ad Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl animate-fadeIn max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0">
              <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <span>{editingAd ? "Edit Ad Banner" : "Create New Ad Banner"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveAd} className="flex flex-col flex-1 min-h-0 text-xs font-sans">
              <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ad Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harvard Leadership Certification 2026"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Image *</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="https://... or upload image"
                        value={form.imageUrl}
                        onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium text-xs"
                      />
                      <label className="bg-primary hover:bg-slate-800 text-amber-400 font-bold px-3 py-2.5 rounded-xl transition cursor-pointer text-xs shrink-0 border border-amber-400/30 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{uploadingImage ? "Uploading..." : "Browse"}</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>

                    {form.imageUrl && (
                      <div className="aspect-[3.2/1] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                        <img 
                          src={form.imageUrl} 
                          alt="Ad Preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">Or pick sample template:</span>
                      {PRESET_SAMPLE_ADS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, imageUrl: sample.imageUrl, ...(prev.name ? {} : { name: sample.name, targetUrl: sample.targetUrl }) }))}
                          className="text-[10px] bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 px-2 py-0.5 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Sample #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Click Destination URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://online.harvard.edu or /properties"
                    value={form.targetUrl}
                    onChange={e => setForm({ ...form, targetUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Page Placement *</label>
                    <select
                      value={form.placement}
                      onChange={e => setForm({ ...form, placement: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium text-xs"
                    >
                      <option value="BOTH">🌐 All Pages (Home & Inner)</option>
                      <option value="HOME_ONLY">🏠 Home Page Only</option>
                      <option value="INNER_ONLY">📄 All Inner Pages</option>
                      <option value="PROPERTIES_ONLY">🏢 Property Listings Page</option>
                      <option value="PROPERTY_DETAIL_ONLY">🏠 Property Details Page</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Banner Layout Format *</label>
                    <select
                      value={form.format}
                      onChange={e => setForm({ ...form, format: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium text-xs"
                    >
                      <option value="FULL_WIDTH">🖼️ Full Width Sidebar Banner</option>
                      <option value="HALF_WIDTH">📐 Dual Half Width Sidebar Grid</option>
                      <option value="QUAD_GRID">🧩 4-Card Combined Grid Block</option>
                    </select>
                  </div>
                </div>

                {/* Exclusive Solo Ad Banner Option */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isExclusiveCheck"
                      checked={form.isExclusive}
                      onChange={e => setForm({ ...form, isExclusive: e.target.checked })}
                      className="w-4 h-4 text-amber-500 accent-primary rounded cursor-pointer"
                    />
                    <label htmlFor="isExclusiveCheck" className="font-bold text-amber-950 cursor-pointer text-xs flex items-center gap-1">
                      👑 Exclusive Solo Banner Takeover (Hide All Other Ads)
                    </label>
                  </div>
                  <p className="text-[10.5px] text-amber-800 leading-relaxed font-medium pl-6">
                    Check this if the advertiser purchased an exclusive package. When active, ONLY this single ad will appear in the sidebar, hiding secondary ads on that placement.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sort Display Order (Priority #) *</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      required
                      value={form.displayOrder}
                      onChange={e => setForm({ ...form, displayOrder: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-bold text-xs"
                    />
                  </div>

                  <div className="pt-5 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActiveCheck"
                      checked={form.isActive}
                      onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 text-amber-500 accent-primary rounded cursor-pointer"
                    />
                    <label htmlFor="isActiveCheck" className="font-bold text-slate-700 cursor-pointer">
                      Enable Ad Banner
                    </label>
                  </div>
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-amber-400 hover:bg-slate-800 font-bold px-5 py-2 rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingAd ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
