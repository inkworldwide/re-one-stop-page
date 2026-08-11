"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, ShieldAlert, Check, Eye } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  reason: string;
  details: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    status: string;
    ownerId: string;
  };
  reporter: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDismiss = async (reportId: string) => {
    if (!confirm("Are you sure you want to dismiss this report?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?id=${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to dismiss report");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTakeDown = async (reportId: string, propertyId: string, details: string) => {
    if (!confirm("Are you sure you want to decline this listing and take it down?")) return;
    setActionLoading(true);
    try {
      // 1. Take down property (updates status to REJECTED)
      const verifyRes = await fetch("/api/admin/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          status: "REJECTED",
          rejectionReason: `Took down due to moderation report: "${details}"`,
        }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        alert(err.error || "Failed to update property status");
        setActionLoading(false);
        return;
      }

      // 2. Dismiss the report since listing is processed
      await fetch(`/api/admin/reports?id=${reportId}`, { method: "DELETE" });

      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" /> Property Reports
        </h2>
        <p className="text-xs text-slate-500 mt-1">Review moderation flags filed by verified seekers regarding suspicious, fake, or spam listings.</p>
      </div>

      <div className="mb-4 text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
        {reports.length} pending moderation reports
      </div>

      {reports.length === 0 ? (
        <div className="border border-line rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-secondary/35">
          <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-primary font-semibold mb-2">Queue Clear</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No active moderation flags or reported property listings have been found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const dateStr = new Date(r.createdAt).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric"
            });
            const reasonColors = {
              FAKE_PROPERTY: "bg-red-50 text-red-700 border-red-200",
              INCORRECT_INFORMATION: "bg-amber-50 text-amber-700 border-amber-200",
              DUPLICATE_LISTING: "bg-orange-50 text-orange-700 border-orange-200",
              ALREADY_SOLD_OR_RENTED: "bg-blue-50 text-blue-700 border-blue-200",
              SUSPICIOUS_OWNER: "bg-purple-50 text-purple-700 border-purple-200",
              SPAM: "bg-slate-50 text-slate-500 border-slate-200",
              OTHER: "bg-zinc-50 text-zinc-500 border-zinc-200",
            };

            return (
              <div key={r.id} className="bg-white border border-line rounded-xl overflow-hidden shadow-xs p-5 space-y-4 flex flex-col justify-between">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-primary">
                      {r.property ? r.property.title : "Deleted Property"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Reported on {dateStr}</p>
                  </div>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${reasonColors[r.reason as keyof typeof reasonColors] || "bg-secondary text-primary"}`}>
                    {r.reason.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {/* Reporter details */}
                  <div className="bg-secondary p-3 rounded-lg border border-line text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Reporter Name</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{r.reporter.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Reporter Email</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{r.reporter.email}</p>
                    </div>
                  </div>

                  {/* Report details */}
                  <div className="text-xs text-slate-600 bg-secondary/30 p-3.5 rounded-lg border border-line/40 leading-relaxed">
                    <p className="font-mono text-[10px] text-slate-400 uppercase font-bold mb-1">Reporter Comments</p>
                    <p className="italic">"{r.details}"</p>
                  </div>
                </div>

                {/* Actions */}
                {r.property && (
                  <div className="flex items-center gap-2.5 pt-2 border-t border-line/40">
                    <button
                      onClick={() => handleTakeDown(r.id, r.property.id, r.details)}
                      type="button"
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Decline &amp; Take Down Listing
                    </button>
                    
                    <button
                      onClick={() => handleDismiss(r.id)}
                      type="button"
                      disabled={actionLoading}
                      className="border border-line hover:bg-secondary text-slate-600 font-semibold px-3.5 py-1.5 rounded text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Dismiss Report
                    </button>

                    <Link
                      href={`/properties/${r.property.id}`}
                      target="_blank"
                      className="border border-line hover:bg-secondary text-slate-500 font-semibold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Listing
                    </Link>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
