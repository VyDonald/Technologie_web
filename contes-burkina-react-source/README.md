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

## Hébergement GitHub Pages
Le workflow `.github/workflows/deploy-pages.yml` publie automatiquement l’application sur GitHub Pages après chaque mise à jour de `main`. Le site sera accessible à l’adresse :

https://vydonald.github.io/Technologie_web/

## Ajouter du contenu
- Textes, quiz, coordonnées : src/contes.json
- Photos des régions : public/regions/<sindou|mouhoun|sahel|laongo|tenkodogo>.jpg
- Crédits et licences des photos : public/regions/ATTRIBUTIONS.md
- Accueil : atlas topographique 3D avec repères interactifs (Three.js) ; une carte SVG reste disponible si WebGL n’est pas pris en charge.
- Fiches des récits : chapitres illustrés qui suivent le défilement, avec lecture audio de chaque scène.
- Français : narration MP3 fournie pour chaque scène, générée localement avec la voix française d’eSpeak NG ; si une piste manque, le lecteur essaie la synthèse vocale du navigateur. Les voix françaises installées peuvent aussi être sélectionnées dans le lecteur.
- Autres langues : déposer les enregistrements dans public/audio/<id>-<langue en minuscules>-<n° scène>.mp3 (ex. yennenga-mooré-1.mp3).

La collection comprend douze histoires réparties dans douze localités. Les fictions originales ne représentent pas des traditions locales. Pour publier une version traditionnelle ou un enregistrement en langue nationale, recueillir le consentement des conteuses et conteurs et documenter la provenance, les variantes et les crédits.
