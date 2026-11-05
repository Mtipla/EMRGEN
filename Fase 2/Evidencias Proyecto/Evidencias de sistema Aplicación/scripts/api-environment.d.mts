export type ApiUrls = { VITE_API_URL: string; VITE_INTERNAL_API_URL: string };
export function publicApiUrls(
  env: Record<string, string | undefined>,
  mode: string,
): ApiUrls;
export function checkApiReadiness(
  urls: ApiUrls,
  options?: {
    deployment?: string;
    environment?: string;
    origin?: string;
    token?: string;
  },
): Promise<unknown[]>;
