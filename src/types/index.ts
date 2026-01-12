export interface MarketplaceListing {
  platform: string;
  listingPrice: string;
  url?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: string | number;
  category: string;
  price: string | number;
  marketplaces: MarketplaceListing[];
}
