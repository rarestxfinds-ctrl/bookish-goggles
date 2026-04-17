import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Middle/Context/Auth";
import { toast } from "@/Middle/Hook/Use-Toast";

export function useAuthRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: action 
          ? `Please sign in to ${action}` 
          : "Please sign in to use this feature",
      });
      navigate("/Sign-Up");
      return false;
    }
    return true;
  };

  const checkAuthWithToast = (action?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: action 
          ? `Please sign in to ${action}` 
          : "Please sign in to use this feature",
      });
      return false;
    }
    return true;
  };

  return { user, requireAuth, checkAuthWithToast };
}
