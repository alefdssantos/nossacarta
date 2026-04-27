// Shim para resolver a divergência entre exports e arquivos reais do @abacatepay/sdk.
// O package.json aponta types pra ./dist/index.d.ts mas só existe em ./dist/sdk/src/...
// Mantém apenas o que usamos.

declare module "@abacatepay/sdk" {
  type Cents = number;

  type CheckoutItem = {
    id?: string;
    name: string;
    description?: string;
    quantity: number;
    price: Cents;
  };

  type Customer = {
    name: string;
    email: string;
    cellphone?: string;
    taxId?: string;
  };

  type CreateCheckoutBody = {
    methods?: ("PIX" | "CARD")[] | "PIX" | "CARD";
    returnUrl?: string;
    completionUrl?: string;
    customerId?: string;
    customer?: Customer;
    coupons?: string[];
    externalId?: string;
    metadata?: Record<string, unknown>;
    items: CheckoutItem[];
  };

  type APICheckout = {
    id: string;
    url: string;
    amount: Cents;
    paidAmount: Cents | null;
    externalId: string | null;
    items: CheckoutItem[];
  };

  export function AbacatePay(opts: { secret: string; rest?: unknown }): {
    checkouts: {
      create(body: CreateCheckoutBody): Promise<APICheckout>;
      get(id: string): Promise<APICheckout>;
    };
    pix: {
      create(body: {
        amount: Cents;
        expiresIn?: number;
        description?: string;
        customer?: Customer;
        metadata?: Record<string, unknown>;
      }): Promise<{
        id: string;
        amount: Cents;
        status: string;
        brCode: string;
        brCodeBase64: string;
        platformFee?: Cents;
        expiresAt?: string;
      }>;
      simulate(id: string, metadata?: Record<string, unknown>): Promise<unknown>;
      status(id: string): Promise<{ status: string; expiresAt?: string }>;
    };
    customers: {
      get(id: string): Promise<unknown>;
      create(body: Customer): Promise<unknown>;
    };
  };
}
