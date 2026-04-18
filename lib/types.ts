export type ClientType = "ips" | "distribuidor";

export type PaymentTermsKey = "30" | "60" | "90" | "contado";

export interface ProposalData {
  type: ClientType;
  institution: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  city: string;
  discount: number;
  paymentTermsKey: PaymentTermsKey;
  ccEmails: string[];
}

export interface ProductItem {
  name: string;
  price: number;
}

export interface ProductCategory {
  cat: string;
  items: ProductItem[];
}
