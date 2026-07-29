"use client";

import { DbImage } from "@/components/ui/DbImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingBag,
  X,
  MapPin,
  Phone,
  UserRound,
  Bike,
  Store,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAdminAuth";
import {
  createOrder,
  ensureStoreSeeded,
  subscribeMenu,
  subscribeReviews,
  subscribeSettings,
} from "@/lib/store";
import { formatCurrency, formatPhone, cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type FulfillmentType,
  type MenuCategory,
  type MenuItem,
  type Review,
  type StoreSettings,
} from "@/types";
import { DEFAULT_SETTINGS } from "@/data/defaults";

const CATEGORIES: MenuCategory[] = [
  "big-hots",
  "tradicionais",
  "especiais",
  "combos",
  "bebidas",
];

export function StoreFront() {
  const router = useRouter();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "todos">(
    "todos"
  );
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [couponToast, setCouponToast] = useState(false);
  const cart = useCart();
  const { user, profile, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (!localStorage.getItem("frysushi_banner_closed")) {
          setShowBanner(true);
        }
        if (sessionStorage.getItem("frysushi_welcome_coupon")) {
          setCouponToast(true);
          sessionStorage.removeItem("frysushi_welcome_coupon");
          setTimeout(() => setCouponToast(false), 8000);
        }
      } catch {
        /* ignore */
      }
    });
  }, []);

  useEffect(() => {
    let unsubSettings = () => {};
    let unsubMenu = () => {};
    let unsubReviews = () => {};
    (async () => {
      await ensureStoreSeeded();
      unsubSettings = subscribeSettings(setSettings);
      unsubMenu = subscribeMenu((items) => {
        setMenu(items);
        setLoading(false);
      }, true);
      unsubReviews = subscribeReviews(setReviews);
    })();
    return () => {
      unsubSettings();
      unsubMenu();
      unsubReviews();
    };
  }, []);

  const featured = useMemo(
    () => menu.filter((m) => m.featured).slice(0, 4),
    [menu]
  );

  const mostOrdered = useMemo(
    () =>
      [...menu]
        .filter((m) => (m.orderCount || 0) > 0)
        .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
        .slice(0, 4),
    [menu]
  );

  const filtered = useMemo(() => {
    if (activeCategory === "todos") return menu;
    return menu.filter((m) => m.category === activeCategory);
  }, [menu, activeCategory]);

  const wa = settings.phone.replace(/\D/g, "");

  if (isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--rice-dim)]">
        Redirecionando ao painel...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-28">
      <div className="pointer-events-none absolute inset-0 pattern-overlay" />

      {showBanner && !user && (
        <div className="relative z-50 border-b border-[var(--salmon)]/40 bg-[var(--salmon)] text-[var(--ink)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold">
            <p>
              Cadastre-se e sua conta recebe{" "}
              <strong>10% OFF</strong> em todos os pedidos!
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/entrar"
                className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs text-[var(--rice)]"
              >
                Quero o cupom
              </Link>
              <button
                aria-label="Fechar"
                onClick={() => {
                  setShowBanner(false);
                  localStorage.setItem("frysushi_banner_closed", "1");
                }}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {couponToast && (
        <div className="fixed bottom-24 left-1/2 z-[80] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-black shadow-xl">
          Parabéns! Sua conta ganhou <strong>10% OFF</strong> em todos os pedidos.
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[color-mix(in_oklab,var(--ink)_78%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <DbImage
              src="/images/logo-fry-sushi.png"
              alt="Fry Sushi"
              width={52}
              height={52}
              className="rounded-full bg-black/40 object-cover ring-1 ring-white/15"
              priority
            />
            <div>
              <p className="font-display text-xl leading-none tracking-wide text-[var(--rice)] sm:text-2xl">
                {settings.storeName || "Fry Sushi"}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--rice-dim)]">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5",
                    settings.isOpen ? "text-emerald-300" : "text-amber-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      settings.isOpen ? "pulse-dot" : "bg-amber-400"
                    )}
                  />
                  {settings.isOpen ? "Aberto agora" : "Fechado"}
                </span>
                <span>· Goiânia</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 lg:flex">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    document
                      .getElementById("cardapio")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full px-3 py-1.5 text-sm text-[var(--rice-dim)] transition hover:bg-white/8 hover:text-[var(--rice)]"
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </nav>
            {user ? (
              <div className="flex items-center gap-2">
                {profile?.couponPercent ? (
                  <span className="hidden rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] text-emerald-200 sm:inline">
                    {profile.couponPercent}% OFF na conta
                  </span>
                ) : null}
                <Link
                  href="/entrar"
                  className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-[var(--rice)]"
                >
                  {profile?.name?.split(" ")[0] || "Conta"}
                </Link>
                <button
                  onClick={() => logout()}
                  className="rounded-full px-2 py-1.5 text-xs text-[var(--rice-dim)]"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/entrar"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm text-[var(--rice)]"
              >
                <UserRound className="size-4" />
                Entrar
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
          <CategoryChip
            active={activeCategory === "todos"}
            onClick={() => setActiveCategory("todos")}
            label="Tudo"
          />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              label={CATEGORY_LABELS[cat]}
            />
          ))}
        </div>
      </header>

      <section className="relative min-h-[88vh] w-full overflow-hidden">
        <DbImage
          src={settings.heroImageUrl || "/images/hero-sushi.jpg"}
          alt="Fry Sushi Goiânia"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
            className="mb-5"
          >
            <DbImage
              src="/images/logo-fry-sushi.png"
              alt="Fry Sushi"
              width={120}
              height={120}
              className="rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-white/20"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl leading-[0.95] text-[var(--rice)] sm:text-7xl md:text-8xl"
          >
            Fry Sushi
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-lg text-lg text-[var(--rice)]/90 md:text-xl"
          >
            {settings.accentNote}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button
              size="lg"
              onClick={() =>
                document
                  .getElementById("cardapio")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ver cardápio
            </Button>
            <a
              href={`https://wa.me/55${wa}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-xl border border-white/20 px-5 text-sm font-semibold"
            >
              WhatsApp
            </a>
            {!settings.isOpen && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {settings.closedMessage}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {mostOrdered.length > 0 && activeCategory === "todos" && (
        <section className="relative mx-auto max-w-6xl px-4 py-10">
          <h2 className="font-display text-3xl text-[var(--rice)] md:text-4xl">
            Mais pedidos
          </h2>
          <p className="mt-2 text-[var(--rice-dim)]">
            Os queridinhos da galera em Goiânia.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mostOrdered.map((item, i) => (
              <div key={item.id} className="relative">
                <span className="absolute left-3 top-3 z-30 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-orange-300 ring-1 ring-orange-400/40">
                  🔥 Mais pedido
                </span>
                <MenuCard
                  item={item}
                  index={i}
                  storeOpen={settings.isOpen}
                  onOpen={() => setSelected(item)}
                  onAdd={() => cart.addItem(item)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && activeCategory === "todos" && (
        <section className="relative mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-3xl text-[var(--rice)] md:text-4xl">
            Em destaque
          </h2>
          <p className="mt-2 text-[var(--rice-dim)]">
            Os hot rolls que mais pedem em Goiânia.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item, i) => (
              <MenuCard
                key={item.id}
                item={item}
                index={i}
                storeOpen={settings.isOpen}
                onOpen={() => setSelected(item)}
                onAdd={() => cart.addItem(item)}
              />
            ))}
          </div>
        </section>
      )}

      <section id="cardapio" className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-[var(--rice)] md:text-4xl">
              Cardápio
            </h2>
            <p className="mt-2 text-[var(--rice-dim)]">
              Toque no prato para ver foto, descrição e preço.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <MenuCard
                key={item.id}
                item={item}
                index={i}
                storeOpen={settings.isOpen}
                onOpen={() => setSelected(item)}
                onAdd={() => cart.addItem(item)}
              />
            ))}
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section className="relative mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-3xl text-[var(--rice)] md:text-4xl">
            Avaliações
          </h2>
          <p className="mt-2 text-[var(--rice-dim)]">
            O que quem pediu está falando.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-white/8 bg-white/4 p-4"
              >
                <p className="text-amber-300">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(Math.max(0, 5 - r.rating))}
                </p>
                <p className="mt-2 text-sm text-[var(--rice)]">{r.comment}</p>
                <p className="mt-3 text-xs text-[var(--rice-dim)]">
                  {r.customerName}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="mx-auto mt-10 max-w-6xl border-t border-white/8 px-4 py-10 text-sm text-[var(--rice-dim)]">
        <div className="flex flex-wrap gap-6">
          <a
            href={`https://wa.me/55${wa}`}
            className="flex items-center gap-2 hover:text-[var(--rice)]"
          >
            <Phone className="size-4 text-[var(--salmon)]" />
            {settings.phone}
          </a>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-[var(--salmon)]" />
            {settings.address}
          </p>
        </div>
        <p className="mt-4 opacity-70">
          © {new Date().getFullYear()} Fry Sushi · Goiânia
        </p>
      </footer>

      <button
        className="cart-fab flex size-14 items-center justify-center rounded-full bg-[var(--salmon)] text-[var(--ink)] shadow-[0_12px_40px_rgba(232,111,74,0.45)] transition hover:scale-105"
        onClick={() => cart.setOpen(true)}
        aria-label="Abrir sacola"
      >
        <ShoppingBag className="size-6" />
        {cart.count > 0 && (
          <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-bold text-[var(--rice)] ring-2 ring-[var(--salmon)]">
            {cart.count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {selected && (
          <ItemModal
            item={selected}
            storeOpen={settings.isOpen}
            closedMessage={settings.closedMessage}
            onClose={() => setSelected(null)}
            onAdd={() => {
              cart.addItem(selected);
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>

      <CartDrawer settings={settings} />
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition",
        active
          ? "bg-[var(--salmon)] text-[var(--ink)]"
          : "bg-white/6 text-[var(--rice-dim)] hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}

function MenuCard({
  item,
  index,
  storeOpen,
  onOpen,
  onAdd,
}: {
  item: MenuItem;
  index: number;
  storeOpen: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}
      className="menu-tile group cursor-pointer rounded-2xl bg-[var(--ink-soft)]"
      onClick={onOpen}
    >
      <div className="relative aspect-[4/5] w-full">
        <DbImage
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--salmon)]">
          {CATEGORY_LABELS[item.category]}
        </p>
        <h3 className="font-display mt-1 text-2xl text-white">{item.name}</h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-white">
            {formatCurrency(item.price)}
          </p>
          <Button
            size="sm"
            disabled={!storeOpen}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            Adicionar
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function ItemModal({
  item,
  storeOpen,
  closedMessage,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  storeOpen: boolean;
  closedMessage: string;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-[var(--ink-elevated)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72 w-full">
          <DbImage src={item.imageUrl} alt={item.name} fill className="object-cover" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--salmon)]">
            {CATEGORY_LABELS[item.category]}
          </p>
          <h3 className="font-display mt-1 text-3xl">{item.name}</h3>
          <p className="mt-3 text-[var(--rice-dim)]">{item.description}</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-2xl font-semibold">{formatCurrency(item.price)}</p>
            {storeOpen ? (
              <Button size="lg" onClick={onAdd}>
                Adicionar
              </Button>
            ) : (
              <p className="max-w-[14rem] text-right text-sm text-amber-200">
                {closedMessage}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CartDrawer({ settings }: { settings: StoreSettings }) {
  const cart = useCart();
  const router = useRouter();
  const { user, profile, updateCustomerProfile } = useAuth();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("delivery");
  const [payMethod, setPayMethod] = useState<"pix" | "card">("pix");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    complement: "",
    neighborhood: "",
    notes: "",
  });

  useEffect(() => {
    if (!cart.open) {
      queueMicrotask(() => setStep("cart"));
    }
  }, [cart.open]);

  useEffect(() => {
    if (!profile) return;
    queueMicrotask(() => {
      setForm((f) => ({
        ...f,
        name: profile.name || f.name,
        phone: profile.phone || f.phone,
        address: profile.address || f.address,
        complement: profile.complement || f.complement,
        neighborhood: profile.neighborhood || f.neighborhood,
      }));
    });
  }, [profile]);

  const deliveryFee =
    fulfillment === "delivery" ? settings.deliveryFee || 0 : 0;
  const discountPercent =
    user && profile?.couponPercent ? Number(profile.couponPercent) : 0;
  const discountAmount =
    discountPercent > 0
      ? Math.round(cart.subtotal * (discountPercent / 100) * 100) / 100
      : 0;
  const total =
    Math.max(0, cart.subtotal - discountAmount) +
    (cart.items.length ? deliveryFee : 0);

  const checkout = async () => {
    setError("");
    if (!settings.isOpen) {
      setError(settings.closedMessage);
      return;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Preencha nome completo e telefone.");
      return;
    }
    if (fulfillment === "delivery" && !form.address.trim()) {
      setError("Informe o endereço de entrega em Goiânia.");
      return;
    }
    if (cart.subtotal < (settings.minOrder || 0)) {
      setError(`Pedido mínimo: ${formatCurrency(settings.minOrder)}`);
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        await updateCustomerProfile({
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          complement: form.complement.trim(),
          neighborhood: form.neighborhood.trim(),
          city: "Goiânia",
        });
      }

      const guestToken =
        !user && typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : !user
            ? `guest_${Date.now()}`
            : undefined;

      const { rememberGuestOrder } = await import("@/lib/store");

      const orderId = await createOrder({
        ...(user?.uid ? { userId: user.uid } : {}),
        ...(guestToken ? { guestToken, isGuest: true } : { isGuest: false }),
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          ...(user?.email ? { email: user.email } : {}),
          address:
            fulfillment === "delivery"
              ? form.address.trim()
              : settings.pickupAddress || "Retirada em Goiânia",
          ...(form.complement.trim()
            ? { complement: form.complement.trim() }
            : {}),
          ...(form.neighborhood.trim()
            ? { neighborhood: form.neighborhood.trim() }
            : {}),
          city: "Goiânia",
          ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
        },
        fulfillment,
        items: cart.items,
        subtotal: cart.subtotal,
        deliveryFee,
        ...(discountPercent
          ? { discountPercent, discountAmount }
          : {}),
        total,
        status: "awaiting_payment",
        paymentStatus: "pending",
      });

      if (guestToken) rememberGuestOrder(orderId, guestToken);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentMethod: payMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no checkout");

      if (data.preferenceId) {
        const { doc, updateDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        await updateDoc(doc(db, "orders", orderId), {
          mpPreferenceId: data.preferenceId,
          updatedAt: Date.now(),
        });
      }

      cart.clear();
      cart.setOpen(false);

      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        router.push(`/pedido/${orderId}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao finalizar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {cart.open && (
        <motion.div
          className="fixed inset-0 z-[70] flex justify-end bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0" onClick={() => cart.setOpen(false)} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative flex h-full w-full max-w-md flex-col bg-[var(--ink-elevated)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <h2 className="font-display text-2xl">
                {step === "cart" ? "Sacola" : "Finalizar"}
              </h2>
              <button onClick={() => cart.setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {step === "cart" ? (
                cart.items.length === 0 ? (
                  <p className="text-[var(--rice-dim)]">
                    Sua sacola está vazia. Escolha um Big Hot.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {cart.items.map((item) => (
                      <li key={item.id} className="flex gap-3">
                        <div className="relative size-16 overflow-hidden rounded-xl">
                          <DbImage
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-[var(--rice-dim)]">
                            {formatCurrency(item.price)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              className="rounded-lg bg-white/8 p-1"
                              onClick={() =>
                                cart.setQty(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              className="rounded-lg bg-white/8 p-1"
                              onClick={() =>
                                cart.setQty(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <div className="space-y-4">
                  {!user && (
                    <div className="rounded-xl border border-[var(--salmon)]/30 bg-[var(--salmon)]/10 px-3 py-2 text-sm">
                      Pedido sem conta — preencha seus dados.{" "}
                      <Link href="/entrar" className="underline">
                        Cadastre-se e ganhe 10% OFF
                      </Link>
                    </div>
                  )}
                  {user && discountPercent > 0 && (
                    <div className="rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
                      Cupom da sua conta: {discountPercent}% OFF aplicado
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillment("delivery")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm",
                        fulfillment === "delivery"
                          ? "border-[var(--salmon)] bg-[var(--salmon)]/15"
                          : "border-white/10 bg-black/20"
                      )}
                    >
                      <Bike className="size-5" />
                      Entrega
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillment("pickup")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm",
                        fulfillment === "pickup"
                          ? "border-[var(--salmon)] bg-[var(--salmon)]/15"
                          : "border-white/10 bg-black/20"
                      )}
                    >
                      <Store className="size-5" />
                      Retirada
                    </button>
                  </div>

                  {(
                    [
                      ["name", "Nome completo"],
                      ["phone", "Telefone / WhatsApp"],
                      ...(fulfillment === "delivery"
                        ? ([
                            ["address", "Endereço completo (Goiânia)"],
                            ["neighborhood", "Bairro"],
                            ["complement", "Complemento"],
                          ] as const)
                        : []),
                      ["notes", "Observações"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block text-sm">
                      <span className="mb-1.5 block text-[var(--rice-dim)]">
                        {label}
                      </span>
                      {key === "notes" ? (
                        <textarea
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-[var(--salmon)]"
                          rows={3}
                          value={form[key]}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, [key]: e.target.value }))
                          }
                        />
                      ) : (
                        <input
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-[var(--salmon)]"
                          value={form[key]}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              [key]:
                                key === "phone"
                                  ? formatPhone(e.target.value)
                                  : e.target.value,
                            }))
                          }
                        />
                      )}
                    </label>
                  ))}

                  {fulfillment === "pickup" && (
                    <p className="rounded-xl bg-white/5 px-3 py-2 text-sm text-[var(--rice-dim)]">
                      {settings.pickupAddress}
                    </p>
                  )}

                  <div>
                    <p className="mb-2 text-sm text-[var(--rice-dim)]">
                      Como deseja pagar?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod("pix")}
                        className={cn(
                          "rounded-2xl border px-3 py-4 text-sm font-semibold",
                          payMethod === "pix"
                            ? "border-[var(--salmon)] bg-[var(--salmon)]/15"
                            : "border-white/10 bg-black/20"
                        )}
                      >
                        Pix
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod("card")}
                        className={cn(
                          "rounded-2xl border px-3 py-4 text-sm font-semibold",
                          payMethod === "card"
                            ? "border-[var(--salmon)] bg-[var(--salmon)]/15"
                            : "border-white/10 bg-black/20"
                        )}
                      >
                        Cartão
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/8 px-5 py-4">
              <div className="mb-3 space-y-1 text-sm">
                <div className="flex justify-between text-[var(--rice-dim)]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Desconto ({discountPercent}%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--rice-dim)]">
                  <span>
                    {fulfillment === "pickup" ? "Retirada" : "Taxa de entrega"}
                  </span>
                  <span>
                    {fulfillment === "pickup"
                      ? "Grátis"
                      : cart.items.length
                        ? formatCurrency(deliveryFee)
                        : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              {error && <p className="mb-3 text-sm text-amber-200">{error}</p>}
              {!settings.isOpen && (
                <p className="mb-3 rounded-xl bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
                  {settings.closedMessage}
                </p>
              )}
              {step === "cart" ? (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!cart.items.length || !settings.isOpen}
                  onClick={() => setStep("checkout")}
                >
                  Continuar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep("cart")}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-[1.4]"
                    size="lg"
                    disabled={submitting || !settings.isOpen}
                    onClick={checkout}
                  >
                    {submitting ? "Finalizando..." : "Finalizar pedido"}
                  </Button>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
