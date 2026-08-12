import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Trash2, Loader2, MessageCircle, Share2, Lock, Unlock,
  Settings, Image as ImageIcon, Users, UserPlus, Pencil,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { StoryViewer } from "../components/StoryViewer";
import type { StoryItem, StoryGroup } from "../components/StoryViewer";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { supabase } from "../lib/supabase";

interface PostWithProfile {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  like_count: number;
  liked_by_me: boolean;
  comment_count: number;
}

interface FollowUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_professional: boolean | null;
  professional_role: string | null;
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

type Tab = "posts" | "followers" | "following";

export function MyProfile() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profileStories, setProfileStories] = useState<StoryItem[]>([]);
  const [activeStoryGroup, setActiveStoryGroup] = useState<StoryGroup | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [tab, setTab] = useState<Tab>("posts");
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const profileId = user?.id ?? "";

  const loadPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: postData } = await supabase
      .from("feed_posts")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (postData && postData.length > 0) {
      const postIds = postData.map((p) => p.id);
      const [{ data: likes }, { data: myLikes }, { data: commentCounts }] = await Promise.all([
        supabase.from("feed_likes").select("post_id").in("post_id", postIds),
        supabase.from("feed_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("feed_comments").select("post_id").in("post_id", postIds),
      ]);
      const likeMap: Record<string, number> = {};
      (likes || []).forEach((l) => { likeMap[l.post_id] = (likeMap[l.post_id] || 0) + 1; });
      const myLikeSet = new Set((myLikes || []).map((l) => l.post_id));
      const commentMap: Record<string, number> = {};
      (commentCounts || []).forEach((c) => { commentMap[c.post_id] = (commentMap[c.post_id] || 0) + 1; });
      setPosts(postData.map((p) => ({
        ...p,
        profiles: p.profiles as PostWithProfile["profiles"],
        like_count: likeMap[p.id] || 0,
        liked_by_me: myLikeSet.has(p.id),
        comment_count: commentMap[p.id] || 0,
      })) as PostWithProfile[]);
    } else {
      setPosts([]);
    }
    setLoading(false);
  }, [user]);

  const loadCounts = useCallback(async () => {
    if (!user) return;
    const [{ count: fCount }, { count: fgCount }] = await Promise.all([
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("followee_id", user.id).eq("status", "accepted"),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id).eq("status", "accepted"),
    ]);
    setFollowerCount(fCount ?? 0);
    setFollowingCount(fgCount ?? 0);
  }, [user]);

  const loadStories = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    const { data: sData } = await supabase
      .from("stories")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("user_id", user.id)
      .gt("expires_at", now)
      .order("created_at", { ascending: false });
    setProfileStories((sData ?? []) as StoryItem[]);
  }, [user]);

  useEffect(() => {
    loadPosts();
    loadCounts();
    loadStories();
  }, [loadPosts, loadCounts, loadStories]);

  async function loadFollowers() {
    if (!user) return;
    setListLoading(true);
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("followee_id", user.id)
      .eq("status", "accepted");
    const ids = (data || []).map((f) => f.follower_id);
    if (ids.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_professional, professional_role")
        .in("id", ids);
      setFollowers((profilesData ?? []) as FollowUser[]);
    } else {
      setFollowers([]);
    }
    setListLoading(false);
  }

  async function loadFollowing() {
    if (!user) return;
    setListLoading(true);
    const { data } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", user.id)
      .eq("status", "accepted");
    const ids = (data || []).map((f) => f.followee_id);
    if (ids.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_professional, professional_role")
        .in("id", ids);
      setFollowing((profilesData ?? []) as FollowUser[]);
    } else {
      setFollowing([]);
    }
    setListLoading(false);
  }

  useEffect(() => {
    if (tab === "followers") loadFollowers();
    if (tab === "following") loadFollowing();
  }, [tab]);

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

  async function togglePrivacy() {
    if (!profile) return;
    const newPrivate = !profile.is_private;
    await supabase.from("profiles").update({ is_private: newPrivate }).eq("id", user?.id);
    window.location.reload();
  }

  const name = profile?.full_name || user?.email?.split("@")[0] || "Usuario";

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "posts", label: t("feed.posts"), count: posts.length },
    { key: "followers", label: t("feed.followers"), count: followerCount },
    { key: "following", label: t("feed.followingCount"), count: followingCount },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 sm:px-6">
      {/* Profile header */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Cover */}
          <div className="relative h-36 w-full bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 sm:h-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          </div>

          <div className="px-5 pb-5 sm:px-8">
            {/* Avatar + actions */}
            <div className="flex items-end justify-between">
              <button
                onClick={() => {
                  if (profileStories.length > 0) {
                    setActiveStoryGroup({ userId: profileId, stories: profileStories });
                    setActiveStoryIndex(0);
                  }
                }}
                className={`-mt-12 shrink-0 ${profileStories.length > 0 ? "cursor-pointer" : "cursor-default"}`}
                title={profileStories.length > 0 ? "Ver stories" : undefined}
              >
                <div className={`h-24 w-24 rounded-full ring-4 ring-white shadow-xl ${profileStories.length > 0 ? "bg-gradient-to-tr from-primary-400 to-primary-600 p-0.5" : ""}`}>
                  <Avatar className="h-full w-full overflow-hidden rounded-full border-2 border-white">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={name} />
                    ) : (
                      <AvatarFallback className="bg-primary-50 text-2xl font-bold text-primary-600">{initials(name)}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </button>

              <div className="flex items-center gap-2 pb-1">
                <Button variant="outline" size="sm" onClick={togglePrivacy} className="gap-1.5">
                  {profile?.is_private ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  <span className="hidden sm:inline">{profile?.is_private ? t("feed.profilePrivate") : t("feed.profilePublic")}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="gap-1.5">
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("editProfile.title")}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/settings")} className="gap-1.5">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Name + bio */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-content-strong">{name}</h1>
                {profile?.is_professional && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    PRO
                  </span>
                )}
              </div>
              {profile?.is_professional && profile?.professional_role && (
                <p className="mt-0.5 text-sm font-medium text-primary-600">{profile.professional_role}</p>
              )}
              {profile?.bio && <p className="mt-2 text-sm leading-relaxed text-content-body">{profile.bio}</p>}
            </div>

            {/* Stats as tabs */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-surface-subtle p-1">
              {tabs.map((tb) => (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  className={`flex flex-col items-center rounded-lg py-2.5 transition-all ${tab === tb.key ? "bg-surface-card shadow-sm" : "hover:bg-surface-card/50"}`}
                >
                  <span className={`text-lg font-bold ${tab === tb.key ? "text-primary-600" : "text-content-strong"}`}>{tb.count}</span>
                  <span className="text-xs text-content-muted">{tb.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab content */}
      {tab === "posts" && (
        loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle">
                <ImageIcon className="h-8 w-8 text-content-muted" />
              </div>
              <p className="mt-4 text-sm font-medium text-content-body">{t("feed.noPosts")}</p>
              <p className="mt-1 text-xs text-content-muted">{t("feed.noPostsSub")}</p>
              <Button className="mt-4" size="sm" onClick={() => navigate("/feed")}>
                {t("feed.createPost")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
                {post.image_url && (
                  <div className="aspect-square w-full overflow-hidden bg-surface-subtle">
                    <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile.avatar_url} alt={name} />
                        ) : (
                          <AvatarFallback className="bg-primary-50 text-xs font-bold text-primary-600">{initials(name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-content-strong">{name}</p>
                        <p className="text-[11px] text-content-muted">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    <button onClick={() => deletePost(post.id)} className="text-content-muted transition-colors hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {post.content && <p className="mt-3 line-clamp-3 break-words text-sm leading-relaxed text-content-body">{post.content}</p>}
                  <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => toggleLike(post.id, post.liked_by_me)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${post.liked_by_me ? "text-rose-600" : "text-content-muted hover:text-rose-500"}`}
                    >
                      <Heart className={`h-4 w-4 ${post.liked_by_me ? "fill-rose-500" : ""}`} />
                      {post.like_count > 0 && <span>{post.like_count}</span>}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-primary-500">
                      <MessageCircle className="h-4 w-4" />
                      {post.comment_count > 0 && <span>{post.comment_count}</span>}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-primary-500">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === "followers" && (
        listLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : followers.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium text-content-body">{t("myProfile.noFollowers")}</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {followers.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(`/profile/${f.id}`)}
                className="flex items-center gap-3 rounded-xl bg-surface-card p-3 text-left transition-colors hover:bg-surface-subtle"
              >
                <Avatar className="h-10 w-10">
                  {f.avatar_url ? <AvatarImage src={f.avatar_url} alt={f.full_name ?? ""} /> : (
                    <AvatarFallback className="bg-primary-50 text-sm font-bold text-primary-600">{initials(f.full_name ?? "?")}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-content-strong">{f.full_name ?? "Usuario"}</p>
                  {f.is_professional && <p className="text-xs text-primary-600">{f.professional_role}</p>}
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {tab === "following" && (
        listLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : following.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12 text-center">
            <UserPlus className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium text-content-body">{t("myProfile.noFollowing")}</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {following.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(`/profile/${f.id}`)}
                className="flex items-center gap-3 rounded-xl bg-surface-card p-3 text-left transition-colors hover:bg-surface-subtle"
              >
                <Avatar className="h-10 w-10">
                  {f.avatar_url ? <AvatarImage src={f.avatar_url} alt={f.full_name ?? ""} /> : (
                    <AvatarFallback className="bg-primary-50 text-sm font-bold text-primary-600">{initials(f.full_name ?? "?")}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-content-strong">{f.full_name ?? "Usuario"}</p>
                  {f.is_professional && <p className="text-xs text-primary-600">{f.professional_role}</p>}
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {/* Story viewer */}
      {activeStoryGroup && (
        <StoryViewer
          group={activeStoryGroup}
          index={activeStoryIndex}
          onIndexChange={setActiveStoryIndex}
          onClose={() => { setActiveStoryGroup(null); setActiveStoryIndex(0); }}
          allGroups={[activeStoryGroup]}
          onGroupChange={() => {}}
        />
      )}
    </div>
  );
}
