export { usePrivacyConsent, type ConsentStatus } from './application/use-privacy-consent';
export {
  isConsentCurrent,
  type PolicyConsent,
  PRIVACY_POLICY_VERSION,
  privacyPolicyUrl,
} from './domain/privacy-policy';
export { PrivacyConsentGate } from './ui/components/privacy-consent-gate';
