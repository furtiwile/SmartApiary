import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthApi } from "../api/AuthApi";
import { isActivateFailure } from "../models/AuthResult";
import { PageLayout } from "../../../layouts/PageLayout";

const MIN_PASSWORD_LEN = 8;

export function ActivatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendForm(event: React.FormEvent) {
    event.preventDefault();

    if (!token) {
      alert("Activation token is missing from URL.");
      return;
    }

    if (password.length < MIN_PASSWORD_LEN) {
      alert(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }

    if (password !== passwordConfirm) {
      alert("Password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await AuthApi.activate(token, password);
    setIsSubmitting(false);

    if (isActivateFailure(result)) {
      alert(result.message);
      return;
    }

    alert(result.message || "Account activated successfully.");
    navigate("/login");
  }

  return (
    <PageLayout>
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Activate account</h1>
          <p className="text-slate-400 text-sm">Set your password to activate your account.</p>
        </div>
      </header>

      <div className="mt-10 sm:mx-auto sm:w-full sm:mac-w-sm">
        <form name="activate" onSubmit={sendForm} className="space-y-6">
          <div className="p-4 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Password</label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                minLength={MIN_PASSWORD_LEN}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoFocus
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>

            <label htmlFor="password-confirm" className="block text-sm/6 font-medium text-gray-900 mt-6">Confirm password</label>
            <div className="mt-2">
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                minLength={MIN_PASSWORD_LEN}
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                required
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Back to login
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-50 justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm/6 font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {isSubmitting ? "Activating..." : "Activate"}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
