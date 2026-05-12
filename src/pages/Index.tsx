import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
}