import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../hooks/AuthHook";
import { AuthApi } from "../api/AuthApi";
import { PageLayout } from "../../../layouts/PageLayout";

const MIN_EMAIL_LEN = 6;
const MIN_PASSWD_LEN = 8;

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthed, user, login } = useAuth();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthed && user) {
      navigate(`/dashboard`);
    }
  }, [isAuthed, user, navigate]);

  async function handleForgotPassword(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (!email || email.length < MIN_EMAIL_LEN) {
      alert("Please enter a valid email address first to reset your password.");
      return;
    }

    const result = await AuthApi.forgotPassword(email);

    if (result.success) {
      alert(result.message || "Password reset instructions have been sent to your email!");
    } else {
      alert("Failed to send reset email: " + result.message);
    }
  }

  async function sendForm(event: React.SubmitEvent) {
    event.preventDefault();

    const _email = email;
    const _password = password;

    setEmail("");
    setPassword("");
    
    if (_email.length < MIN_EMAIL_LEN) {
      console.error(
        `Input for email is too short.\nShould be: ${MIN_EMAIL_LEN}; Given: ${_email.length}`,
      );
      return;
    }
    
    if (_password.length < MIN_PASSWD_LEN) {
      console.error(
        `Input for password is too short.\nShould be: ${MIN_PASSWD_LEN}; Given: ${_password.length}`,
      );
      return;
    }
    
    AuthApi.login(_email, _password)
      .then((result) => {
        console.log("Login result: ", result);
        if (result.data) {
          login(result.data.token);
          return;
        }

        setEmail("");
        setPassword("");
        alert("Unknown error: Something went wrong...\n" + result.message);
      });
  }

  return (
    <PageLayout>
      <header className="flex justify-center items-end mb-10">
        <div>
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white tracking-tight">
            Login
          </h1>
        </div>
      </header>
      
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form name="login" onSubmit={sendForm} className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  minLength={MIN_EMAIL_LEN}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoFocus
                  tabIndex={1}
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  minLength={MIN_PASSWD_LEN}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  tabIndex={2}
                  autoComplete="current-password"
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mt-2 text-right text-sm">
                <a 
                  href="#" 
                  onClick={handleForgotPassword}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300" 
                  tabIndex={5}
                >
                  Forgot password?
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4 mt-6">
            <Link to="/register" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300" tabIndex={4}>
              Don't have an account? Register
            </Link>
            <button 
              type="submit" 
              className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors" 
              tabIndex={3}
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}