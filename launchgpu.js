const { google } = require('googleapis');
const compute = google.compute('v1');

async function launchGpuInstance() {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const project = 'gifted-pulsar-459320-g7';
  const zone = 'us-central1-a';
  const instanceName = 'gpu-demo-instance';

  const config = {
    name: instanceName,
    machineType: `zones/${zone}/machineTypes/n1-standard-4`,
    disks: [{
      boot: true,
      initializeParams: {
        sourceImage: 'projects/debian-cloud/global/images/family/debian-11',
        diskSizeGb: '50',
      },
    }],
    networkInterfaces: [{
      network: 'global/networks/default',
      accessConfigs: [{ type: 'ONE_TO_ONE_NAT', name: 'External NAT' }],
    }],
    guestAccelerators: [{
      acceleratorType: `zones/${zone}/acceleratorTypes/nvidia-tesla-t4`,
      acceleratorCount: 1,
    }],
    scheduling: {
      onHostMaintenance: 'TERMINATE',
      automaticRestart: false,
    },
    metadata: {
      items: [{
        key: 'startup-script',
        value: '#!/bin/bash\napt-get update\napt-get install -y nvidia-driver-460',
      }],
    },
  };

  const res = await compute.instances.insert({
    auth,
    project,
    zone,
    requestBody: config,
  });

  console.log('🚀 Launching GPU Instance:', res.data.targetLink);
}

launchGpuInstance().catch(console.error);
