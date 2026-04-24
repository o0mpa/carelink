import { useEffect } from "react";
import { useNavigate } from "react-router";
import { isLoggedIn, getRole } from "~/utils/auth";

export function useAuth(allowedRole?: "Client" | "Caregiver") {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    if (allowedRole && getRole() !== allowedRole) {
      // Redirect to their actual dashboard instead of denying access
      const role = getRole();
      navigate(role === "Caregiver" ? "/dashboard/caregiver" : "/dashboard/client");
    }
  }, []);
}