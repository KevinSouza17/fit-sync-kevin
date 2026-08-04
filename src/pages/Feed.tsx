import { useEffect, useState } from "react";
import { Heart, Send, Trash2, ImagePlus, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { supabase } from "../lib/supabase";
import type { FeedPost } from "../lib/types";

interface PostWithProfile extends FeedPost {
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  like_count: number;
  liked_by_me: boolean;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function Feed() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    loadPosts();
    const channel = supabase
      .channel("feed-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_posts" }, () => loadPosts())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "feed_posts" }, () => loadPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "feed_likes" }, () => loadPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadPosts() {
    const { data: postData } = await supabase
      .from("feed_posts")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!postData) { setLoading(false); return; }
    const postIds = postData.map((p) => p.id);
    const [{ data: likes }, { data: myLikes }] = await Promise.all([
      supabase.from("feed_likes").select("post_id").in("post_id", postIds),
      supabase.from("feed_likes").select("post_id").eq("user_id", user?.id ?? "").in("post_id", postIds),
    ]);
    const likeMap: Record<string, number> = {};
    (likes || []).forEach((l) => { likeMap[l.post_id] = (likeMap[l.post_id] || 0) + 1; });
    const myLikeSet = new Set((myLikes || []).map((l) => l.post_id));
    setPosts(postData.map((p) => ({
      ...p,
      profiles: p.profiles as PostWithProfile["profiles"],
      like_count: likeMap[p.id] || 0,
      liked_by_me: myLikeSet.has(p.id),
    })) as PostWithProfile[]);
    setLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${user.id}/feed-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(fileName, file);
    if (upErr) { setError("Erro ao enviar imagem"); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    setImageUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  async function createPost() {
    if (!content.trim() && !imageUrl) { setError(t("feed.emptyError")); return; }
    setPosting(true);
    setError("");
    const { data } = await supabase
      .from("feed_posts")
      .insert({ content: content.trim(), image_url: imageUrl })
      .select("*, profiles:user_id(full_name, avatar_url)")
      .single();
    if (data) {
      setPosts((prev) => [{
        ...data,
        profiles: data.profiles as PostWithProfile["profiles"],
        like_count: 0,
        liked_by_me: false,
      } as PostWithProfile, ...prev]);
      setContent("");
      setImageUrl(null);
    }
    setPosting(false);
  }

  async function toggleLike(postId: string, liked: boolean) {
    if (liked) {
      await supabase.from("feed_likes").delete().eq("post_id", postId).eq("user_id", user?.id ?? "");
    } else {
      await supabase.from("feed_likes").insert({ post_id: postId });
    }
    setPosts((prev) => prev.map((p) => p.id === postId ? {
      ...p, liked_by_me: !liked, like_count: p.like_count + (liked ? -1 : 1),
    } : p));
  }

  async function deletePost(id: string) {
    await supabase.from("feed_posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const taCls = "w-full rounded-xl border border-edge-base bg-surface-base px-4 py-3 text-sm text-content-strong placeholder:text-content-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-content-strong">{t("feed.title")}</h1>
        <p className="mt-0.5 text-sm text-content-muted">{t("feed.subtitle")}</p>
      </header>

      {/* Composer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("feed.placeholder")}
              rows={3}
              className={taCls}
            />
            {imageUrl && (
              <div className="relative">
                <img src={imageUrl} alt="" className="max-h-64 rounded-xl object-cover" />
                <button onClick={() => setImageUrl(null)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  ref={(el) => setFileInput(el)}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInput?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Imagem
                </Button>
              </div>
              <Button onClick={createPost} disabled={posting} className="gap-2">
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t("feed.post")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <Heart className="mb-3 h-12 w-12 text-slate-200" />
          <h3 className="text-base font-semibold text-content-body">{t("feed.noPosts")}</h3>
          <p className="mt-1 text-sm text-content-muted">{t("feed.noPostsSub")}</p>
        </CardContent></Card>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const name = post.profiles?.full_name || "Usuário";
            return (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {post.profiles?.avatar_url ? (
                          <AvatarImage src={post.profiles.avatar_url} alt={name} />
                        ) : (
                          <AvatarFallback className="bg-primary-50 text-sm font-bold text-primary-600">{initials(name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-content-strong">{name}</p>
                        <p className="text-xs text-content-muted">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    {post.user_id === user?.id && (
                      <button onClick={() => deletePost(post.id)} className="text-content-muted transition-colors hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {post.content && <p className="mt-3 text-sm leading-relaxed text-content-body">{post.content}</p>}
                  {post.image_url && <img src={post.image_url} alt="" className="mt-3 max-h-96 rounded-xl object-cover" />}
                  <div className="mt-3 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleLike(post.id, post.liked_by_me)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                        post.liked_by_me ? "text-rose-600" : "text-content-muted hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.liked_by_me ? "fill-rose-500" : ""}`} />
                      {post.like_count > 0 && <span>{post.like_count}</span>}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
