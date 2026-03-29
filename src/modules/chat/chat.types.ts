export type ChatAuthor = 'IA' | 'Cliente';

export type ChatMessage = {
  id: string;
  autor: ChatAuthor;
  texto: string;
  data: string;
  metadata?: Record<string, unknown>;
};

export type ChatOption = {
  label: string;
  kind: 'prompt' | 'link';
  action?: string | null;
  url?: string | null;
};

export type ChatVehicleCard = {
  id: string;
  title: string;
  subtitle: string | null;
  price: number;
  year: number;
  mileage: number | null;
  photoUrl: string | null;
  shopId: string;
  matchScore: number;
  financeScore: number;
  reasons: string[];
  plate: string | null;
  pricingContext: {
    priceDeltaToBudget: number | null;
    affordabilityBand: 'inside_budget' | 'near_budget' | 'above_budget' | 'unknown';
  };
};

export type ChatLeadSummary = {
  id: string;
  sellerId: string | null;
  sellerName: string | null;
  status: string;
};

export type ChatCustomerProfile = {
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  budgetMax: number | null;
  budgetMin: number | null;
  preferredCategories: string[];
  preferredBrands: string[];
  preferredFuelTypes: string[];
  preferredTransmissions: string[];
  desiredUses: string[];
  plate: string | null;
};

export type ChatSessionState = {
  id: string;
  sessionId: string;
  shopId: string | null;
  vehicleId: string | null;
  leadId: string | null;
  customerProfile: ChatCustomerProfile;
  messages: ChatMessage[];
  lastRecommendedVehicleIds: string[];
  keywords: string[];
  summary: string | null;
  toolCallsCount: number;
  handoffsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FinancingSimulation = {
  vehicleId: string;
  vehicleTitle: string;
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  estimatedInstallment: number;
  monthlyRate: number;
};

export type ChatTelemetrySnapshot = {
  toolsUsed: string[];
  scoringVersion: string;
  summaryVersion: string;
  responseMode: 'streaming' | 'sync';
};

export type ChatReply = {
  id: string;
  message: string;
  options: ChatOption[];
  photos: string[];
  humor: string;
  vehicles: ChatVehicleCard[];
  lead: ChatLeadSummary | null;
  profile: ChatCustomerProfile;
  handoffSuggested: boolean;
  shouldCaptureLead: boolean;
  nextBestAction: string | null;
  summary: string | null;
  financing: FinancingSimulation | null;
  telemetry: ChatTelemetrySnapshot;
};
