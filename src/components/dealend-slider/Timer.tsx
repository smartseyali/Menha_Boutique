"use client"
import { useEffect, useState } from 'react';

const Timer = ({ targetDate }: any) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {

    const updateTimer = () => {
      const futureTime = Date.parse(targetDate);
      const now: any = new Date();
      const diff = futureTime - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Update timer every second
    const intervalId = setInterval(updateTimer, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [targetDate]);

  return (
    <div id="dealend" className="dealend-timer">
      <div className='dealend-timer'>
      <div className="time-block">
        <div className="time">{timeLeft.days}</div>
        <span className="day">Days</span>
      </div>
      <div className="time-block">
        <div className="time">{timeLeft.hours}</div>
        <span className="dots">:</span>
      </div>
      <div className="time-block">
        <div className="time">{timeLeft.minutes}</div>
        <span className="dots">:</span>
      </div>
      <div className="time-block">
        <div className="time">{timeLeft.seconds}</div>
      </div>
      </div>
    </div>
  );
};

export default Timer