import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";
import { toast } from "sonner";
import { Boxes, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  const { bootstrapAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20 text-warning-foreground">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle>Firebase not configured</CardTitle>
            <CardDescription>
              StockNova needs your Firebase web config to connect. Add the following environment variables and reload:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...`}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await bootstrapAdmin(email, password, name);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Boxes className="h-6 w-6" />
          </div>
          <CardTitle>Initial setup</CardTitle>
          <CardDescription>Create the first account. The first user becomes admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}