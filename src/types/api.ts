import type {
  BrandAuditResult,
  BrandBible,
  BrandColor,
  ChatMessage,
  FontPairing,
  GenerateBrandRequest,
  LogoArchetype,
  LogoPromptRefinementResult,
  LogoVariation,
  SocialPlatform,
  SocialPostData,
  ViralTopicHook,
} from '../types';

/** Stable public error codes shared by every JSON API error response. */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'DATABASE_ERROR'
  | 'BAD_REQUEST'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
  requestId: string;
}

const API_ERROR_CODES: readonly ApiErrorCode[] = [
  'VALIDATION_ERROR', 'AUTHENTICATION_REQUIRED', 'AUTHORIZATION_ERROR', 'NOT_FOUND',
  'CONFLICT', 'RATE_LIMITED', 'PROVIDER_ERROR', 'DATABASE_ERROR', 'BAD_REQUEST',
  'INTERNAL_SERVER_ERROR',
];

/** Runtime guard for untrusted JSON returned by an API request. */
export function isApiErrorResponse(input: unknown): input is ApiErrorResponse {
  if (!input || typeof input !== 'object') return false;
  const candidate = input as Record<string, unknown>;
  return (
    typeof candidate.error === 'string' &&
    typeof candidate.requestId === 'string' &&
    API_ERROR_CODES.includes(candidate.code as ApiErrorCode)
  );
}

export interface HealthResponse {
  status: 'ok';
  time: string;
  db: 'not-configured' | 'connected' | 'error';
}

export interface BrandListResponse {
  brands: BrandBible[];
}

export interface BrandMutationResponse {
  ok: true;
}

export interface BrandRouteParams {
  [key: string]: string;
  id: string;
}

/** PUT /api/brands/:id accepts the canonical Brand Bible document. */
export type BrandPersistenceRequest = BrandBible;

export interface ImageUploadRequest {
  dataUrl: string;
  brandId?: string;
}

export interface ImageUploadResponse {
  url: string;
}

export interface GenerateBrandApiRequest extends GenerateBrandRequest {
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}

export type GenerateBrandResponse = BrandBible;

export interface GenerateLogoVariationsRequest {
  brandName: string;
  industry?: string;
  mission?: string;
  palette?: BrandColor[];
  typography?: FontPairing;
  archetypeFilter?: LogoArchetype;
  stylePrompt?: string;
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}

export interface LogoVariationsResponse {
  variations: LogoVariation[];
}

export interface LogoPromptRefinementRequest {
  brandName: string;
  industry?: string;
  mission?: string;
  aesthetic?: string;
  targetAudience?: string;
  archetype?: LogoArchetype;
  customDirectives?: string;
  complexityLevel?: 'minimalist_precision' | 'intricate_geometric' | 'architectural_dimensional' | 'metaphoric_duality';
  currentPrompt?: string;
  palette?: BrandColor[];
  typography?: FontPairing;
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}

export type LogoPromptRefinementResponse = LogoPromptRefinementResult;

export interface ViralTopicsRequest {
  brandName: string;
  industry?: string;
  mission?: string;
  targetAudience?: string;
  toneStyle?: string;
  goal?: string;
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}

export interface ViralTopicsResponse {
  hooks: ViralTopicHook[];
}

export interface BrandAuditRequest {
  brandName: string;
  industry?: string;
  currentMission?: string;
  palette?: BrandColor[];
  typography?: FontPairing;
  toneStyle?: string;
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}

export type BrandAuditResponse = BrandAuditResult;

export interface ChatRequest {
  messages: ChatMessage[];
  brandContext?: Pick<BrandBible, 'brandName' | 'tagline' | 'industry' | 'mission' | 'palette' | 'typography'>;
  model?: string;
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}

export interface ChatResponse {
  reply: string;
}

export interface SocialPostRequest {
  brand: BrandBible;
  postType?: SocialPostData['postType'];
  platform?: SocialPlatform;
  topicPrompt?: string;
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}

export type SocialPostResponse = SocialPostData;

export interface SocialImageRequest {
  prompt: string;
  aspectRatio?: '1:1' | '9:16' | '4:3' | '16:9' | '3:4';
  provider?: 'auto' | 'openai' | 'gemini' | 'higgsfield';
}

export interface GeneratedImageResponse {
  imageUrl: string;
  engine?: string;
}

export interface LogoImageRequest {
  prompt: string;
  resolution?: '512px' | '1K' | '2K' | '4K';
  brandName?: string;
  industry?: string;
  palette?: BrandColor[];
  logoSvg?: string;
  tagline?: string;
  typography?: FontPairing;
  provider?: 'auto' | 'openai' | 'gemini' | 'higgsfield';
}

export interface BrandLogoHistoryQuery {
  brand: string;
  eras?: string;
}

export interface BrandLogoHistoryResponse {
  brand: string;
  currentLogo: { title: string; imageUrl: string } | null;
  eras: Array<Record<string, unknown>>;
}

export interface BrandCaseStudyRequest {
  brandQuery: string;
  provider?: 'auto' | 'openai' | 'anthropic' | 'gemini';
}
