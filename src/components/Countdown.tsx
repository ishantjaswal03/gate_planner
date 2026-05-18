"use client";

import { useState, useEffect } from "react";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // GATE Exam typical start date: First weekend of Feb
    // Target: Feb 6, 2027
    const targetDate = new Date("2027-02-06T00:00:00").getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return (
      <div className="text-5xl sm:text-7xl font-black tabular-nums tracking-tighter opacity-50">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 items-baseline">
        <div className="text-5xl sm:text-7xl font-black tabular-nums tracking-tighter">
          {timeLeft.days}
        </div>
        <span className="text-xl font-bold uppercase">Days</span>
      </div>
      <div className="text-lg font-bold mt-1 opacity-90 tracking-widest tabular-nums">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  );
}
