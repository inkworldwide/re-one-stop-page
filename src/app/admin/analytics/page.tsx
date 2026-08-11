"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Users, Building, AlertTriangle, MessageSquare, 
  CalendarRange, CheckCircle2, FileEdit, ShieldCheck, Database, Megaphone,
  ArrowUpRight, Clock
} from "lucide-react";

interface Metrics {
  totalUsers: number;
  totalProperties: number;
  draftCount: number;
  pendingCount: number;
  activeCount: number;
  enquiriesCount: number;
  visitsCount: number;
  reportsCount: number;
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono">Loading platform analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-xs text-slate-400 py-10 text-center font-mono">
        Failed to load analytics data.
      </div>
    );
  }

  const statCards = [
    {
      title: "Registered Users",
      value: metrics.totalUsers,
      desc: "Owners, Seekers, Agents & Admins",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      href: "/admin/users",
    },
    {
      title: "Total Listings",
      value: metrics.totalProperties,
      desc: "All properties on platform",
      icon: Building,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      href: "/admin/properties",
    },
    {
      title: "Active Properties",
      value: metrics.activeCount,
      desc: "Verified & searchable listings",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      href: "/admin/properties",
    },
    {
      title: "Pending Verification",
      value: metrics.pendingCount,
      desc: "Listings awaiting approval",
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      href: "/admin/verify",
    },
    {
      title: "Enquiry Leads",
      value: metrics.enquiriesCount,
      desc: "Direct contact enquiries received",
      icon: MessageSquare,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      href: "/admin/inquiries",
    },
    {
      title: "Visits & Tours",
      value: metrics.visitsCount,
      desc: "Booked tour requests",
      icon: CalendarRange,
      color: "bg-teal-50 text-teal-600 border-teal-100",
      href: "/admin/inquiries",
    },
    {
      title: "Property Reports",
      value: metrics.reportsCount,
      desc: "Moderation flags for review",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600 border-red-100",
      href: "/admin/reports",
    },
    {
      title: "Draft Listings",
      value: metrics.draftCount,
      desc: "Unpublished property drafts",
      icon: FileEdit,
      color: "bg-slate-100 text-slate-600 border-slate-200",
      href: "/admin/properties",
    },
  ];

  const approvalRate = metrics.totalProperties
    ? ((metrics.activeCount / metrics.totalProperties) * 100).toFixed(1)
    : "0";
  const pendingRate = metrics.totalProperties
    ? ((metrics.pendingCount / metrics.totalProperties) * 100).toFixed(1)
    : "0";
  const leadsPerProperty = metrics.activeCount
    ? (metrics.enquiriesCount / metrics.activeCount).toFixed(1)
    : "0";
  const visitsPerProperty = metrics.activeCount
    ? (metrics.visitsCount / metrics.activeCount).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 text-left pb-10">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0F172A] font-bold tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-[#D4AF37]" /> Dashboard Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Real-time operations, property verifications, enquiry leads, and platform performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link
            href="/admin/ads"
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-[#D4AF37]" />
            <span>Ads Buzz</span>
          </Link>
          <Link
            href="/admin/database"
            className="flex items-center gap-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#D4AF37]" />
            <span>Platform Configuration</span>
          </Link>
        </div>
      </div>

      {/* 📊 Stat Cards Grid (ILMIKA Clean Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Link
              key={idx}
              href={c.href}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs hover:border-[#D4AF37] hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group cursor-pointer flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform ${c.color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider group-hover:text-[#D4AF37] transition-colors truncate">
                    {c.title}
                  </p>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D4AF37] transition-colors shrink-0" />
                </div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-[#0F172A]">
                  {c.value.toLocaleString("en-IN")}
                </p>
                <p className="text-[10.5px] text-slate-500 font-medium truncate">{c.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 📈 Breakdown & System Engagement Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Listing Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-sm font-bold text-[#0F172A]">Listing Status Breakdown</h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">Live Inventory %</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Active */}
            <Link href="/admin/properties" className="group block space-y-1.5 hover:opacity-90 transition cursor-pointer">
              <div className="flex justify-between font-bold">
                <span className="text-[#0F172A] group-hover:text-[#D4AF37] transition">Active Properties</span>
                <span className="font-mono text-slate-700">{metrics.activeCount} ({approvalRate}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${approvalRate}%` }}></div>
              </div>
            </Link>

            {/* Pending */}
            <Link href="/admin/verify" className="group block space-y-1.5 hover:opacity-90 transition cursor-pointer">
              <div className="flex justify-between font-bold">
                <span className="text-[#0F172A] group-hover:text-[#D4AF37] transition">Pending Moderation Queue</span>
                <span className="font-mono text-slate-700">{metrics.pendingCount} ({pendingRate}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pendingRate}%` }}></div>
              </div>
            </Link>

            {/* Reports */}
            <Link href="/admin/reports" className="group block space-y-1.5 hover:opacity-90 transition cursor-pointer">
              <div className="flex justify-between font-bold">
                <span className="text-[#0F172A] group-hover:text-[#D4AF37] transition">Flagged Reports</span>
                <span className="font-mono text-slate-700">{metrics.reportsCount}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${metrics.totalProperties ? Math.min((metrics.reportsCount / metrics.totalProperties) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </Link>
          </div>
        </div>

        {/* System Engagement Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-sm font-bold text-[#0F172A]">Engagement Metrics</h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">Averages</span>
          </div>

          <div className="space-y-2 text-xs font-bold text-slate-700">
            <Link
              href="/admin/inquiries"
              className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer group border border-slate-100"
            >
              <span className="group-hover:text-[#D4AF37] transition">Enquiries per Active Property</span>
              <span className="font-mono text-[#0F172A] text-sm bg-slate-100 group-hover:bg-[#D4AF37]/20 px-3 py-1 rounded-lg transition">
                {leadsPerProperty}
              </span>
            </Link>

            <Link
              href="/admin/inquiries"
              className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer group border border-slate-100"
            >
              <span className="group-hover:text-[#D4AF37] transition">Tours / Visits per Active Property</span>
              <span className="font-mono text-[#0F172A] text-sm bg-slate-100 group-hover:bg-[#D4AF37]/20 px-3 py-1 rounded-lg transition">
                {visitsPerProperty}
              </span>
            </Link>

            <Link
              href="/admin/properties"
              className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer group border border-slate-100"
            >
              <span className="group-hover:text-[#D4AF37] transition">Listing Verification Rate</span>
              <span className="font-mono text-[#0F172A] text-sm bg-slate-100 group-hover:bg-[#D4AF37]/20 px-3 py-1 rounded-lg transition">
                {approvalRate}%
              </span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
