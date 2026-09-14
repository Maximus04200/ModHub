const API = 'http://localhost:4000/api';

async function main() {
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ email: 'demo-creator@modhub.dev', password: 'DemoPass123' }),
  }).then((r) => r.json());
  const token = login.token;
  const headers = { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` };

  const categories = await fetch(`${API}/categories`).then((r) => r.json());
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const mods = [
    {
      title: 'Realistic Military Movement',
      summary: 'Animations de déplacement militaire réalistes pour Arma Reforger.',
      description:
        "Refonte complète des animations de déplacement (marche, course, visée) pour un rendu plus réaliste, basée sur des références militaires réelles. Compatible avec les scénarios coopératifs et le mode Conflict.",
      gameKey: 'arma-reforger',
      categoryId: catByName.Gameplay,
      gameMetadata: { workshopId: 'RMM-2026', requiredDLC: 'aucun' },
    },
    {
      title: 'Textures Terrain 4K',
      summary: 'Pack de textures haute résolution pour tous les terrains vanilla.',
      description:
        'Remplace les textures de terrain par défaut par des versions 4K, avec normal maps améliorées. Impact perf modéré, recommandé sur GPU récent.',
      gameKey: 'arma-reforger',
      categoryId: catByName.Graphismes,
      gameMetadata: { workshopId: 'TT4K-118', resolution: '4096x4096' },
    },
    {
      title: 'Everon Extended',
      summary: "Extension de la carte Everon avec de nouvelles zones d'intérêt.",
      description:
        "Ajoute trois nouvelles zones jouables sur la carte Everon : un port militaire, une zone industrielle et un village fortifié, chacune avec ses propres points de capture.",
      gameKey: 'arma-reforger',
      categoryId: catByName.Cartes,
      gameMetadata: { workshopId: 'EE-054' },
    },
  ];

  const created = [];
  for (const mod of mods) {
    const res = await fetch(`${API}/mods`, { method: 'POST', headers, body: JSON.stringify(mod) }).then((r) => r.json());
    created.push(res);
    console.log('created', res.title, res.id, res.status);
  }

  for (const mod of created) {
    await fetch(`${API}/mods/${mod.id}/moderate`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'APPROVED' }),
    });
  }
  console.log('all approved');

  await fetch(`${API}/mods/${created[0].id}/versions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      versionLabel: '1.2.0',
      changelog: "Correction de la synchronisation d'animation en multijoueur.",
      fileUrl: '/uploads/rmm-1.2.0.zip',
      fileSizeBytes: 15_400_000,
    }),
  });
  await fetch(`${API}/mods/${created[0].id}/versions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      versionLabel: '1.0.0',
      changelog: 'Première version publique.',
      fileUrl: '/uploads/rmm-1.0.0.zip',
      fileSizeBytes: 14_800_000,
    }),
  });

  await fetch(`${API}/mods/${created[0].id}/ratings`, { method: 'POST', headers, body: JSON.stringify({ value: 5 }) });
  await fetch(`${API}/mods/${created[0].id}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body: 'Excellent mod, les animations sont bluffantes !' }),
  });
  await fetch(`${API}/mods/${created[0].id}/follow`, { method: 'POST', headers });

  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
