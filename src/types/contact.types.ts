import { Contact } from "../generated/prisma";

export type { Contact };

export interface IdentifyRequest {
  email?: string | null;
  phoneNumber?: string | null;
}

export interface ConsolidatedContact {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export interface IdentifyResponse {
  contact: ConsolidatedContact;
}