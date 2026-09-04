"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        <p className="mt-1 text-surface-400">Configurez les paramètres de la plateforme</p>
      </div>

      <Card className="border-surface-700 bg-surface-800">
        <CardHeader>
          <CardTitle>Paramètres généraux</CardTitle>
        </CardHeader>
        <CardContent>
          {saved && (
            <Alert variant="success" className="mb-4">
              <AlertDescription>Paramètres sauvegardés avec succès.</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Nom de la plateforme</Label>
              <Input defaultValue="Game Top-Up" className="mt-1" />
            </div>
            <div>
              <Label>Devise par défaut</Label>
              <Input defaultValue="HTG" className="mt-1" />
            </div>
            <div>
              <Label>Email de support</Label>
              <Input type="email" defaultValue="support@game-topup.com" className="mt-1" />
            </div>
            <div>
              <Label>WhatsApp support</Label>
              <Input placeholder="+509 XXX XXX XXX" className="mt-1" />
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit">Sauvegarder</Button>
              <Button type="button" variant="outline">Réinitialiser</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}