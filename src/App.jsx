import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Globe, 
  Calendar, 
  Users, 
  Check, 
  AlertCircle, 
  Info 
} from 'lucide-react';
import { formatLocalTime, getOverlapWorkingHours } from './utils';

// Helper to get offset in hours dynamically for any timezone name
function getTimeZoneOffset(timeZone) {
  try {
    const date = new Date();
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tz = new Date(date.toLocaleString('en-US', { timeZone }));
    return (tz.getTime() - utc.getTime()) / (60 * 60 * 1000);
  } catch (e) {
    return 0;
  }
}

// Predefined list of timezones to select from
const PRESET_TIMEZONES = [
  { id: 'utc', name: 'UTC (Coordinated Universal Time)', zone: 'UTC' },
  { id: 'est', name: 'New York (EST/EDT)', zone: 'America/New_York' },
  { id: 'pst', name: 'San Francisco (PST/PDT)', zone: 'America/Los_Angeles' },
  { id: 'gmt', name: 'London (GMT/BST)', zone: 'Europe/London' },
  { id: 'jst', name: 'Tokyo (JST)', zone: 'Asia/Tokyo' },
  { id: 'aest', name: 'Sydney (AEST/AEDT)', zone: 'Australia/Sydney' },
  { id: 'gst', name: 'Dubai (GST)', zone: 'Asia/Dubai' },
  { id: 'cet', name: 'Paris (CET/CEST)', zone: 'Europe/Paris' },
  { id: 'ist', name: 'Mumbai (IST)', zone: 'Asia/Kolkata' },
];

export default function App() {
  const [localTime, setLocalTime] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getUTCHours());
  const [trackedZones, setTrackedZones] = useState([
    { id: 'local', name: 'Local Time', zone: Intl.DateTimeFormat().resolvedOptions().timeZone, isLocal: true },
    { id: 'utc', name: 'UTC', zone: 'UTC' },
    { id: 'est', name: 'New York', zone: 'America/New_York' },
    { id: 'jst', name: 'Tokyo', zone: 'Asia/Tokyo' }
  ]);
  const [newZoneName, setNewZoneName] = useState(PRESET_TIMEZONES[4].zone); // Default to Tokyo

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Add a timezone to the tracking list
  const handleAddZone = (e) => {
    e.preventDefault();
    const preset = PRESET_TIMEZONES.find(p => p.zone === newZoneName);
    if (!preset) return;
    
    // Avoid duplicates
    if (trackedZones.some(tz => tz.zone === newZoneName)) return;

    setTrackedZones([
      ...trackedZones,
      {
        id: preset.id + '-' + Date.now(),
        name: preset.name.split(' (')[0], // Extract just the city/name
        zone: preset.zone
      }
    ]);
  };

  // Remove a timezone from the tracking list
  const handleRemoveZone = (id) => {
    setTrackedZones(trackedZones.filter(tz => tz.id !== id));
  };

  // Calculate times for a specific UTC hour selection
  const getSelectedTimeInZone = (zone, utcHour) => {
    const d = new Date();
    d.setUTCHours(utcHour, 0, 0, 0);
    return d.toLocaleTimeString('en-US', {
      timeZone: zone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSelectedDateInZone = (zone, utcHour) => {
    const d = new Date();
    d.setUTCHours(utcHour, 0, 0, 0);
    return d.toLocaleDateString('en-US', {
      timeZone: zone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Analyze the meeting window suitability
  const meetingAnalysis = () => {
    let sleepingCount = 0;
    let workingCount = 0;
    
    trackedZones.forEach(tz => {
      const offset = getTimeZoneOffset(tz.zone);
      const localHour = (selectedHour + offset + 24) % 24;
      
      // Sleep hours: 10 PM (22) to 6 AM (6)
      if (localHour >= 22 || localHour < 6) {
        sleepingCount++;
      }
      // Work hours: 9 AM (9) to 5 PM (17)
      if (localHour >= 9 && localHour <= 17) {
        workingCount++;
      }
    });

    const total = trackedZones.length;
    if (sleepingCount > 0) {
      return {
        status: 'critical',
        message: `${sleepingCount} participant(s) will be asleep!`,
        color: 'var(--error)'
      };
    } else if (workingCount === total) {
      return {
        status: 'optimal',
        message: 'Perfect match! Working hours for everyone.',
        color: 'var(--success)'
      };
    } else {
      return {
        status: 'warning',
        message: 'Sub-optimal. No one is asleep, but some are outside working hours.',
        color: 'var(--accent)'
      };
    }
  };

  const analysis = meetingAnalysis();

  return (
    <div className="app-container">
      <header>
        <div className="logo-section">
          <Clock size={32} className="logo-icon" />
          <div>
            <h1 className="logo-text">SyncTime</h1>
            <p className="subtitle">Collaborate seamlessly across time zones</p>
          </div>
        </div>
        <div className="local-time-badge">
          <Globe size={16} />
          <span>Local:</span>
          {localTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>
      </header>

      <main className="dashboard-grid">
        {/* Left Column: Tracked Time Zones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h2 className="section-title">
              <Globe size={20} style={{ color: 'var(--primary)' }} />
              Tracked Time Zones
            </h2>
            
            <div className="timezone-list">
              {trackedZones.map(tz => {
                const offset = getTimeZoneOffset(tz.zone);
                const sign = offset >= 0 ? '+' : '';
                const displayOffset = `UTC${sign}${offset % 1 === 0 ? offset : offset.toFixed(1)}`;
                
                return (
                  <div className="timezone-item" key={tz.id}>
                    <div className="timezone-info">
                      <span className="timezone-name">
                        {tz.name} {tz.isLocal && <span style={{fontSize: '0.75rem', padding: '2px 6px', background: 'var(--primary-glow)', borderRadius: '4px', color: '#a5b4fc', marginLeft: '6px'}}>Local</span>}
                      </span>
                      <span className="timezone-offset">{tz.zone} • {displayOffset}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="timezone-time-display">
                        <div className="timezone-time">
                          {getSelectedTimeInZone(tz.zone, selectedHour)}
                        </div>
                        <div className="timezone-date">
                          {getSelectedDateInZone(tz.zone, selectedHour)}
                        </div>
                      </div>
                      
                      {!tz.isLocal && (
                        <button className="remove-btn" onClick={() => handleRemoveZone(tz.id)} title="Remove timezone">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Timezone Panel */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} style={{ color: 'var(--accent)' }} /> Add Time Zone
            </h3>
            <form onSubmit={handleAddZone} style={{ display: 'flex', gap: '1rem' }}>
              <select 
                value={newZoneName} 
                onChange={(e) => setNewZoneName(e.target.value)}
                style={{ flexGrow: 1 }}
              >
                {PRESET_TIMEZONES.map(preset => (
                  <option 
                    key={preset.zone} 
                    value={preset.zone}
                    disabled={trackedZones.some(tz => tz.zone === preset.zone)}
                  >
                    {preset.name}
                  </option>
                ))}
              </select>
              <button className="btn" type="submit">Add</button>
            </form>
          </div>
        </div>

        {/* Right Column: Interactive Meeting Planner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card meeting-planner">
            <h2 className="section-title">
              <Users size={20} style={{ color: 'var(--primary)' }} />
              Meeting Scheduler
            </h2>
            
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Drag the slider to adjust the proposed meeting hour (UTC). See how it maps to active time zones:
              </p>
              
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  className="range-slider"
                />
                <div className="slider-labels">
                  <span>12:00 AM UTC</span>
                  <span>12:00 PM UTC</span>
                  <span>11:00 PM UTC</span>
                </div>
              </div>
            </div>

            {/* Meeting Suitability Indicator */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: `1px solid ${analysis.color}33`,
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              transition: 'border-color 0.2s ease'
            }}>
              {analysis.status === 'optimal' && <Check size={24} style={{ color: 'var(--success)' }} />}
              {analysis.status === 'warning' && <Info size={24} style={{ color: 'var(--accent)' }} />}
              {analysis.status === 'critical' && <AlertCircle size={24} style={{ color: 'var(--error)' }} />}
              
              <div>
                <h4 style={{ fontSize: '1rem', color: analysis.color, textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                  {analysis.status} Timing
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {analysis.message}
                </p>
              </div>
            </div>

            {/* 24h Timeline Comparer */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Timeline Comparison</h3>
              <div className="comparison-grid">
                {trackedZones.map(tz => {
                  const offset = getTimeZoneOffset(tz.zone);
                  return (
                    <div className="comparison-row" key={tz.id}>
                      <div className="row-label" title={tz.name}>{tz.name}</div>
                      <div className="hours-bar">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const localHr = (i + offset + 24) % 24;
                          const isSleep = localHr >= 22 || localHr < 6;
                          const isWork = localHr >= 9 && localHr <= 17;
                          const isSelected = i === selectedHour;
                          
                          let className = 'hour-cell';
                          if (isSelected) className += ' active';
                          else if (isSleep) className += ' sleep';
                          else if (isWork) className += ' overlap';
                          
                          return (
                            <div 
                              className={className} 
                              key={i}
                              title={`${tz.name}: ${localHr % 1 === 0 ? localHr : Math.floor(localHr) + ':30'} (${isSleep ? 'Sleep' : isWork ? 'Work' : 'Off-hours'})`}
                            >
                              {Math.floor(localHr)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'rgba(20, 184, 166, 0.3)', borderRadius: '2px', border: '1px solid var(--accent)' }}></span> Working Hours
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '2px' }}></span> Sleep Hours
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></span> Proposed Time
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 SyncTime. Developed with 💜 for remote team synergy.</p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); alert(`Did you know formatLocalTime("2026-06-19T15:00:00Z") is "${formatLocalTime('2026-06-19T15:00:00Z')}" in your local system?`); }}>
            View local debug details
          </a>
        </p>
      </footer>
    </div>
  );
}
