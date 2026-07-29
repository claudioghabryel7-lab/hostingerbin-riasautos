import { OrderTracker } from "@/components/store/OrderTracker";

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  return <OrderTracker orderId={id} paymentHint={payment} />;
}
