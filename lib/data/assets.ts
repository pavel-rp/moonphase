
export interface Asset {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  supply: number;
  maxSupply: number | null;
  marketCapUsd: number;
  volumeUsd24Hr: number;
  priceUsd: number;
  changePercent24Hr: number;
  vwap24Hr: number;
  explorer: string;
}

export async function fetchAssets(): Promise<Array<Asset>> {
  try {
    const url = `https://rest.coincap.io/v3/assets?limit=15&offset=0&apiKey=${process.env.COINCAP_API_KEY}`;
    console.log("Fetching assets from:", url);
    
    const res = await fetch(url, { next: { revalidate: 60 } });
    console.log("Response status:", res.status);
    
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const { data: assets } = await res.json();
    console.log("Fetched assets:", assets?.length || 0);
    
    return assets.map((asset: Asset) => ({
      ...asset,
      supply: Number(asset.supply),
      maxSupply: asset.maxSupply ? Number(asset.maxSupply) : null,
      marketCapUsd: Number(asset.marketCapUsd),
      volumeUsd24Hr: Number(asset.volumeUsd24Hr),
      priceUsd: Number(asset.priceUsd),
      changePercent24Hr: Number(asset.changePercent24Hr),
      vwap24Hr: Number(asset.vwap24Hr),
    }));
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
}
