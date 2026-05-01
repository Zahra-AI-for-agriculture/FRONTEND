// ═══════════════════════════════════════════
// ZAHRA — TypeScript Models & Interfaces
// ═══════════════════════════════════════════

// ── Auth ──
export interface User {
  id: number;
  phone: string;
  name: string;
  governorate?: string;
  main_crop?: string;
  language_preference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  farmer_id: number;
  name: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  governorate?: string;
  main_crop?: string;
  language_preference?: string;
}

// ── Parcels ──
export interface Parcel {
  id: number;
  farmer_id: number;
  name: string;
  crop: string;
  area_hectares: number;
  governorate: string;
  latitude?: number;
  longitude?: number;
  soil_type?: string;
  irrigation_type?: string;
  planting_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ParcelHistory {
  id: number;
  parcel_id: number;
  event_type: string;
  description: string;
  data?: Record<string, unknown>;
  created_at?: string;
}

export interface HealthScore {
  parcel_id: number;
  overall_score: number;
  ndvi_score?: number;
  disease_risk?: number;
  irrigation_status?: string;
  last_updated?: string;
  recommendations?: string[];
}

// ── AI — Disease ──
export interface DiseaseResult {
  disease: string;
  confidence: number;
  crop: string;
  description?: string;
  treatment?: string;
  severity?: string;
  image_id?: string;
}

// ── AI — Yield ──
export interface YieldPredictRequest {
  crop: string;
  region: string;
  soil_type: string;
  area_hectares: number;
  temperature?: number;
  rainfall?: number;
  humidity?: number;
}

export interface YieldResult {
  predicted_yield_kg: number;
  yield_per_hectare: number;
  confidence: number;
  crop: string;
  factors?: Record<string, unknown>;
}

// ── AI — Drought ──
export interface DroughtPredictRequest {
  city: string;
  temperature?: number;
  rainfall?: number;
  humidity?: number;
}

export interface DroughtResult {
  city: string;
  risk_level: string;
  probability: number;
  recommendations?: string[];
  forecast_days?: number;
}

// ── AI — Segmentation ──
export interface SegmentationRequest {
  image_base64: string;
  parcel_id?: number;
}

export interface SegmentationResult {
  segments: number;
  healthy_percentage: number;
  stressed_percentage: number;
  bare_soil_percentage: number;
  segmentation_map?: string;
}

// ── AI — Irrigation ──
export interface IrrigationPredictRequest {
  crop: string;
  soil_type: string;
  temperature: number;
  humidity: number;
  growth_stage?: string;
  last_irrigation_days?: number;
}

export interface IrrigationResult {
  needs_irrigation: boolean;
  recommended_amount_mm: number;
  urgency: string;
  next_irrigation_date?: string;
  recommendations?: string[];
}

export interface WeeklyPlan {
  parcel_id: number;
  week_start: string;
  days: WeeklyPlanDay[];
}

export interface WeeklyPlanDay {
  day: string;
  irrigate: boolean;
  amount_mm?: number;
  reason?: string;
}

// ── AI — NDVI Anomaly ──
export interface NDVIAnomalyRequest {
  parcel_id: number;
  ndvi_values?: number[];
}

export interface NDVIAnomalyResult {
  parcel_id: number;
  has_anomaly: boolean;
  anomaly_type?: string;
  severity?: string;
  affected_area_percentage?: number;
  recommendations?: string[];
}

// ── AI — Pest ──
export interface PestPredictRequest {
  crop: string;
  region: string;
  temperature?: number;
  humidity?: number;
  month?: number;
}

export interface PestResult {
  pest_name: string;
  risk_level: string;
  probability: number;
  crop: string;
  prevention?: string[];
  treatment?: string[];
}

// ── AI — Pipeline ──
export interface FullDiagnosisRequest {
  parcel_id?: number;
  image_base64?: string;
  crop: string;
  region: string;
  soil_type?: string;
  temperature?: number;
  humidity?: number;
}

export interface FullDiagnosisResult {
  parcel_id?: number;
  disease?: DiseaseResult;
  pest_risk?: PestResult;
  irrigation?: IrrigationResult;
  ndvi_anomaly?: NDVIAnomalyResult;
  drought_risk?: DroughtResult;
  overall_health?: string;
  priority_actions?: string[];
}

// ── AI — Status ──
export interface AIStatus {
  models: AIModelStatus[];
  overall_status: string;
}

export interface AIModelStatus {
  name: string;
  status: string;
  version?: string;
  last_updated?: string;
}

// ── Weather ──
export interface WeatherCurrent {
  city: string;
  temperature: number;
  humidity: number;
  description: string;
  wind_speed?: number;
  pressure?: number;
  icon?: string;
  feels_like?: number;
}

export interface WeatherForecast {
  city: string;
  days: WeatherForecastDay[];
}

export interface WeatherForecastDay {
  date: string;
  temperature_min: number;
  temperature_max: number;
  humidity: number;
  description: string;
  rainfall_mm?: number;
  icon?: string;
}

export interface WeatherAlert {
  id: number;
  type: string;
  severity: string;
  message: string;
  governorate: string;
  start_date?: string;
  end_date?: string;
}

export interface SiroccoRisk {
  city: string;
  risk_level: string;
  probability: number;
  expected_date?: string;
  recommendations?: string[];
}

export interface SeasonalSummary {
  city: string;
  season: string;
  avg_temperature: number;
  total_rainfall_mm: number;
  avg_humidity: number;
  drought_days?: number;
  summary?: string;
}

// ── NDVI ──
export interface NDVIResult {
  parcel_id: number;
  ndvi_value: number;
  status: string;
  date: string;
  interpretation?: string;
}

export interface NDVIHistory {
  parcel_id: number;
  records: NDVIHistoryRecord[];
}

export interface NDVIHistoryRecord {
  date: string;
  ndvi_value: number;
  status: string;
}

export interface NDVICompare {
  parcel_id: number;
  current: number;
  previous: number;
  change_percentage: number;
  trend: string;
}

export interface NDVICoverage {
  parcel_id: number;
  vegetation_percentage: number;
  bare_soil_percentage: number;
  water_percentage: number;
  date: string;
}

// ── Alerts ──
export interface Alert {
  id: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
  parcel_id?: number;
  created_at?: string;
}

export interface UnreadCount {
  count: number;
}

export interface AlertReport {
  type: string;
  description: string;
  governorate: string;
  location?: string;
}

export interface TreatmentWindow {
  parcel_id: number;
  window_start: string;
  window_end: string;
  optimal_conditions: string;
  weather_forecast?: string;
}

// ── Treatments ──
export interface Pesticide {
  id: number;
  name: string;
  active_ingredient: string;
  target_diseases: string[];
  dosage: string;
  dar_days: number;
  safety_instructions?: string;
  organic: boolean;
}

export interface TreatmentLogEntry {
  id?: number;
  parcel_id: number;
  pesticide_id?: number;
  pesticide_name: string;
  disease: string;
  application_date: string;
  dosage: string;
  notes?: string;
}

export interface TreatmentLog {
  parcel_id: number;
  treatments: TreatmentLogEntry[];
}

export interface DARReminder {
  treatment_id: number;
  parcel_id: number;
  pesticide_name: string;
  application_date: string;
  dar_days: number;
  safe_harvest_date: string;
  days_remaining: number;
}

export interface Prescription {
  disease: string;
  treatments: PrescriptionTreatment[];
  prevention?: string[];
}

export interface PrescriptionTreatment {
  pesticide: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

// ── Market ──
export interface MarketPrice {
  crop: string;
  price_per_kg: number;
  unit: string;
  market: string;
  date: string;
  trend?: string;
}

export interface PriceHistory {
  crop: string;
  records: PriceHistoryRecord[];
}

export interface PriceHistoryRecord {
  date: string;
  price_per_kg: number;
  market?: string;
}

export interface SellAdvice {
  parcel_id: number;
  crop: string;
  recommended_action: string;
  current_price: number;
  predicted_price?: number;
  best_sell_window?: string;
  reasoning?: string;
}

export interface RevenueForecast {
  parcel_id: number;
  crop: string;
  estimated_yield_kg: number;
  estimated_revenue: number;
  currency: string;
  confidence?: number;
}

export interface Buyer {
  id: number;
  name: string;
  location: string;
  crops_interested: string[];
  phone?: string;
  rating?: number;
}

// ── Knowledge ──
export interface Crop {
  id: number;
  name: string;
  scientific_name?: string;
  category: string;
  growing_season: string;
  water_needs: string;
  description?: string;
}

export interface CropCalendar {
  crop: string;
  region: string;
  activities: CalendarActivity[];
}

export interface CalendarActivity {
  month: number;
  activity: string;
  description?: string;
  priority?: string;
}

export interface SoilType {
  name: string;
  description: string;
  suitable_crops: string[];
  ph_range?: string;
  region: string;
}

export interface Subsidy {
  id: number;
  title: string;
  description: string;
  amount?: number;
  eligibility: string;
  deadline?: string;
  contact?: string;
}

export interface Seed {
  id: number;
  name: string;
  crop: string;
  variety: string;
  supplier?: string;
  price?: number;
  description?: string;
  recommended_regions?: string[];
}

// ── Reports ──
export interface Dashboard {
  farmer_id: number;
  total_parcels: number;
  total_area_hectares: number;
  active_crops: string[];
  alerts_count: number;
  health_summary?: Record<string, unknown>;
}

export interface CampaignReport {
  season: string;
  parcels: number;
  total_yield_kg: number;
  total_revenue: number;
  crop_breakdown: CropBreakdown[];
}

export interface CropBreakdown {
  crop: string;
  area_hectares: number;
  yield_kg: number;
  revenue: number;
}

export interface FinancialReport {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  currency: string;
  breakdown: FinancialBreakdown[];
}

export interface FinancialBreakdown {
  category: string;
  amount: number;
  type: string;
}

export interface SustainabilityReport {
  water_saved_liters: number;
  pesticide_reduction_percentage: number;
  organic_practices: number;
  carbon_footprint?: number;
  recommendations?: string[];
}

// ── Community ──
export interface Post {
  id: number;
  author_name: string;
  author_id: number;
  title: string;
  content: string;
  category?: string;
  replies_count: number;
  created_at: string;
}

export interface Reply {
  id: number;
  post_id: number;
  author_name: string;
  author_id: number;
  content: string;
  created_at: string;
}

export interface Advisor {
  id: number;
  name: string;
  speciality: string;
  governorate: string;
  phone?: string;
  available: boolean;
}

// ── Notifications ──
export interface NotificationPreferences {
  weather_alerts: boolean;
  disease_alerts: boolean;
  irrigation_reminders: boolean;
  market_updates: boolean;
  community_replies: boolean;
}

export interface NotificationHistory {
  notifications: NotificationEntry[];
}

export interface NotificationEntry {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ── Sync ──
export interface SyncPush {
  data: Record<string, unknown>[];
  last_sync?: string;
}

export interface SyncPull {
  data: Record<string, unknown>[];
  server_timestamp: string;
}

// ── Generic API response wrapper ──
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}
