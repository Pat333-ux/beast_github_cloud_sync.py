import React from "react";
import Link from "next/link";

export default function BeastSystemDashboard() {
  const backendUrl = process.env.SERVICE_URL || "https://beastsystem-70875693050.us-central1.run.app";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded-full border border-emerald-500/20">
                SYSTEM ONLINE 3.0
              </span>
              <span className="text-xs text-slate-400 font-mono">ORG: pat333-ux</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2 text-white">
              BEAST System Digital Constitution Engine
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              New World Order Private Government DAO LLC — Executive Governance & Cloud Infrastructure
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <div>Governing Officer: Pat Tarwater Jr.</div>
            <div className="text-emerald-400 mt-1">● Cloud Run Active</div>
          </div>
        </header>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Cloud Run Backend</h3>
            <p className="text-lg font-semibold text-white truncate">beastsystem</p>
            <a 
              href={backendUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono underline block truncate"
            >
              {backendUrl}
            </a>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Web3 Governance</h3>
            <p className="text-lg font-semibold text-white">Lucricity Protocol (LUCR)</p>
            <span className="text-xs text-emerald-400 font-mono">ERC-20Votes & Governor Active</span>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">System Bus</h3>
            <p className="text-lg font-semibold text-white">Event Dispatcher</p>
            <span className="text-xs text-indigo-400 font-mono">HMAC SHA-256 Synchronized</span>
          </div>

        </div>

        {/* Action Controls / Modules */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Active System Submodules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <h4 className="font-semibold text-indigo-400 text-sm">Constitutional Rules Engine</h4>
              <p className="text-xs text-slate-400">Manages member rights, eligibility workflows, and automated program assessments across nodes.</p>
              <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">/api/v1/constitution</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <h4 className="font-semibold text-indigo-400 text-sm">GitHub Webhook Dispatcher</h4>
              <p className="text-xs text-slate-400">Handles incoming CI/CD push events and repository sync triggers from `pat333-ux` repositories.</p>
              <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">/api/v1/webhooks/github</span>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 pt-8 border-t border-slate-900 font-mono">
          BEAST System 3.0 • Sovereign Autonomous Intelligence Architecture • pat333-ux
        </footer>

      </div>
    </main>
  );
}
