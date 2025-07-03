/**
 * All-in-One GPU Rental Price Scraper
 *
 * This script fetches GPU rental prices and details from multiple providers in parallel:
 * 1. RunPod: Uses the official API for fast and reliable data.
 * 2. Vast.ai: Scrapes the website for detailed GPU specifications.
 * 3. DigitalOcean: Uses a headless browser (Puppeteer) to handle dynamic content.
 *
 * It then aggregates all the data and displays it in a single table.
 *
 * To Run This Script:
 * 1. Make sure you have Node.js installed.
 * 2. Save this file as `scraper.js`.
 * 3. In your terminal, navigate to the directory where you saved the file.
 * 4. Install all necessary packages with this single command:
 * npm install axios cheerio puppeteer
 * 5. Run the script with the command:
 * node scraper.js
 *
 * Note: Puppeteer will download a version of Chromium (~170MB) the first time it's installed.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// --- Provider 1: RunPod (API) ---
async function fetchRunpodData() {
    const API_URL = 'https://api.runpod.io/v2/gpu-types';
    console.log('Fetching from RunPod API...');
    try {
        const { data } = await axios.get(API_URL);
        if (!Array.isArray(data)) {
            throw new Error("RunPod API did not return expected data.");
        }
        return data.map(gpu => {
            const communityPrice = gpu.lowestPrice?.onDemandPrice;
            const securePrice = gpu.secureCloud?.lowestPrice?.onDemandPrice;
            let price = 'N/A';
            if (communityPrice !== undefined && securePrice !== undefined) {
                 price = `Community: $${communityPrice.toFixed(4)}/hr, Secure: $${securePrice.toFixed(4)}/hr`;
            } else if (communityPrice !== undefined) {
                 price = `$${communityPrice.toFixed(4)}/hr (Community)`;
            } else if (securePrice !== undefined) {
                 price = `$${securePrice.toFixed(4)}/hr (Secure)`;
            }

            return {
                provider: 'RunPod',
                gpu: gpu.displayName,
                price: price,
                specs: `Memory: ${gpu.memoryInGb} GB`,
            };
        });
    } catch (error) {
        console.error(`Error fetching from RunPod: ${error.message}`);
        return []; // Return empty array on failure
    }
}


// --- Provider 2: Vast.ai (Web Scraping) ---
async function fetchVastData() {
    const URL = 'https://vast.ai/pricing';
    console.log('Fetching from Vast.ai...');
    try {
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);
        const gpuData = [];
        const tableRows = $('tbody > tr');

        tableRows.each((index, element) => {
            const cells = $(element).find('td');
            if (cells.length >= 3) {
                const gpuName = $(cells[0]).find('a').text().trim();
                const price = $(cells[1]).text().trim();
                const available = $(cells[2]).text().trim();
                if (gpuName) {
                     gpuData.push({
                         provider: 'Vast.ai',
                         gpu: gpuName,
                         price: `${price}/hr (Median)`,
                         specs: `Total Available: ${available}`,
                     });
                }
            }
        });
        return gpuData;
    } catch (error) {
        console.error(`Error fetching from Vast.ai: ${error.message}`);
        return [];
    }
}


// --- Provider 3: DigitalOcean (Puppeteer) ---
async function fetchDigitalOceanData() {
    const URL = 'https://www.digitalocean.com/pricing/droplets-with-gpus';
    let browser;
    console.log('Fetching from DigitalOcean...');
    try {
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.goto(URL, { waitUntil: 'networkidle2' });

        const gpuData = await page.evaluate(() => {
            const data = [];
            const cardElements = document.querySelectorAll('#gpu-droplets div[class*="GpuPricingCards_card"]');
            cardElements.forEach(card => {
                const planName = card.querySelector('h3')?.innerText.trim();
                const monthlyPrice = card.querySelector('div[class*="PricingCard_price"] > span:nth-child(1)')?.innerText.trim();
                const hourlyPrice = card.querySelector('div[class*="PricingCard_price"] > span:nth-child(2)')?.innerText.trim().replace(/[\(\)]/g, '');
                
                const specItems = [];
                card.querySelectorAll('ul li').forEach(item => specItems.push(item.innerText.trim()));

                if (planName) {
                    data.push({
                        provider: 'DigitalOcean',
                        gpu: planName,
                        price: `${monthlyPrice}/mo or ${hourlyPrice}`,
                        specs: specItems.join(' | '),
                    });
                }
            });
            return data;
        });
        return gpuData;
    } catch (error) {
        console.error(`Error fetching from DigitalOcean: ${error.message}`);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Main function to execute all scrapers and display results.
 */
async function fetchAllPrices() {
    console.log('--- Starting GPU Price Fetcher ---');
    console.time('Total Time');

    // Run all fetching functions in parallel
    const results = await Promise.allSettled([
        fetchRunpodData(),
        fetchVastData(),
        fetchDigitalOceanData()
    ]);

    let allGpus = [];

    // Process the results, collecting data from fulfilled promises
    results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allGpus = allGpus.concat(result.value);
        } else if (result.status === 'rejected') {
            console.error('A provider failed to respond:', result.reason);
        }
    });

    if (allGpus.length > 0) {
        console.log('\n--- Aggregated GPU Rental Prices ---');
        console.table(allGpus);
        console.log('------------------------------------');
    } else {
        console.log('\nCould not fetch data from any provider. Please check the errors above.');
    }

    console.timeEnd('Total Time');
}

// Run the main function
fetchAllPrices();
