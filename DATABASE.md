# DATABASE - GAME TOP-UP HAITI

## Vue d'Ensemble

La base de données PostgreSQL utilise un système de **ledger** pour les opérations financières et RLS (Row Level Security) pour la sécurité.

## Tables Principales

### Authentication & Users

| Table | Description |
|-------|-------------|
| `roles` | Rôles utilisateurs (GAMER, SELLER, ADMIN, etc.) |
| `profiles` | Profils utilisateurs (email, phone, role, status) |

### Games & Products

| Table | Description |
|-------|-------------|
| `game_categories` | Catégories de jeux |
| `games` | Jeux (Free Fire, PUBG, Mobile Legends, etc.) |
| `game_products` | Produits par jeu (diamants, crédits) |
| `providers` | Fournisseurs de top-up |
| `provider_products` | Produits par fournisseur |

### Orders & Payments

| Table | Description |
|-------|-------------|
| `orders` | Commandes de top-up |
| `order_items` | Items de commande |
| `payments` | Paiements |

### Wallet & Ledger

| Table | Description |
|-------|-------------|
| `wallets` | Portefeuilles utilisateurs |
| `wallet_transactions` | Transactions du ledger |

### Sellers

| Table | Description |
|-------|-------------|
| `seller_profiles` | Profils vendeurs |
| `seller_requests` | Demandes de statut vendeur |
| `seller_prices` | Prix personnalisés vendeur |
| `commissions` | Commissions gagnées |
| `withdrawals` | Demandes de retrait |

### Marketing & Support

| Table | Description |
|-------|-------------|
| `promotions` | Promotions et coupons |
| `coupons` | Codes de réduction |
| `notifications` | Notifications utilisateur |
| `support_tickets` | Tickets de support |
| `audit_logs` | Logs d'audit admin |

### System

| Table | Description |
|-------|-------------|
| `system_settings` | Paramètres système |

## Ledger System

Chaque opération financière crée une entrée dans `wallet_transactions` :

```
wallet_transactions:
- id: UUID
- wallet_id: UUID (FK → wallets)
- user_id: UUID (FK → profiles)
- type: DEPOSIT | PURCHASE | TOPUP | REFUND | COMMISSION | WITHDRAWAL | ADJUSTMENT | BONUS | REVERSAL
- amount: TEXT (NUMERIC stocké comme texte pour précision)
- currency: TEXT (HTG, USD, DOP)
- balance_before: TEXT
- balance_after: TEXT
- reference: TEXT
- description: TEXT
- status: COMPLETED | PENDING | FAILED | REVERSED
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

## RLS Policies

### Principes

1. **Users** peuvent voir/modifier leur propre profil
2. **Sellers** peuvent voir/modifier leur profil et leurs ventes
3. **Admins** ont accès à toutes les données (via service role)
4. **Personne** ne peut voir les données des autres sans permission

### Policies Principales

- `Users can view own profile` : `auth.uid() = id`
- `Users can create orders` : `auth.uid() = user_id`
- `Users can view own orders` : `auth.uid() = user_id`
- `Users can view own wallet` : `auth.uid() = user_id`
- `Sellers can view own commissions` : `auth.uid() = seller_id`
- `Admin full access to audit logs` : `true` (service role)

## Migrations

Toutes les modifications de base de données passent par des migrations versionnées dans `/migrations`.

### Appliquer les Migrations

```bash
# Via Supabase CLI
npx supabase db push

# Ou via la console Supabase
# SQL Editor → Run
```

### Ajouter une Migration

```bash
# Créer un fichier de migration
npx supabase migration new 002_add_feature.sql

# Éditer le fichier
# Appliquer
npx supabase db push
```

## Seed Data

Des données de démonstration sont dans `/seeds` pour le développement :
- 6 jeux (Free Fire, Mobile Legends, PUBG, Roblox, FC Mobile, eFootball)
- ~20 produits avec prix HTG

## Important

- **Aucune suppression physique** des transactions financières
- Les corrections se font via des transactions `REVERSAL` ou `ADJUSTMENT`
- Les montants financiers sont stockés en `TEXT` (pas `FLOAT`) pour précision
- Les UUID sont utilisés comme clés primaires