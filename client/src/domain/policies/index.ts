import type { JurisdictionId, PolicyConfig } from "./types";
import { US_CA_POLICY } from "./us-ca";
import { US_NY_POLICY } from "./us-ny";
import { US_GENERIC_POLICY } from "./us-generic";

const POLICY_REGISTRY: Record<string, PolicyConfig> = {
  [US_GENERIC_POLICY.jurisdictionId]: US_GENERIC_POLICY,
  [US_CA_POLICY.jurisdictionId]: US_CA_POLICY,
  [US_NY_POLICY.jurisdictionId]: US_NY_POLICY,
};

export function getPolicyConfig(jurisdictionId: JurisdictionId): PolicyConfig {
  return POLICY_REGISTRY[jurisdictionId] ?? US_GENERIC_POLICY;
}

export function listPolicies(): PolicyConfig[] {
  return Object.values(POLICY_REGISTRY);
}
