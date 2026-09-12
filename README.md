# NdosseSport

Site communautaire de l'esport gabonais : rubriques Clash Royale, EA Sports FC 27, GTA V, Naruto Storm Connections, et liste des joueurs gabonais.

## Mise en ligne sur GitHub Pages

1. Créez un dépôt GitHub (ex. `ndossesport`) et mettez-y tous les fichiers de ce dossier.
2. Dans le dépôt : **Settings → Pages → Source → Deploy from a branch**, choisissez la branche `main` et le dossier `/root`.
3. Le site sera accessible à `https://votre-compte.github.io/ndossesport/`.
4. Pour utiliser **ndossesport.com** :
   - Chez votre registrar de domaine, créez un enregistrement `A` pointant vers les IP de GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153), ou un `CNAME` vers `votre-compte.github.io` si vous utilisez un sous-domaine.
   - Dans **Settings → Pages → Custom domain**, entrez `ndossesport.com` et cochez "Enforce HTTPS" une fois le certificat généré.
   - Ajoutez un fichier `CNAME` à la racine du dépôt contenant uniquement `ndossesport.com` (GitHub le crée automatiquement si vous utilisez le champ ci-dessus).

## Clash Royale en direct

Le clan `#GJ902098` est déjà référencé dans `config.js`. L'API officielle de Clash Royale **ne peut pas être appelée directement depuis un navigateur** : elle exige une clé liée à une adresse IP fixe et refuse les requêtes venant d'un site statique comme GitHub Pages.

Pour avoir des données automatiques et à jour, il faut un petit relais serveur :

1. Utilisez `worker-example.js` : c'est un modèle de proxy Cloudflare Worker (gratuit) qui interroge l'API Clash Royale avec votre clé et renvoie le résultat au site.
2. Suivez les instructions en commentaire dans ce fichier pour le déployer.
3. Une fois déployé, copiez l'URL du Worker dans `config.js` → `clashApiProxyUrl`.
4. Le site interroge alors ce proxy automatiquement toutes les 5 minutes.

Tant que `clashApiProxyUrl` est vide, la page Clash Royale affiche un message au lieu de données, plutôt que d'inventer des chiffres.

## Administration

Le bouton "Administration" ouvre un panneau protégé par le mot de passe défini dans `config.js` (`adminPassword`).

**Important à savoir :** ce mot de passe est stocké en clair dans un fichier public du site — n'importe qui peut l'ouvrir dans son navigateur et le lire. Cela suffit pour éviter qu'un visiteur clique sur le panneau par erreur, mais **ce n'est pas une vraie sécurité**. Pour une administration protégée avec plusieurs comptes, il faudrait ajouter un vrai système d'authentification (par exemple Firebase Auth ou Supabase), ce que je peux vous aider à mettre en place séparément si vous en avez besoin.

Le panneau permet d'ajouter/retirer des joueurs, mais ces changements ne restent que dans votre navigateur (mémoire locale). Pour qu'ils soient visibles par tous les visiteurs :
1. Cliquez sur "Télécharger players.json à jour".
2. Remplacez le fichier `data/players.json` du dépôt GitHub par celui téléchargé.
3. Validez (commit) le changement — le site public se met à jour en quelques minutes.

## Structure des fichiers

```
index.html          page principale (toutes les rubriques)
style.css           mise en forme
script.js           navigation, chargement des données, administration
config.js           identifiant du clan, URL du proxy, mot de passe admin
data/players.json   liste des joueurs gabonais
data/games.json     rubriques des jeux à venir
worker-example.js   modèle de proxy pour l'API Clash Royale
```

## Ajouter un nouveau jeu

Ouvrez `data/games.json` et ajoutez un objet `{ "id", "nom", "statut", "description" }`. Il apparaîtra automatiquement dans l'onglet "Autres jeux".
