export const msalConfig = {
    auth: {
        clientId: "YOUR_AZURE_CLIENT_ID", // Replace with your Azure App Registration Client ID
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "http://localhost:3000", // Update this for production
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest = {
    scopes: [
        "Files.ReadWrite",
        "Sites.ReadWrite.All",
        "User.Read"
    ]
};