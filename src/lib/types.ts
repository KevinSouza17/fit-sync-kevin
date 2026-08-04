export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          height_cm: number | null;
          weight_kg: number | null;
          goal_weight_kg: number | null;
          health_goal: string;
          daily_calorie_goal: number;
          daily_water_goal_liters: number;
          activity_level: string;
          plan: string;
          is_professional: boolean;
          professional_role: string | null;
          specialty: string | null;
          bio: string | null;
          credentials: string | null;
          location_city: string | null;
          available_for_booking: boolean;
          rating_avg: number;
          rating_count: number;
          avatar_url: string | null;
          registration_type: string;
          document_number: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          meal_type: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          logged_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["meals"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Row"]>;
      };
      diary_tasks: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          done: boolean;
          category: string;
          task_date: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["diary_tasks"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["diary_tasks"]["Row"]>;
      };
      exercises: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sets: string;
          weight_kg: number | null;
          done: boolean;
          workout_type: string;
          exercise_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["exercises"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Row"]>;
      };
      water_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_liters: number;
          logged_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["water_logs"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["water_logs"]["Row"]>;
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          logged_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["weight_logs"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weight_logs"]["Row"]>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          current_value: number;
          target_value: number;
          unit: string;
          deadline: string | null;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["goals"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Row"]>;
      };
      conversations: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "created_at"> & {
          id?: string;
          user_a_id?: string;
          user_b_id?: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "sender_id" | "created_at"> & {
          id?: string;
          sender_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          code: string | null;
          invite_email: string | null;
          inviter_id: string | null;
          inviter_name: string | null;
          conversation_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      workout_programs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_programs"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_programs"]["Row"]>;
      };
      workout_days: {
        Row: {
          id: string;
          program_id: string;
          day_of_week: number;
          label: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_days"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_days"]["Row"]>;
      };
      workout_exercises: {
        Row: {
          id: string;
          program_day_id: string;
          exercise_name: string;
          target_sets: number;
          target_reps_min: number;
          target_reps_max: number;
          rest_seconds: number;
          sort_order: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_exercises"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_exercises"]["Row"]>;
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          program_exercise_id: string | null;
          exercise_name: string;
          workout_day_id: string | null;
          sets_completed: number;
          reps_per_set: string | null;
          weight_kg: number;
          logged_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_logs"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_logs"]["Row"]>;
      };
      custom_foods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          brand: string | null;
          serving_size: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          fiber_g: number;
          barcode: string | null;
          is_recipe: boolean;
          ingredients: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["custom_foods"]["Row"], "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["custom_foods"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Meal = Database["public"]["Tables"]["meals"]["Row"];
export type DiaryTask = Database["public"]["Tables"]["diary_tasks"]["Row"];
export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type WaterLog = Database["public"]["Tables"]["water_logs"]["Row"];
export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type WorkoutProgram = Database["public"]["Tables"]["workout_programs"]["Row"];
export type WorkoutDay = Database["public"]["Tables"]["workout_days"]["Row"];
export type WorkoutExercise = Database["public"]["Tables"]["workout_exercises"]["Row"];
export type WorkoutLog = Database["public"]["Tables"]["workout_logs"]["Row"];
export type CustomFood = Database["public"]["Tables"]["custom_foods"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type ClientPlan = Database["public"]["Tables"]["client_plans"]["Row"];
