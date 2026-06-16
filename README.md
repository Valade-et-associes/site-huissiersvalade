# Refonte statique de huissiersvalade.com

Première étape de migration hors WordPress vers un site statique Astro, sans React et sans backend.

## Objectifs de l'étape 1

- Reprendre les pages publiques principales du site existant.
- Préserver les slugs SEO WordPress importants.
- Générer un site statique prêt pour Netlify.
- Laisser les formulaires désactivés jusqu'à l'étape 2.

## Pages reprises

- `/`
- `/a-propos/`
- `/services-et-tarifs/`
- `/formulaires/`
- `/vente-de-vehicules-operation-sabot-de-denver/`
- `/contact/`

## Commandes

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Déploiement prévu

Le fichier `netlify.toml` est prêt pour un déploiement Netlify:

- commande de build: `npm run build`
- dossier publié: `dist`
- branche cible prévue: `master`

L'automatisation du déploiement au push sur `master` sera activée au moment du raccordement du dépôt à Netlify.

## Étape 2

À traiter séparément:

- formulaire de contact;
- formulaire d'offre pour les ventes de véhicules;
- formulaires PDF ou fichiers téléchargeables;
- source de données pour la liste des véhicules;
- éventuelle stratégie Netlify Forms, serverless functions ou service externe.
