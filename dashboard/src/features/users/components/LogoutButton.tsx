import React from "react";

type LogoutButtonProps = {
  logout: () => void;
};

const LogoutButton: React.FC<LogoutButtonProps> = ({ logout }) => (
  <button
    type="button"
    onClick={logout}
    aria-label="Logout"
    className="inline-flex m-auto h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  </button>
);

export default LogoutButton;
