"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>{children}</LanguageProvider>
    </QueryClientProvider>
  );
}
