"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gamepad2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, error, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(email, password);
    if (!result.error) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Game Top-Up</h1>
          <p className="mt-1 text-sm text-surface-400">Connexion à votre compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>Connectez-vous pour accéder à votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1" />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Se connecter
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <p className="text-surface-400">
                Pas encore de compte ?{" "}
                <Link href="/auth/register" className="font-medium text-brand-400 hover:underline">
                  Créer un compte
                </Link>
              </p>
              <p className="mt-2 text-surface-500">
                Mot de passe oublié ?{" "}
                <Link href="/auth/forgot-password" className="font-medium text-brand-400 hover:underline">
                  Réinitialiser
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}