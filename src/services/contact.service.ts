import { db } from "../config/db";
import { Contact, LinkPrecedence } from "../generated/prisma/client";
import { ApiError } from "../utils/apiError";
import { buildContactResponse } from "../utils/buildContactResponse";
import { ConsolidatedContact } from "../types/contact.types";

// fetch the full cluster given a primary contact id
const fetchCluster = async (
  primaryId: number,
  tx: typeof db,
): Promise<{ primary: Contact; secondaries: Contact[] }> => {
  const primary = await tx.contact.findUnique({
    where: { id: primaryId },
  });

  if (!primary) {
    throw new ApiError(404, "Primary contact not found");
  }

  const secondaries = await tx.contact.findMany({
    where: { linkedId: primaryId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  return { primary, secondaries };
};

// resolve contact (primary or secondary) to its root primary id
const resolveToPrimaryId = (contact: Contact): number => {
  return contact.linkPrecedence === LinkPrecedence.primary
    ? contact.id
    : contact.linkedId!;
};

export const identifyContact = async (
  email: string | null | undefined,
  phoneNumber: string | null | undefined,
): Promise<ConsolidatedContact> => {
  return await db.$transaction(async (tx) => {
    // build dynamic query - only match on non-null fields
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phoneNumber) orConditions.push({ phoneNumber });

    // step 1 - find all contacts matching email or phone
    const matchedContacts = await tx.contact.findMany({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    // Case 1: no matches → create new primary
    if (matchedContacts.length === 0) {
      const newContact = await tx.contact.create({
        data: {
          email: email ?? null,
          phoneNumber: phoneNumber ?? null,
          linkPrecedence: LinkPrecedence.primary,
        },
      });

      return buildContactResponse(newContact, []);
    }

    // step 2 — resolve all matches to their root primary ids
    const primaryIds = [...new Set(matchedContacts.map(resolveToPrimaryId))];

    // fetch all primary contacts
    const primaryContacts = await tx.contact.findMany({
      where: { id: { in: primaryIds }, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    // Case 4: multiple primaries → merge
    let winnerPrimary = primaryContacts[0]; // oldest = winner

    if (primaryContacts.length > 1) {
      const losers = primaryContacts.slice(1);
      const loserIds = losers.map((c) => c.id);

      // demote all loser primaries to secondary
      await tx.contact.updateMany({
        where: { id: { in: loserIds } },
        data: {
          linkPrecedence: LinkPrecedence.secondary,
          linkedId: winnerPrimary.id,
          updatedAt: new Date(),
        },
      });

      // re-point all their existing children to winner
      await tx.contact.updateMany({
        where: { linkedId: { in: loserIds }, deletedAt: null },
        data: {
          linkedId: winnerPrimary.id,
          updatedAt: new Date(),
        },
      });
    }

    // fetch full cluster after potential merge
    const { primary, secondaries } = await fetchCluster(
      winnerPrimary.id,
      tx as unknown as typeof db,
    );

    // step 3 — check if request contains new information
    const allEmails = new Set([
      primary.email,
      ...secondaries.map((c) => c.email),
    ]);
    const allPhones = new Set([
      primary.phoneNumber,
      ...secondaries.map((c) => c.phoneNumber),
    ]);

    const hasNewEmail = email && !allEmails.has(email);
    const hasNewPhone = phoneNumber && !allPhones.has(phoneNumber);
    const hasNewInfo = hasNewEmail || hasNewPhone;

    // Case 3: new info → create secondary
    if (hasNewInfo) {
      await tx.contact.create({
        data: {
          email: email ?? null,
          phoneNumber: phoneNumber ?? null,
          linkedId: primary.id,
          linkPrecedence: LinkPrecedence.secondary,
        },
      });

      // re-fetch cluster with new secondary included
      const updated = await fetchCluster(
        primary.id,
        tx as unknown as typeof db,
      );
      return buildContactResponse(updated.primary, updated.secondaries);
    }

    // Case 2: no new info → return existing cluster
    return buildContactResponse(primary, secondaries);
  });
};
