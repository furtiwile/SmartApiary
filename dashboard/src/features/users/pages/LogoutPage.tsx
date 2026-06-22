import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/AuthHook";



export function LogoutPage() {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthed && user)
      logout();
    navigate("/");
  })

  return <></>;
}
