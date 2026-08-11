"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/analytics");
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1">
      <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-slate-500 font-mono">Redirecting to Admin Dashboard...</p>
    </div>
  );
}
