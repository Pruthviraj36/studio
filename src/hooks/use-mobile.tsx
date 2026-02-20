import * as React from "react";
import { useIsMobile as useIsMobileFromLib } from "@/lib/responsive";

// Re-export the responsive hook for consistency
export function useIsMobile() {
  return useIsMobileFromLib();
}
