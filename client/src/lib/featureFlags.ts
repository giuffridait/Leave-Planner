const NARRATION_KEY = "llmNarration";
const BABY_COSTS_KEY = "babyCosts";

type EnvBag = {
  VITE_ENABLE_LLM_NARRATION?: string;
  NEXT_PUBLIC_ENABLE_LLM_NARRATION?: string;
  VITE_ENABLE_BABY_COSTS?: string;
};

function readEnvFlag(env: EnvBag | undefined): boolean {
  if (!env) {
    return false;
  }
  const value = env.VITE_ENABLE_LLM_NARRATION ?? env.NEXT_PUBLIC_ENABLE_LLM_NARRATION;
  return value === "true";
}

function readBabyCostsEnvFlag(env: EnvBag | undefined): boolean {
  return env?.VITE_ENABLE_BABY_COSTS === "true";
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
  const stored = window.localStorage.getItem(NARRATION_KEY);
  if (stored === null) {
    return null;
  }
  return stored === "true";
}

export function setNarrationOverride(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(NARRATION_KEY, value.toString());
}

export function resolveLlmNarrationFlag(): boolean {
  const override = getNarrationOverride();
  if (override !== null) {
    return override;
  }
  return readEnvFlag(getEnv());
}

export function getBabyCostsOverride(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(BABY_COSTS_KEY);
  if (stored === null) {
    return null;
  }
  return stored === "true";
}

export function setBabyCostsOverride(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(BABY_COSTS_KEY, value.toString());
}

export function resolveBabyCostsFlag(): boolean {
  const override = getBabyCostsOverride();
  if (override !== null) {
    return override;
  }
  return readBabyCostsEnvFlag(getEnv());
}

export const featureFlags = {
  get llmNarration() {
    return resolveLlmNarrationFlag();
  },
  get babyCostEnrichment() {
    return resolveBabyCostsFlag();
  },
} as const;
