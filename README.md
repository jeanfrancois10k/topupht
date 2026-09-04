# GAME TOP-UP HAITI

La plateforme professionnelle de recharge de jeux vidéo destinée au marché africaen.

## Présentation

TOPUP+ est une plateforme moderne permettant aux gamers d'acheter automatiquement des recharges de jeux (diamants, crédits), aux utilisateurs sans moyen de paiement de trouver un vendeur de confiance, et aux gamers de devenir vendeurs/revendeurs.

## Stack Technique

- **Frontend :** Next.js 16, React 19, TypeScript, Tailwind CSS 4, App Router
- **Backend :** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Déploiement :** Vercel
- **Design :** Mobile-first, dark mode, design system gaming moderne

## Architecture

```
/app                    - Pages Next.js (App Router)
/components             - Composants UI et layout
/features               - Modules métier (auth, games, products, orders, payments, topup, wallet, sellers, commissions, withdrawals, promotions, notifications, support, admin)
/lib                    - Utilitaires généraux
/services               - Intégrations externes (fournisseurs, paiements)
/hooks                  - Hooks React personnalisés
/utils                  - Fonctions utilitaires
/config                 - Configuration (Supabase, base de données)
/types                  - Types TypeScript partagés
/supabase               - Client Supabase et helpers
/migrations             - Migrations PostgreSQL
/seeds                  - Données de démonstration
/tests                  - Tests unitaires et intégration
```

## Installation

### Prérequis

- Node.js >= 20
- npm >= 10
- Compte Supabase

### Étapes

```bash
# 1. Cloner le dépôt
git clone <repository-url>
cd topup

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs Supabase

# 4. Lancer la base de données Supabase
# Exécuter les migrations dans la console Supabase ou via CLI
npx supabase db push

# 5. Lancer en mode développement
npm run dev
```

## Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role | `eyJhbGci...` |
| `NEXT_PUBLIC_PLATFORM_URL` | URL de la plateforme | `http://localhost:3000` |
| `NEXT_PUBLIC_PLATFORM_NAME` | Nom de la plateforme | `TOPUP+` |

## Fonctionnalités

### Pour les Gamers
- Catalogue de jeux dynamique (Free Fire, PUBG, Mobile Legends, Roblox, FC Mobile, eFootball)
- Système de produits avec prix configurable
- Checkout avec paiement MonCash/NatCash/Carte
- Historique des commandes
- Portefeuille personnel
- Trouver un vendeur
- Support ticket

### Pour les Vendeurs
- Demande de statut vendeur (approbation admin)
- Dashboard vendeur avec statistiques
- Vente de top-ups pour clients
- Wallet professionnel avec historique (ledger)
- Dépôt de fonds
- Retraits
- Vue des commissions

### Pour l'Administration
- Dashboard avec métriques
- Gestion des utilisateurs et vendeurs
- Gestion des jeux et produits
- Gestion des fournisseurs
- Gestion des commandes et paiements
- Gestion des wallets et retraits
- Système de promotions et coupons
- Logs d'audit
- Paramètres système

## Sécurité

- **RLS (Row Level Security)** activé sur toutes les tables
- **JWT** via Supabase Auth
- **Idempotence** sur les commandes et transactions financières
- **Ledger** pour toutes les opérations financières (aucune modification directe de balance)
- **Audit logs** pour toutes les opérations administratives
- **Secrets** uniquement côté serveur (supabase service role)

## Base de Données

La base de données PostgreSQL utilise un système de **ledger** pour les opérations financières :

- Tables principales : `profiles`, `games`, `game_products`, `orders`, `payments`, `wallets`, `wallet_transactions`, `seller_profiles`, `seller_requests`, `commissions`, `withdrawals`, `promotions`, `notifications`, `support_tickets`, `audit_logs`, `system_settings`
- Toutes les transactions financières sont enregistrées avec `balance_before` et `balance_after`
- **Aucune suppression physique** des transactions financières
- Les corrections se font via des transactions `REVERSAL` ou `ADJUSTMENT`

## Migrations

Les migrations sont dans le dossier `/migrations`. La migration initiale (`001_initial_schema.sql`) crée toutes les tables, vues, fonctions, triggers et politiques RLS.

```bash
# Appliquer les migrations
npx supabase db push

# Ou via la console Supabase
```

## Contributing

1. Créer une branche feature
2. Ajouter les migrations nécessaires
3. Mettre à jour les types si nécessaire
4. Soumettre une Pull Request

## Licence

Propriétaire - TOPUP+ © 2026