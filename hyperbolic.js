async function listAvailableGPUs() {
    try {
      const response = await fetch('https://api.hyperbolic.xyz/v1/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "filters": {}
        })
      });
  
      const data = await response.json();
  
      // Extract details from instances array
      if (Array.isArray(data.instances)) {
        data.instances.forEach(instance => {
          console.log({
            gpu_type: instance.hardware.gpus[0]?.model,
            region: instance.location.region,
            available_nodes: instance.gpus_total - instance.gpus_reserved,
            total_nodes: instance.gpus_total,
            cluster_name: instance.cluster_name,
            node_name: instance.id,
            hourly_price: instance.pricing.price.amount,
            reserved_status: instance.reserved,
            // Image details from nested instances if available
            running_instances: instance.instances?.map(inst => ({
              instance_id: inst.id,
              status: inst.status,
              gpu_details: inst.hardware
            }))
          });
        });
      } else {
        console.error('No instances array in response:', data);
        return [];
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching GPU details:', error);
    }
  }
  
  if (require.main === module) {
    listAvailableGPUs();
  }
  module.exports = { listAvailableGPUs };