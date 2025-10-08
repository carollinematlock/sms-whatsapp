import { CommType } from "../types";

export const hasScheduler = (type: CommType) => type === "CAMPAIGN" || type === "AUTOMATED";

export const requiresRedemptionOffers = (type: CommType) => type === "REDEMPTION_RESPONSE";

export const isActivationOnly = (type: CommType) =>
  ["SIGNUP_RESPONSE", "REDEMPTION_RESPONSE", "TRIGGERED_POINTS"].includes(type);

export const isOtp = (type: CommType) => type === "AUTHENTICATION_OTP";
