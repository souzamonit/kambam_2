import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  prazoVencimento?: string;
  size?: 'sm' | 'md';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  prazoVencimento, 
  size = 'sm' 
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!prazoVencimento) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(prazoVencimento).getTime();
      const difference = target - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [prazoVencimento]);

  if (!prazoVencimento) {
    return (
      <div className={`flex items-center text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        <Clock className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        <span>Sem prazo definido</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const isUrgent = !timeLeft.isExpired && timeLeft.days === 0 && timeLeft.hours < 24;
  const textColor = timeLeft.isExpired 
    ? 'text-red-600' 
    : isUrgent 
    ? 'text-orange-600' 
    : 'text-gray-600';

  const bgColor = timeLeft.isExpired 
    ? 'bg-red-50' 
    : isUrgent 
    ? 'bg-orange-50' 
    : 'bg-gray-50';

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center ${textColor} ${size === 'sm' ? 'text-xs' : 'text-sm'} ${bgColor} px-2 py-1 rounded`}>
        <AlertTriangle className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        <span className="font-medium">Prazo vencido</span>
      </div>
    );
  }

  const formatTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }
  };

  return (
    <div className={`flex items-center ${textColor} ${size === 'sm' ? 'text-xs' : 'text-sm'} ${bgColor} px-2 py-1 rounded`}>
      <Clock className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      <span className="font-mono font-medium">{formatTime()}</span>
    </div>
  );
};