import { IProvider, TopupRequest, TopupResponse } from "./types";
import { generateId } from "@/lib/utils";

export class MockProvider implements IProvider {
  name = "MockProvider";

  async topup(request: TopupRequest): Promise<TopupResponse> {
    console.log(`[MockProvider] Initiating topup for order ${request.orderId}...`);
    console.log(`[MockProvider] Payload:`, request);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate failure if player_id is exactly "ERROR"
    if (request.playerId === "ERROR") {
      console.log(`[MockProvider] Simulating failure for player_id = ERROR`);
      return {
        success: false,
        errorMessage: "Identifiant joueur invalide (Simulé)",
      };
    }

    console.log(`[MockProvider] Topup successful!`);
    return {
      success: true,
      providerTransactionId: `mock_tx_${generateId()}`,
    };
  }

  async checkBalance(): Promise<number> {
    return 9999.99;
  }
}
