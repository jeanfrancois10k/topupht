import { Search, Wallet, Zap, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    emoji: "🎮",
    title: "Choisir un jeu",
    description: "Parcourez notre catalogue : Free Fire, Mobile Legends, PUBG, Roblox et bien d'autres.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Wallet,
    emoji: "💸",
    title: "Payer",
    description: "Payez via votre Solde TOPUP+ ou par MonCash Manuel. Trouvez un marchand près de chez vous.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "Livraison Auto",
    description: "Votre recharge est traitée automatiquement en quelques secondes après validation.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: PartyPopper,
    emoji: "🎉",
    title: "Profitez !",
    description: "Vos diamants ou crédits sont dans votre compte de jeu. Le support est toujours disponible.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface-900 border-t border-surface-800 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Comment ça marche ?</h2>
          <p className="mt-2 text-surface-400">En 4 étapes simples, rechargez votre compte de jeu.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center p-5 rounded-2xl bg-surface-800 border border-surface-700">
              {/* Step number */}
              <div className="absolute -top-3 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-htg-500 text-xs font-black text-white">
                {i + 1}
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} mb-4 text-3xl`}>
                {step.emoji}
              </div>
              <h3 className={`text-base font-bold ${step.color}`}>{step.title}</h3>
              <p className="mt-2 text-xs text-surface-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}