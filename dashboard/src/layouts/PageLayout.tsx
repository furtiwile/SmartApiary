import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center p-4 sm:p-8 transition-colors duration-300 bg-slate-950 text-slate-200">
      <div className="max-w-md w-full mx-auto p-8 border-4 border-slate-800/40 rounded-2xl bg-slate-900/50 backdrop-blur-md shadow-2xl">
        {children}
      </div>
    </div>
  );
};