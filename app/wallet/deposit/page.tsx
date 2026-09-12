"use client";
// @ts-nocheck

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { supabaseClient } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, Wallet, Phone, AlertCircle, Upload, Info } from "lucide-react";

const MONCASH_NUMBER = "+509 38 00 00 00"; // À personnaliser

export default function WalletDepositPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetAmounts = ["500", "1000", "2000", "5000", "10000"];

  async function handleSubmit() {
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    if (!amount || parseFloat(amount) < 100) {
      setError("Le montant minimum est de 100 HTG.");
      return;
    }
    if (!phone || phone.length < 8) {
      setError("Numéro MonCash invalide.");
      return;
    }
    if (!reference) {
      setError("Veuillez entrer la référence de transaction MonCash.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabaseClient
        .from("wallet_deposits")
        .insert({
          user_id: user.id,
          amount: amount,
          currency: "HTG",
          moncash_phone: phone,
          moncash_reference: reference,
          status: "PENDING",
        });

      if (insertError) throw insertError;

      setStep(3);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la soumission.");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto p-4 py-12">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-surface-950">Demande envoyée !</h1>
          <p className="text-surface-500">
            Votre demande de dépôt de <strong className="text-htg-600">{parseFloat(amount).toLocaleString()} HTG</strong> a été soumise. L'admin va vérifier votre paiement et créditer votre portefeuille sous <strong>30 minutes</strong>.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
            <p className="font-bold text-amber-900 text-sm">⏳ Prochaines étapes</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>• L'admin vérifie votre référence MonCash</li>
              <li>• Votre portefeuille est crédité automatiquement</li>
              <li>• Vous recevez une notification de confirmation</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={() => router.push("/wallet")} className="bg-htg-500 hover:bg-htg-600 text-white font-bold rounded-full">
              Voir mon portefeuille
            </Button>
            <Button variant="outline" onClick={() => { setStep(1); setAmount(""); setPhone(""); setReference(""); }} className="rounded-full">
              Nouveau dépôt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-surface-950">Recharger mon portefeuille</h1>
        <p className="text-surface-500 mt-1">Paiement via MonCash — Crédit sous 30 minutes</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? "bg-htg-500 text-white" : "bg-surface-100 text-surface-400"
            }`}>
              {s}
            </div>
            {s < 2 && <div className={`h-0.5 w-12 transition-all ${step > s ? "bg-htg-500" : "bg-surface-200"}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-surface-500">
          {step === 1 ? "Choisir le montant" : "Confirmer le paiement"}
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card className="border-surface-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-htg-500" />
              Montant à déposer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Preset amounts */}
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    amount === preset
                      ? "border-htg-500 bg-htg-50 text-htg-700"
                      : "border-surface-200 text-surface-600 hover:border-htg-300"
                  }`}
                >
                  {parseInt(preset).toLocaleString()} HTG
                </button>
              ))}
            </div>

            <div>
              <Label className="text-sm font-semibold">Ou entrez un montant personnalisé</Label>
              <div className="relative mt-1.5">
                <Input
                  type="number"
                  placeholder="Ex: 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-14 h-12 text-lg font-bold"
                  min="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold text-sm">HTG</span>
              </div>
              <p className="text-xs text-surface-400 mt-1">Minimum: 100 HTG</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => {
                if (!amount || parseFloat(amount) < 100) {
                  setError("Le montant minimum est de 100 HTG.");
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="w-full bg-htg-500 hover:bg-htg-600 text-white font-bold h-12 rounded-xl"
            >
              Continuer →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
            <p className="font-bold text-blue-900 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Instructions de paiement MonCash
            </p>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2"><span className="font-bold">1.</span> Ouvrez votre application MonCash</li>
              <li className="flex gap-2"><span className="font-bold">2.</span> Envoyez <strong>{parseFloat(amount).toLocaleString()} HTG</strong> au numéro :</li>
              <li className="pl-5">
                <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-1.5">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="font-mono font-bold text-blue-900">{MONCASH_NUMBER}</span>
                </div>
              </li>
              <li className="flex gap-2"><span className="font-bold">3.</span> Notez la référence de transaction</li>
              <li className="flex gap-2"><span className="font-bold">4.</span> Remplissez le formulaire ci-dessous</li>
            </ol>
          </div>

          <Card className="border-surface-200 shadow-sm">
            <CardHeader>
              <CardTitle>Confirmer votre paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center bg-surface-50 rounded-xl p-3 border">
                <span className="text-surface-500 text-sm">Montant</span>
                <span className="font-black text-htg-600 text-lg">{parseFloat(amount).toLocaleString()} HTG</span>
              </div>

              <div>
                <Label className="text-sm font-semibold">Votre numéro MonCash</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <Input
                    type="tel"
                    placeholder="+509 XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Référence de transaction MonCash</Label>
                <Input
                  placeholder="Ex: TXN-123456789"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1.5 h-11"
                />
                <p className="text-xs text-surface-400 mt-1">Trouvez la référence dans le SMS de confirmation MonCash</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  ← Retour
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-htg-500 hover:bg-htg-600 text-white font-bold"
                >
                  {isLoading ? <Spinner className="h-4 w-4" /> : "Soumettre"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
