import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  Check,
  X,
  CalendarCheck,
  CalendarX,
  User,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Appointment {
  id: string;
  user_id: string;
  professional_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
}

interface EnrichedAppointment extends Appointment {
  otherName: string;
  otherAvatar: string | null;
  otherRole: string | null;
  otherIsPro: boolean;
}

const statusConfig: Record<
  AppointmentStatus,
  { badge: string; dot: string; label: string }
> = {
  pending: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "appointments.statusPending",
  },
  confirmed: {
    badge: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    dot: "bg-green-500",
    label: "appointments.statusConfirmed",
  },
  completed: {
    badge: "bg-slate-200 text-slate-700 dark:bg-slate-500/25 dark:text-slate-300",
    dot: "bg-slate-500",
    label: "appointments.statusCompleted",
  },
  cancelled: {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot: "bg-red-500",
    label: "appointments.statusCancelled",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function fmtTime(t: string) {
  return t.slice(0, 5);
}

function isPast(apt: Appointment) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(apt.appointment_date + "T00:00:00") < today;
}

export function Appointments() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [roleView, setRoleView] = useState<"pro" | "client">("pro");
  const [busyId, setBusyId] = useState<string | null>(null);

  const isProfessional = !!profile?.is_professional;

  const loadAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .or(`user_id.eq.${user.id},professional_id.eq.${user.id}`)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (!data) {
      setLoading(false);
      return;
    }

    const enriched: EnrichedAppointment[] = await Promise.all(
      (data as Appointment[]).map(async (apt) => {
        const otherId =
          apt.user_id === user.id ? apt.professional_id : apt.user_id;
        const { data: p } = await supabase
          .from("profiles")
          .select(
            "full_name, avatar_url, professional_role, is_professional"
          )
          .eq("id", otherId)
          .maybeSingle();
        return {
          ...apt,
          otherName: p?.full_name || "—",
          otherAvatar: p?.avatar_url ?? null,
          otherRole: p?.professional_role ?? null,
          otherIsPro: !!p?.is_professional,
        };
      })
    );
    setAppointments(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function updateStatus(id: string, status: AppointmentStatus) {
    setBusyId(id);
    await supabase.from("appointments").update({ status }).eq("id", id);
    setBusyId(null);
    await loadAppointments();
  }

  const isInRole = (apt: EnrichedAppointment) =>
    roleView === "pro"
      ? apt.professional_id === user?.id
      : apt.user_id === user?.id;

  const filtered = appointments.filter((apt) => {
    if (isProfessional && !isInRole(apt)) return false;
    const past =
      isPast(apt) ||
      apt.status === "completed" ||
      apt.status === "cancelled";
    return tab === "upcoming" ? !past : past;
  });

  const ordered = tab === "past" ? [...filtered].reverse() : filtered;

  const upcomingCount = appointments.filter(
    (a) =>
      !(isPast(a) || a.status === "completed" || a.status === "cancelled") &&
      (!isProfessional || isInRole(a))
  ).length;
  const pastCount = appointments.filter(
    (a) =>
      (isPast(a) || a.status === "completed" || a.status === "cancelled") &&
      (!isProfessional || isInRole(a))
  ).length;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-content-strong">
          {t("appointments.title")}
        </h1>
        <p className="mt-0.5 text-sm text-content-muted">
          {t("appointments.subtitle")}
        </p>
      </header>

      {/* Role segment for professionals */}
      {isProfessional && (
        <div className="inline-flex w-full max-w-xs rounded-xl border border-edge-base bg-surface-subtle p-1 sm:w-auto">
          {(
            [
              { key: "pro", label: t("appointments.asPro") },
              { key: "client", label: t("appointments.asClient") },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRoleView(opt.key)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                roleView === opt.key
                  ? "bg-surface-card text-content-strong shadow-sm"
                  : "text-content-muted hover:text-content-body"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-edge-base">
        {(
          [
            { key: "upcoming", label: t("appointments.upcoming"), count: upcomingCount },
            { key: "past", label: t("appointments.past"), count: pastCount },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setTab(opt.key)}
            className={`relative flex items-center gap-2 px-1 pb-3 pt-1 text-sm font-medium transition-colors ${
              tab === opt.key
                ? "text-content-strong"
                : "text-content-muted hover:text-content-body"
            }`}
          >
            {opt.label}
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-content-muted">
              {opt.count}
            </span>
            {tab === opt.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary-600" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : ordered.length === 0 ? (
        <Card className="border-edge-base bg-surface-card">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle">
              {tab === "upcoming" ? (
                <Calendar className="h-8 w-8 text-content-muted" />
              ) : (
                <CalendarX className="h-8 w-8 text-content-muted" />
              )}
            </div>
            <h3 className="text-base font-semibold text-content-strong">
              {t("appointments.noAppointments")}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-content-muted">
              {t("appointments.noAppointmentsSub")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {ordered.map((apt) => {
            const cfg = statusConfig[apt.status];
            const iAmPro = apt.professional_id === user?.id;
            const canConfirm = iAmPro && apt.status === "pending";
            const canComplete = iAmPro && apt.status === "confirmed";
            const canCancel =
              (apt.status === "pending" || apt.status === "confirmed") &&
              (iAmPro || apt.user_id === user?.id);
            const busy = busyId === apt.id;
            return (
              <Card
                key={apt.id}
                className="border-edge-base bg-surface-card transition-all hover:shadow-md"
              >
                <CardContent className="p-5">
                  {/* Header: other party */}
                  <div className="mb-4 flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      {apt.otherAvatar ? (
                        <AvatarImage
                          src={apt.otherAvatar}
                          alt={apt.otherName}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary-50 text-sm font-bold text-primary-700">
                          {initials(apt.otherName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-content-muted">
                        {t("appointments.with")}
                      </p>
                      <p className="truncate text-sm font-semibold text-content-strong">
                        {apt.otherName}
                      </p>
                      <p className="truncate text-xs text-content-muted">
                        {apt.otherIsPro
                          ? apt.otherRole || t("appointments.professional")
                          : t("appointments.client")}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {t(cfg.label)}
                    </span>
                  </div>

                  {/* Date / time / duration */}
                  <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
                    <div className="flex items-center gap-1.5 text-sm text-content-body">
                      <Calendar className="h-4 w-4 text-content-muted" />
                      {fmtDate(apt.appointment_date)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-content-body">
                      <Clock className="h-4 w-4 text-content-muted" />
                      {fmtTime(apt.appointment_time)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-content-body">
                      <Clock className="h-4 w-4 text-content-muted" />
                      {apt.duration_minutes} min
                    </div>
                  </div>

                  {/* Notes */}
                  {apt.notes && (
                    <div className="mb-4 rounded-xl bg-surface-subtle p-3 text-sm leading-relaxed text-content-body">
                      {apt.notes}
                    </div>
                  )}

                  {/* Actions */}
                  {(canConfirm || canComplete || canCancel) && (
                    <div className="flex flex-wrap gap-2 border-t border-edge-base pt-4">
                      {canConfirm && (
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => updateStatus(apt.id, "confirmed")}
                          className="gap-1.5 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {t("appointments.confirm")}
                        </Button>
                      )}
                      {canComplete && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => updateStatus(apt.id, "completed")}
                          className="gap-1.5"
                        >
                          <CalendarCheck className="h-3.5 w-3.5" />
                          {t("appointments.complete")}
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => updateStatus(apt.id, "cancelled")}
                          className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t("appointments.cancel")}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
