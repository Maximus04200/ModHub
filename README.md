# ModHub

Plateforme communautaire de partage de mods pour jeux vidéo : les créateurs publient des mods
et leurs versions, la communauté cherche, note, commente et suit les mods qui l'intéressent.

Projet réalisé comme support du dossier de projet et de la présentation orale du Titre
Professionnel Développeur Web et Web Mobile (DWWM).

## Stack technique

- **Frontend** : React 19 + TypeScript, Vite, React Router
- **Backend** : Node.js + Express 5 + TypeScript, architecture en couches
  (routes → controllers → services → repositories)
- **Base de données relationnelle** : PostgreSQL via Prisma 7 (utilisateurs, mods, versions,
  catégories, notes, commentaires, follows)
- **Base de données NoSQL** : MongoDB via Mongoose (fil d'activité et métadonnées de mod à
  schéma variable selon le jeu)
- **Auth** : JWT + bcryptjs, rôles USER/ADMIN
- **Tests** : Vitest + Supertest (tests d'intégration bout-en-bout)

## Pourquoi deux bases de données

- **PostgreSQL** pour tout ce qui a une structure relationnelle forte et des contraintes
  d'intégrité (un utilisateur, un mod, une note unique par couple mod/utilisateur, suppression
  en cascade).
- **MongoDB** pour le fil d'activité (forme de document différente selon le type d'événement) et
  les métadonnées spécifiques à chaque jeu (un mod Arma Reforger n'a pas les mêmes champs qu'un
  mod Minecraft) — un cas d'usage NoSQL réel, pas un choix artificiel.

## Prérequis

- Node.js 20+
- Une base PostgreSQL accessible (Supabase, ou toute instance Postgres classique)
- Une instance MongoDB accessible (locale ou Atlas)

## Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env   # renseigner DATABASE_URL et MONGO_URL
npx prisma migrate deploy
npx ts-node prisma/seed.ts   # crée les catégories de base
npm run dev             # démarre sur http://localhost:4000

# Frontend (autre terminal)
cd frontend
npm install
cp .env.example .env    # VITE_API_URL doit pointer vers le backend
npm run dev              # démarre sur http://localhost:5173
```

## Tests

```bash
cd backend
npm test
```

Les tests sont des tests d'intégration réels : ils créent des utilisateurs et des mods contre
la vraie base configurée dans `.env`, puis nettoient après eux.

## Devenir administrateur (modération)

Aucune interface ne permet de se promouvoir soi-même (volontaire, pour éviter une élévation de
privilège par un utilisateur normal). En développement, promouvoir un compte directement en base :

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'ton-email@exemple.com';
```

Il faut ensuite se reconnecter pour obtenir un nouveau token JWT reflétant le rôle.

## Structure du dépôt

```
backend/   API REST (Express/TS, Prisma, Mongoose)
frontend/  Application React/TS (Vite)
```
