import { Client } from "@microsoft/microsoft-graph-client";
import {
  IPublicClientApplication,
  SilentRequest,
  AuthenticationResult,
} from "@azure/msal-browser";
import { loginRequest } from "../config/authConfig";
import { InventoryItem } from "@/types"; // We'll create this interface

// Add interfaces for the service
interface DriveItem {
  id: string;
  name: string;
}

interface DriveItemResponse {
  value: DriveItem[];
}

class ExcelService {
  private msalInstance: IPublicClientApplication;

  constructor(msalInstance: IPublicClientApplication) {
    this.msalInstance = msalInstance;
  }

  async getAuthenticatedClient(): Promise<Client> {
    const account = this.msalInstance.getAllAccounts()[0];
    const accessToken: AuthenticationResult =
      await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      } as SilentRequest);

    return Client.init({
      authProvider: (done: (error: any, token?: string) => void) => {
        done(null, accessToken.accessToken);
      },
    });
  }

  async initializeWorkbook(fileName: string): Promise<string> {
    const client = await this.getAuthenticatedClient();

    try {
      // Check if file exists
      const files: DriveItemResponse = await client
        .api(`/me/drive/root/children`)
        .filter(`name eq '${fileName}'`)
        .get();

      if (files.value.length === 0) {
        // Create new workbook
        const workbook: DriveItem = await client
          .api("/me/drive/root:/inventory.xlsx:/content")
          .put(this.createEmptyWorkbook());
        return workbook.id;
      }

      return files.value[0].id;
    } catch (error) {
      console.error("Error initializing workbook:", error);
      throw error;
    }
  }

  async syncInventoryData(items: InventoryItem[]): Promise<void> {
    const client = await this.getAuthenticatedClient();

    try {
      const workbookId = await this.initializeWorkbook("inventory.xlsx");

      // Convert items to Excel format
      const values: (string | number)[][] = items.map((item) => [
        item.name,
        item.quantity,
        item.category,
        item.price,
        item.marketplaces
          .map(
            (m) =>
              `${m.platform}: $${m.listingPrice}${m.url ? ` (${m.url})` : ""}`
          )
          .join("; "),
      ]);

      // Update worksheet
      await client
        .api(
          `/me/drive/items/${workbookId}/workbook/worksheets/Sheet1/range(address='A2:E${
            values.length + 1
          }')`
        )
        .patch({
          values: values,
        });
    } catch (error) {
      console.error("Error syncing data:", error);
      throw error;
    }
  }

  createEmptyWorkbook(): string[][] {
    // Create a basic Excel workbook structure
    const headers: string[][] = [
      ["Name", "Quantity", "Category", "Cost Price", "Marketplace Listings"],
    ];

    return headers;
  }
}

export default ExcelService;
