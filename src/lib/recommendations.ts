export type Goal = "lose_weight" | "build_muscle" | "maintain" | "endurance" | "general";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Diet = "omnivore" | "vegetarian" | "vegan" | "low_carb" | "flexible";

export interface RecommendationAnswers {
  goal: Goal;
  experience: Experience;
  workout_days: number;
  diet: Diet;
  allergies: string | string[] | null;
  equipment: string[];
}

export interface WorkoutRecommendationExercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
}

export interface WorkoutRecommendationDay {
  dayName: string;
  exercises: WorkoutRecommendationExercise[];
}

export interface DietRecommendationMeal {
  meal: string;
  items: string;
  calories: number;
  protein: number;
}

export function generateWorkoutPlan(answers: RecommendationAnswers): WorkoutRecommendationDay[] {
  const { goal, experience, workout_days, equipment } = answers;
  const isBeginner = experience === "beginner";
  const setsBase = isBeginner ? 3 : experience === "intermediate" ? 4 : 5;
  const repsByGoal: Record<Goal, string> = {
    lose_weight: "12-15", build_muscle: "8-12", maintain: "10-12", endurance: "15-20", general: "10-15",
  };
  const reps = repsByGoal[goal];
  const rest = goal === "endurance" ? 30 : goal === "lose_weight" ? 45 : 90;
  const hasGym = equipment.includes("gym") || equipment.includes("dumbbells");
  const bodyOnly = equipment.includes("bodyweight") && !hasGym;
  const pushExercises = hasGym
    ? ["Supino Reto", "Supino Inclinado", "Desenvolvimento", "Tríceps Pulley", "Elevação Lateral"]
    : ["Flexão de Braço", "Flexão Inclinada", "Tríceps no Banco", "Prancha Lateral"];
  const pullExercises = hasGym
    ? ["Puxada Frontal", "Remada Baixa", "Levantamento Terra", "Rosca Direta", "Face Pull"]
    : ["Barra Fixa", "Remada Invertida", "Superman", "Prancha"];
  const legExercises = hasGym
    ? ["Agachamento Livre", "Leg Press 45", "Cadeira Extensora", "Stiff", "Panturrilha"]
    : ["Agachamento Livre", "Afundo", "Ponte de Glúteo", "Panturrilha em Pé"];
  const cardioExercises = bodyOnly
    ? ["Burpees", "Polichinelo", "Mountain Climber", "Corrida Estacionária"]
    : ["Esteira (corrida)", "Bicicleta", "Elíptico", "Remo"];
  const upperExercises = [...pushExercises.slice(0, 3), ...pullExercises.slice(0, 2)];
  const lowerExercises = legExercises.slice(0, 5);
  const days: WorkoutRecommendationDay[] = [];
  const dayLabels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const buildDay = (dayName: string, names: string[], isCardio = false) => ({
    dayName,
    exercises: names.map((name) => ({ name, sets: isCardio ? 1 : setsBase, reps: isCardio ? "20-30 min" : reps, rest: isCardio ? 0 : rest })),
  });
  if (workout_days <= 3) {
    const fullBody = [...upperExercises.slice(0, 3), ...lowerExercises.slice(0, 2)];
    for (let i = 0; i < workout_days; i++) days.push(buildDay(dayLabels[i] || `Dia ${i + 1}`, fullBody));
  } else if (workout_days <= 4) {
    const pattern = [upperExercises, lowerExercises, upperExercises, lowerExercises];
    for (let i = 0; i < workout_days; i++) days.push(buildDay(dayLabels[i] || `Dia ${i + 1}`, pattern[i]));
  } else {
    const pattern = [pushExercises, pullExercises, legExercises, pushExercises, pullExercises, cardioExercises];
    for (let i = 0; i < workout_days; i++) days.push(buildDay(dayLabels[i] || `Dia ${i + 1}`, pattern[i] || legExercises, i === 5));
  }
  return days;
}

export function generateDietPlan(answers: RecommendationAnswers, weightKg = 75): DietRecommendationMeal[] {
  const { goal, diet } = answers;
  const isVegan = diet === "vegan";
  const isVegetarian = diet === "vegetarian" || isVegan;
  const isLowCarb = diet === "low_carb";
  const activityAdjustment = Math.max(-150, Math.min(250, (answers.workout_days - 3) * 100));
  const baseCalories = goal === "lose_weight" ? 1800 : goal === "build_muscle" ? 2600 : goal === "endurance" ? 2500 : goal === "maintain" ? 2200 : 2100;
  const calTarget = Math.max(1500, Math.round(baseCalories + activityAdjustment + (Math.max(45, Math.min(110, weightKg)) - 75) * 12));
  const proteinPerKg = goal === "build_muscle" ? 2 : goal === "lose_weight" ? 1.8 : goal === "endurance" ? 1.6 : 1.5;
  const totalProtein = Math.round(Math.max(45, Math.min(110, weightKg)) * proteinPerKg);
  const allergyText = Array.isArray(answers.allergies) ? answers.allergies.join(",") : answers.allergies || "";
  const allergens = allergyText.toLowerCase();
  const proteinSources = isVegan ? ["Tofu", "Grão-de-bico", "Lentilha", "Proteína vegetal texturizada"] : isVegetarian ? ["Ovos", "Queijo cottage", "Iogurte grego", "Whey protein"] : ["Frango grelhado", "Ovos", "Carne magra", "Peixe", "Whey protein"];
  const carbSources = isLowCarb ? ["Batata-doce (pequena)", "Abóbora", "Folhas verdes"] : ["Arroz integral", "Aveia", "Batata-doce", "Frutas", "Pão integral"];
  const fatSources = ["Abacate", "Azeite", "Castanhas", "Amêndoas"];
  const filterAllergens = (items: string[]) => items.filter((item) => !allergens.split(",").some((allergen) => allergen.trim() && item.toLowerCase().includes(allergen.trim().toLowerCase())));
  const safeProtein = filterAllergens(proteinSources);
  const safeCarbs = filterAllergens(carbSources);
  const safeFats = filterAllergens(fatSources);
  const p = safeProtein[0] || "Fonte de proteína";
  const p2 = safeProtein[1] || p;
  const c = safeCarbs[0] || "Fonte de carboidrato";
  const c2 = safeCarbs[1] || c;
  const f = safeFats[0] || "Fonte de gordura";
  return [
    { meal: "Café da Manhã", items: `${c} (100g), ${p} (2 unidades/100g), ${f} (1 colher)`, calories: Math.round(calTarget * 0.25), protein: Math.round(totalProtein * 0.25) },
    { meal: "Lanche da Manhã", items: `${c2} (1 porção), ${safeFats[1] || f} (1 punhado)`, calories: Math.round(calTarget * 0.1), protein: Math.round(totalProtein * 0.1) },
    { meal: "Almoço", items: `${p} (150g), ${c} (150g), salada verde à vontade, ${f} (1 colher)`, calories: Math.round(calTarget * 0.3), protein: Math.round(totalProtein * 0.35) },
    { meal: "Lanche da Tarde", items: `${p2} (100g), ${c2} (1 porção)`, calories: Math.round(calTarget * 0.1), protein: Math.round(totalProtein * 0.1) },
    { meal: "Jantar", items: `${p2} (150g), ${c2} (100g), legumes refogados, ${f} (1 colher)`, calories: Math.round(calTarget * 0.25), protein: Math.round(totalProtein * 0.2) },
  ];
}

export function goalLabel(goal: Goal): string {
  return {
    lose_weight: "Perda de Peso", build_muscle: "Hipertrofia Muscular", maintain: "Manutenção", endurance: "Resistência Cardiovascular", general: "Melhora da Saúde Geral",
  }[goal];
}
