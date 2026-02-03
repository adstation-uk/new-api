"use client";

import React, { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function ServerAddressClient() {
  const [serverAddress, setServerAddress] = useState("");

  useEffect(() => {
    setServerAddress(window.location.origin);
  }, []);

  const handleCopyBaseURL = () => {
    navigator.clipboard.writeText(serverAddress);
    toast.success("已复制到剪切板");
  };

  return (
    <div className="w-full max-w-md mb-10">
      <div className="relative flex items-center h-14 w-full bg-muted border rounded-xl px-4 hover:border-primary/50 transition-colors group">
        <input
          readOnly
          value={serverAddress}
          className="bg-transparent border-none outline-none flex-1 text-foreground font-medium focus:ring-0 w-full"
        />
        <button
          onClick={handleCopyBaseURL}
          className="ml-2 p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors cursor-pointer border-none flex items-center justify-center"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}
