"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const WHATSAPP = "5562995045038";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "Olá! Vim pelo site da Fry Sushi e preciso de ajuda."
)}`;

type Faq = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

const FAQS: Faq[] = [
  {
    id: "horario",
    question: "Qual o horário de funcionamento?",
    answer:
      "Funcionamos conforme o status no site: se aparecer “aberto”, é só pedir. Quando fechamos, a mensagem na página inicial mostra o horário de retorno.",
    keywords: ["hora", "horário", "aberto", "fechado", "funciona", "abre"],
  },
  {
    id: "entrega",
    question: "Vocês entregam em Goiânia?",
    answer:
      "Sim! Fazemos delivery em Goiânia. No checkout você escolhe entrega ou retirada e informa o endereço.",
    keywords: ["entrega", "delivery", "goiânia", "goiania", "bairro", "região"],
  },
  {
    id: "pedir",
    question: "Como faço um pedido?",
    answer:
      "Escolha os itens no cardápio, abra o carrinho, preencha nome, telefone e endereço (ou retirada) e finalize com Pix ou cartão pelo Mercado Pago.",
    keywords: ["pedir", "pedido", "como", "carrinho", "comprar", "finalizar"],
  },
  {
    id: "conta",
    question: "Preciso criar conta?",
    answer:
      "Não. Você pode comprar como visitante. Se criar conta em Entrar, ganha 10% OFF automático nos pedidos.",
    keywords: ["conta", "cadastro", "login", "entrar", "cadastrar", "visitante"],
  },
  {
    id: "pagamento",
    question: "Quais formas de pagamento?",
    answer:
      "Pix ou cartão, ambos pelo Mercado Pago na finalização do pedido. O pagamento confirma o pedido automaticamente.",
    keywords: ["pagar", "pagamento", "pix", "cartão", "cartao", "mercado"],
  },
  {
    id: "cupom",
    question: "Tem cupom de desconto?",
    answer:
      "Sim: ao se cadastrar no site você recebe 10% OFF na conta. Colaboradores também podem liberar cupons especiais.",
    keywords: ["cupom", "desconto", "10%", "promo", "oferta"],
  },
  {
    id: "acompanhar",
    question: "Como acompanho meu pedido?",
    answer:
      "Depois de pagar, você vai para a página do pedido com status em tempo real. Guarde o link — pedidos sem login usam um acesso temporário no seu aparelho.",
    keywords: ["acompanhar", "status", "rastreio", "onde", "pedido"],
  },
  {
    id: "contato",
    question: "Como falo com a loja?",
    answer:
      "Pelo WhatsApp (62) 99504-5038. Se eu não souber responder algo, te mando direto para o WhatsApp.",
    keywords: ["contato", "whatsapp", "telefone", "falar", "whats"],
  },
];

type ChatMsg = { role: "bot" | "user"; text: string };

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findAnswer(input: string): { answer: string; matched: boolean } {
  const q = normalize(input);
  if (!q.trim()) {
    return {
      answer: "Pergunte algo sobre o site ou escolha uma opção abaixo.",
      matched: true,
    };
  }

  let best: Faq | null = null;
  let score = 0;
  for (const faq of FAQS) {
    let s = 0;
    for (const kw of faq.keywords) {
      if (q.includes(normalize(kw))) s += 2;
    }
    if (q.includes(normalize(faq.question.slice(0, 18)))) s += 3;
    if (s > score) {
      score = s;
      best = faq;
    }
  }

  if (best && score > 0) {
    return { answer: best.answer, matched: true };
  }

  return {
    answer:
      "Não tenho essa resposta pronta. Fale com a gente no WhatsApp — a equipe Fry Sushi te ajuda rapidinho.",
    matched: false,
  };
}

export function SiteChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "bot",
      text: "Olá! Sou o assistente da Fry Sushi. Pergunte sobre o site, pedidos, entrega ou pagamento. Se eu não souber, te mando para o WhatsApp.",
    },
  ]);

  const suggestions = useMemo(() => FAQS.slice(0, 4), []);
  const hidden = pathname?.startsWith("/admin");

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    const { answer, matched } = findAnswer(trimmed);
    setMessages((m) => {
      const next = [...m, { role: "bot" as const, text: answer }];
      if (!matched) {
        next.push({
          role: "bot",
          text: "Toque em “Falar no WhatsApp” abaixo para continuar.",
        });
      }
      return next;
    });
    setInput("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Abrir chat Fry Sushi"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[60] flex size-14 items-center justify-center rounded-full bg-[var(--salmon)] text-white shadow-lg shadow-black/40 transition hover:scale-105"
      >
        <MessageCircle className="size-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-24 left-4 z-[70] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[var(--ink-soft)] shadow-2xl"
          >
            <div className="flex items-center justify-between bg-[var(--ink-elevated)] px-4 py-3">
              <div>
                <p className="font-display text-lg">Fry Sushi</p>
                <p className="text-xs text-[var(--rice-dim)]">
                  Assistente do site
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar chat"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-[var(--rice-dim)] hover:bg-white/5"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto px-3 py-3">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "bot"
                      ? "bg-black/30 text-[var(--rice)]"
                      : "ml-auto bg-[var(--salmon)] text-white"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div className="mt-1 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => ask(s.question)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--rice-dim)] hover:border-[var(--salmon)] hover:text-[var(--salmon)]"
                  >
                    {s.question}
                  </button>
                ))}
              </div>
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mx-3 mb-2 rounded-xl bg-emerald-600/90 px-3 py-2 text-center text-sm font-medium text-white hover:bg-emerald-500"
            >
              Falar no WhatsApp
            </a>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-white/8 px-3 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida..."
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--salmon)]"
              />
              <button
                type="submit"
                className="flex size-10 items-center justify-center rounded-xl bg-[var(--salmon)] text-white"
                aria-label="Enviar"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
