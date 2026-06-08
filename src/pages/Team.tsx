import { UserPlus, MessageCircle, Calendar, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const connections = [
  { name: "Ana Beatriz", role: "Amiga • Fitsync", initials: "AB", active: true },
  { name: "Carlos Mota", role: "Parceiro de treino", initials: "CM", active: true },
  { name: "Fernanda Lima", role: "Amiga • Fitsync", initials: "FL", active: false },
  { name: "Ricardo Souza", role: "Colega de academia", initials: "RS", active: true },
];

const professionals = [
  {
    name: "Dra. Mariana Costa",
    role: "Nutricionista",
    specialty: "Nutrição Esportiva",
    rating: 4.9,
    reviews: 127,
    location: "São Paulo, SP",
    initials: "MC",
    bg: "bg-rose-50",
    text: "text-rose-700",
    available: true,
  },
  {
    name: "Dr. Felipe Andrade",
    role: "Personal Trainer",
    specialty: "Hipertrofia e Força",
    rating: 4.8,
    reviews: 94,
    location: "São Paulo, SP",
    initials: "FA",
    bg: "bg-blue-50",
    text: "text-blue-700",
    available: true,
  },
  {
    name: "Dr. Roberto Lima",
    role: "Médico do Esporte",
    specialty: "Performance Atlética",
    rating: 4.7,
    reviews: 213,
    location: "Campinas, SP",
    initials: "RL",
    bg: "bg-green-50",
    text: "text-green-700",
    available: false,
  },
  {
    name: "Dra. Camila Torres",
    role: "Psicóloga",
    specialty: "Bem-estar Mental",
    rating: 5.0,
    reviews: 68,
    location: "Rio de Janeiro, RJ",
    initials: "CT",
    bg: "bg-violet-50",
    text: "text-violet-700",
    available: true,
  },
];

const suggestedPros = [
  {
    name: "Dr. André Santos",
    role: "Endocrinologista",
    rating: 4.6,
    initials: "AS",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  {
    name: "Dra. Juliana Rocha",
    role: "Fisioterapeuta",
    rating: 4.9,
    initials: "JR",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
];

export function Team() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minha Equipe</h1>
          <p className="mt-0.5 text-sm text-slate-500">Sua rede de suporte profissional e social</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Membro
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Main professionals */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Profissionais Experts</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Explorar mais
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {professionals.map((pro) => (
                  <div
                    key={pro.name}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`text-sm font-bold ${pro.bg} ${pro.text}`}>
                        {pro.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{pro.name}</p>
                        {pro.available && (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                            Disponível
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{pro.role} • {pro.specialty}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-slate-700">{pro.rating}</span>
                          <span className="text-xs text-slate-400">({pro.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{pro.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <Button size="sm" className="h-8 gap-1.5 px-3">
                        <Calendar className="h-3.5 w-3.5" />
                        Agendar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested professionals */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Profissionais Sugeridos</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestedPros.map((pro) => (
                  <div
                    key={pro.name}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`text-sm font-bold ${pro.bg} ${pro.text}`}>
                        {pro.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{pro.name}</p>
                      <p className="text-xs text-slate-500">{pro.role}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-slate-700">{pro.rating}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">
                      Conectar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Connections */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Minhas Conexões</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                  {connections.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {connections.map((conn) => (
                  <div
                    key={conn.name}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                          {conn.initials}
                        </AvatarFallback>
                      </Avatar>
                      {conn.active && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{conn.name}</p>
                      <p className="text-xs text-slate-500">{conn.role}</p>
                    </div>
                    <button className="text-slate-400 hover:text-blue-600">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full rounded-lg border border-dashed border-slate-200 py-2.5 text-sm text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600">
                + Convidar amigos
              </button>
            </CardContent>
          </Card>

          {/* Next appointment */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Próximo Agendamento</h2>
              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-sm font-bold text-blue-700">
                      MC
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Dra. Mariana Costa</p>
                    <p className="text-xs text-slate-500">Nutricionista</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  <span>Seg, 28 Out 2024 • 14:00</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Estatísticas</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">4</p>
                  <p className="mt-0.5 text-xs text-slate-500">Profissionais</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">4</p>
                  <p className="mt-0.5 text-xs text-slate-500">Conexões</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">8</p>
                  <p className="mt-0.5 text-xs text-slate-500">Consultas</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">12</p>
                  <p className="mt-0.5 text-xs text-slate-500">Meses ativo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
