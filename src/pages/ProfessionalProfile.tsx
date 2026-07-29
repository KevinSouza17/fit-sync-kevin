import { useState } from "react";
import {
  Star,
  MapPin,
  Users,
  Pencil,
  Check,
  X,
  Copy,
  Mail,
  Instagram,
  Phone,
  QrCode,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ─── Plan data ────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  tagline: string;
  features: { label: string; included: boolean }[];
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Plano Básico",
    price: 149,
    popular: false,
    tagline: "Ideal para quem está começando a jornada de saúde e bem-estar.",
    features: [
      { label: "1 consulta mensal", included: true },
      { label: "Plano alimentar inicial", included: true },
      { label: "Acompanhamento por chat", included: true },
      { label: "Acesso ao app", included: true },
      { label: "Avaliações semanais", included: false },
      { label: "Ajustes de dieta", included: false },
    ],
  },
  {
    id: "pro",
    name: "Plano Pro",
    price: 299,
    popular: true,
    tagline: "O mais escolhido! Acompanhamento completo com resultados comprovados.",
    features: [
      { label: "2 consultas mensais", included: true },
      { label: "Plano alimentar personalizado", included: true },
      { label: "Acompanhamento por chat", included: true },
      { label: "Acesso ao app", included: true },
      { label: "Avaliações semanais", included: true },
      { label: "Ajustes de dieta", included: true },
    ],
  },
  {
    id: "elite",
    name: "Plano Elite",
    price: 499,
    popular: false,
    tagline: "Para quem busca alta performance com suporte total e exclusivo.",
    features: [
      { label: "4 consultas mensais", included: true },
      { label: "Plano alimentar personalizado", included: true },
      { label: "Suporte prioritário 24h", included: true },
      { label: "Acesso ao app", included: true },
      { label: "Avaliações semanais", included: true },
      { label: "Ajustes de dieta", included: true },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Simple QR-like SVG pattern (decorative, not a real QR code)
function FakeQR() {
  // 7×7 boolean matrix representing a simplified QR pattern
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0],
    [1,1,0,0,1,0,1,1,0,1,0,1,1,0,0,1,1],
    [0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0],
    [1,0,1,1,0,0,1,0,0,1,1,1,0,0,0,1,1],
    [0,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,1,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,1,0,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,1,0,0,1,0,1,0,1],
  ];
  const size = 7;
  return (
    <svg viewBox={`0 0 ${cells[0].length * size} ${cells.length * size}`} className="h-full w-full">
      {cells.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * size}
              y={y * size}
              width={size}
              height={size}
              fill="#1e293b"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: Plan }) {
  if (plan.popular) {
    return (
      <div className="relative flex flex-col rounded-2xl bg-primary-600 p-6 text-white shadow-xl">
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-1 text-xs font-bold text-white">
          Mais Popular
        </span>
        <h3 className="text-lg font-bold">{plan.name}</h3>
        <p className="mt-1 text-xs text-primary-100">{plan.tagline}</p>
        <div className="my-5 flex items-baseline gap-1">
          <span className="text-4xl font-black">R$ {plan.price}</span>
          <span className="text-sm text-primary-200">/mês</span>
        </div>
        <ul className="flex flex-1 flex-col gap-2.5">
          {plan.features.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-sm">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.included ? "bg-white/20" : "bg-white/10"}`}>
                {f.included ? (
                  <Check className="h-2.5 w-2.5 text-white" />
                ) : (
                  <X className="h-2.5 w-2.5 text-white/40" />
                )}
              </span>
              <span className={f.included ? "text-white" : "text-primary-200/60 line-through decoration-white/30"}>{f.label}</span>
            </li>
          ))}
        </ul>
        <button className="mt-6 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">
          Assinar Agora
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
      <p className="mt-1 text-xs text-primary-600">{plan.tagline}</p>
      <div className="my-5 flex items-baseline gap-1">
        <span className="text-4xl font-black text-slate-900">R$ {plan.price}</span>
        <span className="text-sm text-slate-400">/mês</span>
      </div>
      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-2 text-sm">
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.included ? "bg-primary-50" : "bg-slate-100"}`}>
              {f.included ? (
                <Check className="h-2.5 w-2.5 text-primary-600" />
              ) : (
                <X className="h-2.5 w-2.5 text-slate-300" />
              )}
            </span>
            <span className={f.included ? "text-slate-700" : "text-slate-300 line-through"}>{f.label}</span>
          </li>
        ))}
      </ul>
      <button className="mt-6 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
        Assinar Agora
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfessionalProfile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const name = profile?.full_name || "Dra. Amanda Costa";
  const role = profile?.professional_role || "Nutricionista";
  const specialty = profile?.specialty || "Nutrição Esportiva";
  const credentials = profile?.credentials || "CRN 12345-SP";
  const city = profile?.location_city || "São Paulo, SP";
  const bio =
    profile?.bio ||
    "Nutricionista esportiva com 8 anos de experiência em emagrecimento e performance atlética. Especialista em nutrição funcional e comportamental.";
  const rating = profile?.rating_avg ?? 4.9;
  const ratingCount = profile?.rating_count ?? 312;
  const pixKey = "amanda@luminafit.com.br";

  const displayTitle = `${role}${specialty ? ` · ${credentials}` : ""}`;
  const tags = ["Emagrecimento", "Hipertrofia", "Performance", "Vegano"];

  function handleCopy() {
    navigator.clipboard.writeText(pixKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-0 pb-10">
      {/* ── Hero banner ── */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-700 via-primary-500 to-primary-400">
        {/* decorative wave shapes */}
        <svg
          className="absolute bottom-0 left-0 h-full w-full opacity-20"
          viewBox="0 0 900 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C150,180 350,20 600,120 C750,200 850,60 900,80 L900,200 L0,200 Z"
            fill="white"
          />
          <path
            d="M0,140 C200,60 400,180 650,100 C800,40 870,130 900,110 L900,200 L0,200 Z"
            fill="white"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* ── Profile header card ── */}
      <div className="mx-8 -mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 shrink-0 ring-4 ring-white shadow">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={name} />
              ) : (
                <AvatarFallback className="bg-rose-50 text-2xl font-bold text-rose-600">
                  {initials(name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
              <p className="text-sm text-primary-600 font-medium">
                {role}{credentials ? ` · ${credentials}` : ""}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-700">{rating}</span>
                  <span>({ratingCount} avaliações)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  24 pacientes ativos
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {city}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 self-start sm:self-auto"
            onClick={() => navigate("/profile")}
          >
            <Pencil className="h-4 w-4" />
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* ── Main content + sidebar ── */}
      <div className="mx-8 mt-6 flex flex-col gap-6 xl:flex-row xl:items-start">
        {/* ── Plans ── */}
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Meus Planos</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Escolha o plano ideal para acompanhamento personalizado.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex w-full flex-col gap-4 xl:w-72 xl:shrink-0">
          {/* Pix QR */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Pix — QR Code</h3>
              </div>
              <div className="mx-auto h-40 w-40">
                <FakeQR />
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">Chave Pix</p>
                <p className="mt-0.5 text-sm font-semibold text-primary-600">{pixKey}</p>
              </div>
              <button
                onClick={handleCopy}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copiado!" : "Copiar Chave"}
              </button>
            </CardContent>
          </Card>

          {/* Sobre Mim */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Sobre Mim</h3>
              <p className="text-sm leading-relaxed text-slate-600">{bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Contato</h3>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-center gap-2 text-sm text-primary-600">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  {pixKey}
                </li>
                <li className="flex items-center gap-2 text-sm text-primary-600">
                  <Instagram className="h-4 w-4 shrink-0 text-slate-400" />
                  @dra.amandafit
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  +55 11 9 8765-4321
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
