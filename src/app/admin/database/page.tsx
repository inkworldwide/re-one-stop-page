"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Database,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Search,
  Trash2,
  Sparkles,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
  Building,
} from "lucide-react";

interface City {
  id: string;
  name: string;
  state?: string;
}

interface Locality {
  id: string;
  name: string;
  cityId: string;
  city?: { name: string };
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export default function AdminDatabaseManager() {
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab & View state
  const [activeTab, setActiveTab] = useState<"overview" | "cities" | "localities" | "amenities">("overview");

  // Search states
  const [globalSearch, setGlobalSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [localitySearch, setLocalitySearch] = useState("");
  const [amenitySearch, setAmenitySearch] = useState("");

  // Form states
  const [cityForm, setCityForm] = useState({ cityName: "", state: "Maharashtra" });
  const [localityForm, setLocalityForm] = useState({ localityName: "", cityId: "" });
  const [amenityForm, setAmenityForm] = useState({ amenityName: "", icon: "Check" });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToastNotice = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [citiesRes, localitiesRes, amenitiesRes] = await Promise.all([
        fetch("/api/cities"),
        fetch("/api/localities"),
        fetch("/api/amenities"),
      ]);

      const citiesData = await citiesRes.json();
      const localitiesData = await localitiesRes.json();
      const amenitiesData = await amenitiesRes.json();

      if (citiesData.cities) setCities(citiesData.cities);
      if (localitiesData.localities) setLocalities(localitiesData.localities);
      if (amenitiesData.amenities) setAmenities(amenitiesData.amenities);
    } catch (err) {
      console.error(err);
      showToastNotice("Failed to load master configuration data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent, type: "city" | "locality" | "amenity", formData: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...formData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create database entry");

      showToastNotice(`✓ ${type.toUpperCase()} created successfully!`);
      
      // Reset forms
      if (type === "city") setCityForm({ cityName: "", state: "Maharashtra" });
      if (type === "locality") setLocalityForm({ localityName: "", cityId: "" });
      if (type === "amenity") setAmenityForm({ amenityName: "", icon: "Check" });

      // Reload lists
      loadData();
    } catch (err: any) {
      showToastNotice(err.message || "An error occurred.", "error");
    }
  };

  const handleDelete = async (type: "city" | "locality" | "amenity", id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/database?id=${id}&type=${type}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry.");

      showToastNotice(`✓ ${type.toUpperCase()} '${name}' deleted successfully!`);
      loadData();
    } catch (err: any) {
      showToastNotice(err.message || "Failed to delete entry.", "error");
    }
  };

  // Filtered lists
  const filteredCities = useMemo(() => {
    const q = (citySearch || globalSearch).toLowerCase().trim();
    if (!q) return cities;
    return cities.filter(c => c.name.toLowerCase().includes(q) || (c.state || "").toLowerCase().includes(q));
  }, [cities, citySearch, globalSearch]);

  const filteredLocalities = useMemo(() => {
    const q = (localitySearch || globalSearch).toLowerCase().trim();
    if (!q) return localities;
    return localities.filter(l => l.name.toLowerCase().includes(q));
  }, [localities, localitySearch, globalSearch]);

  const filteredAmenities = useMemo(() => {
    const q = (amenitySearch || globalSearch).toLowerCase().trim();
    if (!q) return amenities;
    return amenities.filter(a => a.name.toLowerCase().includes(q));
  }, [amenities, amenitySearch, globalSearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
        <div className="w-9 h-9 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Synchronizing platform master configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-10 relative">

      {/* Floating Toast Notice */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white transition animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "bg-[#0F172A] border border-[#D4AF37]/50"
              : "bg-red-900 border border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb Navigation & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#D4AF37] font-semibold">Platform Configuration</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-bold tracking-tight flex items-center gap-2.5">
            <Database className="w-7 h-7 text-[#D4AF37]" /> Platform Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Configure and manage operational parameters such as supported Cities, Localities, and Amenities.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E5E7EB] font-bold px-3.5 py-2 rounded-xl text-xs transition duration-200 shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh Master Data
        </button>
      </div>

      {/* 📊 Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab("cities")}
          className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex items-center justify-between ${
            activeTab === "cities" ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "border-[#E5E7EB]"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Supported Cities
            </p>
            <p className="font-serif text-3xl font-bold text-[#0F172A]">{cities.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Primary metropolitan hubs</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D4AF37] border border-amber-100 grid place-items-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("localities")}
          className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex items-center justify-between ${
            activeTab === "localities" ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "border-[#E5E7EB]"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Mapped Localities
            </p>
            <p className="font-serif text-3xl font-bold text-[#0F172A]">{localities.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Micro-market sectors & zones</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 grid place-items-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("amenities")}
          className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex items-center justify-between ${
            activeTab === "amenities" ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "border-[#E5E7EB]"
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Property Amenities
            </p>
            <p className="font-serif text-3xl font-bold text-[#0F172A]">{amenities.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Luxury & basic features</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 grid place-items-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Segmented View Tabs & Global Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Overview Cards</span>
          </button>

          <button
            onClick={() => setActiveTab("cities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "cities"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cities</span>
            <span className="ml-1 text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-md">
              {cities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("localities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "localities"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Localities</span>
            <span className="ml-1 text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-md">
              {localities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("amenities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "amenities"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Amenities</span>
            <span className="ml-1 text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-md">
              {amenities.length}
            </span>
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search across all master data..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4AF37] transition"
          />
        </div>
      </div>

      {/* 3-COLUMN OVERVIEW GRID VIEW */}
      {(activeTab === "overview" || activeTab === "cities" || activeTab === "localities" || activeTab === "amenities") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 🏙 1. CITIES MANAGER */}
          {(activeTab === "overview" || activeTab === "cities") && (
            <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between ${
              activeTab === "cities" ? "lg:col-span-3" : ""
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" /> Supported Cities
                  </h3>
                  <span className="bg-amber-50 text-[#D4AF37] border border-amber-200/60 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {filteredCities.length} Total
                  </span>
                </div>
                
                {/* Create form */}
                <form onSubmit={(e) => handleCreate(e, "city", cityForm)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">City Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pune, Mumbai, Delhi"
                        value={cityForm.cityName}
                        onChange={(e) => setCityForm(prev => ({ ...prev, cityName: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">State Name</label>
                      <input
                        type="text"
                        required
                        value={cityForm.state}
                        onChange={(e) => setCityForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add City
                  </button>
                </form>

                {/* Search Input */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                {/* List display */}
                <div className="h-56 overflow-y-auto custom-scrollbar border border-[#E5E7EB] bg-slate-50/50 rounded-xl divide-y divide-slate-100 text-xs">
                  {filteredCities.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-mono">No matching cities found</div>
                  ) : (
                    filteredCities.map((c, idx) => (
                      <div key={c.id || `city-${idx}`} className="group p-2.5 flex items-center justify-between font-medium hover:bg-white transition">
                        <span className="text-[#0F172A] font-semibold">{c.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{c.state || "Active"}</span>
                          <button
                            onClick={() => handleDelete("city", c.id, c.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete City"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 📍 2. LOCALITIES MANAGER */}
          {(activeTab === "overview" || activeTab === "localities") && (
            <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between ${
              activeTab === "localities" ? "lg:col-span-3" : ""
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" /> Localities & Zones
                  </h3>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {filteredLocalities.length} Total
                  </span>
                </div>

                <form onSubmit={(e) => handleCreate(e, "locality", localityForm)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Locality Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Koregaon Park, Indiranagar"
                        value={localityForm.localityName}
                        onChange={(e) => setLocalityForm(prev => ({ ...prev, localityName: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Associated City</label>
                      <select
                        required
                        value={localityForm.cityId}
                        onChange={(e) => setLocalityForm(prev => ({ ...prev, cityId: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      >
                        <option value="">Select City</option>
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Locality
                  </button>
                </form>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Localities..."
                    value={localitySearch}
                    onChange={(e) => setLocalitySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                <div className="h-56 overflow-y-auto custom-scrollbar border border-[#E5E7EB] bg-slate-50/50 rounded-xl divide-y divide-slate-100 text-xs">
                  {filteredLocalities.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-mono">No matching localities found</div>
                  ) : (
                    filteredLocalities.map((l, idx) => (
                      <div key={l.id || `locality-${idx}`} className="group p-2.5 flex items-center justify-between font-medium hover:bg-white transition">
                        <span className="text-[#0F172A] font-semibold">{l.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {cities.find(c => c.id === l.cityId)?.name || "Mapped"}
                          </span>
                          <button
                            onClick={() => handleDelete("locality", l.id, l.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete Locality"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✨ 3. AMENITIES MANAGER */}
          {(activeTab === "overview" || activeTab === "amenities") && (
            <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between ${
              activeTab === "amenities" ? "lg:col-span-3" : ""
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" /> Property Amenities
                  </h3>
                  <span className="bg-teal-50 text-teal-700 border border-teal-200/60 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {filteredAmenities.length} Total
                  </span>
                </div>

                <form onSubmit={(e) => handleCreate(e, "amenity", amenityForm)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Amenity Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Swimming Pool, Gym"
                        value={amenityForm.amenityName}
                        onChange={(e) => setAmenityForm(prev => ({ ...prev, amenityName: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Lucide Icon Name</label>
                      <input
                        type="text"
                        required
                        value={amenityForm.icon}
                        onChange={(e) => setAmenityForm(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0F172A] hover:bg-[#D4AF37] text-white hover:text-[#0F172A] py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Amenity
                  </button>
                </form>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Amenities..."
                    value={amenitySearch}
                    onChange={(e) => setAmenitySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                <div className="h-56 overflow-y-auto custom-scrollbar border border-[#E5E7EB] bg-slate-50/50 rounded-xl divide-y divide-slate-100 text-xs">
                  {filteredAmenities.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-mono">No matching amenities found</div>
                  ) : (
                    filteredAmenities.map((a, idx) => (
                      <div key={a.id || `amenity-${idx}`} className="group p-2.5 flex items-center justify-between font-medium hover:bg-white transition">
                        <span className="text-[#0F172A] font-semibold">{a.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{a.icon || "Check"}</span>
                          <button
                            onClick={() => handleDelete("amenity", a.id, a.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete Amenity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
