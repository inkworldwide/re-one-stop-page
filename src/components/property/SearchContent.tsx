"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Search, SlidersHorizontal, Grid, List as ListIcon, Map as MapIcon, 
  X, Check, RotateCcw, ChevronLeft, ChevronRight 
} from "lucide-react";
import PropertyCard from "./PropertyCard";
import AdSidebarColumn from "@/components/ads/AdSidebarColumn";

// Dynamic import of Leaflet MapComponent to disable Server-Side Rendering
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-100 flex items-center justify-center border border-line rounded-2xl">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading interactive map...</p>
      </div>
    </div>
  ),
});

interface City {
  id: string;
  name: string;
}

interface Locality {
  id: string;
  name: string;
  cityId: string;
}

interface Property {
  id: string;
  title: string;
  slug: string;
  price: any;
  transactionType: string;
  propertyType: string;
  bhk: number | null;
  bathrooms: number | null;
  carpetArea: number;
  areaUnit: string;
  isVerified: boolean;
  isFeatured: boolean;
  furnishingStatus: string;
  locality: { name: string };
  city: { name: string };
  latitude: number | null;
  longitude: number | null;
  images: Array<{ url: string }>;
}

export default function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Loading States
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  // Pagination & Count
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // View state: grid, list, map (split)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    transactionType: searchParams.get("transactionType") || searchParams.get("type") || "",
    propertyType: searchParams.get("propertyType") || "",
    cityId: searchParams.get("cityId") || "",
    citySearch: searchParams.get("citySearch") || searchParams.get("city") || "",
    localityId: searchParams.get("localityId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bhk: searchParams.get("bhk") || "",
    facing: searchParams.get("facing") || "",
    furnishingStatus: searchParams.get("furnishingStatus") || "",
    possessionStatus: searchParams.get("possessionStatus") || "",
    isVerified: searchParams.get("isVerified") === "true",
    sortBy: searchParams.get("sortBy") || "newest",
    page: searchParams.get("page") || "1",
  });

  // Fetch Cities on Mount
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch("/api/cities");
        const data = await res.json();
        if (data.cities) setCities(data.cities);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCities();
  }, []);

  // Fetch Localities when selected City changes
  useEffect(() => {
    if (!filters.cityId) {
      setLocalities([]);
      return;
    }
    async function fetchLocalities() {
      try {
        const res = await fetch(`/api/localities?cityId=${filters.cityId}`);
        const data = await res.json();
        if (data.localities) setLocalities(data.localities);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLocalities();
  }, [filters.cityId]);

  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "",
      transactionType: searchParams.get("transactionType") || searchParams.get("type") || "",
      propertyType: searchParams.get("propertyType") || "",
      cityId: searchParams.get("cityId") || "",
      citySearch: searchParams.get("citySearch") || searchParams.get("city") || "",
      localityId: searchParams.get("localityId") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bhk: searchParams.get("bhk") || "",
      facing: searchParams.get("facing") || "",
      furnishingStatus: searchParams.get("furnishingStatus") || "",
      possessionStatus: searchParams.get("possessionStatus") || "",
      isVerified: searchParams.get("isVerified") === "true",
      sortBy: searchParams.get("sortBy") || "newest",
      page: searchParams.get("page") || "1",
    });
  }, [searchParams]);

  // Fetch Properties on filters changes
  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        // Serialize query params
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
          if (val) params.set(key, val.toString());
        });

        const res = await fetch(`/api/properties?${params.toString()}`);
        const data = await res.json();
        
        if (data.properties) {
          setProperties(data.properties);
          setTotalPages(data.meta.totalPages);
          setTotalCount(data.meta.total);
        }
      } catch (err) {
        console.error("Properties search error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [filters]);

  // Apply filters updating URL params
  const applyFilters = (newFilters: Partial<typeof filters>) => {
    const nextFilters = { ...filters, page: "1", ...newFilters }; // Reset page unless page is explicitly provided
    setFilters(nextFilters);

    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, val]) => {
      if (val) params.set(key, val.toString());
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    applyFilters({ page: newPage.toString() });
  };

  const handleResetFilters = () => {
    const reset = {
      category: "",
      transactionType: "",
      propertyType: "",
      cityId: "",
      citySearch: "",
      localityId: "",
      minPrice: "",
      maxPrice: "",
      bhk: "",
      facing: "",
      furnishingStatus: "",
      possessionStatus: "",
      isVerified: false,
      sortBy: "newest",
      page: "1",
    };
    setFilters(reset);
    router.push(pathname);
    setDrawerOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky Search bar strip */}
      <section className="bg-white border-b border-line py-4 px-6 md:px-8 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Transaction type selector */}
            <select
              value={filters.transactionType}
              onChange={(e) => applyFilters({ transactionType: e.target.value })}
              className="border border-line rounded-lg px-3 py-2 text-xs font-semibold bg-secondary text-primary focus:outline-none"
            >
              <option value="">Any Purpose</option>
              <option value="RENT">For Rent</option>
              <option value="SALE">For Sale</option>
              <option value="PURCHASE">For Purchase</option>
              <option value="LEASE">For Lease</option>
            </select>

            {/* City Selector */}
            <div className="flex gap-2 relative">
              <select
                value={filters.cityId}
                onChange={(e) => {
                  applyFilters({ cityId: e.target.value, localityId: "", citySearch: "" });
                }}
                className="border border-line rounded-lg px-3 py-2 text-xs font-semibold bg-secondary text-primary focus:outline-none"
              >
                <option value="">All Cities</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="others">Others...</option>
              </select>
              
              {filters.cityId === "others" && (
                <input
                  type="text"
                  placeholder="Type city name..."
                  value={filters.citySearch}
                  onChange={(e) => applyFilters({ citySearch: e.target.value })}
                  className="border border-line rounded-lg px-3 py-2 text-xs font-semibold bg-secondary text-primary focus:outline-none w-32"
                />
              )}
            </div>

            {/* BHK Selector */}
            <select
              value={filters.bhk}
              onChange={(e) => applyFilters({ bhk: e.target.value })}
              className="border border-line rounded-lg px-3 py-2 text-xs font-semibold bg-secondary text-primary focus:outline-none"
            >
              <option value="">Any BHK</option>
              <option value="studio">Studio</option>
              <option value="apartment">Apartment</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>

            {/* More Filters Toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              type="button"
              className="flex items-center gap-1.5 border border-line hover:border-accent bg-secondary hover:bg-paper rounded-lg px-4.5 py-2 text-xs font-bold transition text-primary cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
              Filters
            </button>
          </div>

          {/* Controls: View Mode & Sorting */}
          <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-line">
            <div className="flex items-center gap-1 bg-secondary border border-line rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                type="button"
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === "grid" ? "bg-primary text-secondary" : "text-slate-400 hover:text-primary"}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                type="button"
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === "list" ? "bg-primary text-secondary" : "text-slate-400 hover:text-primary"}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                type="button"
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === "map" ? "bg-primary text-secondary" : "text-slate-400 hover:text-primary"}`}
                title="Split Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => applyFilters({ sortBy: e.target.value })}
              className="border border-line rounded-lg px-3 py-2 text-xs font-semibold bg-secondary text-primary focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Carpet Area: High to Low</option>
            </select>
          </div>

        </div>
      </section>

      {/* Main Listings Body */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-8">
        
        {/* Dynamic header summary */}
        <div className="mb-6 flex justify-between items-center text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
          <span>{totalCount} properties found</span>
          {filters.cityId && <span>Bengaluru Market</span>}
        </div>

        {/* LOADING STATE - Skeleton loaders */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(idx => (
              <div key={idx} className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm h-96 flex flex-col justify-between p-5 space-y-4">
                <div className="aspect-[4/3] w-full shimmer-bg animate-shimmer rounded-xl"></div>
                <div className="h-5 shimmer-bg animate-shimmer rounded w-3/4"></div>
                <div className="h-4 shimmer-bg animate-shimmer rounded w-1/2"></div>
                <div className="h-px bg-line/80 my-1"></div>
                <div className="flex gap-3 justify-between items-center">
                  <div className="h-7 shimmer-bg animate-shimmer rounded w-1/3"></div>
                  <div className="h-4 shimmer-bg animate-shimmer rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          // EMPTY STATE - No properties found
          <div className="bg-white border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <SlidersHorizontal className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-serif text-xl text-primary font-semibold mb-2">No Properties Found</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We couldn't find any properties matching your current search parameters. Try widening your price range or clearing filters.
            </p>
            <button
              onClick={handleResetFilters}
              type="button"
              className="bg-primary text-secondary font-semibold px-6 py-2.5 rounded-full hover:bg-slate-800 transition text-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        ) : (
          // RENDER PROPERTIES LIST
          <>
            {/* 1. GRID VIEW */}
            {viewMode === "grid" && (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {properties.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
                <div className="w-full lg:w-72 xl:w-80 shrink-0">
                  <AdSidebarColumn page="properties" />
                </div>
              </div>
            )}

            {/* 2. LIST VIEW */}
            {viewMode === "list" && (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 flex flex-col gap-6 w-full">
                  {properties.map(p => (
                    <div key={p.id} className="w-full">
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>
                <div className="w-full lg:w-72 xl:w-80 shrink-0">
                  <AdSidebarColumn page="properties" />
                </div>
              </div>
            )}

            {/* 3. SPLIT MAP VIEW */}
            {viewMode === "map" && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 border border-line rounded-2xl overflow-hidden bg-white shadow-sm min-h-[600px] h-[calc(100vh-280px)]">
                {/* Left scrollable list */}
                <div className="overflow-y-auto p-5 no-scrollbar flex flex-col gap-5 h-full">
                  {properties.map(p => (
                    <div 
                      key={p.id} 
                      className="w-full shrink-0"
                      onMouseEnter={() => setHoveredPropertyId(p.id)}
                      onMouseLeave={() => setHoveredPropertyId(null)}
                    >
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>
                
                {/* Right Map Panel */}
                <div className="h-full border-l border-line relative overflow-hidden hidden lg:block">
                  <MapComponent properties={properties} hoveredPropertyId={hoveredPropertyId} />
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 border-t border-line/60 pt-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, parseInt(filters.page) - 1))}
                  disabled={filters.page === "1"}
                  type="button"
                  className="w-10 h-10 border border-line rounded-full grid place-items-center hover:bg-secondary transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const currPage = idx + 1;
                  const isCurrent = filters.page === currPage.toString();
                  return (
                    <button
                      key={currPage}
                      onClick={() => handlePageChange(currPage)}
                      type="button"
                      className={`w-10 h-10 rounded-full font-semibold text-xs border transition cursor-pointer ${
                        isCurrent 
                          ? "bg-primary border-primary text-secondary shadow-sm" 
                          : "border-line text-slate-600 hover:bg-secondary"
                      }`}
                    >
                      {currPage}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, parseInt(filters.page) + 1))}
                  disabled={filters.page === totalPages.toString()}
                  type="button"
                  className="w-10 h-10 border border-line rounded-full grid place-items-center hover:bg-secondary transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

      </section>

      {/* FILTER DRAWER SLIDE-IN */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm transition"
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 py-6 px-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <h3 className="font-serif text-lg text-primary font-semibold">Detailed Filters</h3>
              <button 
                onClick={() => setDrawerOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full border border-line grid place-items-center hover:bg-secondary transition cursor-pointer text-slate-500"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-sm no-scrollbar">
              {/* Transaction Type */}
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-2">Purpose</label>
                <div className="grid grid-cols-3 gap-2">
                  {["RENT", "SALE", "LEASE"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => applyFilters({ transactionType: filters.transactionType === type ? "" : type })}
                      className={`py-2 rounded-lg border text-xs font-semibold text-center transition cursor-pointer ${
                        filters.transactionType === type
                          ? "border-accent bg-accent/5 text-primary font-bold"
                          : "border-line bg-secondary text-slate-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-2">City</label>
                <select
                  value={filters.cityId}
                  onChange={(e) => applyFilters({ cityId: e.target.value, localityId: "" })}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Locality Selection (Only loaded if city is selected) */}
              {filters.cityId && localities.length > 0 && (
                <div>
                  <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-2">Locality</label>
                  <select
                    value={filters.localityId}
                    onChange={(e) => applyFilters({ localityId: e.target.value })}
                    className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                  >
                    <option value="">Select Locality</option>
                    {localities.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Ranges */}
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-2">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => applyFilters({ minPrice: e.target.value })}
                    className="border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => applyFilters({ maxPrice: e.target.value })}
                    className="border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                  />
                </div>
              </div>

              {/* Furnishing Status */}
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-2">Furnishing</label>
                <select
                  value={filters.furnishingStatus}
                  onChange={(e) => applyFilters({ furnishingStatus: e.target.value })}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-semibold"
                >
                  <option value="">Any</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                </select>
              </div>

              {/* Facing Direction */}
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-2">Facing Direction</label>
                <select
                  value={filters.facing}
                  onChange={(e) => applyFilters({ facing: e.target.value })}
                  className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-semibold"
                >
                  <option value="">Any Direction</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTH">North</option>
                  <option value="SOUTH">South</option>
                  <option value="NORTHEAST">North-East</option>
                  <option value="NORTHWEST">North-West</option>
                  <option value="SOUTHEAST">South-East</option>
                  <option value="SOUTHWEST">South-West</option>
                </select>
              </div>

              {/* Verified Badge Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={filters.isVerified}
                  onChange={(e) => applyFilters({ isVerified: e.target.checked })}
                  className="w-5 h-5 rounded border-line text-accent focus:ring-accent"
                />
                <label htmlFor="isVerified" className="text-sm font-semibold text-slate-700">Verified Listings Only</label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 border-t border-line pt-4 mt-4">
              <button
                onClick={handleResetFilters}
                type="button"
                className="flex-1 py-2.5 border border-line hover:bg-secondary rounded-lg font-bold text-xs transition text-slate-600 cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                type="button"
                className="flex-1 py-2.5 bg-primary hover:bg-slate-800 text-secondary rounded-lg font-bold text-xs transition cursor-pointer"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
