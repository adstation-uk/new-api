"use client";

import { ConsoleSidebar } from "@/components/console-sidebar";
import { useState } from "react";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <ConsoleSidebar />
      <main className="flex-1 transition-all duration-300 ml-64 overflow-x-hidden">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
