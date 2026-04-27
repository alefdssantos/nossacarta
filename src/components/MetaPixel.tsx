"use client";

import Script from "next/script";
import { useConsent } from "./CookieBanner";

export function MetaPixel() {
  const consent = useConsent();
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const pixelId = /^\d{10,20}$/.test(raw ?? "") ? raw : null;

  if (!pixelId || consent !== "accepted") return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
          s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${pixelId}');
          fbq('track','PageView');
        `,
      }}
    />
  );
}
