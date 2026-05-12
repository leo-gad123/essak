import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Boxes } from "lucide-react";

export default function Auth() {
  const { signIn, bootstrapAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "setup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      // If no users exist yet, suggest setup
      const snap = await get(ref(db, "users")).catch(() => null);
      if (!snap || !snap.exists()) {
        toast.error("No users found — switch to Setup to create the first admin.");
        setMode("setup");
      } else {
        toast.error((err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  const onSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await bootstrapAdmin(email, password, name);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Boxes className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">StockNova</CardTitle>
          <CardDescription>Inventory & stock management</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "setup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="setup">First-time setup</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={onSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="setup">
              <form onSubmit={onSetup} className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground">
                  Use this only for the first account. The first user becomes admin.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="name">Display name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-email">Email</Label>
                  <Input id="setup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-password">Password</Label>
                  <Input id="setup-password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}