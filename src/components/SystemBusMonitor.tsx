"use client";

import React, { useState, useEffect } from "react";

interface SystemEvent {
  id: string;
  source: "GITHUB_HOOK" | "SYSTEM_BUS" | "GOVERNANCE";
  eventType: string;
  moduleName: string;
  timestamp: string;
  status: "PROCESSED" | "PENDING" | "FAILED";
}

export default function SystemBusMonitor() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<string>("Initializing...");

  // Mock initial state / health synchronization poll
  useEffect(() => {
    const fetchSystemEvents = async () => {
      try {
        const timestamp = new Date().toLocaleTimeString();
        setLastSync(timestamp);
        
        // Initial system event simulation log
        setEvents((prev) => [
          {
            id: `evt-${Date.now().toString().slice(-6)}`,
            source: "GITHUB_HOOK",
            eventType: "PUSH_DEPLOY",
            moduleName: "beastsystem-backend",
            timestamp,
            status: "PROCESSED",
          },
          ...prev.slice(0, 9), // Keep latest 10 events
        ]);
      } catch (error) {
        console.error("Failed to poll BEAST System Bus:", error);
      }
    };

    fetchSystemEvents();
    const interval = setInterval(fetchSystemEvents, 12000);

    return () => clearInterval(interval);
  }, [isPolling]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚡</span> BEAST System Bus Event Feed
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Endpoint: https://beastsystem-70875693050.us-central1.run.app
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            Last Sync: {lastSync}
          </span>
          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
              isPolling
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            {isPolling ? "● Live Polling" : "Paused"}
          </button>
        </div>
      </div>

      {/* Events Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2 px-3">Event ID</th>
              <th className="py-2 px-3">Source</th>
              <th className="py-2 px-3">Module</th>
              <th className="py-2 px-3">Action</th>
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-500">
                  No active system events in buffer.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-indigo-400">{evt.id}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {evt.source}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{evt.moduleName}</td>
                  <td className="py-2.5 px-3 text-amber-300">{evt.eventType}</td>
                  <td className="py-2.5 px-3 text-slate-400">{evt.timestamp}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {evt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
