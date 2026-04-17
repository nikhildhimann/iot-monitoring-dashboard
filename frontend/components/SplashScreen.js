"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if user has ever seen the long branding splash
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    const first = !hasSeenSplash;
    setIsFirstVisit(first);

    // Show splash initially
    setShow(true);

    // Timing constants (Further reduced for snappier branding)
    const FADE_DELAY = first ? 1500 : 200;
    const REMOVE_DELAY = first ? 2000 : 500;

    // Start fading out
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, FADE_DELAY);

    // Completely remove component
    const removeTimer = setTimeout(() => {
      setShow(false);
      if (first) {
        localStorage.setItem("hasSeenSplash", "true");
      }
    }, REMOVE_DELAY);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
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
          animation: `splashPulse ${isFirstVisit ? '1.5s' : '0.5s'} ease-in-out forwards`
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
          0% { transform: scale(0.85); opacity: 0; }
          20% { transform: scale(1.02); opacity: 1; }
          40% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
