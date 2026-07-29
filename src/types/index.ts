export type MenuCategory = "tradicionais" | "especiais" | "big-hots" | "bebidas" | "combos";

export type OrderStatus =
  | "awaiting_payment"
  | "received"
  | "preparing"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "completed"
  | "rejected"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "refunded"
  | "rejected"
  | "cancelled";

export type FulfillmentType = "delivery" | "pickup";

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
  orderCount?: number;
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
  email?: string;
  address: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  couponPercent?: number;
  welcomeCouponClaimed?: boolean;
  createdAt: number;
  updatedAt?: number;
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
  city: string;
  heroImageUrl: string;
  logoUrl: string;
  accentNote?: string;
  pickupAddress?: string;
  signupCouponPercent?: number;
}

export interface Order {
  id: string;
  userId?: string;
  guestToken?: string;
  isGuest?: boolean;
  customer: CustomerInfo;
  fulfillment: FulfillmentType;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountPercent?: number;
  discountAmount?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  refundId?: string;
  customerConfirmedDelivery?: boolean;
  reviewed?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: number;
  visible: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  percent: number;
  userId?: string;
  userEmail?: string;
  note?: string;
  active: boolean;
  createdAt: number;
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
  ready_for_pickup: "Pronto para retirada",
  completed: "Finalizado",
  rejected: "Recusado",
  cancelled: "Cancelado",
};
