export interface TopupRequest {
  orderId: string;
  playerId: string;
  serverId?: string;
  productSku: string;
}

export interface TopupResponse {
  success: boolean;
  providerTransactionId?: string;
  errorMessage?: string;
}

export interface IProvider {
  name: string;
  topup(request: TopupRequest): Promise<TopupResponse>;
  checkBalance?(): Promise<number>;
}
