import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading, configured } = useAuth();
  if (!configured) return <Navigate to="/setup" />;
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
