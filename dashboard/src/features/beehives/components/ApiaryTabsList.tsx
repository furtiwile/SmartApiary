import * as Tabs from "@radix-ui/react-tabs";
import { ChevronRight } from "lucide-react";
import type { ApiaryDto } from "../models/Apiary";
import noImage from "../../../assets/no-image.svg";

function imageOrFallback(src?: string) {
  return src?.trim() ? src : noImage;
}

interface ApiaryTabsListProps {
  apiaries: ApiaryDto[];
}

export function ApiaryTabsList({ apiaries }: ApiaryTabsListProps) {
  return (
    <Tabs.List className="flex gap-1 overflow-x-auto mb-4 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
      {apiaries.map((apiary) => (
        <Tabs.Trigger
          key={apiary.id}
          value={apiary.id}
          className="group flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:text-slate-200 data-[state=active]:bg-slate-800 data-[state=active]:text-amber-400 data-[state=active]:shadow-sm"
        >
          <img
            src={imageOrFallback(apiary.thumbnailUrl || apiary.imageUrl)}
            alt=""
            className="h-7 w-7 rounded-md object-cover border border-slate-700"
            onError={(event) => {
              event.currentTarget.src = noImage;
            }}
          />
          {apiary.name}
          <ChevronRight className="h-3 w-3 opacity-0 group-data-[state=active]:opacity-100 text-amber-400 transition-opacity" />
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  );
}
