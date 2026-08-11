"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Megaphone, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface AdItem {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  placement?: string;
  format?: "FULL_WIDTH" | "HALF_WIDTH" | "QUAD_GRID";
  isExclusive?: boolean;
}

export default function HomeAdsSection() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      try {
        const res = await fetch("/api/ads?page=home");
        if (res.ok) {
          const data = await res.json();
          setAds(data.ads || []);
        }
      } catch (err) {
        console.error("Home ads loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAds();
  }, []);

  const handleAdClick = (ad: AdItem) => {
    if (ad.id) {
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id }),
      }).catch(() => {});
    }
    window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
  };

  if (loading || ads.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-2xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>Featured Partner Offers &amp; Promotions</span>
                <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  SPONSORED
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exclusive home loan deals, luxury project launches, and verified relocation offers.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              onClick={() => handleAdClick(ad)}
              className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Ad Image Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                <img
                  src={ad.imageUrl}
                  alt={ad.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Exclusive Badge */}
                {ad.isExclusive && (
                  <span className="absolute top-3 left-3 z-10 text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md border border-amber-300 shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    EXCLUSIVE PARTNER
                  </span>
                )}

                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-slate-950/80 text-amber-400 border border-amber-400/40 flex items-center justify-center group-hover:scale-110 transition shadow-md">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Ad Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {ad.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                  <span className="flex items-center gap-1">
                    <span>Explore Promotion</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-[10px] text-slate-500">Ad</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
