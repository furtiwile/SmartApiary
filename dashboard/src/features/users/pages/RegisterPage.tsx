import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md relative">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-0 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </button>
        <RegisterForm />
      </div>
    </PageLayout>
  );
}