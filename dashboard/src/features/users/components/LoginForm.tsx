import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import { AuthApi } from "../api/AuthApi";
import { useNotify } from "../../../hooks/useNotify";


const MIN_EMAIL_LEN = 6;
const MIN_PASSWD_LEN = 8;

interface LoginFormProps {
  onSuccess: (token: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useNotify();

  async function handleForgotPassword(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (!email || email.length < MIN_EMAIL_LEN) {
      notify({
        type: "warning",
        title: "Email required",
        message: "Please enter a valid email address first to reset your password.",
      });
      return;
    }

    const result = await AuthApi.forgotPassword(email);

    if (result.success) {
      notify({
        type: "success",
        title: "Reset email sent",
        message: result.message ?? "Password reset instructions have been sent to your email.",
      });
    } else {
      notify({
        type: "error",
        title: "Reset failed",
        message: result.message ?? "Failed to send reset email. Please try again.",
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const _email = email;
    const _password = password;

    if (_email.length < MIN_EMAIL_LEN) {
      notify({ type: "error", title: "Invalid email", message: "Email address is too short." });
      return;
    }

    if (_password.length < MIN_PASSWD_LEN) {
      notify({
        type: "error",
        title: "Invalid password",
        message: `Password must be at least ${MIN_PASSWD_LEN} characters.`,
      });
      return;
    }

    setIsSubmitting(true);
    setEmail("");
    setPassword("");

    try {
      const result = await AuthApi.login(_email, _password);
      if (result.data) {
        onSuccess(result.data.token);
      } else {
        notify({
          type: "error",
          title: "Login failed",
          message: result.message ?? "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form name="login" onSubmit={handleSubmit} className="space-y-6">
      <div className="p-8 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 mb-4">
            <LogIn className="h-6 w-6 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to SmartApiary</p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <div className="mt-2 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              minLength={MIN_EMAIL_LEN}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              tabIndex={1}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <a
              href="#"
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
              tabIndex={4}
            >
              Forgot password?
            </a>
          </div>
          <div className="mt-2 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={MIN_PASSWD_LEN}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              tabIndex={2}
              autoComplete="current-password"
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            tabIndex={3}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </div>
    </form>
  );
}
