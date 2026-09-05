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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword, error, isLoading } = useAuth();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
            <Gamepad2 className="h-8 w-8 text-surface-50" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-surface-50">TOPUP+</h1>
          <p className="mt-1 text-sm text-surface-400">Réinitialiser le mot de passe</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>Entrez votre email pour recevoir un lien de réinitialisation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="mt-1" />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Envoyer le lien
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <Link href="/auth/login" className="font-medium text-brand-400 hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}