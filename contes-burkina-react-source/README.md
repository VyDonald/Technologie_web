# Contes et légendes du Burkina Faso (React + Vite)

## Lancer en local

```sh
npm install
npm run dev
npm run build
```

Le site est disponible sur `http://localhost:5173`. La compilation produit le site statique dans `dist/` ; les photographies de `public/regions/` sont copiées dans `dist/regions/`.

## Déployer sur Vercel
Importer ce dossier sur vercel.com/new (Vite est détecté automatiquement), ou : npx vercel --prod

## Ajouter du contenu
- Textes, quiz, coordonnées : src/contes.json
- Photos des régions : public/regions/<sindou|mouhoun|sahel|laongo|tenkodogo>.jpg
- Crédits et licences des photos : public/regions/ATTRIBUTIONS.md
- Audios : public/audio/<id>-<langue en minuscules>-<n° scène>.mp3 (ex. yennenga-mooré-1.mp3)

Les récits sont des adaptations de travail : pour publier une version traditionnelle, recueillir le consentement des conteurs et documenter la provenance, les variantes et les crédits.
