import React, { useEffect, useState } from "react";

import { PageLayout } from "../../../layouts/PageLayout";
import type { Apiary } from "../models/Apiary";
import { useAuth } from "../../users/hooks/AuthHook";
import { ApiaryApi } from "../api/apiaryApi";
import { ApiaryList } from "../components/ApiaryList";
import { ApiaryUploadModal } from "../components/ApiaryUploadModal";

export function ApiariesPage() {
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    (async function() {
      const _apiaries = await ApiaryApi.getAll();
      // const _apiaries = await ApiaryApi.getAllByBeekeeper(user.id);
      if (_apiaries)
        setApiaries(_apiaries);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-20">
        {" "}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>{" "}
        <span className="ml-3 text-slate-400 font-medium">
          {" "}
          Loading apiaries...{" "}
        </span>{" "}
      </div>
    );

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Apiary Collection
          </h1>
          <p className="text-slate-400 text-sm">
            Overview and management of all apiaries in the system.
          </p>
        </div>

        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          Create New Apiary
        </button>
      </div>

      {/* Why are we checking if it's loading twice? */}
      {/* Table */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <span className="ml-3 text-slate-400 font-medium">
              Loading apiaries...
            </span>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="px-6 py-4 align-middle text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Thumbnail
                </th>
                <th className="px-6 py-4 align-middle text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-6 py-4 align-middle text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Geographical Coordinates
                </th>
                <th className="px-6 py-4 align-middle text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Terrain Description
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <ApiaryList apiaries={apiaries} />
            </tbody>
          </table>
        )}
      </div>
      <ApiaryUploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PageLayout>
  );
}
