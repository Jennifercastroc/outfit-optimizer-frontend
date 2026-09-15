import { supabase } from '@/lib/supabase-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Gender = 'mujer' | 'hombre' | 'unisex';

export interface AnalyzeOutfitParams {
  image: File;
  city: string;
  gender: Gender;
  budget?: number;
  size?: string;
}

export interface Garment {
  category: string;
  color: string;
  material: string;
  pattern: string;
  style: string;
  is_statement_piece: boolean;
}

export interface AccessoryDetected {
  category: string;
  color: string;
  description: string;
}

export interface Recommendation {
  // Las recomendaciones del tablero (/outfits/analyze-board) no tienen productVariantId -
  // no se persisten, solo se devuelven en la respuesta - por eso es opcional acá.
  productVariantId?: string;
  score: number;
  scoreBreakdown: Record<string, number | string>;
  productName: string | null;
  storeUrl: string | null;
  price: number | null;
  imageUrl: string | null;
}

export interface OutfitItem {
  outfitItemId: string;
  category: string;
  color: string;
  pattern: string;
  material: string;
  style: string;
  status: 'owned' | 'missing';
  matchedClosetItemId: string | null;
  recommendations: Recommendation[];
}

export interface AnalyzeOutfitResponse {
  analysis: {
    garments: Garment[];
    accessories_detected: AccessoryDetected[];
    styling_notes: string;
  };
  outfitAnalysisId: string;
  items: OutfitItem[];
}

export async function analyzeOutfit(params: AnalyzeOutfitParams): Promise<AnalyzeOutfitResponse> {
  const formData = new FormData();
  formData.append('image', params.image);
  formData.append('city', params.city);
  formData.append('gender', params.gender);
  if (params.budget !== undefined) formData.append('budget', String(params.budget));
  if (params.size) formData.append('size', params.size);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_URL}/outfits/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export interface AnalyzeBoardParams {
  images: File[];
  city: string;
  gender: Gender;
  budget?: number;
  size?: string;
}

export interface EssentialCategory {
  category: string;
  color: string;
  material: string;
  pattern: string;
  style: string;
  imageFrequency: number;
  specificDescription: string;
  exampleImageIndexes: number[];
  recommendations: Recommendation[];
}

export interface AnalyzeBoardResponse {
  imagesAnalyzed: number;
  images: string[];
  styleNarrative: string;
  accessoryRecommendation: string;
  essentialCategories: EssentialCategory[];
}

export async function analyzeBoard(params: AnalyzeBoardParams): Promise<AnalyzeBoardResponse> {
  const formData = new FormData();
  for (const image of params.images) {
    formData.append('images', image);
  }
  formData.append('city', params.city);
  formData.append('gender', params.gender);
  if (params.budget !== undefined) formData.append('budget', String(params.budget));
  if (params.size) formData.append('size', params.size);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_URL}/outfits/analyze-board`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}
