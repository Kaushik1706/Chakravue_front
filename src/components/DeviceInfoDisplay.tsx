import React, { useState, useEffect } from 'react';
import { Monitor, Clock, MapPin } from 'lucide-react';

export function DeviceInfoDisplay() {
  const [deviceInfo, setDeviceInfo] = useState({
    time: '',
    timezone: '',
    device: '',
    browser: '',
    resolution: '',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      // Get current time
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = -now.getTimezoneOffset() / 60;
      const offsetStr = `UTC ${offset >= 0 ? '+' : ''}${offset}`;

      // Get device type
      const userAgent = navigator.userAgent;
      let deviceType = 'Desktop';
      if (/Mobile|Android|iPhone|iPad|iPod/.test(userAgent)) {
        deviceType = 'Mobile';
      } else if (/iPad|Android/.test(userAgent)) {
        deviceType = 'Tablet';
      }

      // Get browser
      let browser = 'Unknown';
      if (/Chrome/.test(userAgent)) browser = 'Chrome';
      else if (/Firefox/.test(userAgent)) browser = 'Firefox';
      else if (/Safari/.test(userAgent)) browser = 'Safari';
      else if (/Edge|Edg/.test(userAgent)) browser = 'Edge';
      else if (/MSIE|Trident/.test(userAgent)) browser = 'IE';

      // Get resolution
      const resolution = `${window.innerWidth}x${window.innerHeight}`;

      setDeviceInfo({
        time: timeStr,
        timezone: offsetStr,
        device: deviceType,
        browser: browser,
        resolution: resolution,
      });
    };

    updateDeviceInfo();
    const interval = setInterval(updateDeviceInfo, 1000); // Update every second

    window.addEventListener('resize', updateDeviceInfo);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return (
    <div className="group relative">
      {/* Display compact info */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg hover:border-[#D4A574] transition-all cursor-pointer">
        <Clock className="w-4 h-4 text-[#D4A574]" />
        <div className="flex flex-col gap-1">
          <div className="text-xs text-[#8B8B8B]">{deviceInfo.timezone}</div>
          <div className="text-sm font-semibold text-white">{deviceInfo.time}</div>
        </div>
      </div>

      {/* Detailed info tooltip */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#D4A574] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#8B8B8B] uppercase">Time</p>
              <p className="text-sm text-white font-mono">{deviceInfo.time}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#D4A574] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#8B8B8B] uppercase">Timezone</p>
              <p className="text-sm text-white font-mono">{deviceInfo.timezone}</p>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a] pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#8B8B8B] uppercase">Device</p>
                <p className="text-xs text-white">{deviceInfo.device}</p>
              </div>
              <div>
                <p className="text-xs text-[#8B8B8B] uppercase">Browser</p>
                <p className="text-xs text-white">{deviceInfo.browser}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
              <p className="text-xs text-[#8B8B8B] uppercase">Resolution</p>
              <p className="text-xs text-white font-mono">{deviceInfo.resolution}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
