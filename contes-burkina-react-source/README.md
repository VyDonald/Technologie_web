# Contes et légendes du Burkina Faso (React + Vite)

## Lancer en local
npm install
npm run dev        # http://localhost:5173
npm run build      # produit dist/index.html (page unique)

## Déployer sur Vercel
Importer ce dossier sur vercel.com/new (Vite est détecté automatiquement), ou : npx vercel --prod

## Ajouter du contenu
- Textes, quiz, coordonnées : src/contes.json
- Photos des régions : public/regions/<sindou|mouhoun|sahel|laongo|tenkodogo>.jpg (remplacent les illustrations)
- Audios : public/audio/<id>-<langue en minuscules>-<n° scène>.mp3 (ex. yennenga-mooré-1.mp3)
