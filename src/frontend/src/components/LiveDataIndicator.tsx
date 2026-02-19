import { useState, useEffect } from 'react';
import { useMetricsData } from '../hooks/useQueries';

export default function LiveDataIndicator() {
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [status, setStatus] = useState<'online' | 'partial' | 'offline'>('online');
  const { isError, isLoading, dataUpdatedAt, data } = useMetricsData();

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdateTime(dataUpdatedAt);
    }
  }, [dataUpdatedAt]);

  useEffect(() => {
    const checkStatus = () => {
      const timeSinceUpdate = Date.now() - lastUpdateTime;
      const hasRecentError = isError && !isLoading;
      const isStale = timeSinceUpdate > 10000;
      
      const activeSources = data?.sources?.length || 0;
      
      if (hasRecentError || isStale || activeSources === 0) {
        setStatus('offline');
      } else if (activeSources < 3) {
        setStatus('partial');
      } else {
        setStatus('online');
      }
    };

    const interval = setInterval(checkStatus, 1000);
    checkStatus();

    return () => clearInterval(interval);
  }, [lastUpdateTime, isError, isLoading, data]);

  return (
    <div className="flex items-center">
      <div 
        className={`h-2 w-2 rounded-full ${
          status === 'online' 
            ? 'bg-green-500 animate-pulse' 
            : status === 'partial'
            ? 'bg-yellow-500 animate-pulse'
            : 'bg-red-500'
        }`}
      />
    </div>
  );
}
