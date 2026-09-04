# ARCHITECTURE - GAME TOP-UP HAITI

## Vue d'Ensemble

L'architecture de TOPUP+ est conçue pour être modulaire, sécurisée et évolutive. Elle suit les principes suivants :

- **Séparation des responsabilités** : UI, logique métier, et accès aux données sont séparés
- **Sécurité** : RLS activé, secrets côté serveur, validation côté serveur
- **Intégrité financière** : Ledger system, idempotence, audit logs
- **Extensibilité** : Adapters pour providers externes (top-up, paiement)
- **Mobile-first** : Conçu pour les utilisateurs mobiles africaens

## Structure du Projet

```
topup/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout racine avec MainLayout et AuthProvider
│   ├── page.tsx             # Homepage publique
│   ├── globals.css          # Styles globaux Tailwind CSS 4
│   ├── auth/
│   │   ├── login/page.tsx   # Page de connexion
│   │   ├── register/page.tsx # Page d'inscription
│   │   └── forgot-password/page.tsx # Réinitialisation mot de passe
│   ├── dashboard/           # Dashboard Gamer
│   ├── games/               # Catalogue de jeux
│   │   ├── page.tsx         # Liste des jeux
│   │   └── [slug]/          # Détail d'un jeu
│   ├── checkout/            # Page de commande
│   ├── orders/              # Historique des commandes
│   │   └── [id]/            # Détail d'une commande
│   ├── wallet/              # Portefeuille gamer
│   ├── promotions/          # Promotions
│   ├── support/             # Support ticket
│   ├── become-seller/       # Devenir vendeur
│   ├── find-seller/         # Trouver un vendeur
│   ├── seller/              # Dashboard vendeur
│   │   ├── page.tsx
│   │   ├── products/        # Produits vendeur
│   │   ├── orders/          # Commandes vendeur
│   │   ├── wallet/          # Portefeuille vendeur
│   │   └── ...
│   └── admin/               # Dashboard administration
│       ├── dashboard/       # Vue d'ensemble admin
│       ├── users/           # Gestion utilisateurs
│       ├── sellers/         # Gestion vendeurs
│       ├── games/           # Gestion jeux
│       ├── products/        # Gestion produits
│       ├── orders/          # Gestion commandes
│       ├── wallets/         # Gestion wallets
│       ├── withdrawals/     # Gestion retraits
│       ├── commissions/     # Gestion commissions
│       ├── settings/        # Paramètres
│       └── audit/           # Logs audit
├── components/
│   ├── ui/                  # Composants UI de base
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── avatar.tsx
│   │   ├── spinner.tsx
│   │   └── skeleton.tsx
│   ├── layout/              # Composants de layout
│   │   ├── main-layout.tsx  # Sidebar + Header + Main
│   │   ├── footer.tsx
│   │   └── nav-link.tsx
│   └── features/            # Composants métier
│       ├── auth/
│       ├── home/
│       ├── seller/
│       ├── admin/
│       ├── orders/
│       └── wallet/
├── features/                # Modules métier
│   ├── auth/                # Authentification
│   ├── core/                # Logique core
│   ├── games/               # Jeux
│   ├── products/            # Produits
│   ├── orders/              # Commandes
│   ├── payments/            # Paiements
│   ├── topup/               # Top-up engine
│   ├── wallet/              # Wallet/ledger
│   ├── sellers/             # Vendeurs
│   ├── commissions/         # Commissions
│   ├── withdrawals/         # Retraits
│   ├── promotions/          # Promotions
│   ├── notifications/       # Notifications
│   ├── support/             # Support
│   ├── admin/               # Admin features
│   └── analytics/           # Analytics
├── lib/                     # Utilitaires
│   ├── utils.ts             # Fonctions utilitaires (cn, formatCurrency, etc.)
│   ├── pricing.ts           # Calcul des prix
│   └── supabase-helpers.ts  # Helpers Supabase
├── services/                # Services externes
├── hooks/                   # Hooks React personnalisés
│   ├── use-auth.ts
│   ├── use-games.ts
│   └── ...
├── utils/                   # Fonctions utilitaires
├── config/                  # Configuration
│   ├── supabase.ts          # Client Supabase
│   └── database.ts          # Config base de données
├── types/                   # Types TypeScript
│   ├── database.ts          # Types générés Supabase
│   └── shared.ts            # Types partagés
├── supabase/                # Supabase helpers
├── migrations/              # Migrations PostgreSQL
│   └── 001_initial_schema.sql
├── seeds/                   # Données de seed
├── tests/                   # Tests
└── docs/                    # Documentation
```

## Système d'Authentification

- **Provider :** Supabase Auth (email/password)
- **Stockage :** Session persistée localement
- **Rôles :** GAMER, SELLER, PRO_SELLER, PARTNER, ADMIN, SUPER_ADMIN
- **Protection :** RLS + ProtectedRoute côté client

## Système de Rôles

| Rôle | Description |
|------|-------------|
| GAMER | Utilisateur standard |
| SELLER | Vendeur vérifié |
| PRO_SELLER | Vendeur professionnel |
| PARTNER | Partenaire stratégique |
| ADMIN | Administrateur plateforme |
| SUPER_ADMIN | Super administrateur |

## Système de Paiement

- **Abstraction :** PaymentProvider interface
- **Adapters :** MonCash, NatCash, CardAdapter (à implémenter)
- **Webhooks :** Idempotents, vérification de signature
- **États :** PENDING → SUCCESS/FAILED

## Système de Top-Up

- **Abstraction :** TopUpProvider interface
- **Méthodes :** getProducts(), getBalance(), validatePlayer(), createTopUp(), getTransactionStatus()
- **Idempotence :** idempotency_key unique par commande
- **États :** PENDING → PROCESSING → SUCCESS/FAILED

## Système Financier (Ledger)

- **Wallet :** Un wallet par utilisateur
- **Transactions :** Chaque opération enregistrée dans wallet_transactions
- **Types :** DEPOSIT, PURCHASE, TOPUP, REFUND, COMMISSION, WITHDRAWAL, ADJUSTMENT, BONUS, REVERSAL
- **Intégrité :** balance_before et balance_after pour chaque transaction
- **Pas de modification directe** de la balance

## RLS (Row Level Security)

Toutes les tables ont RLS activé :
- Les utilisateurs ne voient que leurs propres données
- Les vendeurs voient uniquement leurs données
- Les admin ont accès à toutes les données (via service role)

## Déploiement

- **Vercel** pour le frontend
- **Supabase** pour le backend
- **Variables d'environnement** : configurées dans Vercel dashboard