const STORAGE_KEY = "llmNarration";

type EnvBag = {
  VITE_ENABLE_LLM_NARRATION?: string;
  NEXT_PUBLIC_ENABLE_LLM_NARRATION?: string;
};

function readEnvFlag(env: EnvBag | undefined): boolean {
  if (!env) {
    return false;
  }
  const value = env.VITE_ENABLE_LLM_NARRATION ?? env.NEXT_PUBLIC_ENABLE_LLM_NARRATION;
  return value === "true";
}

function getEnv(): EnvBag | undefined {
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    return (import.meta as any).env as EnvBag;
  }
  if (typeof process !== "undefined") {
    return process.env as EnvBag;
  }
  return undefined;
}

export function getNarrationOverride(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return null;
  }
  return stored === "true";
}

export function setNarrationOverride(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, value.toString());
}

export function resolveLlmNarrationFlag(): boolean {
  const override = getNarrationOverride();
  if (override !== null) {
    return override;
  }
  return readEnvFlag(getEnv());
}

export const featureFlags = {
  get llmNarration() {
    return resolveLlmNarrationFlag();
  },
} as const;
