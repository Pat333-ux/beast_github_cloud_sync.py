"use client";

import React, { useState } from "react";

export default function GovernanceActionPanel() {
  const [moduleName, setModuleName] = useState<string>("CONSTITUTION_ENGINE");
  const [eventType, setEventType] = useState<string>("GRANT_ALLOCATION");
  const [payloadData, setPayloadData] = useState<string>('{"recipient": "0x...", "amount": "1000"}');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDispatchEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/v1/webhooks/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Event": "system_bus_dispatch",
        },
        body: JSON.stringify({
          source: "GovernanceActionPanel",
          moduleName,
          eventType,
          payload: JSON.parse(payloadData || "{}"),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setStatusMessage("✅ System event dispatched successfully to Cloud Run bus.");
      } else {
        setStatusMessage("❌ Failed to dispatch system event. Check service health.");
      }
    } catch (err: any) {
      setStatusMessage(`❌ Execution Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 text-slate-100 font-sans">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏛️</span> Executive Governance Action Panel
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Direct Module Dispatcher • BEAST System 3.0
        </p>
      </div>

      <form onSubmit={handleDispatchEvent} className="space-y-4 text-xs font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">Target Submodule</label>
            <select
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="CONSTITUTION_ENGINE">CONSTITUTION_ENGINE</option>
              <option value="LUCR_TREASURY">LUCR_TREASURY</option>
              <option value="RESOURCE_ALLOCATOR">RESOURCE_ALLOCATOR</option>
              <option value="MUNICIPAL_SBT">MUNICIPAL_SBT</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Event Type</label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., GRANT_ALLOCATION"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Payload (JSON)</label>
          <textarea
            rows={3}
            value={payloadData}
            onChange={(e) => setPayloadData(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded transition-colors text-xs font-sans"
        >
          {isLoading ? "Dispatching to System Bus..." : "Dispatch System Event"}
        </button>
      </form>

      {statusMessage && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
