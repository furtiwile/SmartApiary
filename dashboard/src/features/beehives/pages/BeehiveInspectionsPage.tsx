import { useEffect, useState } from "react";
import { PageLayout } from "../../../layouts/PageLayout";
import type { BeehiveInspection } from "../models/BeehiveInspection";
import { BeehiveInspectionApi } from "../api/beehiveInspectionApi";
import { BeehiveInspectionList } from "../components/BeehiveInspectionList";
import { useParams } from "react-router-dom";
import { BeehiveInspectionUploadModal } from "../components/BeehiveInspectionUploadModal";



// `default` must stay!
export default function BeehiveInspectionsPage() {
  const [inspections, setInspections] = useState<BeehiveInspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hiveId } = useParams<{hiveId: string}>();
  // const {user} = useAuth();

  if (!hiveId) {
    return <div>[ERROR] Invalid Hive ID, bruh (got: {hiveId})</div>;
  }

  useEffect(() => {
    (async function() {
      const _inspections = await BeehiveInspectionApi.getByHiveId(hiveId);
      if (_inspections)
        setInspections(_inspections);
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
          Loading inspections...{" "}
        </span>{" "}
      </div>
    );

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Inspections Collection
          </h1>
          <p className="text-slate-400 text-sm">
            Overview and management of all inspections in the system.
          </p>
        </div>

        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          Register New Inspection
        </button>
      </div>

      {/* Why are we checking if it's loading twice? */}
      {/* Table */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <span className="ml-3 text-slate-400 font-medium">
              Loading inspections...
            </span>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="px-6 py-4 align-middle text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                  ID
                </th>
                <th className="px-6 py-4 align-middle text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Inspection Date
                </th>
                <th className="px-6 py-4 align-middle text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Bottom Board Color
                </th>
                <th className="px-6 py-4 align-middle text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Honey Frames
                </th>
                <th className="px-6 py-4 align-middle text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Honey Amount
                </th>
                <th className="px-6 py-4 align-middle text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Brood Frames
                </th>
                <th className="px-6 py-4 align-middle text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Is Queen Present
                </th>
                <th className="px-6 py-4 align-middle text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Note
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <BeehiveInspectionList inspections={inspections} />
            </tbody>
          </table>
        )}
      </div>
      <BeehiveInspectionUploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hiveId={hiveId}
      />
    </PageLayout>
  );
}
