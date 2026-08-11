import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/property/PropertyCard";
import PostListingButton from "@/components/ui/PostListingButton";
import AdSidebarColumn from "@/components/ads/AdSidebarColumn";
import { 
  Building, MapPin, Search, ShieldCheck, Heart, ArrowRight, 
  Sparkles, Layers, Users, PhoneCall, CheckCircle2, Star, Award,
  Home, Map, Building2, Factory
} from "lucide-react";

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function HomePage() {
  const propertyInclude = {
    city: true,
    locality: true,
    images: { take: 1, orderBy: { sortOrder: "asc" as const } },
    owner: { include: { agentProfile: true } },
  };

  const rawFeatured = await prisma.property.findMany({
    where: { status: "ACTIVE", isVerified: true },
    include: propertyInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  const rawRecent = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    include: propertyInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  const cities = await prisma.city.findMany({
    include: {
      localities: { take: 3 },
      _count: {
        select: { properties: { where: { status: "ACTIVE" } } }
      }
    },
    take: 6,
  });

  const rawPgs = await prisma.property.findMany({
    where: { status: "ACTIVE", propertyType: { in: ["PG", "CO_LIVING", "SHARED_ROOM"] } },
    include: propertyInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 8,
  });

  const rawCommercials = await prisma.property.findMany({
    where: { status: "ACTIVE", propertyType: { in: ["OFFICE_SPACE", "COWORKING_SPACE", "SHOP"] } },
    include: propertyInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 8,
  });

  const sortByFeaturedOwnerFirst = <T extends { isFeatured?: boolean; owner?: { agentProfile?: { isFeatured?: boolean } | null } | null }>(items: T[]) => {
    return [...items].sort((a, b) => {
      const aIsFeatured = (a.isFeatured ?? false) || (a.owner?.agentProfile?.isFeatured ?? false);
      const bIsFeatured = (b.isFeatured ?? false) || (b.owner?.agentProfile?.isFeatured ?? false);
      if (aIsFeatured && !bIsFeatured) return -1;
      if (!aIsFeatured && bIsFeatured) return 1;
      return 0;
    });
  };

  const featured = sortByFeaturedOwnerFirst(rawFeatured).slice(0, 6);
  const recent = sortByFeaturedOwnerFirst(rawRecent).slice(0, 6);
  const pgs = sortByFeaturedOwnerFirst(rawPgs).slice(0, 4);
  const commercials = sortByFeaturedOwnerFirst(rawCommercials).slice(0, 4);

  const agents = await prisma.user.findMany({
    where: { 
      role: { in: ["AGENT", "OWNER"] }, 
      isApproved: true,
      isSuspended: false,
      agentProfile: { isFeatured: true }
    },
    include: { agentProfile: true },
    take: 4,
  });

  const localities = await prisma.locality.findMany({
    include: {
      city: { select: { name: true } },
      _count: {
        select: { properties: { where: { status: "ACTIVE" } } }
      }
    },
    orderBy: { properties: { _count: "desc" } },
    take: 8,
  });

  const trending = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    include: { city: true, locality: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
    take: 6,
    orderBy: { viewCount: "desc" },
  });

  // Helper: Prisma Decimal → plain number so Client Components don't crash
  const serializeProperty = (p: any) => ({
    ...p,
    price: p.price ? Number(p.price) : null,
    monthlyRent: p.monthlyRent ? Number(p.monthlyRent) : null,
    securityDeposit: p.securityDeposit ? Number(p.securityDeposit) : null,
    maintenanceCharges: p.maintenanceCharges ? Number(p.maintenanceCharges) : null,
    carpetArea: p.carpetArea ? Number(p.carpetArea) : null,
    builtUpArea: p.builtUpArea ? Number(p.builtUpArea) : null,
    superBuiltUpArea: p.superBuiltUpArea ? Number(p.superBuiltUpArea) : null,
    plotArea: p.plotArea ? Number(p.plotArea) : null,
    latitude: p.latitude ? Number(p.latitude) : null,
    longitude: p.longitude ? Number(p.longitude) : null,
    leaseDuration: p.leaseDuration ? Number(p.leaseDuration) : null,
    availableFrom: p.availableFrom ? p.availableFrom.toISOString() : null,
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  });

  const featuredSafe = featured.map(serializeProperty);
  const recentSafe = recent.map(serializeProperty);
  const pgsSafe = pgs.map(serializeProperty);
  const commercialsSafe = commercials.map(serializeProperty);
  const trendingSafe = trending.map(serializeProperty);

  // City cover photo fallbacks
  const cityCovers: Record<string, string> = {
    bengaluru: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80",
    mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80",
    delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80",
    default: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80"
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col text-left">
      <Navbar />

      {/* ── MAIN BODY CONTENT & RIGHT AD SIDEBAR COLUMN (Starts alongside Hero) ── */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left Content Column */}
        <div className="space-y-12 min-w-0">

          {/* 1. HERO SECTION */}
      <section className="relative w-full h-[600px] bg-primary overflow-hidden flex flex-col md:flex-row">
        {/* Left Text Content */}
        <div className="absolute left-0 top-0 bottom-0 w-full md:w-[45%] z-20 flex flex-col justify-center px-8 md:px-12 lg:px-20 bg-gradient-to-r from-primary via-primary/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto mt-20 md:mt-0">
            <h1 className="font-serif text-5xl md:text-[3.5rem] lg:text-[4.5rem] font-bold tracking-tight leading-[1.15] mb-5 drop-shadow-md">
              <span className="text-accent">RE</span>{" "}
              <span className="text-white">OneStop</span>
              <span className="text-accent">Page</span>
            </h1>
            <div className="flex items-center gap-3 mb-6 max-w-max">
              <div className="w-8 h-[2px] bg-accent rounded-full"></div>
              <p className="text-white font-mono text-[10px] md:text-xs tracking-[0.25em] uppercase font-semibold opacity-90">
                One Page. All Real Estate Solutions.
              </p>
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-10 max-w-md font-medium">
              Your complete real estate partner for Home, Land, Commercial & Industrial properties. Search, Explore and Find the perfect space for your needs.
            </p>
            <Link href="/properties" className="bg-accent hover:bg-accent-hover text-primary font-bold px-8 py-4 rounded-full inline-flex items-center gap-3 max-w-max transition-all shadow-[0_8px_20px_-6px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(212,175,55,0.6)] hover:-translate-y-1 text-sm uppercase tracking-wider">
              Explore Properties <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Slanted Sections */}
        <div className="absolute left-0 md:left-[35%] right-0 top-0 bottom-0 z-10 flex flex-row opacity-30 md:opacity-100">
          {/* HOMES */}
          <Link href="/properties?category=homes" 
            className="relative flex-1 group overflow-hidden cursor-pointer"
            style={{ clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0% 100%)', marginLeft: '-10%' }}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/20 transition-colors duration-500"></div>
            <div className="absolute inset-x-0 bottom-16 flex flex-col items-center justify-end text-center z-20">
              <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mb-4 bg-primary/80 backdrop-blur-sm group-hover:bg-accent group-hover:text-primary transition-all duration-300 text-accent">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-accent font-bold tracking-widest text-base mb-1">HOMES</h3>
              <p className="text-white text-[10px] px-4 opacity-90 max-w-[150px] hidden lg:block">Find your dream home for a better life</p>
            </div>
            {/* Border line */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/40 z-30 transform -skew-x-[20deg]"></div>
          </Link>

          {/* LAND */}
          <Link href="/properties?category=land" 
            className="relative flex-1 group overflow-hidden cursor-pointer"
            style={{ clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0% 100%)', marginLeft: '-10%' }}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/20 transition-colors duration-500"></div>
            <div className="absolute inset-x-0 bottom-16 flex flex-col items-center justify-end text-center z-20">
              <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mb-4 bg-primary/80 backdrop-blur-sm group-hover:bg-accent group-hover:text-primary transition-all duration-300 text-accent">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-accent font-bold tracking-widest text-base mb-1">LAND</h3>
              <p className="text-white text-[10px] px-4 opacity-90 max-w-[150px] hidden lg:block">Invest in the right land for your future</p>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/40 z-30 transform -skew-x-[20deg]"></div>
          </Link>

          {/* COMMERCIAL */}
          <Link href="/properties?category=commercial" 
            className="relative flex-1 group overflow-hidden cursor-pointer"
            style={{ clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0% 100%)', marginLeft: '-10%' }}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/20 transition-colors duration-500"></div>
            <div className="absolute inset-x-0 bottom-16 flex flex-col items-center justify-end text-center z-20 pl-4">
              <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mb-4 bg-primary/80 backdrop-blur-sm group-hover:bg-accent group-hover:text-primary transition-all duration-300 text-accent">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-accent font-bold tracking-widest text-base mb-1">COMMERCIAL</h3>
              <p className="text-white text-[10px] px-4 opacity-90 max-w-[150px] hidden lg:block">Grow your business with the right space</p>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/40 z-30 transform -skew-x-[20deg]"></div>
          </Link>

          {/* INDUSTRY */}
          <Link href="/properties?category=industry" 
            className="relative flex-1 group overflow-hidden cursor-pointer"
            style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-10%' }}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/20 transition-colors duration-500"></div>
            <div className="absolute inset-x-0 bottom-16 flex flex-col items-center justify-end text-center z-20 pl-8">
              <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mb-4 bg-primary/80 backdrop-blur-sm group-hover:bg-accent group-hover:text-primary transition-all duration-300 text-accent">
                <Factory className="w-6 h-6" />
              </div>
              <h3 className="text-accent font-bold tracking-widest text-base mb-1">INDUSTRY</h3>
              <p className="text-white text-[10px] px-4 opacity-90 max-w-[150px] hidden lg:block">Premium industrial spaces for your business</p>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/40 z-30 transform -skew-x-[20deg]"></div>
          </Link>
        </div>
        
        {/* Decorative gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary to-transparent z-30 pointer-events-none"></div>
      </section>

      {/* 2. POPULAR CITIES */}
      <section className="py-16 max-w-7xl mx-auto w-full px-5 md:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Popular Cities</h2>
            <p className="text-xs text-slate-500 mt-1">Explore verified rental options across India's primary metropolitan zones.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => {
            const cover = cityCovers[city.name.toLowerCase()] || cityCovers.default;
            return (
              <Link 
                key={city.id}
                href={`/properties?cityId=${city.id}`} 
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-line shadow-xs transition hover:shadow"
              >
                <img 
                  src={cover} 
                  alt={city.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <div className="absolute bottom-4 left-4 right-4 z-20 text-white space-y-0.5">
                  <p className="font-serif text-sm font-bold">{city.name}</p>
                  {city.localities && city.localities.length > 0 && (
                    <p className="text-[9px] font-mono opacity-90 truncate w-full">
                      {city.localities.map((l: any) => l.name).join(", ")}
                    </p>
                  )}
                  <p className="text-[9px] font-mono font-bold tracking-wider opacity-85 pt-1">
                    {city._count.properties} ACTIVE LISTINGS
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      {featuredSafe.length > 0 && (
        <section className="py-16 bg-white border-y border-line">
          <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="w-7 h-7 text-accent" /> Featured Verified Listings
                </h2>
                <p className="text-xs text-slate-500 mt-1">RERA registered and physical-site audited properties ready for tenancy.</p>
              </div>
              <Link href="/properties?isVerified=true" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSafe.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. CATEGORIES SECTIONS: PG & COMMERCIAL */}
      <section className="py-16 max-w-7xl mx-auto w-full px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* PG & Co-living */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-line pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">PG &amp; Co-Living Spaces</h3>
              <p className="text-xs text-slate-500 mt-0.5">Shared accommodations and budget PGs for young professionals.</p>
            </div>
            <Link href="/properties?propertyType=PG" className="text-[10px] font-bold text-slate-400 hover:text-accent font-mono uppercase">
              See All
            </Link>
          </div>
          {pgsSafe.length === 0 ? (
            <p className="text-xs text-slate-400">No PG listings currently available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pgsSafe.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>

        {/* Commercial Workspaces */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-line pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">Commercial Workspaces</h3>
              <p className="text-xs text-slate-500 mt-0.5">Offices, coworking spots, and retail shops in prime business centers.</p>
            </div>
            <Link href="/properties?propertyType=OFFICE_SPACE" className="text-[10px] font-bold text-slate-400 hover:text-accent font-mono uppercase">
              See All
            </Link>
          </div>
          {commercialsSafe.length === 0 ? (
            <p className="text-xs text-slate-400">No commercial listings currently available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {commercialsSafe.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. RECENTLY ADDED */}
      <section className="py-16 bg-white border-t border-line">
        <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Recently Added Properties</h2>
              <p className="text-xs text-slate-500 mt-1">Explore the latest properties added to our Indian marketplace.</p>
            </div>
            <Link href="/properties" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
              Browse Listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSafe.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 5a. POPULAR LOCALITIES */}
      {localities.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto w-full px-5 md:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                <MapPin className="w-7 h-7 text-accent" /> Popular Localities
              </h2>
              <p className="text-xs text-slate-500 mt-1">Explore India's most active rental micro-markets by neighbourhood.</p>
            </div>
            <Link href="/properties" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {localities.filter(l => l._count.properties > 0).map((locality) => (
              <Link
                key={locality.id}
                href={`/properties?localityId=${locality.id}`}
                className="group bg-white border border-line rounded-xl px-4 py-3.5 hover:shadow-sm hover:border-accent/30 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-xs text-primary group-hover:text-accent transition">{locality.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{locality.city.name}</p>
                </div>
                <span className="text-[10px] font-bold font-mono bg-secondary border border-line text-slate-500 px-2 py-0.5 rounded-full">
                  {locality._count.properties}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5b. TRENDING PROPERTIES */}
      {trendingSafe.length > 0 && (
        <section className="py-16 bg-white border-t border-line">
          <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-accent" /> Trending Right Now
                </h2>
                <p className="text-xs text-slate-500 mt-1">Most-viewed properties this week — popular with seekers like you.</p>
              </div>
              <Link href="/properties" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 font-mono uppercase">
                Explore More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingSafe.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. HOW IT WORKS / WHY CHOOSE US */}
      <section className="py-16 max-w-7xl mx-auto w-full px-5 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-line rounded-2xl p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-bold text-primary">Verified &amp; RERA Inspected</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            We require valid RERA IDs and run site verification audits on premium listings to block spam, fake locations, or duplicate posts.
          </p>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-bold text-primary">Multi-Step Post Wizard</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            List your rental property with our 12-step structured creation engine. Auto-save drafts and resume publishing at any time.
          </p>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-bold text-primary">Direct Landlord Messaging</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Skip the middleman and communicate directly with landlords, owners, or verified agents using our database-backed secure inbox threads.
          </p>
        </div>
      </section>



      {/* 7. TOP AGENTS */}
      {agents.length > 0 && (
        <section className="py-16 bg-white border-t border-line">
          <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Top Verified Agents &amp; Owners</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect with Indian PropTech specialists and verified property owners carrying top credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.map((agent) => {
                const cleanName = agent.name.replace(/\s*\([^)]*\)/g, "").trim();
                return (
                  <Link 
                    key={agent.id}
                    href={`/agent/${agent.id}`} 
                    className="bg-secondary border border-line rounded-2xl p-5 text-center hover:shadow-xs transition duration-300 space-y-4 flex flex-col items-center"
                  >
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={cleanName} className="w-16 h-16 rounded-full object-cover border border-line" />
                    ) : (
                      <span className="w-16 h-16 rounded-full bg-primary text-secondary flex items-center justify-center font-bold text-xl uppercase border border-line">
                        {cleanName.charAt(0)}
                      </span>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm text-primary">{cleanName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                        {agent.agentProfile?.companyName || "Independent Agent"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white border border-line px-3 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      <span>{agent.agentProfile?.ratingAverage || 0} Rating</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. TESTIMONIALS */}
      <section className="py-16 max-w-7xl mx-auto w-full px-5 md:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">What Our Seekers Say</h2>
          <p className="text-xs text-slate-500">Read verified reviews from tenants who discovered their dream home.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-line rounded-2xl p-6 space-y-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-accent fill-accent" />)}
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Renting an apartment in Whitefield was always a hassle due to broker fees. Re One Stop Page saved me from that. Found a verified listing, contacted the owner, and booked a visit tour instantly!"
            </p>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">R</span>
              <div>
                <p className="text-[11px] font-bold text-primary">Rahul Sharma</p>
                <p className="text-[9px] text-slate-400 font-mono uppercase">Software Engineer, Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-2xl p-6 space-y-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-accent fill-accent" />)}
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "The EMI calculator and comparison tools are incredibly helpful. I compared four duplex villas in Bandra West side-by-side on specs, floor numbers, and parking details before purchasing."
            </p>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">P</span>
              <div>
                <p className="text-[11px] font-bold text-primary">Priya Patel</p>
                <p className="text-[9px] text-slate-400 font-mono uppercase">Business Owner, Mumbai</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-2xl p-6 space-y-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-accent fill-accent" />)}
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Listing my builder floor in Karol Bagh took less than 10 minutes. The multi-step wizard saved my progress automatically as a draft. Superb interface."
            </p>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">A</span>
              <div>
                <p className="text-[11px] font-bold text-primary">Amit Gupta</p>
                <p className="text-[9px] text-slate-400 font-mono uppercase">Property Owner, New Delhi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

        </div>

        {/* Right Column: Adds Buzz Banner Column */}
        <AdSidebarColumn page="home" className="hidden lg:block" title="FEATURED BUZZ" />
      </div>

      {/* 9. FINAL CTA SECTION */}
      <section className="py-16 bg-primary text-secondary border-t border-line text-center">
        <div className="max-w-xl mx-auto px-5 space-y-6">
          <h2 className="font-serif text-3xl font-bold text-white">Own a property in India?</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Post your residential flat, villa, PG, or commercial shop and connect with thousands of verified seekers. Start listing your home now.
          </p>
          <div className="flex items-center justify-center gap-3">
            <PostListingButton className="bg-accent hover:bg-accent-hover text-primary font-bold text-xs px-7 py-3 rounded-full transition cursor-pointer">
              Post Your Listing
            </PostListingButton>
            <Link 
              href="/auth/register" 
              className="border border-white/20 hover:bg-white/5 text-white font-bold text-xs px-7 py-3 rounded-full transition"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
