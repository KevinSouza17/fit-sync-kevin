import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X, Save, Loader2, Table2, Pencil, Check } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { ClientSpreadsheet } from "../lib/types";
import { cn } from "../lib/utils";

type Cell = { v: string };
type Grid = Cell[][];

const COL_LETTERS = (n: number) => {
  let s = "";
  n++;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const EMPTY_GRID = (): Grid => {
  const rows: Grid = [];
  for (let r = 0; r < 8; r++) {
    rows.push(Array.from({ length: 6 }, () => ({ v: "" })));
  }
  return rows;
};

const DIET_TEMPLATE = (): Grid => {
  const headers = ["Refeição", "Alimento", "Qtd (g)", "Calorias", "Proteína (g)", "Carbo (g)"];
  const meals = ["Café da manhã", "Almoço", "Lanche", "Jantar", "Ceia"];
  const grid: Grid = [headers.map((h) => ({ v: h }))];
  meals.forEach((m) => {
    grid.push([{ v: m }, ...Array.from({ length: 5 }, () => ({ v: "" }))]);
  });
  grid.push(Array.from({ length: 6 }, () => ({ v: "" })));
  return grid;
};

const WORKOUT_TEMPLATE = (): Grid => {
  const headers = ["Dia", "Exercício", "Séries", "Reps", "Carga (kg)", "Descanso (s)"];
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const grid: Grid = [headers.map((h) => ({ v: h }))];
  days.forEach((d) => {
    grid.push([{ v: d }, ...Array.from({ length: 5 }, () => ({ v: "" }))]);
  });
  grid.push(Array.from({ length: 6 }, () => ({ v: "" })));
  return grid;
};

function gridFromData(data: unknown): Grid {
  if (!Array.isArray(data) || data.length === 0) return EMPTY_GRID();
  return (data as unknown as Grid).map((row) =>
    Array.isArray(row) ? row.map((c) => (c && typeof c === "object" && "v" in c ? c : { v: String(c ?? "") })) : []
  );
}

function gridToData(grid: Grid): string[][] {
  return grid.map((row) => row.map((c) => c.v));
}

interface Props {
  clientId: string;
  clientName: string;
}

export function ClientSpreadsheets({ clientId, clientName }: Props) {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<ClientSpreadsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSheet, setEditingSheet] = useState<ClientSpreadsheet | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [sheetType, setSheetType] = useState<"diet" | "workout">("diet");
  const [grid, setGrid] = useState<Grid>(EMPTY_GRID());
  const [saving, setSaving] = useState(false);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("client_spreadsheets")
        .select("*")
        .eq("professional_id", user.id)
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false });
      setSheets((data as ClientSpreadsheet[]) || []);
      setLoading(false);
    })();
  }, [user, clientId]);

  function openNew(type: "diet" | "workout") {
    setEditingSheet(null);
    setIsCreating(true);
    setSheetType(type);
    setTitle(type === "diet" ? "Plano alimentar" : "Plano de treino");
    setGrid(type === "diet" ? DIET_TEMPLATE() : WORKOUT_TEMPLATE());
    setActiveCell(null);
  }

  function openEdit(sheet: ClientSpreadsheet) {
    setEditingSheet(sheet);
    setIsCreating(true);
    setSheetType(sheet.sheet_type);
    setTitle(sheet.title);
    setGrid(gridFromData(sheet.data));
    setActiveCell(null);
  }

  function closeEditor() {
    setIsCreating(false);
    setEditingSheet(null);
    setTitle("");
    setGrid(EMPTY_GRID());
    setActiveCell(null);
  }

  function updateCell(r: number, c: number, value: string) {
    setGrid((prev) => prev.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? { v: value } : cell) : row));
  }

  function addRow() {
    const cols = grid[0]?.length ?? 6;
    setGrid((prev) => [...prev, Array.from({ length: cols }, () => ({ v: "" }))]);
  }
  function addCol() {
    setGrid((prev) => prev.map((row) => [...row, { v: "" }]));
  }
  function removeRow(r: number) {
    if (grid.length <= 1) return;
    setGrid((prev) => prev.filter((_, i) => i !== r));
  }
  function removeCol(c: number) {
    if ((grid[0]?.length ?? 0) <= 1) return;
    setGrid((prev) => prev.map((row) => row.filter((_, i) => i !== c)));
  }

  async function saveSheet() {
    if (!user || !title.trim()) return;
    setSaving(true);
    const data = gridToData(grid);
    if (editingSheet) {
      const { data: updated } = await supabase
        .from("client_spreadsheets")
        .update({ title: title.trim(), sheet_type: sheetType, data: data as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq("id", editingSheet.id)
        .select("*")
        .single();
      if (updated) {
        setSheets((prev) => prev.map((s) => s.id === updated.id ? updated as ClientSpreadsheet : s));
        closeEditor();
      }
    } else {
      const { data: created } = await supabase
        .from("client_spreadsheets")
        .insert({ professional_id: user.id, client_id: clientId, title: title.trim(), sheet_type: sheetType, data: data as unknown as Record<string, unknown> })
        .select("*")
        .single();
      if (created) {
        setSheets((prev) => [created as ClientSpreadsheet, ...prev]);
        closeEditor();
      }
    }
    setSaving(false);
  }

  async function deleteSheet(id: string) {
    const { error } = await supabase.from("client_spreadsheets").delete().eq("id", id);
    if (!error) setSheets((prev) => prev.filter((s) => s.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent, r: number, c: number) {
    const maxR = grid.length - 1;
    const maxC = (grid[0]?.length ?? 1) - 1;
    if (e.key === "Enter") {
      e.preventDefault();
      if (r < maxR) {
        const key = `${r + 1}-${c}`;
        inputRefs.current[key]?.focus();
        setActiveCell({ r: r + 1, c });
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const nextC = e.shiftKey ? c - 1 : c + 1;
      if (nextC >= 0 && nextC <= maxC) {
        const key = `${r}-${nextC}`;
        inputRefs.current[key]?.focus();
        setActiveCell({ r, c: nextC });
      } else if (nextC > maxC && r < maxR) {
        const key = `${r + 1}-0`;
        inputRefs.current[key]?.focus();
        setActiveCell({ r: r + 1, c: 0 });
      }
    } else if (e.key === "ArrowDown" && r < maxR) {
      e.preventDefault();
      const key = `${r + 1}-${c}`;
      inputRefs.current[key]?.focus();
      setActiveCell({ r: r + 1, c });
    } else if (e.key === "ArrowUp" && r > 0) {
      e.preventDefault();
      const key = `${r - 1}-${c}`;
      inputRefs.current[key]?.focus();
      setActiveCell({ r: r - 1, c });
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isCreating) {
    const maxC = (grid[0]?.length ?? 1) - 1;
    return (
      <div className="flex flex-col gap-4">
        {/* Editor header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da planilha"
              className="max-w-xs font-medium"
            />
            <div className="flex gap-2">
              {(["diet", "workout"] as const).map((st) => (
                <button key={st} onClick={() => setSheetType(st)}
                  className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    sheetType === st
                      ? st === "diet" ? "bg-orange-500 text-white" : "bg-cyan-500 text-white"
                      : "bg-surface-card text-content-muted border border-edge-base")}>
                  {st === "diet" ? "Dieta" : "Treino"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={closeEditor} className="gap-1.5">
              <X className="h-4 w-4" />Cancelar
            </Button>
            <Button size="sm" onClick={saveSheet} disabled={saving || !title.trim()} className="gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />Linha
          </Button>
          <Button variant="outline" size="sm" onClick={addCol} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />Coluna
          </Button>
          {grid.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => removeRow(grid.length - 1)} className="gap-1.5 text-red-500">
              <Trash2 className="h-3.5 w-3.5" />Última linha
            </Button>
          )}
          {(grid[0]?.length ?? 0) > 1 && (
            <Button variant="outline" size="sm" onClick={() => removeCol(maxC)} className="gap-1.5 text-red-500">
              <Trash2 className="h-3.5 w-3.5" />Última coluna
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="overflow-x-auto rounded-xl border border-edge-base bg-surface-card shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-subtle">
                <th className="sticky left-0 z-10 w-10 border-b border-r border-edge-base bg-surface-subtle px-2 py-1.5 text-center text-[10px] font-medium text-content-muted">
                  #
                </th>
                {grid[0]?.map((_, c) => (
                  <th key={c} className="border-b border-r border-edge-base px-2 py-1.5 text-center text-[10px] font-medium text-content-muted last:border-r-0"
                    style={{ minWidth: 120 }}>
                    {COL_LETTERS(c)}
                  </th>
                )) ?? null}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, r) => (
                <tr key={r} className="group">
                  <td className="sticky left-0 z-10 w-10 border-b border-r border-edge-base bg-surface-subtle px-2 py-1 text-center text-[10px] font-medium text-content-muted">
                    {r + 1}
                  </td>
                  {row.map((cell, c) => (
                    <td key={c} className="border-b border-r border-edge-base p-0 last:border-r-0">
                      <input
                        ref={(el) => { inputRefs.current[`${r}-${c}`] = el; }}
                        type="text"
                        value={cell.v}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        onFocus={() => setActiveCell({ r, c })}
                        onKeyDown={(e) => handleKeyDown(e, r, c)}
                        className={cn(
                          "w-full bg-transparent px-2 py-1.5 text-sm text-content-strong outline-none transition-colors",
                          r === 0 ? "font-semibold text-content-strong bg-surface-subtle/50" : "text-content-body",
                          activeCell?.r === r && activeCell?.c === c && "ring-2 ring-primary-400 bg-primary-50/30"
                        )}
                        style={{ minWidth: 120 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-content-muted">
          Dica: use Enter para descer, Tab para avançar, e as setas para navegar entre as células.
        </p>
      </div>
    );
  }

  // List view
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => openNew("diet")} className="gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50">
          <Plus className="h-4 w-4" />Planilha de Dieta
        </Button>
        <Button variant="outline" size="sm" onClick={() => openNew("workout")} className="gap-1.5 border-cyan-200 text-cyan-600 hover:bg-cyan-50">
          <Plus className="h-4 w-4" />Planilha de Treino
        </Button>
      </div>

      {sheets.length === 0 ? (
        <Card className="bg-surface-card">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-subtle text-content-muted">
              <Table2 className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-content-strong">Nenhuma planilha criada</p>
            <p className="text-xs text-content-muted">Crie uma planilha de dieta ou treino para {clientName}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sheets.map((s) => {
            const diet = s.sheet_type === "diet";
            const rows = Array.isArray(s.data) ? (s.data as string[][]) : [];
            return (
              <Card key={s.id} className="bg-surface-card">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      diet ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>
                      <Table2 className="h-5 w-5" />
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} aria-label="Editar planilha"
                        className="text-content-muted transition-colors hover:text-primary-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteSheet(s.id)} aria-label="Excluir planilha"
                        className="text-content-muted transition-colors hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-content-strong">{s.title}</p>
                    <p className="mt-0.5 text-xs text-content-muted">
                      {diet ? "Dieta" : "Treino"} · {rows.length} linhas · {rows[0]?.length ?? 0} colunas
                    </p>
                  </div>
                  {rows.length > 0 && rows[0]?.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-edge-base">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-surface-subtle">
                            {rows[0].slice(0, 4).map((h, i) => (
                              <th key={i} className="border-r border-edge-base px-2 py-1 text-left font-semibold text-content-strong last:border-r-0">
                                {h || "—"}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.slice(1, 4).map((row, ri) => (
                            <tr key={ri}>
                              {row.slice(0, 4).map((cell, ci) => (
                                <td key={ci} className="border-r border-edge-base px-2 py-1 text-content-body last:border-r-0">
                                  {cell || "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {rows.length > 4 && (
                        <p className="bg-surface-subtle px-2 py-1 text-center text-[10px] text-content-muted">
                          +{rows.length - 4} linhas
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-content-muted">
                    Atualizada em {new Date(s.updated_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
