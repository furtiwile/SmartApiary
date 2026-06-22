import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto p-8">
        {children}
      </div>
    </div>
  );
};