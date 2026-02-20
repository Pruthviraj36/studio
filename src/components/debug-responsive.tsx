"use client";

import {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useScreenWidth,
} from "@/lib/responsive";

export function DebugResponsive() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const screenWidth = useScreenWidth();

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg font-mono text-sm">
      <div className="space-y-1">
        <div>Width: {screenWidth}px</div>
        <div>Mobile: {isMobile ? "✅" : "❌"}</div>
        <div>Tablet: {isTablet ? "✅" : "❌"}</div>
        <div>Desktop: {isDesktop ? "✅" : "❌"}</div>
      </div>
    </div>
  );
}
