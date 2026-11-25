import prisma from './prisma';

/**
 * Resolves a university ID from a given input string (ID or Name).
 * Matches by ID, exact name, or partial name against registered universities.
 * Returns the university ID if found, or null if no registered university matches.
 */
export async function resolveUniversityId(universityInput: string | null | undefined): Promise<string | null> {
  if (!universityInput || typeof universityInput !== 'string') return null;
  const trimmed = universityInput.trim();
  if (!trimmed) return null;

  // 1. Direct ID match
  const byId = await prisma.user.findFirst({
    where: {
      id: trimmed,
      role: 'UNIVERSITY',
    },
  });
  if (byId) return byId.id;

  // 2. Fetch all registered universities
  const allUnis = await prisma.user.findMany({
    where: { role: 'UNIVERSITY' },
    include: { universityProfile: true },
  });

  const lowerInput = trimmed.toLowerCase();

  // 3. Exact match on user.name or universityProfile.universityName
  const exactMatch = allUnis.find((u) => {
    const uName = (u.name || '').trim().toLowerCase();
    const profName = (u.universityProfile?.universityName || '').trim().toLowerCase();
    return uName === lowerInput || profName === lowerInput;
  });
  if (exactMatch) return exactMatch.id;

  // 4. Substring / partial match
  // E.g. input "มหาวิทยาลัย PWK" matches "มหาวิทยาลัยนวัตกรรมและเทคโนโลยี PWK"
  const partialMatch = allUnis.find((u) => {
    const uName = (u.name || '').trim().toLowerCase();
    const profName = (u.universityProfile?.universityName || '').trim().toLowerCase();
    return (
      (uName && (uName.includes(lowerInput) || lowerInput.includes(uName))) ||
      (profName && (profName.includes(lowerInput) || lowerInput.includes(profName)))
    );
  });
  if (partialMatch) return partialMatch.id;

  // If no registered university matches, return null (prevent auto-creating unverified accounts)
  return null;
}

/**
 * Returns a list of all active universities for UI dropdowns/autocomplete.
 */
export async function getUniversityList() {
  const universities = await prisma.user.findMany({
    where: { role: 'UNIVERSITY', status: 'ACTIVE' },
    include: { universityProfile: true },
    orderBy: { name: 'asc' },
  });

  return universities.map((u) => ({
    id: u.id,
    name: u.universityProfile?.universityName || u.name,
    campus: u.universityProfile?.campus || '',
    logo: u.universityProfile?.logo || u.avatar,
    email: u.email,
  }));
}
