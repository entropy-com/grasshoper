const { google } = require('googleapis');
const compute = google.compute('v1');

async function getGPUZones() {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const project = 'your-project-id';
  const zonesRes = await compute.zones.list({ auth, project });
  const zones = zonesRes.data.items.map(z => z.name);

  const results = results.push({
    name: acc.name,
    zone: zone,
    region: zone.substring(0, zone.lastIndexOf('-')), // Extract region from zone
    description: acc.description,
  });
  ;

  for (const zone of zones) {
    const res = await compute.acceleratorTypes.list({ auth, project, zone });
    const accelerators = res.data.items || [];
    for (const acc of accelerators) {
      results.push({
        name: acc.name,
        zone: zone,
        description: acc.description,
      });
    }
  }

  console.log(results);
}

getGPUZones();
