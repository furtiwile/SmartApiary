import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import { useApis } from "../../../shared/api/useApis";
import { PageLayout } from "../../../layouts/PageLayout";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Password confirmation must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { auth } = useApis();
  const { success, error } = useNotify();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: ResetPasswordSchemaType) {
    if (!token) {
      error("Reset failed", "No valid reset token found in the URL.");
      return;
    }

    try {
      const result = await auth.resetPassword(token, data.password);
      if (result.success) {
        success(
          "Password reset successful",
          "Your password has been reset successfully. You can now log in with your new password."
        );
        navigate("/login");
      } else {
        error("Reset failed", result.message ?? "Failed to reset password. The link might be expired.");
      }
    } catch (err) {
      console.error(err);
      error("Reset failed", "An unexpected error occurred.");
    }
  }

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="p-8 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 mb-4">
              <KeyRound className="h-6 w-6 text-indigo-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reset password
            </h1>
            <p className="text-sm text-slate-500 mt-1">Please enter your new password below</p>
          </div>

          {!token ? (
            <div className="space-y-6">
              <div className="flex gap-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <h4 className="font-semibold">Invalid reset link</h4>
                  <p className="mt-1">
                    The link you followed does not contain a valid security token. Please request a new password reset link from the login page.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  New Password
                </label>
                <div className="mt-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`block w-full rounded-lg border ${
                      errors.password
                        ? "border-rose-300 dark:border-rose-600 focus:ring-rose-500"
                        : "border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                    } bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow`}
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
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
                        ? "border-rose-300 dark:border-rose-600 focus:ring-rose-500"
                        : "border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                    } bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-rose-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Resetting password…" : "Reset password"}
                </button>
              </div>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
