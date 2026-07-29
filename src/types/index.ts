export type MenuCategory = "tradicionais" | "especiais" | "big-hots" | "bebidas" | "combos";

export type OrderStatus =
  | "awaiting_payment"
  | "received"
  | "preparing"
  | "out_for_delivery"
  | "completed"
  | "rejected"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "refunded"
  | "rejected"
  | "cancelled";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  available: boolean;
  featured?: boolean;
  sortOrder: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  complement?: string;
  neighborhood?: string;
  notes?: string;
}

export interface StoreSettings {
  isOpen: boolean;
  closedMessage: string;
  reopenAt: string;
  deliveryFee: number;
  minOrder: number;
  storeName: string;
  phone: string;
  address: string;
  heroImageUrl: string;
  logoUrl: string;
  accentNote?: string;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  refundId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  name?: string;
  createdAt: number;
}

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  "big-hots": "Big Hots",
  tradicionais: "Tradicionais",
  especiais: "Especiais",
  combos: "Combos",
  bebidas: "Bebidas",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Aguardando pagamento",
  received: "Pedido recebido",
  preparing: "Sendo preparado",
  out_for_delivery: "Saiu para entrega",
  completed: "Finalizado",
  rejected: "Recusado",
  cancelled: "Cancelado",
};
