import { IProvider } from "./types";
import { MockProvider } from "./mock-provider";

const providers = new Map<string, IProvider>();

// Register providers
providers.set("MOCK", new MockProvider());
// When ready: providers.set("SMILEONE", new SmileOneProvider());
// When ready: providers.set("UNIPIN", new UniPinProvider());

export function getProvider(name: string): IProvider {
  const provider = providers.get(name.toUpperCase());
  if (!provider) {
    // Default fallback to Mock if provider isn't strictly configured (useful for development)
    console.warn(`[Registry] Provider '${name}' not found. Falling back to MOCK provider.`);
    return providers.get("MOCK")!;
  }
  return provider;
}
