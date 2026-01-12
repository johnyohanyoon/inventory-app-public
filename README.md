# Inventory Manager

A modern inventory management application built with React and TypeScript, featuring Microsoft Excel synchronization and multi-marketplace tracking.

## Features

- **Inventory Management** - Add, edit, and delete inventory items with categories
- **Multi-Marketplace Support** - Track listings across Amazon, eBay, Etsy, and Facebook Marketplace
- **Microsoft Excel Sync** - Real-time synchronization with Excel Online via Microsoft Graph API
- **Import/Export** - CSV and XLSX file import/export support
- **Search & Filter** - Quick search across all inventory items
- **Dark/Light Theme** - Toggle between dark and light modes
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Authentication**: Microsoft MSAL (Azure AD)
- **APIs**: Microsoft Graph API
- **Data Processing**: PapaParse, SheetJS (xlsx)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Microsoft 365 account (for Excel sync feature)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/inventory-manager.git

# Navigate to project directory
cd inventory-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

For Microsoft Excel sync, configure your Azure AD application:

1. Register an app in [Azure Portal](https://portal.azure.com)
2. Add redirect URI: `http://localhost:5173`
3. Enable "Files.ReadWrite" and "User.Read" permissions
4. Update `src/config/authConfig.ts` with your client ID

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   └── ui/           # Radix UI components (Button, Card, Dialog, etc.)
├── config/
│   └── authConfig.ts # MSAL configuration
├── services/
│   └── excelService.ts # Microsoft Graph API integration
├── types/
│   └── index.ts      # TypeScript interfaces
├── InventoryManagement.tsx # Main application component
└── main.tsx          # Application entry point
```

## Key Features Explained

### Multi-Marketplace Tracking

Each inventory item can have multiple marketplace listings:

```typescript
interface MarketplaceListing {
  platform: string;      // Amazon, eBay, Etsy, etc.
  listingPrice: string;  // Price on that platform
  url?: string;          // Link to listing
}
```

### Excel Synchronization

Inventory data syncs automatically to Excel Online when changes are made. Manual sync is also available. Requires Microsoft 365 authentication.

### Data Persistence

- Local data stored in browser's localStorage
- Export to CSV/XLSX for backup
- Import from CSV/XLSX to restore or bulk add items

## License

MIT
