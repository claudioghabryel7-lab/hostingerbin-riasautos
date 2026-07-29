import { EmbeddedCheckout } from "@/components/store/EmbeddedCheckout";

export default async function PagarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmbeddedCheckout orderId={id} />;
}
