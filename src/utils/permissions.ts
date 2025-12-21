// src/utils/permissions.ts

export const PERMISSIONS = {
  DASHBOARD: "dashboard",

  BOOKINGS_VIEW: "bookings",
  BOOKINGS_CREATE: "bookings.create",
  BOOKINGS_EDIT: "bookings.edit",

  ENQUIRY:"enquiry",
  INCENTIVES:"incentives",

  CUSTOMERS_VIEW: "customers",
  CUSTOMERS_EDIT: "customers.edit",

  LAB_PRODUCTS: "lab_products",

  CONTENT_MANAGEMENT: "content_management",

  NOTIFICATIONS: "notifications",

  SETTINGS: "settings",
} as const;

/**
 * Permission key type
 */
export type PermissionKey =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
