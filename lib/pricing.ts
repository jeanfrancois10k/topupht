export interface PricingRule {
  type: "FIXED" | "PERCENTAGE";
  value: number;
  min?: number;
  max?: number;
}

export interface PriceCalculation {
  cost_provider: number;
  platform_margin: number;
  payment_fee: number;
  price_gamer: number;
  price_seller: number;
  price_pro_seller: number;
  price_partner: number;
  margin_gamer: number;
  margin_seller: number;
}

export function calculatePrice(params: {
  costProvider: number;
  platformMarginRate: number;
  paymentFeeRate: number;
  sellerMarginRate: number;
  currency?: string;
}): PriceCalculation {
  const { costProvider, platformMarginRate, paymentFeeRate, sellerMarginRate } = params;

  const platformMargin = costProvider * (platformMarginRate / 100);
  const basePrice = costProvider + platformMargin;
  const paymentFee = basePrice * (paymentFeeRate / 100);

  const priceGamer = Math.ceil((basePrice + paymentFee) * 100) / 100;
  const sellerPrice = Math.ceil(priceGamer * (1 - sellerMarginRate / 100) * 100) / 100;
  const priceProSeller = Math.ceil(priceGamer * (1 - sellerMarginRate * 0.75 / 100) * 100) / 100;
  const pricePartner = Math.ceil(priceGamer * (1 - sellerMarginRate * 1.25 / 100) * 100) / 100;

  return {
    cost_provider: costProvider,
    platform_margin: platformMargin,
    payment_fee: paymentFee,
    price_gamer: priceGamer,
    price_seller: sellerPrice,
    price_pro_seller: priceProSeller,
    price_partner: pricePartner,
    margin_gamer: priceGamer - costProvider,
    margin_seller: priceGamer - sellerPrice,
  };
}

export function applyPromotion(amount: number, promotionType: "PERCENTAGE" | "FIXED_AMOUNT" | "CASHBACK", value: number): number {
  switch (promotionType) {
    case "PERCENTAGE":
      return amount - (amount * value / 100);
    case "FIXED_AMOUNT":
      return Math.max(0, amount - value);
    case "CASHBACK":
      return amount;
    default:
      return amount;
  }
}

export function parseNumericValue(value: string | number): number {
  if (typeof value === "number") return value;
  return parseFloat(value.replace(/[^0-9.]/g, ""));
}

export function validateAmount(amount: string, min: number = 0): boolean {
  const num = parseNumericValue(amount);
  return !isNaN(num) && num > 0;
}

export function formatPrice(amount: number, currency: string = "HTG"): string {
  if (currency === "HTG") {
    return `${Math.round(amount).toLocaleString("ht-HT")} HTG`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}