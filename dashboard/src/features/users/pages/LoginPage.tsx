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
  const {isAuthed, user, login} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthed && user)
      navigate(`/dashboard`);
  }, [isAuthed, user, navigate]);



  async function sendForm(event: React.FormEvent) {
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
      .then((result)=>{
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
      <header className="flex justify-between items-end mb-10">
        <div >
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Login page
          </h1>
          <p className="text-slate-400 text-sm">
            Provide account credentials to log in.
          </p>
        </div>
      </header>
      <div className="mt-10 sm:mx-auto sm:w-full sm:mac-w-sm">
        <form action="" name="login" onSubmit={sendForm} className="space-y-6">
          <div className="p-4 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
            
            {/* Email stuff */}
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Enter your email"
                minLength={MIN_EMAIL_LEN}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
                tabIndex={1}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
            
            {/* Password stuff */}
            <div className="flex items-center justify-between mt-6">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Password </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300" tabIndex={5}>Forgot password?</a>
              </div>
            </div>
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
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300" tabIndex={4}>
              No account? Register instead
            </Link>
            <button type="submit" className="flex w-50 justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" tabIndex={3}>
              Log in
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
