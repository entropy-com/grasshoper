// This file fetches GPU SKU prices from the Google Cloud Billing API.
// It now also fetches the service regions where each SKU is available.

const { CloudCatalogClient } = require('@google-cloud/billing');

async function getPrice() {
  try {
    const client = new CloudCatalogClient();
    // List all services available in the Cloud Catalog
    const [services] = await client.listServices();
    // Find the 'Compute Engine' service
    const compute = services.find(s => s.displayName === 'Compute Engine');

    // List SKUs (Stock Keeping Units) associated with Compute Engine.
    // Filter specifically for SKUs where the resourceFamily is 'GPU'.
    const [skus] = await client.listSkus({
      parent: compute.name,
      filter: 'category.resourceFamily="GPU"'
    });

    const appDesc = []; // Array to store formatted GPU descriptions and prices

    // Iterate through each SKU to extract relevant pricing information
    for (const sku of skus) {
      // Access the first pricingInfo object and its tieredRates
      const pricingInfo = sku.pricingInfo?.[0]?.pricingExpression?.tieredRates?.[0];
      const unitPrice = pricingInfo?.unitPrice;
      const nanoPrice= unitPrice?.nanos // Nanos part of the price
      
      // Skip if unitPrice is not available
      if (!unitPrice) continue;
      
      // Calculate the total cost by combining units and nanos
      const cost = parseFloat(unitPrice.units || "0") + (unitPrice.nanos || 0) / 1e9;
      
      // Push an object containing description, nanos, cost, currency,
      // and now also the regions where this SKU is available.
      appDesc.push({ 
        desc: sku.description, 
        nanos: nanoPrice, 
        cost: cost, 
        currency: unitPrice.currencyCode || "USD",
        // Add serviceRegions to the output data. If not available, default to an empty array.
        regions: sku.serviceRegions || [] 
      });
    }
    return appDesc; // Return the array of GPU details
  } catch (err) {
    console.error('Error occurred in getPrice:', err);
    return []; // Return an empty array in case of an error
  }
}

module.exports = { getPrice }; // Export the getPrice function
