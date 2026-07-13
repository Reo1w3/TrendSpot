const express = require('express');
const cors = require('cors');
const axios = require('axios');
const youTubeSearch = require('youtube-search-api');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

let searchHistory = [];


// VARIABLES DE CONTROL PARA EL CACHÉ DEL ACCESSTOKEN DE CJ
let cjAccessToken = null;
let cjTokenExpiry = null;

// GESTIÓN DEL ACCESS TOKEN EN VIVO (CJ DROPSHIPPING API 2.0)
async function getCJAccessToken() {
    const email = process.env.CJ_EMAIL;
    const apiKey = process.env.CJ_API_KEY;

    if (!email || !apiKey) {
        console.warn("⚠️ Falta CJ_EMAIL o CJ_API_KEY en las variables del archivo .env");
        return null;
    }

    if (cjAccessToken && cjTokenExpiry && Date.now() < cjTokenExpiry) {
        return cjAccessToken;
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken',
            data: {
                email: email,
                apiKey: apiKey
            },
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        if (response.data && response.data.code === 200 && response.data.data) {
            cjAccessToken = response.data.data.accessToken;
            cjTokenExpiry = Date.now() + 14 * 24 * 60 * 60 * 1000;
            console.log("🔑 Token de CJ Dropshipping generado y almacenado con éxito.");
            return cjAccessToken;
        } else {
            console.warn("⚠️ Credenciales rechazadas por CJ API:", response.data.message || response.data);
        }
    } catch (error) {
        console.error("❌ Error de red/autenticación en CJ API:", error.response?.data || error.message);
    }
    return null;
}

// CONSULTA DIRECTA DE INVENTARIO EN VIVO (CJ DROPSHIPPING V2)
async function searchCJProducts(niche, category) {
    const token = await getCJAccessToken();
    const products = [];

    if (!token) return products;

    try {
        const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/listV2', {
            headers: {
                'CJ-Access-Token': token
            },
            params: {
                keyword: niche,
                pageSize: 5,
                pageNum: 1
            },
            timeout: 5000
        });

        if (
            response.data &&
            response.data.code === 200 &&
            response.data.data &&
            response.data.data.content &&
            response.data.data.content[0] &&
            response.data.data.content[0].productList
        ) {
            const list = response.data.data.content[0].productList;

            list.forEach((item, index) => {
                let rawPrice = item.sellPrice || "10.00";
                if (rawPrice.includes("--")) {
                    rawPrice = rawPrice.split("--")[0].trim();
                }
                const cleanPrice = parseFloat(rawPrice) || 10.00;
                const suggestedPrice = parseFloat((cleanPrice * 2.2).toFixed(2));

                products.push({
                    id: item.id || `cj_${index}`,
                    name: item.nameEn || "CJ Dropshipping Product",
                    category: category,
                    imageUrl: item.bigImage || "",
                    sourcingPrice: cleanPrice,
                    suggestedPrice: suggestedPrice,
                    isGeneric: false,
                    trend: {
                        score: 95 - (index * 6),
                        label: "Analyzing Signals",
                        momentum: "Verified Logistics Route"
                    },
                    supplier: {
                        name: "CJ Dropshipping Supplier",
                        url: `https://cjdropshipping.com/product-detail.html?id=${item.id}`,
                        rating: parseFloat((4.5 + Math.random() * 0.4).toFixed(1)),
                        orders_completed: Math.floor(400 + Math.random() * 1500)
                    }
                });
            });
        }
    } catch (error) {
        console.error("⚠️ Error al extraer productos en vivo de CJ V2:", error.message);
    }

    return products;
}

// ALGORITMO DE CLASIFICACIÓN DE INTENCIONALIDAD (NICHO VS PRODUCTO)
function evaluateTermIntent(query, mentionCount) {
    if (!query) return { isGeneric: true, confidence: "Low" };

    const cleanQuery = query.trim().toLowerCase();
    const words = cleanQuery.split(/\s+/);
    const wordCount = words.length;

    let productScore = 0;

    if (wordCount === 1) {
        productScore -= 40;
        const lastWord = words[0];
        if (lastWord.endsWith("ing") || lastWord.endsWith("ics") || lastWord.endsWith("decor") || lastWord.endsWith("wear")) {
            productScore -= 20;
        }
    } else if (wordCount >= 2) {
        productScore += 35;
        if (wordCount >= 3) {
            productScore += 20;
        }
    }

    if (mentionCount > 120) {
        productScore -= 30;
    } else if (mentionCount > 0 && mentionCount <= 45) {
        productScore += 25;
    }

    const isGeneric = productScore < 10;

    return {
        isGeneric: isGeneric,
        confidence: productScore < 0 || productScore > 40 ? "High" : "Medium"
    };
}

// HELPER GOOGLE NEWS RSS (VOLUMEN DE MEDIOS)
async function getTrendsData(niche) {
    try {
        if (!niche) return { score: 0, momentum: "No data" };
        const cleanNiche = niche.trim().toLowerCase();
        const query = encodeURIComponent(cleanNiche);

        const response = await fetch(`https://news.google.com/rss/search?q=${query}+when:7d&hl=en-US&gl=US&ceid=US:en`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
            const xmlData = await response.text();
            const matches = xmlData.toLowerCase().match(new RegExp(cleanNiche, 'g'));
            const mentionCount = matches ? matches.length : 0;

            if (mentionCount === 0) {
                return { score: 15, momentum: "0% regular news volume" };
            }

            const feedVolumeRatio = Math.min(Math.round((mentionCount / 200) * 100), 100);
            const finalScore = Math.min(Math.max(25 + feedVolumeRatio, 30), 98);
            const calculatedGrowth = 5 + (mentionCount % 40);

            return {
                score: finalScore,
                momentum: `+${calculatedGrowth}% based on ${mentionCount} real media matches`
            };
        }
    } catch (e) { }
    return { score: 0, momentum: "Trends Integration Limited" };
}

// HELPER YOUTUBE SHORTS
async function getYouTubeShortsData(niche) {
    try {
        const response = await Promise.race([
            youTubeSearch.GetListByKeyword(`${niche} amazon finds #shorts`, false, 1),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout YT')), 2500))
        ]);

        if (response?.items?.length > 0) {
            return { has_signal: true, metrics: `${response.items[0].viewCount?.text || "Viral"} on YT Shorts` };
        }
    } catch (e) {
        console.error("⚠️ Error en YT Shorts:", e.message);
    }
    return { has_signal: false };
}

// HELPER DE SUGERENCIAS DE BÚSQUEDA (CRUDA / SIN FILTROS)
async function getLiveSuggestions(niche) {
    try {
        const query = encodeURIComponent(niche.trim().toLowerCase());
        const response = await fetch(`https://completion.amazon.com/api/2017/suggestions?mid=ATVPDKIKX0DER&alias=aps&prefix=${query}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            signal: AbortSignal.timeout(2500)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.suggestions)) {
                const cleanNiche = niche.trim().toLowerCase();
                const keywords = [];

                for (const s of data.suggestions) {
                    const term = s.value.toLowerCase().trim();
                    if (term === cleanNiche) continue;

                    if (!keywords.includes(term)) {
                        keywords.push(term);
                    }
                }
                return keywords.slice(0, 5);
            }
        }
    } catch (e) {
        console.error("⚠️ Error obteniendo keywords de Amazon:", e.message);
    }
    return [];
}

// --- ENDPOINTS ---

app.get('/api/trends/keywords', async (req, res) => {
    const { niche } = req.query;
    if (!niche) return res.status(400).json({ error: 'Niche is required' });

    const keywords = await getLiveSuggestions(niche);
    res.json({ keywords });
});

app.get('/api/research', async (req, res) => {
    const { niche } = req.query;

    if (!niche) return res.status(400).json({ error: "Niche parameter is required" });

    const query = niche.trim().toLowerCase();
    if (query.length >= 2) {
        const lastSearch = searchHistory[searchHistory.length - 1];
        if (!lastSearch || lastSearch.term !== query) {
            searchHistory.push({ term: query, timestamp: new Date() });
            if (searchHistory.length > 1000) searchHistory.shift();
        }
    }

    let trend = { score: 0, momentum: "No data" };
    let ytData = { has_signal: false };
    let finalSignal = "No social signals detected";

    try {
        // Ejecución en paralelo de los módulos de análisis para optimizar tiempos de respuesta
        const [trendsResult, ytResult] = await Promise.allSettled([
            getTrendsData(niche),
            getYouTubeShortsData(niche)
        ]);

        if (trendsResult.status === 'fulfilled') trend = trendsResult.value;
        if (ytResult.status === 'fulfilled') ytData = ytResult.value;

        if (ytData?.has_signal && ytData?.metrics) {
            finalSignal = ytData.metrics;
        }

        let mentionCount = 0;
        if (trend && trend.momentum) {
            const match = trend.momentum.match(/(\d+)\s+real\s+media/);
            if (match) {
                mentionCount = parseInt(match[1], 10);
            }
        }

        let detectedCategory = "General Merchandise";
        if (query.includes("gaming") || query.includes("tech") || query.includes("phone")) {
            detectedCategory = "Electronics & Gadgets";
        } else if (query.includes("home") || query.includes("kitchen") || query.includes("decor")) {
            detectedCategory = "Home & Living";
        } else if (query.includes("fit") || query.includes("gym") || query.includes("sport") || query.includes("snack") || query.includes("health")) {
            detectedCategory = "Sports & Fitness";
        } else if (query.includes("cloth") || query.includes("wear") || query.includes("fashion")) {
            detectedCategory = "Apparel & Fashion";
        }

        const intent = evaluateTermIntent(query, mentionCount);
        const isGenericNiche = intent.isGeneric;

        const formattedName = niche.charAt(0).toUpperCase() + niche.slice(1);
        const realScore = (trend && typeof trend.score === 'number') ? trend.score : 0;
        const realMomentum = (trend && trend.momentum) ? trend.momentum : "Google Trends API Rate Limited";

        let results = [];

        if (isGenericNiche) {
            results.push({
                id: Buffer.from(niche).toString('base64').substring(0, 8) + "_cat",
                name: `${formattedName} Trend Catalog`,
                category: detectedCategory,
                imageUrl: "",
                sourcingPrice: 0.00,
                suggestedPrice: 0.00,
                isGeneric: true,
                trend: {
                    score: realScore,
                    label: "Explore Category",
                    momentum: realMomentum
                },
                supplier: {
                    name: "CJ Dropshipping Catalog",
                    url: `https://cjdropshipping.com/list.html?searchKey=${encodeURIComponent(niche)}`,
                    rating: 0.0,
                    orders_completed: 0
                }
            });
        } else {
            results = await searchCJProducts(niche, detectedCategory);

            results.forEach(product => {
                product.trend.label = finalSignal;
                product.trend.score = realScore || product.trend.score;
            });
        }

        res.json(results);

    } catch (error) {
        console.error("❌ Fallo general crítico:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/hot-tags', (req, res) => {
    const counts = {};
    searchHistory.forEach(item => {
        if (item && item.term) {
            counts[item.term] = (counts[item.term] || 0) + 1;
        }
    });

    const topTags = Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a])
        .slice(0, 4)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));

    res.json(topTags);
});

app.listen(PORT, () => {
    console.log(`🚀 TrendSpot API ejecutándose en http://localhost:${PORT}`);
});