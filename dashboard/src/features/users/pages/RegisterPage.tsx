import { PageLayout } from "../../../layouts/PageLayout";
import { RegisterForm } from "../components/RegisterForm";

/**
 * RegisterPage is only reachable for Admin users (guarded by AdminRoute in routes.tsx).
 * The page itself is a thin wrapper — all logic lives in RegisterForm.
 */
export function RegisterPage() {
  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </PageLayout>
  );
}