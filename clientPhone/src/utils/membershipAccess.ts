import { Membership } from "../interface/interfaces";

export const canSeeRoutines = (role: number, membership: Membership) => {
  if (role === 1 || role === 3) return { allowed: true };

  if (!membership.membershipActive) {
    return { allowed: false, reason: "sin_membresia" };
  }

  return { allowed: true };
};

export const canSeeClasses = (role: number, membership: Membership) => {
  if (role === 1 || role === 3) return { allowed: true };

  if (!membership.membershipActive) {
    return { allowed: false, reason: "sin_membresia" };
  }

  if (membership.data.tipo === 2 || membership.data.tipo === 3) {
    return { allowed: true };
  }

  return { allowed: false, reason: "tipo_invalido" };
};
