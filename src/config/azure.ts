export const azureOpenAiConfig = {
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini",
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
};

export const isAzureOpenAiConfigured = () =>
  Boolean(azureOpenAiConfig.apiKey && azureOpenAiConfig.endpoint);
