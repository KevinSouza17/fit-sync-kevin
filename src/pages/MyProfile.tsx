import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Settings, Pencil, Heart, MessageCircle, MoreHorizontal,
  UserRound, UserPlus, MessageSquare, ShieldCheck, X, Grid3X3,
} from "lucide-react";
import { AvatarPreview } from "../components/ui/AvatarPreview";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface ProfilePost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
}

interface SuggestedProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_professional: boolean | null;
  professional_role: string | null;
}

type ProfileTab = "posts" | "replies" | "reposts" | "media";

function joinedDate(value: string | undefined) {
  if (!value) return "agosto de 2026";
  return new Date(value).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function MyProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [suggested, setSuggested] = useState<SuggestedProfile[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: rawPosts }, { count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from("feed_posts").select("id, user_id, content, image_url, video_url, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("followee_id", user.id).eq("status", "accepted"),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id).eq("status", "accepted"),
    ]);

    const postRows = rawPosts ?? [];
    const postIds = postRows.map((post) => post.id);
    let likeCounts: Record<string, number> = {};
    let commentCounts: Record<string, number> = {};
    if (postIds.length > 0) {
      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase.from("feed_likes").select("post_id").in("post_id", postIds),
        supabase.from("feed_comments").select("post_id").in("post_id", postIds),
      ]);
      likeCounts = (likes ?? []).reduce<Record<string, number>>((map, like) => ({ ...map, [like.post_id]: (map[like.post_id] ?? 0) + 1 }), {});
      commentCounts = (comments ?? []).reduce<Record<string, number>>((map, comment) => ({ ...map, [comment.post_id]: (map[comment.post_id] ?? 0) + 1 }), {});
    }

    setPosts(postRows.map((post) => ({
      ...post,
      like_count: likeCounts[post.id] ?? 0,
      comment_count: commentCounts[post.id] ?? 0,
    })) as ProfilePost[]);
    setFollowers(followersCount ?? 0);
    setFollowing(followingCount ?? 0);

    const { data: suggestions } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, is_professional, professional_role")
      .neq("id", user.id)
      .limit(3);
    setSuggested((suggestions ?? []) as SuggestedProfile[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadProfileData(); }, [loadProfileData]);

  const name = profile?.full_name || user?.email?.split("@")[0] || "Usuario";
  const handle = `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "fitsync"}`;
  const visiblePosts = activeTab === "media" ? posts.filter((post) => post.image_url || post.video_url) : posts;
  const filteredSuggestions = suggested.filter((person) => (person.full_name ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-full bg-white text-slate-950 dark:bg-surface-base dark:text-content-strong">
      <div className="mx-auto grid min-h-screen w-full max-w-[1180px] grid-cols-1 lg:grid-cols-[minmax(0,620px)_360px] lg:gap-7">
        <main className="min-w-0 border-x border-slate-200 dark:border-edge-base">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-5 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-edge-base dark:bg-surface-card/95">
            <button onClick={() => navigate(-1)} aria-label="Voltar" className="rounded-full p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-surface-subtle">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold">{name}</h1>
              <p className="text-xs text-slate-500 dark:text-content-muted">{posts.length} posts</p>
            </div>
            <button onClick={() => navigate("/settings")} className="ml-auto rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-surface-subtle">
              <Settings className="h-5 w-5" />
            </button>
          </header>

          <div className="h-48 bg-slate-200 dark:bg-slate-700 sm:h-52" />
          <section className="relative border-b border-slate-200 px-4 pb-4 dark:border-edge-base sm:px-5">
            <div className="flex items-end justify-between">
              <div className="-mt-14 rounded-full border-4 border-white bg-slate-300 shadow-sm dark:border-surface-base dark:bg-slate-600">
                <AvatarPreview src={profile?.avatar_url} name={name} size="lg" className="h-28 w-28 border-0" fallbackClassName="text-3xl" />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <button onClick={() => navigate("/settings")} className="rounded-full border border-slate-300 p-2 transition-colors hover:bg-slate-50 dark:border-edge-base dark:hover:bg-surface-subtle">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="rounded-full gap-1.5 font-bold">
                  <Pencil className="h-4 w-4" /> Editar perfil
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-extrabold">{name}</h2>
                {profile?.is_professional && <ShieldCheck className="h-5 w-5 fill-sky-500 text-white" />}
              </div>
              <p className="text-sm text-slate-500 dark:text-content-muted">{handle}</p>
              {profile?.bio && <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>}
              <p className="mt-3 text-sm text-slate-500 dark:text-content-muted">Entrou em {joinedDate(profile?.created_at)}</p>
              <div className="mt-3 flex gap-5 text-sm">
                <button onClick={() => setActiveTab("posts")} className="hover:underline"><strong>{following}</strong> <span className="text-slate-500 dark:text-content-muted">Seguindo</span></button>
                <button onClick={() => setActiveTab("posts")} className="hover:underline"><strong>{followers}</strong> <span className="text-slate-500 dark:text-content-muted">Seguidores</span></button>
              </div>
            </div>
          </section>

          <div className="m-4 rounded-2xl bg-emerald-100 p-4 dark:bg-emerald-950/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">Seu perfil ainda não está verificado</h3>
                <p className="mt-1 text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">Complete seu perfil para destacar sua jornada, acompanhar seu progresso e conectar-se com a comunidade.</p>
                <button onClick={() => navigate("/profile")} className="mt-3 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]">Completar perfil</button>
              </div>
              <button className="rounded-full p-1 text-emerald-800 hover:bg-emerald-200 dark:text-emerald-200" aria-label="Fechar aviso"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <nav className="grid grid-cols-4 border-b border-slate-200 dark:border-edge-base">
            {(["posts", "replies", "reposts", "media"] as ProfileTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-2 py-4 text-sm font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-surface-subtle ${activeTab === tab ? "text-slate-950 dark:text-content-strong" : "text-slate-500 dark:text-content-muted"}`}>
                {tab === "posts" ? "Posts" : tab === "replies" ? "Respostas" : tab === "reposts" ? "Reposts" : "Mídia"}
                {activeTab === tab && <span className="absolute inset-x-5 bottom-0 h-1 rounded-full bg-primary-500" />}
              </button>
            ))}
          </nav>

          <section className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Vamos preparar seu perfil</h3>
              <Grid3X3 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SetupCard icon={UserRound} color="from-sky-500 to-cyan-400" title="Complete seu perfil" onClick={() => navigate("/profile")} />
              <SetupCard icon={UserPlus} color="from-fuchsia-500 to-blue-500" title="Siga pessoas" onClick={() => navigate("/feed")} />
              <SetupCard icon={MessageSquare} color="from-amber-400 to-orange-500" title="Conheça a comunidade" onClick={() => navigate("/feed")} />
              <SetupCard icon={Heart} color="from-pink-500 to-rose-500" title="Compartilhe sua jornada" onClick={() => navigate("/feed")} />
            </div>
          </section>

          {loading ? (
            <div className="flex h-32 items-center justify-center border-t border-slate-200 dark:border-edge-base"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
          ) : visiblePosts.length === 0 ? (
            <div className="border-t border-slate-200 px-5 py-12 text-center dark:border-edge-base"><p className="font-semibold">Ainda não há publicações</p><p className="mt-1 text-sm text-slate-500 dark:text-content-muted">Compartilhe sua primeira conquista no Feed.</p></div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 border-t border-slate-200 dark:border-edge-base">
              {visiblePosts.map((post) => (
                <button key={post.id} onClick={() => post.image_url && setLightbox(post.image_url)} className="group relative aspect-square overflow-hidden bg-slate-100 text-left dark:bg-slate-800">
                  {post.image_url ? <img src={post.image_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : post.video_url ? <video src={post.video_url} className="h-full w-full object-cover" muted /> : <div className="flex h-full items-center justify-center bg-sky-50 p-3 dark:bg-sky-950/30"><p className="line-clamp-5 text-center text-xs">{post.content}</p></div>}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100"><span className="flex items-center gap-1 text-sm font-bold"><Heart className="h-4 w-4 fill-white" />{post.like_count}</span><span className="flex items-center gap-1 text-sm font-bold"><MessageCircle className="h-4 w-4" />{post.comment_count}</span></div>
                </button>
              ))}
            </div>
          )}
        </main>

        <aside className="hidden pt-3 lg:block">
          <label className="flex items-center gap-3 rounded-full border border-slate-300 px-4 py-2.5 text-slate-500 focus-within:border-primary-500 dark:border-edge-base dark:bg-surface-card">
            <Search className="h-5 w-5" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-edge-base">
            <h3 className="px-4 pt-4 text-xl font-extrabold">Talvez você goste</h3>
            {filteredSuggestions.map((person) => <SuggestionRow key={person.id} person={person} onClick={() => navigate(`/profile/${person.id}`)} />)}
            {filteredSuggestions.length === 0 && <p className="px-4 py-5 text-sm text-slate-500">Nenhuma sugestão encontrada.</p>}
            <button onClick={() => navigate("/feed")} className="px-4 pb-4 pt-2 text-sm text-sky-500 hover:underline">Ver mais</button>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 p-4 dark:border-edge-base">
            <h3 className="text-xl font-extrabold">O que está acontecendo</h3>
            {[["Fitness · Em alta", "Treino e bem-estar"], ["Nutrição · Em alta", "Receitas saudáveis"], ["Comunidade FitSync", "Compartilhe sua evolução"]].map(([label, title]) => <div key={title} className="mt-5 flex items-start justify-between"><div><p className="text-xs text-slate-500 dark:text-content-muted">{label}</p><p className="mt-1 text-sm font-bold">{title}</p></div><MoreHorizontal className="h-4 w-4 text-slate-500" /></div>)}
            <button onClick={() => navigate("/feed")} className="mt-5 text-sm text-sky-500 hover:underline">Ver mais</button>
          </div>
          <p className="px-4 py-4 text-xs leading-6 text-slate-500">Termos · Privacidade · Cookies · Acessibilidade · © 2026 FitSync</p>
        </aside>
      </div>

      {lightbox && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}><img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain" /></div>}
    </div>
  );
}

function SetupCard({ icon: Icon, color, title, onClick }: { icon: typeof UserRound; color: string; title: string; onClick: () => void }) {
  return <button onClick={onClick} className="group text-left"><div className={`flex aspect-[1.15] items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm transition-transform group-hover:-translate-y-0.5`}><Icon className="h-8 w-8" /></div><p className="mt-2 text-xs font-bold leading-snug">{title}</p></button>;
}

function SuggestionRow({ person, onClick }: { person: SuggestedProfile; onClick: () => void }) {
  const name = person.full_name || "Usuário";
  return <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-surface-subtle"><AvatarPreview src={person.avatar_url} name={name} userId={person.id} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{name}</p><p className="truncate text-xs text-slate-500 dark:text-content-muted">@{name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) || "fitsync"}</p></div><span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">Seguir</span></button>;
}
