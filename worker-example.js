// Exemple de proxy Cloudflare Worker pour l'API Clash Royale.
// L'API officielle (developer.clashroyale.com) exige une clé liée à une
// adresse IP fixe et bloque les appels directs depuis un navigateur.
// Ce petit relais s'exécute côté serveur (IP fixe de Cloudflare) et
// transmet la réponse au site avec les en-têtes CORS nécessaires.
//
// Déploiement (gratuit) :
// 1. Créez un compte sur https://dash.cloudflare.com puis "Workers & Pages".
// 2. Créez un Worker, collez ce code.
// 3. Dans "Settings > Variables", ajoutez une variable secrète CR_API_KEY
//    avec votre clé obtenue sur developer.clashroyale.com (autorisée pour
//    l'IP sortante de Cloudflare, indiquée sur leur documentation).
// 4. Déployez, copiez l'URL du Worker dans config.js -> clashApiProxyUrl.

export default {
  async fetch(request, env){
    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    if(!tag){
      return new Response('Paramètre "tag" manquant', {status:400});
    }
    const apiRes = await fetch(
      `https://api.clashroyale.com/v1/clans/${tag}`,
      { headers: { Authorization: `Bearer ${env.CR_API_KEY}` } }
    );
    const body = await apiRes.text();
    return new Response(body, {
      status: apiRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
