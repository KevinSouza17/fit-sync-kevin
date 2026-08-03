import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Search, ArrowLeft, MessageCircle, UserCircle, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { InviteModal } from "../components/InviteModal";
import { useI18n } from "../context/I18nContext";

interface ConversationRow {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string;
  otherName: string;
  otherRole: string;
  otherId: string;
  otherAvatar: string | null;
  lastContent: string;
  unread: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}

export function Messages() {
  const { user } = useAuth();
  const { notifications, markRead } = useNotifications();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messages, setMessages] = useState<{ id: string; sender_id: string; content: string; created_at: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId);

  // ── Load conversation list ──────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convs) {
      setLoading(false);
      return;
    }

    const enriched: ConversationRow[] = await Promise.all(
      convs.map(async (c) => {
        const otherId = c.user_a_id === user.id ? c.user_b_id : c.user_a_id;
        const { data: other } = await supabase
          .from("profiles")
          .select("full_name, professional_role, is_professional, avatar_url")
          .eq("id", otherId)
          .maybeSingle();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, read, sender_id")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .eq("read", false)
          .neq("sender_id", user.id);

        return {
          id: c.id,
          user_a_id: c.user_a_id,
          user_b_id: c.user_b_id,
          last_message_at: c.last_message_at,
          otherId,
          otherName: other?.full_name || "Usuário",
          otherRole: other?.is_professional ? other.professional_role ?? t("messages.professional") : t("messages.patient"),
          otherAvatar: other?.avatar_url ?? null,
          lastContent: lastMsg?.content ?? "",
          unread: count ?? 0,
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Realtime: refresh conversation list when messages change ─────────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messages-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        loadConversations();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        loadConversations();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadConversations]);

  // ── Select conversation from URL param on first load ────────────────────
  useEffect(() => {
    const targetId = searchParams.get("c");
    if (targetId && conversations.length > 0 && !activeId) {
      const c = conversations.find((cv) => cv.id === targetId);
      if (c) {
        setActiveId(c.id);
        setActiveName(c.otherName);
      }
    }
  }, [searchParams, conversations, activeId]);

  // ── Load messages for active conversation ───────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);

      // Mark incoming messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", activeId)
          .neq("sender_id", user.id)
          .eq("read", false);
        loadConversations();
      }

      // Live new messages in this conversation
      channel = supabase
        .channel(`conv-${activeId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
          (payload) => {
            const row = payload.new as { id: string; sender_id: string; content: string; created_at: string };
            setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
            if (user && row.sender_id !== user.id) {
              supabase
                .from("messages")
                .update({ read: true })
                .eq("id", row.id)
                .eq("read", false)
                .then(() => loadConversations());
            }
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeId, user, loadConversations]);

  // ── Scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send message ────────────────────────────────────────────────────────
  async function handleSend() {
    if (!draft.trim() || !activeId || !user) return;
    const text = draft.trim();
    setDraft("");
    const { data } = await supabase
      .from("messages")
      .insert({ conversation_id: activeId, sender_id: user.id, content: text })
      .select("id, sender_id, content, created_at")
      .single();
    if (data) {
      setMessages((prev) => [...prev, data]);
      loadConversations();
      // Best-effort email notification to the recipient.
      fireMessageEmail(activeId, text).catch(() => {});
    }
  }

  async function fireMessageEmail(convId: string, content: string) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-message`;
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId: convId, content }),
    });
  }

  function openConversation(c: ConversationRow) {
    setActiveId(c.id);
    setActiveName(c.otherName);
    setSearchParams({ c: c.id });
    // Mark any message notifications tied to this conversation as read.
    notifications
      .filter((n) => n.type === "message" && n.conversation_id === c.id && !n.read)
      .forEach((n) => markRead(n.id));
  }

  const filtered = conversations.filter((c) =>
    !search.trim() || c.otherName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* ── Conversation list ── */}
      <aside
        className={`flex w-full flex-col border-r border-slate-200 bg-white md:w-80 xl:w-96 ${
          activeId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">{t("messages.title")}</h1>
              <p className="mt-0.5 text-xs text-slate-500">{t("messages.subtitle")}</p>
            </div>
            <button
              onClick={() => setInviteOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700"
              title={t("messages.invitePerson")}
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder={t("messages.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="mb-2 h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-600">{t("messages.noConversations")}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {t("messages.inviteSomeone")}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  activeId === c.id ? "bg-primary-50" : "hover:bg-slate-50"
                }`}
              >
                <Avatar className="h-11 w-11 shrink-0">
                  {c.otherAvatar ? (
                    <AvatarImage src={c.otherAvatar} alt={c.otherName} />
                  ) : (
                    <AvatarFallback className="bg-primary-100 text-sm font-bold text-primary-700">
                      {initials(c.otherName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.otherName}</p>
                    <span className="shrink-0 text-[10px] text-slate-400">{formatTime(c.last_message_at)}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{c.lastContent || c.otherRole}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat panel ── */}
      {activeId && activeConv ? (
        <section className="flex flex-1 flex-col bg-slate-50">
          {/* Chat header */}
          <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3.5">
            <button
              onClick={() => {
                setActiveId(null);
                setActiveName("");
                setSearchParams({});
              }}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary-100 text-sm font-bold text-primary-700">
                {initials(activeName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{activeName}</p>
              <p className="text-xs text-primary-600">{activeConv.otherRole}</p>
            </div>
            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <UserCircle className="h-5 w-5" />
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                  <MessageCircle className="mb-2 h-10 w-10 text-slate-200" />
                  <p className="text-sm text-slate-400">{t("messages.noMessagesYet")}</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isMine
                            ? "rounded-br-md bg-primary-600 text-white"
                            : "rounded-bl-md bg-white text-slate-700"
                        }`}
                      >
                        <p>{m.content}</p>
                        <p className={`mt-1 text-[10px] ${isMine ? "text-primary-100" : "text-slate-400"}`}>
                          {formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <input
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder={t("messages.typeMessage")}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="hidden flex-1 flex-col items-center justify-center bg-slate-50 md:flex">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <MessageCircle className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700">{t("messages.yourMessages")}</h2>
            <p className="mt-1 max-w-xs text-sm text-slate-400">
              {t("messages.selectConversation")}
            </p>
            <button
              onClick={() => setInviteOpen(true)}
              className="mt-5 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <UserPlus className="h-4 w-4" />
              {t("messages.invitePerson")}
            </button>
          </div>
        </section>
      )}

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
