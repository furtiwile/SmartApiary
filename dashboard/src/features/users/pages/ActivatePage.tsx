import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Lock, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import { useApis } from "../../../shared/api/useApis";
import { PageLayout } from "../../../layouts/PageLayout";

const activateSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ActivateSchemaType = z.infer<typeof activateSchema>;

export function ActivatePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { auth } = useApis();
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [isActivated, setIsActivated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivateSchemaType>({
    resolver: zodResolver(activateSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: ActivateSchemaType) {
    if (!token) {
      notifyError("Activation failed", "Activation token is missing.");
      return;
    }

    try {
      const result = await auth.activate(token, data.password);
      if (result.success) {
        notifySuccess(
          "Account activated",
          "Your account has been successfully activated. You can now sign in.",
          { duration: 6000 }
        );
        setIsActivated(true);
      } else {
        notifyError("Activation failed", result.message ?? "Failed to activate account. The link might be expired or invalid.");
      }
    } catch {
      notifyError("Activation failed", "An unexpected error occurred.");
    }
  }

  // If token is missing, show an alert state
  if (!token) {
    return (
      <PageLayout>
        <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
          <div className="p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-rose-500/30 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 mb-4">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Invalid Activation Link
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              The activation token is missing from your link. Please make sure to copy the entire URL from the activation email.
            </p>
            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
              >
                Go to Sign in
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show nice success confirmation card with navigation button
  if (isActivated) {
    return (
      <PageLayout>
        <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
          <div className="p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-500/30 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 mb-4 animate-bounce">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Account Activated!
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Your password has been set and your account is ready. Click below to sign in to your dashboard.
            </p>
            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
              >
                Sign in to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
        <form name="activate" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 mb-4">
                <KeyRound className="h-6 w-6 text-indigo-500" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Activate your account
              </h1>
              <p className="text-sm text-slate-400 mt-1">Set a password to complete registration</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  autoFocus
                  className={`block w-full rounded-lg border ${
                    errors.password
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  } bg-slate-800/80 pl-10 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-shadow`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="mt-5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
                Confirm Password
              </label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`block w-full rounded-lg border ${
                    errors.confirmPassword
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  } bg-slate-800/80 pl-10 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-shadow`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-500">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {isSubmitting ? "Activating account…" : "Activate account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
