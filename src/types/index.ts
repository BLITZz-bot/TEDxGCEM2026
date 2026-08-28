/**
 * @module types
 *
 * Central barrel for all TEDxGCEM domain types and interfaces.
 *
 * Import domain types from this module instead of from individual service files:
 * @example
 *   import type { EventSettings, TeamMember } from "@/types";
 *
 * The original service files still export these types directly for
 * backwards-compatibility — this barrel simply consolidates them.
 */

export type { EventSettings } from "@/lib/settings-service";
export type { TeamMember } from "@/lib/team-service";
export type { Speaker } from "@/lib/speakers-service";
export type { Partner } from "@/lib/partners-service";
export type { TicketTier } from "@/lib/ticket-service";
export type { PromoCoupon } from "@/lib/coupon-service";
export type { EmailAttendee, SendConfirmationParams } from "@/lib/email-service";
