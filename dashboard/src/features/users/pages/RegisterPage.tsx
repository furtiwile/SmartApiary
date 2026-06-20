import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthHook";
import { AuthApi } from "../api/AuthApi";
import { PageLayout } from "../../../layouts/PageLayout";
import type { UserRole } from "../models/UserRole";

const MIN_NAME_LEN = 2;
const MIN_EMAIL_LEN = 6;

export function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("Unknown");

  const { isAuthed, user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthed && user?.role !== "Admin") {
      navigate(`/dashboard`);
    }
  }, [isAuthed, navigate, user]);

  async function sendForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (firstName.length < MIN_NAME_LEN) {
      alert(
        `Input for first name is too short.\nShould be: ${MIN_NAME_LEN}; Given: ${firstName.length}`,
      );
      return;
    }

    if (lastName.length < MIN_NAME_LEN) {
      alert(
        `Input for last name is too short.\nShould be: ${MIN_NAME_LEN}; Given: ${lastName.length}`,
      );
      return;
    }
  
    if (email.length < MIN_EMAIL_LEN) {
      alert(
        `Input for email is too short.\nShould be: ${MIN_EMAIL_LEN}; Given: ${email.length}`,
      );
      return;
    }

    if (phoneNumber.length < 6) {
      alert("Phone number is invalid");
      return;
    }

    const result = await AuthApi.register(email, firstName, lastName, phoneNumber, role);

    if (result.success) {
      alert("Account created. Check your email for activation instructions.");
      navigate("/login");
      return;
    }

    setEmail("");
    alert("Unknown error: Something went wrong...\n" + result.message);
  }
  
  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-md">
        <form name="register" onSubmit={sendForm} className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white tracking-tight mb-8">
              Register
            </h1>

            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                First name
              </label>
              <div className="mt-2">
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  placeholder="Enter your first name"
                  minLength={MIN_NAME_LEN}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoFocus
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Last name
              </label>
              <div className="mt-2">
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  placeholder="Enter your last name"
                  minLength={MIN_NAME_LEN}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-6">
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
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Phone number
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  required
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Role
              </label>
              <div className="mt-2">
                <select
                  name="role"
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-base text-slate-900 dark:text-white focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                >
                  <option value="Unknown" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Unknown</option>
                  <option value="Farmer" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Farmer</option>
                  <option value="Beekeeper" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Beekeeper</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4 border-t border-slate-200 dark:border-slate-700/60 pt-6 mt-8">
              <Link to="/login" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                Already have an account? Log in
              </Link>
              <button 
                type="submit" 
                className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
              >
                Register
              </button>
            </div>

          </div>
        </form>
      </div>
    </PageLayout>
  );
}