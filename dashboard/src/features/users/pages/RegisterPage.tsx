import { useState, useEffect } from "react";
import { Link } from "react-router";

import { useNavigate } from "react-router";
import { useAuth } from "../hooks/AuthHook";
import { AuthApi } from "../api/AuthApi";
import { PageLayout } from "../../../layouts/PageLayout";
import type { UserRole } from "../models/UserRole";
import { AuthValidation } from "../helpers/AuthValidation";


const MIN_NAME_LEN = 2;
const MIN_EMAIL_LEN = 6;
const MIN_PASSWD_LEN = 8;



export function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("Unknown");
  const {isAuthed, user, login} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthed && user) 
      // navigate(`/premium-dashboard`);
      navigate(`/dashboard`);
  }, [isAuthed, navigate, user]);



  async function sendForm(event: React.FormEvent) {
    event.preventDefault();


    if (firstName.length < MIN_NAME_LEN) {
      alert(
        `Input for first name is too short.\nShould be: ${MIN_NAME_LEN}; Given: ${firstName.length}`,
      );
      return;
    }

    if (lastName.length < MIN_NAME_LEN) {
      alert(
        `Input for first name is too short.\nShould be: ${MIN_NAME_LEN}; Given: ${lastName.length}`,
      );
      return;
    }
  
    if (email.length < MIN_EMAIL_LEN && AuthValidation.isEmailValid(email)) {
      alert(
        `Input for email is too short.\nShould be: ${MIN_EMAIL_LEN}; Given: ${email.length}`,
      );
      return;
    }
  
    if (AuthValidation.isPasswordValid(password)) {
      alert(
        `Input for password is too short.\nShould be: ${MIN_PASSWD_LEN}; Given: ${password.length}`,
      );
      return;
    }

    if (AuthValidation.isPasswordValid(confirmPassword)) {
      alert(
        `Input for confirmed password is too short.\nShould be: ${MIN_PASSWD_LEN}; Given: ${confirmPassword.length}`,
      );
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords don\'t match");
      return;
    }

    if (phoneNumber.length < 6) {
      alert("Phone number is invalid");
      return;
    }

    // Role doesn't need to be changed, since I'm form's select options are fine
  
    const result = await AuthApi.register(email, password, firstName, lastName, phoneNumber, role);

    // Once registered, log in automatically with user-inputted parameters
    if (result.success && result.data) {
      login(result.data);
      return;
    }

    setEmail("");
    setPassword("");
    alert("Unknown error: Something went wrong...\n" + result.msg);
  }
  

  
  return (
    <>
      <PageLayout>
        <header className="flex justify-between items-end mb-10">
          <div >
            <h1 className="text-2xl font-bold text-black tracking-tight">
              Register page
            </h1>
            <p className="text-slate-400 text-sm">
              Provide new account credentials &amp; info to register.
            </p>
          </div>
        </header>
        <div className="mt-10 sm:mx-auto sm:w-full sm:mac-w-sm">
          <form action="" name="register" onSubmit={sendForm} className="space-y-6">
            <div className="p-4 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
              {/* First name stuff */}
              <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">First name </label>
              <div className="mt-2">
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  placeholder="Enter your first name"
                  minLength={MIN_NAME_LEN}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoFocus
                  tabIndex={1}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>

              {/* First name stuff */}
              <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900 mt-6">Last name </label>
              <div className="mt-2">
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  placeholder="Enter your last name"
                  minLength={MIN_NAME_LEN}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  autoFocus
                  tabIndex={1}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
              
              {/* Email stuff */}
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 mt-6">Email </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  minLength={MIN_EMAIL_LEN}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoFocus
                  tabIndex={1}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>

              {/* Password stuff */}
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 mt-6">Password </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  minLength={MIN_PASSWD_LEN}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>

              {/* Confirm Password stuff */}
              <label htmlFor="confirm-password" className="block text-sm/6 font-medium text-gray-900 mt-6">Confirm password </label>
              <div className="mt-2">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  minLength={MIN_PASSWD_LEN}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>

              {/* Phone Number stuff */}
              <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900 mt-6">Phone number </label>
              <div className="mt-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  minLength={6} // idk how many digits one phone number can minimally have
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  required
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>

              {/* Phone Number stuff */}
              <label htmlFor="role" className="block text-sm/6 font-medium text-gray-900 mt-6">Role </label>
              <div className="mt-2">
                {/*<input
                  id="role"
                  name="role"
                  type="tel"
                  placeholder="Enter your phone number"
                  minLength={6} // idk how many digits one phone number can minimally have
                  onChange={(event) => setRole(event.target.value)}
                  required
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />*/}
                <select
                  name="role"
                  id="role"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  defaultValue="Unknown"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Beekeper">Beekeper</option>
                </select>
              </div>
            </div>
    
            <div className="flex items-center justify-between mt-6">
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Already have an account? Log in instead
              </Link>
              <button type="submit" className="flex w-50 justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                Register
              </button>
            </div>
          </form>
        </div>
      </PageLayout>
    </>
  );
}
