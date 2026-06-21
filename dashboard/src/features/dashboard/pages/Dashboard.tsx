import React from "react";
import { useDeviceSignalR } from "../hooks/useDeviceSignalR";
import { PageLayout } from "../../../layouts/PageLayout";
import { HubConnectionState } from "@microsoft/signalr";
import { CONNECTION_CONFIG } from "../constants/connectionConfig";
import { DEVICE_STATUS_UPDATE_EVENT } from "../constants/events";

const Dashboard: React.FC = () => {
  const { devices, state } = useDeviceSignalR(DEVICE_STATUS_UPDATE_EVENT);
  const isConnected = state === HubConnectionState.Connected;
  const { label, className } = CONNECTION_CONFIG[state];

  return (
    <PageLayout>
      {/* Header Section */}
      <header className="flex justify-between items-end mb-10">
        <div
          className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider border shadow-sm transition-all
            ${
              isConnected
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
            }`}
        >
          <div className={`text-xs font-bold transition-all ${className}`}>
            {label}
          </div>
        </div>
      </header>
    </PageLayout>
  );
};

export default Dashboard;
