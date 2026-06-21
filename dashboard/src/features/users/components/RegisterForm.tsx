import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Phone, User, Shield } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import type { UserRole } from "../models/UserRole";
import { useApis } from "../../../shared/api/useApis";

const MIN_NAME_LEN = 2;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "Farmer", label: "🌾 Farmer" },
  { value: "Beekeeper", label: "🐝 Beekeeper" },
];

const schema = z.object({
  firstName: z.string().min(MIN_NAME_LEN, `First name must be at least ${MIN_NAME_LEN} characters.`),
  lastName: z.string().min(MIN_NAME_LEN, `Last name must be at least ${MIN_NAME_LEN} characters.`),
  email: z.string().email("Please enter a valid email address."),
  phoneNumber: z.string().min(6, "Please enter a valid phone number."),
  role: z.enum(["Farmer", "Beekeeper", "Admin"] as const),
});

type SchemaType = z.infer<typeof schema>;

export function RegisterForm() {
  const { success, error } = useNotify();
  const navigate = useNavigate();
  const { auth } = useApis();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phoneNumber: "", role: "Farmer" },
  });

  const watchRole = useWatch({ control, name: "role" });

  async function onSubmit(data: SchemaType) {
    try {
      const result = await auth.register(data.email, data.firstName, data.lastName, data.phoneNumber, data.role as "Farmer" | "Beekeeper" | "Admin");

      if (result.success) {
        success(
          "Account created",
          `An activation email has been sent to ${data.email}. The user must check their inbox to activate the account.`,
          { duration: 8000 }
        );
        navigate("/dashboard");
      } else {
        error("Registration failed", result.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      error("Registration failed", "An unexpected error occurred.");
    }
  }

  return (
    <form name="register" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-8 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 mb-4">
            <UserPlus className="h-6 w-6 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create account
          </h1>
          <p className="text-sm text-slate-500 mt-1">Admin action — invite a new user</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              First name
            </label>
            <div className="mt-2 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="first-name"
                type="text"
                placeholder="Jane"
                {...register("firstName")}
                autoFocus
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            {errors.firstName && <p className="mt-1 text-xs text-rose-500">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Last name
            </label>
            <div className="mt-2 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="last-name"
                type="text"
                placeholder="Doe"
                {...register("lastName")}
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            {errors.lastName && <p className="mt-1 text-xs text-rose-500">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="mt-5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <div className="mt-2 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register("email")}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="mt-5">
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Phone number
          </label>
          <div className="mt-2 relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="phone"
              type="tel"
              placeholder="+381 60 000 0000"
              {...register("phoneNumber")}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-xs text-rose-500">{errors.phoneNumber.message}</p>}
        </div>

        {/* Role */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Role
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue("role", value as "Farmer" | "Beekeeper" | "Admin")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  watchRole === value
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                <Shield className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
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
              <UserPlus className="h-4 w-4" />
            )}
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </div>
      </div>
    </form>
  );
}
