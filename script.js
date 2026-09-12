// ---------- Navigation ----------
function goTo(view){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  const btn = document.querySelector('.nav-btn[data-view="' + view + '"]');
  if(btn) btn.classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> goTo(btn.dataset.view));
});

// ---------- Autres jeux (à venir) ----------
fetch('data/games.json').then(r=>r.json()).then(jeux=>{
  const grid = document.getElementById('jeux-grid');
  grid.innerHTML = jeux.map(j => `
    <div class="card">
      <span class="badge">À venir</span>
      <h3>${j.nom}</h3>
      <p>${j.description}</p>
    </div>
  `).join('');
}).catch(()=>{});

// ---------- Joueurs gabonais ----------
function getPlayersLocal(){
  const raw = localStorage.getItem('ndosse_players');
  return raw ? JSON.parse(raw) : null;
}
function setPlayersLocal(list){
  localStorage.setItem('ndosse_players', JSON.stringify(list));
}
function renderPlayers(list){
  const body = document.getElementById('players-body');
  if(!list.length){ body.innerHTML = '<tr><td colspan="3">Aucun joueur pour le moment.</td></tr>'; return; }
  body.innerHTML = list.map(p => `<tr><td>${p.pseudo}</td><td>${p.jeu}</td><td>${p.ville||''}</td></tr>`).join('');
  document.getElementById('stat-joueurs').textContent = list.length;
}
function loadPlayers(){
  const local = getPlayersLocal();
  if(local){ renderPlayers(local); renderAdminPlayers(local); return; }
  fetch('data/players.json').then(r=>r.json()).then(list=>{
    renderPlayers(list);
    renderAdminPlayers(list);
  }).catch(()=>{
    document.getElementById('players-body').innerHTML = '<tr><td colspan="3">Impossible de charger la liste.</td></tr>';
  });
}
loadPlayers();

// ---------- Clash Royale ----------
async function chargerClan(){
  const statusEl = document.getElementById('clan-status');
  const tag = (window.NDOSSE_CONFIG.clanTag || '').replace('#','%23');
  const proxy = window.NDOSSE_CONFIG.clashApiProxyUrl;

  if(!proxy){
    statusEl.textContent = "Proxy non configuré — affichage impossible pour l'instant (voir README.md).";
    document.getElementById('clan-members-body').innerHTML =
      '<tr><td colspan="5">Configurez clashApiProxyUrl dans config.js pour activer les données en direct.</td></tr>';
    return;
  }

  statusEl.textContent = "Actualisation…";
  try{
    const res = await fetch(proxy + '?tag=' + tag);
    if(!res.ok) throw new Error('reponse ' + res.status);
    const data = await res.json();

    document.getElementById('stat-membres').textContent = data.members ? data.members.length : '—';
    const rows = (data.memberList || data.members || []).map((m, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${m.name}</td>
        <td>${m.role || ''}</td>
        <td>${m.trophies ?? ''}</td>
        <td>${m.clanChestPoints ?? m.donations ?? ''}</td>
      </tr>
    `).join('');
    document.getElementById('clan-members-body').innerHTML = rows || '<tr><td colspan="5">Aucun membre trouvé.</td></tr>';
    statusEl.textContent = "Dernière mise à jour : " + new Date().toLocaleString('fr-FR');
  }catch(err){
    statusEl.textContent = "Erreur lors de la récupération des données du clan.";
  }
}
chargerClan();
// Rafraîchit automatiquement toutes les 5 minutes si le proxy est configuré
setInterval(()=>{ if(window.NDOSSE_CONFIG.clashApiProxyUrl) chargerClan(); }, 5*60*1000);

// ---------- Administration ----------
function tryAdminLogin(){
  const pass = document.getElementById('admin-pass').value;
  if(pass === window.NDOSSE_CONFIG.adminPassword){
    document.getElementById('admin-locked').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    sessionStorage.setItem('ndosse_admin', '1');
  }else{
    document.getElementById('admin-error').textContent = 'Mot de passe incorrect.';
  }
}
function adminLogout(){
  sessionStorage.removeItem('ndosse_admin');
  document.getElementById('admin-locked').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-pass').value = '';
}
if(sessionStorage.getItem('ndosse_admin') === '1'){
  document.getElementById('admin-locked').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
}

function renderAdminPlayers(list){
  const body = document.getElementById('admin-players-body');
  body.innerHTML = list.map((p, i) => `
    <tr>
      <td>${p.pseudo}</td><td>${p.jeu}</td><td>${p.ville||''}</td>
      <td><button class="ghost" onclick="supprimerJoueur(${i})">Retirer</button></td>
    </tr>
  `).join('');
}
function ajouterJoueur(){
  const pseudo = document.getElementById('np-pseudo').value.trim();
  const jeu = document.getElementById('np-jeu').value.trim();
  const ville = document.getElementById('np-ville').value.trim();
  if(!pseudo || !jeu) return;
  const list = getPlayersLocal() || [];
  list.push({pseudo, jeu, ville});
  setPlayersLocal(list);
  renderPlayers(list);
  renderAdminPlayers(list);
  document.getElementById('np-pseudo').value = '';
  document.getElementById('np-jeu').value = '';
  document.getElementById('np-ville').value = '';
}
function supprimerJoueur(i){
  const list = getPlayersLocal() || [];
  list.splice(i,1);
  setPlayersLocal(list);
  renderPlayers(list);
  renderAdminPlayers(list);
}
function exporterJoueurs(){
  const list = getPlayersLocal() || [];
  const blob = new Blob([JSON.stringify(list, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'players.json';
  a.click();
}
