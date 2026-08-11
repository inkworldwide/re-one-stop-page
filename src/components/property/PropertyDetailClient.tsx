"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  MapPin, BedDouble, Bath, Ruler, ShieldCheck, CalendarRange, 
  Mail, MessageSquare, Phone, ChevronLeft, ChevronRight, Eye, 
  Star, Award, CheckCircle2, Send, Clock, Heart, Link as LinkIcon, 
  BarChart3, AlertTriangle, ArrowUpRight, Bus, Train, Plane,
  Wifi, Dumbbell, Car, Waves, Shield, Zap, ArrowUpDown, Leaf, Home, Flame, Droplet, TreePine, Droplets, Camera
} from "lucide-react";
import PropertyCard from "./PropertyCard";
import AdSidebarColumn from "@/components/ads/AdSidebarColumn";

// Dynamic import of Leaflet circle map
const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-slate-100 animate-pulse rounded-xl"></div>,
});

const getAmenityImageUrl = (name: string) => {
  const cleanName = name.toLowerCase();
  if (cleanName.includes("wifi") || cleanName.includes("internet")) return "https://cdn-icons-png.flaticon.com/512/93/93158.png";
  if (cleanName.includes("gym") || cleanName.includes("fitness")) return "https://cdn-icons-png.flaticon.com/512/2964/2964096.png";
  if (cleanName.includes("parking") || cleanName.includes("garage")) return "https://cdn-icons-png.flaticon.com/512/2964/2964098.png";
  if (cleanName.includes("pool") || cleanName.includes("swimming")) return "https://cdn-icons-png.flaticon.com/512/4813/4813589.png";
  if (cleanName.includes("security") || cleanName.includes("cctv") || cleanName.includes("guard")) return "https://cdn-icons-png.flaticon.com/512/2964/2964104.png";
  if (cleanName.includes("power") || cleanName.includes("backup")) return "https://cdn-icons-png.flaticon.com/512/2964/2964108.png";
  if (cleanName.includes("lift") || cleanName.includes("elevator")) return "https://cdn-icons-png.flaticon.com/512/2964/2964112.png";
  if (cleanName.includes("garden") || cleanName.includes("park")) return "https://cdn-icons-png.flaticon.com/512/2964/2964120.png";
  if (cleanName.includes("fire") || cleanName.includes("safety")) return "https://cdn-icons-png.flaticon.com/512/785/785116.png";
  if (cleanName.includes("water") || cleanName.includes("supply")) return "https://cdn-icons-png.flaticon.com/512/2964/2964114.png";
  return "https://cdn-icons-png.flaticon.com/512/7590/7590680.png";
};

const formatFacing = (facing: string | null) => {
  if (!facing) return "Any";
  const map: Record<string, string> = {
    NORTHEAST: "North-East",
    NORTHWEST: "North-West",
    SOUTHEAST: "South-East",
    SOUTHWEST: "South-West",
    NORTH: "North",
    SOUTH: "South",
    EAST: "East",
    WEST: "West"
  };
  return map[facing] || facing;
};

interface PropertyDetailClientProps {
  property: any;
  similarProperties: any[];
}

export default function PropertyDetailClient({ property, similarProperties }: PropertyDetailClientProps) {
  // Image index active state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [galleryMode, setGalleryMode] = useState<"photos" | "video">("photos");
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);

  // Helper to resolve coordinates deterministically from PIN code or City
  const getCoordinates = () => {
    const cityCenters: Record<string, [number, number]> = {
      bengaluru: [12.9716, 77.5946],
      mumbai: [19.0760, 72.8777],
      delhi: [28.6139, 77.2090],
      hyderabad: [17.3850, 78.4867],
      chennai: [13.0827, 80.2707],
      pune: [18.5204, 73.8567],
      kolkata: [22.5726, 88.3639],
      ahmedabad: [23.0225, 72.5714],
      gurugram: [28.4595, 77.0266],
      noida: [28.5355, 77.3910],
      kochi: [9.9312, 76.2673],
    };

    if (property.latitude && property.longitude) {
      return [property.latitude, property.longitude] as [number, number];
    }

    const cleanCity = (property.city?.name || "bengaluru").toLowerCase();
    const center = cityCenters[cleanCity] || cityCenters["bengaluru"];
    const pincode = property.pincode;
    
    if (!pincode || pincode.length < 6) return center;
    
    const lastThree = parseInt(pincode.slice(-3)) || 0;
    const latOffset = ((lastThree % 30) - 15) * 0.0015;
    const lngOffset = (((lastThree * 7) % 30) - 15) * 0.0015;
    
    return [center[0] + latOffset, center[1] + lngOffset] as [number, number];
  };

  const [latitude, longitude] = getCoordinates();

  // Helper to generate nearby transport places and famous landmarks
  const getNearbyPlaces = (lat: number, lng: number) => {
    const cleanCity = (property.city?.name || "bengaluru").toLowerCase();
    const locality = property.locality?.name || "Locality";
    const city = property.city?.name || "City";

    let busStops = [
      { name: `${locality} Bus Stand`, distance: "0.4 km", time: "5 mins", type: "bus" as const, lat: lat + 0.003, lng: lng - 0.002 },
      { name: "Outer Ring Road Junction", distance: "0.8 km", time: "10 mins", type: "bus" as const, lat: lat - 0.004, lng: lng + 0.003 },
      { name: "City Depot Terminal", distance: "1.5 km", time: "18 mins", type: "bus" as const, lat: lat + 0.008, lng: lng + 0.007 },
    ];
    
    let stations = [
      { name: `${locality} Metro Station`, distance: "1.2 km", time: "8 mins", type: "metro" as const, lat: lat - 0.006, lng: lng - 0.005 },
      { name: `${city} Junction Railway Station`, distance: "4.5 km", time: "22 mins", type: "metro" as const, lat: lat + 0.025, lng: lng + 0.02 },
    ];

    let famousPlaces = [
      { name: `${locality} Commercial Plaza`, distance: "0.6 km", time: "7 mins", type: "famous" as const, lat: lat + 0.004, lng: lng + 0.004 },
      { name: `Central Botanical Garden`, distance: "1.8 km", time: "12 mins", type: "famous" as const, lat: lat - 0.007, lng: lng + 0.008 },
    ];
    
    let airport = {
      name: `${city} International Airport`,
      distance: "28.5 km",
      time: "45 mins",
      type: "airport" as const,
      lat: lat + 0.15,
      lng: lng - 0.12
    };

    if (cleanCity === "bengaluru") {
      busStops = [
        { name: "Manyata Tech Park Bus Stop", distance: "0.3 km", time: "4 mins", type: "bus" as const, lat: lat + 0.002, lng: lng - 0.001 },
        { name: "Veerannapalya Bus Stop", distance: "0.4 km", time: "5 mins", type: "bus" as const, lat: lat + 0.003, lng: lng - 0.003 },
        { name: "Veerannapalya Cross", distance: "0.5 km", time: "6 mins", type: "bus" as const, lat: lat - 0.002, lng: lng + 0.002 },
        { name: "Manyata Embassy Business Park Stop", distance: "1.0 km", time: "12 mins", type: "bus" as const, lat: lat + 0.007, lng: lng + 0.005 },
      ];
      stations = [
        { name: "Nagawara Metro Station (Under Const.)", distance: "0.9 km", time: "11 mins", type: "metro" as const, lat: lat - 0.005, lng: lng + 0.006 },
        { name: "Hebbal Railway Station", distance: "2.1 km", time: "15 mins", type: "metro" as const, lat: lat - 0.012, lng: lng - 0.015 },
        { name: "Cantonment Railway Station", distance: "6.8 km", time: "25 mins", type: "metro" as const, lat: lat - 0.045, lng: lng - 0.02 },
      ];
      famousPlaces = [
        { name: "Manyata Embassy Business Park", distance: "0.6 km", time: "8 mins", type: "famous" as const, lat: lat + 0.004, lng: lng + 0.003 },
        { name: "Elements Mall & PVR Cinemas", distance: "1.2 km", time: "15 mins", type: "famous" as const, lat: lat + 0.008, lng: lng - 0.008 },
        { name: "Lumbini Gardens Park", distance: "2.3 km", time: "18 mins", type: "famous" as const, lat: lat - 0.015, lng: lng - 0.012 },
        { name: "Hebbal Lake Park", distance: "2.8 km", time: "22 mins", type: "famous" as const, lat: lat - 0.018, lng: lng - 0.022 },
      ];
      airport = {
        name: "Kempegowda International Airport (BLR)",
        distance: "26.4 km",
        time: "35 mins",
        type: "airport" as const,
        lat: lat + 0.18,
        lng: lng - 0.1
      };
    } else if (cleanCity === "mumbai") {
      busStops = [
        { name: `${locality} Depot`, distance: "0.2 km", time: "3 mins", type: "bus" as const, lat: lat + 0.001, lng: lng - 0.002 },
        { name: "Linking Road Junction Stop", distance: "0.6 km", time: "7 mins", type: "bus" as const, lat: lat - 0.003, lng: lng + 0.002 },
        { name: "Western Express Highway Bus Stand", distance: "1.2 km", time: "14 mins", type: "bus" as const, lat: lat + 0.008, lng: lng + 0.006 },
      ];
      stations = [
        { name: `${locality} Local Train Station`, distance: "0.8 km", time: "9 mins", type: "metro" as const, lat: lat - 0.005, lng: lng - 0.004 },
        { name: "Andheri West Metro Station", distance: "1.5 km", time: "12 mins", type: "metro" as const, lat: lat + 0.009, lng: lng - 0.008 },
        { name: "Mumbai Central Terminus", distance: "15.4 km", time: "45 mins", type: "metro" as const, lat: lat - 0.08, lng: lng - 0.03 },
      ];
      famousPlaces = [
        { name: "Juhu Beach Boardwalk", distance: "1.2 km", time: "14 mins", type: "famous" as const, lat: lat - 0.008, lng: lng - 0.01 },
        { name: "Phoenix Marketcity Mall", distance: "3.8 km", time: "25 mins", type: "famous" as const, lat: lat + 0.024, lng: lng + 0.02 },
        { name: "Bandra Fort", distance: "4.5 km", time: "30 mins", type: "famous" as const, lat: lat - 0.028, lng: lng - 0.035 },
      ];
      airport = {
        name: "Chhatrapati Shivaji Maharaj Airport (BOM)",
        distance: "7.2 km",
        time: "18 mins",
        type: "airport" as const,
        lat: lat + 0.04,
        lng: lng + 0.03
      };
    } else if (cleanCity === "delhi") {
      busStops = [
        { name: "Dwarka Sec 10 Bus Stand", distance: "0.4 km", time: "5 mins", type: "bus" as const, lat: lat + 0.002, lng: lng - 0.003 },
        { name: "Sector 6 crossing Stop", distance: "0.8 km", time: "9 mins", type: "bus" as const, lat: lat - 0.005, lng: lng + 0.004 },
      ];
      stations = [
        { name: "Dwarka Sector 9 Metro Station", distance: "0.7 km", time: "8 mins", type: "metro" as const, lat: lat + 0.004, lng: lng - 0.005 },
        { name: "New Delhi Railway Station (NDLS)", distance: "18.2 km", time: "50 mins", type: "metro" as const, lat: lat + 0.12, lng: lng + 0.09 },
      ];
      famousPlaces = [
        { name: "Dwarka Sector 10 Sports Complex", distance: "0.9 km", time: "11 mins", type: "famous" as const, lat: lat + 0.005, lng: lng + 0.006 },
        { name: "Vegas Mall Dwarka", distance: "1.5 km", time: "18 mins", type: "famous" as const, lat: lat + 0.012, lng: lng - 0.01 },
      ];
      airport = {
        name: "Indira Gandhi International Airport (DEL)",
        distance: "11.5 km",
        time: "20 mins",
        type: "airport" as const,
        lat: lat - 0.06,
        lng: lng - 0.05
      };
    }

    return { busStops, stations, famousPlaces, airport };
  };

  const nearbyPlaces = getNearbyPlaces(latitude, longitude);
  const flattenedPlaces = [
    ...nearbyPlaces.busStops,
    ...nearbyPlaces.stations,
    ...nearbyPlaces.famousPlaces,
    nearbyPlaces.airport
  ];


  // Tab control in contact panel: enquiry, visit, message
  const [activeTab, setActiveTab] = useState<"enquiry" | "visit" | "message" | "callback">("enquiry");

  // Callback form state
  const [callbackForm, setCallbackForm] = useState({ name: "", phone: "", preferredTime: "" });
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  // Auth user state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [visitForm, setVisitForm] = useState({ date: "", timeSlot: "10:00 AM - 12:00 PM", type: "IN_PERSON", message: "" });
  const [chatMessage, setChatMessage] = useState("");

  // UI response states
  const [viewCount, setViewCount] = useState(property.viewCount);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Reviews state (for agents)
  const [agentReviews, setAgentReviews] = useState<any[]>(property.owner.agentProfile?.reviews || []);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // New action states (Save, Compare, Share, Report)
  const [isFavourite, setIsFavourite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("FAKE_PROPERTY");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  // EMI Calculator States
  const priceValue = parseFloat(property.price.toString());
  const [downPayment, setDownPayment] = useState(Math.round(priceValue * 0.2));
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    const principal = priceValue - downPayment;
    if (principal <= 0) {
      setEmi(0);
      return;
    }
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = loanTerm * 12;
    const emiValue = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
        (Math.pow(1 + monthlyRate, numberOfMonths) - 1)
    );
    setEmi(isNaN(emiValue) ? 0 : emiValue);
  }, [downPayment, interestRate, loanTerm, priceValue]);

  // Increment view count and check user session on mount
  useEffect(() => {
    async function initPage() {
      // 1. Check user session
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
          // Pre-populate forms
          setEnquiryForm(prev => ({
            ...prev,
            name: userData.user.name,
            email: userData.user.email,
            phone: userData.user.phone || "",
          }));
        }
      } catch (e) {}

      // 2. Increment view count dynamically (deduplicated in route)
      try {
        const res = await fetch(`/api/properties/${property.id}/view`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.viewCount) setViewCount(data.viewCount);
        }
      } catch (e) {}

      // 3. Fetch favourite status
      try {
        const favRes = await fetch(`/api/properties/${property.id}/favourite`);
        if (favRes.ok) {
          const favData = await favRes.json();
          setIsFavourite(favData.isFavourite);
        }
      } catch (e) {}

      // 4. Check compare list
      try {
        const compareList = JSON.parse(localStorage.getItem("compare_ids") || "[]");
        setIsInCompare(compareList.includes(property.id));
      } catch (e) {}
    }
    initPage();
  }, [property.id]);

  const toggleFavourite = async () => {
    if (!currentUser) {
      alert("Please log in to shortlist properties.");
      return;
    }
    try {
      const res = await fetch(`/api/properties/${property.id}/favourite`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavourite(data.isFavourite);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  const toggleCompare = () => {
    try {
      let compareList = JSON.parse(localStorage.getItem("compare_ids") || "[]");
      if (compareList.includes(property.id)) {
        compareList = compareList.filter((id: string) => id !== property.id);
        localStorage.setItem("compare_ids", JSON.stringify(compareList));
        setIsInCompare(false);
      } else {
        if (compareList.length >= 4) {
          alert("You can compare up to 4 properties. Please remove one first.");
          return;
        }
        compareList.push(property.id);
        localStorage.setItem("compare_ids", JSON.stringify(compareList));
        setIsInCompare(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError("");
    if (!currentUser) {
      alert("Please log in to report listings.");
      return;
    }
    try {
      const res = await fetch(`/api/properties/${property.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportDetails("");
        }, 3000);
      } else {
        const data = await res.json();
        setReportError(data.error || "Failed to submit report");
      }
    } catch (err: any) {
      setReportError("An unexpected error occurred filing the report.");
    }
  };

  // Form submission helpers
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    // Validate Indian phone number
    if (!/^[6-9]\d{9}$/.test(enquiryForm.phone)) {
      setFormError("Please enter a valid 10-digit Indian phone number.");
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/properties/${property.id}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit enquiry");

      setEnquirySuccess(true);
      setEnquiryForm(prev => ({ ...prev, message: "" }));
    } catch (err: any) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (!visitForm.date) {
      setFormError("Please select a tour date.");
      setFormLoading(false);
      return;
    }

    // Verify date is not in the past
    const selectedDate = new Date(visitForm.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFormError("You cannot book a tour date in the past.");
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/properties/${property.id}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule tour");

      setVisitSuccess(true);
      setVisitForm(prev => ({ ...prev, message: "" }));
    } catch (err: any) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!chatMessage.trim()) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/properties/${property.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setMessageSuccess(true);
      setChatMessage("");
    } catch (err: any) {
      setFormError(err.message || "Failed to send message.");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit agent review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    try {
      const res = await fetch(`/api/agent/${property.owner.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setReviewSuccess(true);
      setAgentReviews([data.review, ...agentReviews]);
    } catch (err: any) {
      alert(err.message || "Failed to submit review.");
    }
  };

  // Format price in Indian style
  const formattedPrice = priceValue >= 10000000 
    ? `₹${(priceValue / 10000000).toFixed(2)} Crore` 
    : priceValue >= 100000 
    ? `₹${(priceValue / 100000).toFixed(2)} Lakh` 
    : `₹${priceValue.toLocaleString("en-IN")}`;

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" }];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      
      {/* 1. Header Navigation Breadcrumbs & verification status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent tracking-wider uppercase">
            <span>{property.transactionType}</span>
            <span>·</span>
            <span>{property.propertyType.replace("_", " ")}</span>
            {property.isVerified && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  VERIFIED LISTING
                </span>
              </>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-primary mt-2 font-bold leading-tight">{property.title}</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-2 font-medium">
            <MapPin className="w-4 h-4 text-accent shrink-0" />
            {property.fullAddress}, {property.locality.name}, {property.city.name}, {property.state} - {property.pincode}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
            <Eye className="w-4 h-4" />
            <span>{viewCount} views</span>
          </div>
          <span className="price-tag bg-primary text-accent text-xl font-mono font-bold px-4 py-2 shadow-sm rounded-r">
            {formattedPrice}{property.transactionType === "RENT" ? "/mo" : ""}
          </span>
        </div>
      </div>

      {/* Horizontal Action Bar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8 border-y border-line py-3 text-xs">
        <button
          onClick={toggleFavourite}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full font-bold font-mono transition cursor-pointer ${
            isFavourite 
              ? "bg-red-50 text-red-600 border-red-200" 
              : "border-line bg-white hover:bg-secondary text-slate-600"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavourite ? "fill-current" : ""}`} />
          {isFavourite ? "SAVED" : "SAVE"}
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 border border-line bg-white hover:bg-secondary text-slate-600 rounded-full font-bold font-mono transition cursor-pointer"
        >
          <LinkIcon className="w-4 h-4" />
          {copied ? "LINK COPIED!" : "SHARE LINK"}
        </button>

        <button
          onClick={toggleCompare}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full font-bold font-mono transition cursor-pointer ${
            isInCompare 
              ? "bg-accent/15 text-accent border-accent" 
              : "border-line bg-white hover:bg-secondary text-slate-600"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {isInCompare ? "IN COMPARE" : "ADD TO COMPARE"}
        </button>

        {/* View compare link if we have items */}
        <Link
          href="/properties/compare"
          className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-accent font-mono font-bold uppercase transition"
        >
          View Comparison Matrix <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-line bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-full font-bold font-mono transition cursor-pointer ml-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          REPORT LISTING
        </button>
      </div>

      {/* 2. Image Gallery & Financial Dashboard Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8 mb-10 text-left items-stretch">
        
        {/* Left Column: Cover Image Box */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-line bg-slate-900 shadow-sm">
          {/* Mode Toggles */}
          {property.videoUrl && (
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <button
                onClick={() => setGalleryMode("photos")}
                type="button"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow transition cursor-pointer ${
                  galleryMode === "photos" 
                    ? "bg-accent text-primary font-bold" 
                    : "bg-white/90 text-slate-700 hover:bg-white"
                }`}
              >
                Photos
              </button>
              <button
                onClick={() => setGalleryMode("video")}
                type="button"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow transition cursor-pointer ${
                  galleryMode === "video" 
                    ? "bg-accent text-primary font-bold" 
                    : "bg-white/90 text-slate-700 hover:bg-white"
                }`}
              >
                Video Tour
              </button>
            </div>
          )}

          {galleryMode === "video" && property.videoUrl ? (
            <video
              src={property.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={images[0]?.url}
            />
          ) : (
            <img
              src={images[activeImageIdx].url}
              alt={`${property.title} - View ${activeImageIdx + 1}`}
              className="w-full h-full object-cover"
            />
          )}

          {/* Navigation arrows */}
          {galleryMode === "photos" && images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-50% -translate-y-50% w-10 h-10 rounded-full bg-white/80 hover:bg-white text-primary grid place-items-center cursor-pointer shadow"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-50% -translate-y-50% w-10 h-10 rounded-full bg-white/80 hover:bg-white text-primary grid place-items-center cursor-pointer shadow"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Right Column: Financial Dashboard (Shifted here!) */}
        <div className="flex flex-col h-full space-y-6">
          
          {/* Quick Overview Box */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-semibold text-primary border-b border-line pb-2.5">Quick Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              {property.bhk && (
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">BHK Config</p>
                  <p className="text-sm font-semibold text-primary flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-accent"/> {property.bhk} BHK</p>
                </div>
              )}
              {property.bathrooms && (
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Bathrooms</p>
                  <p className="text-sm font-semibold text-primary flex items-center gap-1.5"><Bath className="w-4 h-4 text-accent"/> {property.bathrooms} Baths</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Carpet Area</p>
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5"><Ruler className="w-4 h-4 text-accent"/> {property.carpetArea} {property.areaUnit}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Facing</p>
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent"/> {formatFacing(property.facing)}</p>
              </div>
            </div>
          </div>

          {/* Financial Dashboard Box */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-semibold text-primary border-b border-line pb-2.5">Financial Dashboard</h3>
            
            {property.transactionType === "SALE" ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Estimated EMI Calculator (Home Loan)</p>
                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Down Payment (₹)</span>
                      <span className="font-mono">₹{downPayment.toLocaleString("en-IN")}</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={priceValue} 
                      step={50000}
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full accent-accent bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 font-normal">({priceValue ? ((downPayment / priceValue) * 100).toFixed(0) : 0}% of property price)</span>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Interest Rate (%)</span>
                      <span className="font-mono">{interestRate}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={5} 
                      max={15} 
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full accent-accent bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Loan Term (Years)</span>
                      <span className="font-mono">{loanTerm} Years</span>
                    </div>
                    <input 
                      type="range" 
                      min={5} 
                      max={30} 
                      step={1}
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full accent-accent bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Calculations */}
                <div className="bg-secondary p-4 rounded-xl border border-line flex flex-col justify-between text-xs space-y-2 mt-4">
                  <div>
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Principal Loan Amount</p>
                    <p className="font-mono text-sm font-bold text-primary">₹{(priceValue - downPayment).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="pt-2 border-t border-line/60">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Estimated Monthly EMI</p>
                    <p className="font-mono text-lg font-bold text-accent">₹{emi.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Monthly Cost Breakdown</p>
                <div className="space-y-3.5 font-semibold text-slate-600 text-xs">
                  <div className="flex justify-between py-2 border-b border-line/60">
                    <span>Monthly Rent</span>
                    <span className="font-mono text-primary text-sm font-bold">₹{priceValue.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-line/60">
                    <span>Security Deposit</span>
                    <span className="font-mono text-primary text-sm font-bold">₹{(property.securityDeposit || (priceValue * 2)).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-line/60">
                    <span>Maintenance Charges</span>
                    <span className="font-mono text-primary text-sm font-bold">₹{(property.maintenanceCharges || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Thumbnails & Video Tour Button Row (Below Cover Image) */}
      <div className="flex flex-wrap gap-3 mb-8 text-left">
        {images.map((img: any, idx: number) => (
          <button
            key={idx}
            onClick={() => {
              setActiveImageIdx(idx);
              setGalleryMode("photos");
            }}
            className={`relative aspect-[4/3] w-24 sm:w-28 rounded-xl overflow-hidden border-2 cursor-pointer shrink-0 transition ${
              idx === activeImageIdx && galleryMode === "photos" ? "border-accent scale-95" : "border-line hover:border-accent"
            }`}
          >
            <img src={img.url} alt="Thumbnail view" className="w-full h-full object-cover" />
          </button>
        ))}
        {property.videoUrl && (
          <button
            onClick={() => setGalleryMode("video")}
            className={`relative aspect-[4/3] w-24 sm:w-28 rounded-xl overflow-hidden border-2 cursor-pointer shrink-0 transition bg-slate-800 text-white flex flex-col items-center justify-center gap-1.5 ${
              galleryMode === "video" ? "border-accent scale-95" : "border-line hover:border-accent"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent">
              <ChevronRight className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase">Video Tour</span>
          </button>
        )}
      </div>


      {/* 3. Detail Body Columns (Main Info vs Sticky Contact) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-start">
        
        {/* Left Column: Specs, Desc, Amenities, Map */}
        <div className="space-y-10">

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-primary">About this property</h3>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{property.description}</p>
          </div>

          {/* Amenities checklist */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-primary">Amenities &amp; Facilities</h3>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Facilities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {property.amenities.map(({ amenity }: any) => {
                  let Icon = ShieldCheck;
                  let iconBgGradient = "from-blue-500 via-indigo-600 to-blue-700";
                  let shadowColor = "shadow-blue-500/25";
                  let iconColor = "text-white";

                  const name = amenity.name.toLowerCase();
                  if (name.includes("power") || name.includes("backup")) {
                    Icon = Zap;
                    iconBgGradient = "from-amber-400 via-orange-500 to-amber-600";
                    shadowColor = "shadow-orange-500/25";
                  } else if (name.includes("cctv") || name.includes("camera")) {
                    Icon = Camera;
                    iconBgGradient = "from-indigo-500 via-purple-600 to-indigo-700";
                    shadowColor = "shadow-indigo-500/25";
                  } else if (name.includes("security")) {
                    Icon = ShieldCheck;
                    iconBgGradient = "from-blue-500 via-blue-600 to-indigo-700";
                    shadowColor = "shadow-blue-500/25";
                  } else if (name.includes("parking")) {
                    Icon = Car;
                    iconBgGradient = "from-slate-700 via-slate-800 to-slate-900";
                    shadowColor = "shadow-slate-900/25";
                  } else if (name.includes("water")) {
                    Icon = Droplets;
                    iconBgGradient = "from-cyan-400 via-teal-500 to-cyan-600";
                    shadowColor = "shadow-cyan-500/25";
                  } else if (name.includes("gym") || name.includes("fitness")) {
                    Icon = Dumbbell;
                    iconBgGradient = "from-rose-500 via-pink-600 to-rose-700";
                    shadowColor = "shadow-rose-500/25";
                  } else if (name.includes("pool") || name.includes("swim")) {
                    Icon = Waves;
                    iconBgGradient = "from-sky-400 via-blue-500 to-sky-600";
                    shadowColor = "shadow-sky-500/25";
                  } else if (name.includes("garden") || name.includes("park")) {
                    Icon = TreePine;
                    iconBgGradient = "from-emerald-400 via-teal-600 to-emerald-700";
                    shadowColor = "shadow-emerald-500/25";
                  } else if (name.includes("wifi") || name.includes("internet")) {
                    Icon = Wifi;
                    iconBgGradient = "from-purple-500 via-indigo-600 to-purple-700";
                    shadowColor = "shadow-purple-500/25";
                  } else if (name.includes("elevator") || name.includes("lift")) {
                    Icon = ArrowUpDown;
                    iconBgGradient = "from-slate-600 via-slate-700 to-slate-800";
                    shadowColor = "shadow-slate-600/25";
                  }

                  return (
                    <div 
                      key={amenity.id} 
                      className="flex items-center gap-3.5 bg-white border border-line/80 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconBgGradient} ${shadowColor} shadow-md flex items-center justify-center shrink-0 border border-white/20 transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5.5 h-5.5 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-primary block truncate group-hover:text-accent transition-colors">{amenity.name}</span>
                        <span className="text-[10px] font-mono text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Available &amp; Verified
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locality Map Integration */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-semibold text-primary">Location &amp; Connectivity Intelligence</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Neighborhood and transport connectivity analysis based on PIN code: <span className="bg-accent/5 px-2 py-0.5 rounded border border-accent/20 text-accent font-bold font-sans">{property.pincode}</span></p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shrink-0">
                💡 Tip: Hover item to view on map
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] border border-line rounded-2xl overflow-hidden shadow-sm bg-white">
              {/* Map container */}
              <div className="h-[430px] min-h-[380px] relative z-10 border-b lg:border-b-0 lg:border-r border-line">
                <DetailMap 
                  latitude={latitude} 
                  longitude={longitude} 
                  localityName={property.locality.name}
                  nearbyPlaces={flattenedPlaces}
                  selectedPlaceName={selectedPlaceName}
                />
              </div>

              {/* Transit Options list */}
              <div className="p-5 bg-secondary/10 flex flex-col justify-start text-left h-[430px] overflow-y-auto no-scrollbar space-y-5">
                {/* Bus section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-line pb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-600 flex items-center justify-center font-bold">
                      <Bus className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold font-mono tracking-wider text-primary uppercase">Bus Stations</h4>
                  </div>
                  <div className="space-y-2">
                    {nearbyPlaces.busStops.map((stop, i) => (
                      <div 
                        key={i} 
                        onMouseEnter={() => setSelectedPlaceName(stop.name)}
                        onMouseLeave={() => setSelectedPlaceName(null)}
                        className={`flex items-center justify-between text-xs p-2 rounded-xl border transition-all cursor-pointer ${
                          selectedPlaceName === stop.name
                            ? "bg-sky-50 border-sky-300 text-sky-900 font-bold shadow-xs scale-[1.02]"
                            : "bg-white/80 border-line/60 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50"
                        }`}
                      >
                        <span className="font-medium truncate pr-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                          {stop.name}
                        </span>
                        <span className="font-mono text-[10px] shrink-0 text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">{stop.distance} | {stop.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metro/Railway Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-line pb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-600 flex items-center justify-center font-bold">
                      <Train className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold font-mono tracking-wider text-primary uppercase">Metro &amp; Stations</h4>
                  </div>
                  <div className="space-y-2">
                    {nearbyPlaces.stations.map((station, i) => (
                      <div 
                        key={i} 
                        onMouseEnter={() => setSelectedPlaceName(station.name)}
                        onMouseLeave={() => setSelectedPlaceName(null)}
                        className={`flex items-center justify-between text-xs p-2 rounded-xl border transition-all cursor-pointer ${
                          selectedPlaceName === station.name
                            ? "bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-xs scale-[1.02]"
                            : "bg-white/80 border-line/60 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                      >
                        <span className="font-medium truncate pr-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          {station.name}
                        </span>
                        <span className="font-mono text-[10px] shrink-0 text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">{station.distance} | {station.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Famous Places Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-line pb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <h4 className="text-xs font-bold font-mono tracking-wider text-primary uppercase">Famous Places</h4>
                  </div>
                  <div className="space-y-2">
                    {nearbyPlaces.famousPlaces.map((place, i) => (
                      <div 
                        key={i} 
                        onMouseEnter={() => setSelectedPlaceName(place.name)}
                        onMouseLeave={() => setSelectedPlaceName(null)}
                        className={`flex items-center justify-between text-xs p-2 rounded-xl border transition-all cursor-pointer ${
                          selectedPlaceName === place.name
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs scale-[1.02]"
                            : "bg-white/80 border-line/60 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
                        }`}
                      >
                        <span className="font-medium truncate pr-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {place.name}
                        </span>
                        <span className="font-mono text-[10px] shrink-0 text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">{place.distance} | {place.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airport Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-line pb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 flex items-center justify-center font-bold">
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold font-mono tracking-wider text-primary uppercase">Airport</h4>
                  </div>
                  <div 
                    onMouseEnter={() => setSelectedPlaceName(nearbyPlaces.airport.name)}
                    onMouseLeave={() => setSelectedPlaceName(null)}
                    className={`flex items-center justify-between text-xs p-2 rounded-xl border transition-all cursor-pointer ${
                      selectedPlaceName === nearbyPlaces.airport.name
                        ? "bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-xs scale-[1.02]"
                        : "bg-white/80 border-line/60 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50"
                    }`}
                  >
                    <span className="font-medium truncate pr-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      {nearbyPlaces.airport.name}
                    </span>
                    <span className="font-mono text-[10px] shrink-0 text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">{nearbyPlaces.airport.distance} | {nearbyPlaces.airport.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Contact & Booking forms */}
        <div className="sticky top-44 space-y-6">

          <div className="bg-white border border-line rounded-2xl shadow-md overflow-hidden">
            
            {/* Form tabs */}
            <div className="grid grid-cols-4 border-b border-line bg-secondary text-[10px] font-bold font-mono tracking-wider">
              <button
                onClick={() => { setActiveTab("enquiry"); setFormError(""); }}
                className={`py-3.5 text-center cursor-pointer transition ${
                  activeTab === "enquiry" ? "bg-white text-primary border-b-2 border-accent" : "text-slate-400 hover:text-primary"
                }`}
              >
                ENQUIRE
              </button>
              <button
                onClick={() => { setActiveTab("visit"); setFormError(""); }}
                className={`py-3.5 text-center cursor-pointer transition ${
                  activeTab === "visit" ? "bg-white text-primary border-b-2 border-accent" : "text-slate-400 hover:text-primary"
                }`}
              >
                TOUR
              </button>
              <button
                onClick={() => { setActiveTab("message"); setFormError(""); }}
                className={`py-3.5 text-center cursor-pointer transition ${
                  activeTab === "message" ? "bg-white text-primary border-b-2 border-accent" : "text-slate-400 hover:text-primary"
                }`}
              >
                CHAT
              </button>
              <button
                onClick={() => { setActiveTab("callback"); setFormError(""); }}
                className={`py-3.5 text-center cursor-pointer transition ${
                  activeTab === "callback" ? "bg-white text-primary border-b-2 border-accent" : "text-slate-400 hover:text-primary"
                }`}
              >
                CALLBACK
              </button>
            </div>

            {/* Forms body */}
            <div className="p-6">
              {formError && (
                <div className="mb-4 text-xs font-semibold bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              {/* 1. ENQUIRY FORM */}
              {activeTab === "enquiry" && (
                <>
                  {enquirySuccess ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-primary text-sm">Enquiry Submitted</h4>
                      <p className="text-xs text-slate-400 mt-1">Your enquiry has been received by our admin & concierge team. We will review and connect with you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquirySubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Your Name</label>
                        <input
                          type="text"
                          required
                          value={enquiryForm.name}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Email Address</label>
                        <input
                          type="email"
                          required
                          value={enquiryForm.email}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Indian Mobile Number</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={enquiryForm.phone}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                          placeholder="e.g. 9876543210"
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Message</label>
                        <textarea
                          required
                          rows={3}
                          value={enquiryForm.message}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="I am interested in this listing. Please call me."
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 leading-normal"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-primary hover:bg-slate-800 text-secondary py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        Send Enquiry
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* 2. VISIT BOOKING FORM */}
              {activeTab === "visit" && (
                <>
                  {visitSuccess ? (
                    <div className="text-center py-6">
                      <CalendarRange className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-primary text-sm">Tour Requested</h4>
                      <p className="text-xs text-slate-400 mt-1">Tour request submitted! Our admin concierge team will verify details and coordinate with you.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleVisitSubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Select Tour Date</label>
                        <input
                          type="date"
                          required
                          value={visitForm.date}
                          onChange={(e) => setVisitForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Time Slot</label>
                        <select
                          value={visitForm.timeSlot}
                          onChange={(e) => setVisitForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        >
                          <option>10:00 AM - 12:00 PM</option>
                          <option>12:00 PM - 02:00 PM</option>
                          <option>02:00 PM - 04:00 PM</option>
                          <option>04:00 PM - 06:00 PM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Tour Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["IN_PERSON", "VIDEO_TOUR"].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setVisitForm(prev => ({ ...prev, type: t }))}
                              className={`py-2 rounded-lg border text-center transition cursor-pointer font-semibold ${
                                visitForm.type === t ? "border-accent bg-accent/5 text-primary" : "border-line text-slate-500"
                              }`}
                            >
                              {t === "IN_PERSON" ? "In-Person" : "Video Tour"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Message for Admin / Concierge</label>
                        <textarea
                          rows={2}
                          value={visitForm.message}
                          onChange={(e) => setVisitForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="e.g. Please let me know if Sunday works."
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 leading-normal"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-primary hover:bg-slate-800 text-secondary py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        Request Visit Tour
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* 3. MESSAGING BOX */}
              {activeTab === "message" && (
                <>
                  {!currentUser ? (
                    <div className="text-center py-6 space-y-3">
                      <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">Please log in to chat with our team.</p>
                      <Link href="/auth/login" className="inline-block bg-primary text-secondary text-xs font-bold px-5 py-2 rounded-full hover:bg-slate-800 transition">
                        Log In
                      </Link>
                    </div>
                  ) : messageSuccess ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-primary text-sm">Message Sent</h4>
                      <p className="text-xs text-slate-400 mt-1">Our admin team has received your message and will respond shortly.</p>
                      <button 
                        onClick={() => setMessageSuccess(false)}
                        type="button"
                        className="mt-3 text-xs font-bold text-accent hover:underline cursor-pointer"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleMessageSubmit} className="space-y-4 text-xs">
                      <p className="text-slate-400 leading-relaxed">Send a direct message to our support and admin team regarding this listing.</p>
                      <div>
                        <textarea
                          required
                          rows={4}
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Ask details, negotiable deposit, availability..."
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 leading-normal"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={formLoading || !chatMessage.trim()}
                        className="w-full bg-primary hover:bg-slate-800 text-secondary py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Message
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* 4. REQUEST CALLBACK FORM */}
              {activeTab === "callback" && (
                <>
                  {callbackSuccess ? (
                    <div className="text-center py-6">
                      <Phone className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-primary text-sm">Callback Requested</h4>
                      <p className="text-xs text-slate-400 mt-1">Our admin team will call you back shortly at your number.</p>
                      <button
                        onClick={() => { setCallbackSuccess(false); setCallbackForm({ name: "", phone: "", preferredTime: "" }); }}
                        type="button"
                        className="mt-3 text-xs font-bold text-accent hover:underline cursor-pointer"
                      >
                        Request another callback
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setFormLoading(true);
                        setFormError("");
                        try {
                          const res = await fetch(`/api/properties/${property.id}/callback`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(callbackForm),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Failed to submit");
                          setCallbackSuccess(true);
                        } catch (err: any) {
                          setFormError(err.message || "Failed to submit callback request.");
                        } finally {
                          setFormLoading(false);
                        }
                      }}
                      className="space-y-4 text-xs"
                    >
                      <p className="text-slate-400 leading-relaxed">Enter your name and phone number and we'll have our admin team call you back.</p>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Your Name</label>
                        <input
                          type="text"
                          required
                          value={callbackForm.name}
                          onChange={(e) => setCallbackForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Indian Mobile Number</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={callbackForm.phone}
                          onChange={(e) => setCallbackForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                          placeholder="e.g. 9876543210"
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Preferred Callback Time (optional)</label>
                        <select
                          value={callbackForm.preferredTime}
                          onChange={(e) => setCallbackForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                          className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700"
                        >
                          <option value="">Anytime</option>
                          <option>Morning (9 AM – 12 PM)</option>
                          <option>Afternoon (12 PM – 3 PM)</option>
                          <option>Evening (3 PM – 6 PM)</option>
                          <option>Night (6 PM – 9 PM)</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-primary hover:bg-slate-800 text-secondary py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Request Callback
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Owner details card */}
          {(() => {
            const isAdmin = currentUser?.role === "ADMIN";
            return (
              <div className="bg-white border border-line rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-serif text-sm font-semibold text-primary">Listed by</h4>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    property.owner.avatar ? (
                      <img 
                        src={property.owner.avatar} 
                        alt={property.owner.name} 
                        className="w-12 h-12 rounded-full object-cover border border-line" 
                      />
                    ) : (
                      <span className="w-12 h-12 rounded-full bg-primary text-secondary flex items-center justify-center font-bold text-base border border-line uppercase">
                        {property.owner.name.charAt(0)}
                      </span>
                    )
                  )}
                  <div>
                    <p className="font-semibold text-primary text-sm">
                      {isAdmin ? property.owner.name : (property.owner.customId || "Verified Owner")}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 capitalize">{property.owner.role.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Sponsored Ad Banner Column */}
          <AdSidebarColumn page="property_detail" />
        </div>

      </div>

      {/* 4. AGENT REVIEWS PANEL */}
      {property.owner.role === "AGENT" && (
        <section className="mt-16 border-t border-line/60 pt-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-primary">Agent Reviews</h3>
              <p className="text-xs text-slate-500 mt-1">Read testimonials and feedback written by verified buyers/tenants.</p>
            </div>
            {currentUser && currentUser.id !== property.owner.id && (
              <span className="text-xs text-slate-400 font-medium">Have you worked with {property.owner.name}? Leave a review below.</span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
            {/* Reviews List */}
            <div className="space-y-4">
              {agentReviews.length === 0 ? (
                <div className="border border-line rounded-xl p-8 text-center text-slate-400 bg-white">
                  No reviews have been written for this agent yet.
                </div>
              ) : (
                agentReviews.map((rev: any) => (
                  <div key={rev.id} className="bg-white border border-line rounded-xl p-4.5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rev.reviewer.avatar ? (
                          <img src={rev.reviewer.avatar} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                            {rev.reviewer.name.charAt(0)}
                          </span>
                        )}
                        <span className="font-semibold text-primary text-xs">{rev.reviewer.name}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-accent fill-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-normal">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            {currentUser && currentUser.id !== property.owner.id && (
              <div className="bg-white border border-line rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-serif text-sm font-semibold text-primary">Write Agent Review</h4>
                {reviewSuccess ? (
                  <p className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                    Your agent review was successfully submitted. Thank you!
                  </p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">Rating (1 to 5 Stars)</label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 font-bold"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                        <option value="3">⭐⭐⭐ (3 Stars)</option>
                        <option value="2">⭐⭐ (2 Stars)</option>
                        <option value="1">⭐ (1 Star)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">Review Comment</label>
                      <textarea
                        required
                        rows={3}
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Describe your experience working with this agent..."
                        className="w-full border border-line rounded-lg px-3 py-2 bg-secondary text-slate-700 leading-normal"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-slate-800 text-secondary py-2 rounded-lg font-bold transition cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. RECOMMENDATIONS - SIMILAR PROPERTIES */}
      {similarProperties.length > 0 && (
        <section className="mt-16 border-t border-line/60 pt-10">
          <h3 className="font-serif text-xl font-semibold text-primary mb-6">Similar Properties in the Area</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProperties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {/* Report Property Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-line rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="font-serif text-sm font-bold text-primary flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Report Property Listing
              </h3>
              <button 
                onClick={() => { setShowReportModal(false); setReportError(""); }}
                className="text-slate-400 hover:text-primary cursor-pointer text-xs font-bold font-mono"
              >
                CLOSE
              </button>
            </div>

            {reportSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center space-y-2 text-xs">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <p className="font-bold">Report Submitted Successfully</p>
                <p className="text-slate-500 font-medium">Our administration moderation team will audit this listing shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                {reportError && (
                  <div className="text-xs font-semibold bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                    {reportError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Reason for Report</label>
                  <select 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-secondary border border-line rounded-lg px-3 py-2 focus:outline-hidden focus:border-accent text-primary font-semibold"
                  >
                    <option value="FAKE_PROPERTY">Fake Property Listing</option>
                    <option value="INCORRECT_INFORMATION">Incorrect Information</option>
                    <option value="DUPLICATE_LISTING">Duplicate Listing</option>
                    <option value="ALREADY_SOLD_OR_RENTED">Already Sold/Rented</option>
                    <option value="SUSPICIOUS_OWNER">Suspicious Owner/Agent Behaviour</option>
                    <option value="SPAM">Spam or Advertisements</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Details &amp; Explanation</label>
                  <textarea
                    rows={4}
                    required
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide specific details about why you are flagging this property..."
                    className="w-full bg-secondary border border-line rounded-lg p-3 focus:outline-hidden focus:border-accent text-primary leading-normal font-semibold"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg cursor-pointer transition uppercase font-mono tracking-wider"
                >
                  SUBMIT REPORT
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
