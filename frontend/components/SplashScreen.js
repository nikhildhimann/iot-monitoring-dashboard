"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Check if it's the first load of the session
    const hasShownSplash = sessionStorage.getItem("splashShown");
    
    if (!hasShownSplash) {
      // Don't show if installed PWA standalone mode (optional, but requested for app-like web experience too)
      // Actually, PWA splash screen is handled by OS natively, so it might show twice. 
      // It's sometimes best not to show web-based splash if standalone, but the prompt says 
      // "Add a splash screen for the PWA to enhance app-like experience" which could mean they want our custom one.
      
      setShow(true);
      
      // Start fading out after 1.2 seconds
      const fadeTimer = setTimeout(() => {
        setFade(true);
      }, 1200);

      // Completely remove component after animation finishes (1.7 seconds total)
      const removeTimer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("splashShown", "true");
      }, 1700);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!show) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        opacity: fade ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: fade ? 'none' : 'auto'
      }}
    >
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'splashPulse 1.2s ease-in-out'
        }}
      >
        <img 
          src="/icon-192.png" 
          alt="AlertSense Logo" 
          style={{ width: '96px', height: '96px', marginBottom: '1.25rem', objectFit: 'contain' }}
        />
        <h1 
          className="dashboard-title"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--foreground)',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          AlertSense
        </h1>
      </div>
      <style>{`
        @keyframes splashPulse {
          0% { transform: scale(0.9); opacity: 0; }
          40% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
