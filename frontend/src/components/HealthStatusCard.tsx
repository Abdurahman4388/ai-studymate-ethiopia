"use client";

import React, { useEffect, useState } from "react";
import { Server, Database, HardDrive, Cpu, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { fetchHealthStatus, HealthResponse } from "../lib/api";
import { useTranslation } from "../context/LanguageContext";

export function HealthStatusCard() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthStatus();
      if (data) {
        setHealth(data);
      } else {
        setError("Backend API is currently offline. Ensure FastAPI is running on port 8000.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to contact backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              {t("health.title")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {health?.environment ? `Environment: ${health.environment} (v${health.version})` : "Diagnostics monitor"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={checkHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Backend Server Status */}
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("health.backend")}
            </span>
            {health ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("health.online")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                <XCircle className="h-3.5 w-3.5" />
                {t("health.offline")}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-2">
            FastAPI 0.151.0
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Port: 8000</p>
        </div>

        {/* PostgreSQL Database Status */}
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("health.database")}
            </span>
            {health?.database.connected ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("health.online")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("health.degraded")}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-2 flex items-center gap-1.5">
            <Database className="h-4 w-4 text-indigo-500" />
            <span>PostgreSQL 18</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {health?.database.latency_ms !== undefined && health.database.latency_ms !== null
              ? `Latency: ${health.database.latency_ms} ms`
              : "Checking credentials..."}
          </p>
        </div>

        {/* Storage Status */}
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("health.storage")}
            </span>
            {health?.storage.accessible ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("health.online")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                Pending
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-2 flex items-center gap-1.5">
            <HardDrive className="h-4 w-4 text-emerald-500" />
            <span>Local Storage</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
            {health?.storage.target_path || "storage/uploads"}
          </p>
        </div>

        {/* AI Provider Status */}
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("health.aiProvider")}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ready
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-2 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-purple-500" />
            <span className="capitalize">{health?.ai_provider || "Mock Dev"} Provider</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {t("health.supportedLangs")}: EN, AM, OM
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
          <strong>Note:</strong> {error}
        </div>
      )}
    </div>
  );
}
