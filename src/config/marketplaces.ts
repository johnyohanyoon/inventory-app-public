/**
 * Marketplace Platform Configuration
 *
 * This file defines all available marketplace platforms.
 * To add a new marketplace, simply add a new entry to the array.
 * No component changes needed!
 */

export interface MarketplacePlatform {
  id: string;          // Unique identifier
  name: string;        // Display name
  icon?: string;       // Optional: Icon name or URL
  urlPattern?: string; // Optional: URL template for validation
  color?: string;      // Optional: Brand color for UI
}

/**
 * Available marketplace platforms
 *
 * ✅ To add a new marketplace: Just add it here!
 * ✅ To remove a marketplace: Just delete it here!
 * ✅ No component modification needed!
 */
export const MARKETPLACE_PLATFORMS: MarketplacePlatform[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    urlPattern: 'https://www.amazon.com/',
    color: '#FF9900',
  },
  {
    id: 'ebay',
    name: 'eBay',
    urlPattern: 'https://www.ebay.com/',
    color: '#E53238',
  },
  {
    id: 'etsy',
    name: 'Etsy',
    urlPattern: 'https://www.etsy.com/',
    color: '#F1641E',
  },
  {
    id: 'facebook',
    name: 'Facebook Marketplace',
    urlPattern: 'https://www.facebook.com/marketplace/',
    color: '#1877F2',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    urlPattern: 'https://*.myshopify.com/',
    color: '#96BF48',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    urlPattern: 'https://www.walmart.com/',
    color: '#0071CE',
  },
  {
    id: 'other',
    name: 'Other',
    color: '#6B7280',
  },
];

/**
 * Helper function: Get marketplace by ID
 */
export const getMarketplaceById = (id: string): MarketplacePlatform | undefined => {
  return MARKETPLACE_PLATFORMS.find(platform => platform.id === id);
};

/**
 * Helper function: Get marketplace by name (for backward compatibility)
 */
export const getMarketplaceByName = (name: string): MarketplacePlatform | undefined => {
  return MARKETPLACE_PLATFORMS.find(
    platform => platform.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Helper function: Validate marketplace URL
 */
export const isValidMarketplaceUrl = (
  marketplaceId: string,
  url: string
): boolean => {
  const marketplace = getMarketplaceById(marketplaceId);

  if (!marketplace?.urlPattern) {
    return true; // No pattern defined, accept any URL
  }

  // Simple pattern matching (can be enhanced with regex)
  const pattern = marketplace.urlPattern.replace('*', '');
  return url.includes(pattern);
};
