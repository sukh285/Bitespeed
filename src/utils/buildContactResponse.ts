import { Contact } from "../types/contact.types";
import { ConsolidatedContact } from "../types/contact.types";

export const buildContactResponse = (
  primary: Contact,
  secondaries: Contact[]
): ConsolidatedContact => {
  const emails = [
    primary.email,
    ...secondaries.map((c) => c.email),
  ].filter((e): e is string => e !== null && e !== undefined);

  const phoneNumbers = [
    primary.phoneNumber,
    ...secondaries.map((c) => c.phoneNumber),
  ].filter((p): p is string => p !== null && p !== undefined);

  const secondaryContactIds = secondaries.map((c) => c.id);

  return {
    primaryContactId: primary.id,
    emails: [...new Set(emails)],
    phoneNumbers: [...new Set(phoneNumbers)],
    secondaryContactIds,
  };
};