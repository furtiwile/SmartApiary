import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthHook";
import { LoginForm } from "../components/LoginForm";
import { PageLayout } from "../../../layouts/PageLayout";

export function LoginPage() {
  const { isAuthed, user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthed && user) {
      navigate("/dashboard");
    }
  }, [isAuthed, user, navigate]);

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm onSuccess={login} />
      </div>
    </PageLayout>
  );
}