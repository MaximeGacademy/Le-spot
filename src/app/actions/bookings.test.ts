import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-guards", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { createClient } from "@/lib/supabase/server";
import { createBooking } from "./bookings";

const MOCK_USER = { id: "user-abc", email: "test@example.com" };
const PREV_STATE = { ok: false as const, error: null };

function validFormData(): FormData {
  const fd = new FormData();
  fd.set("court_id", "1");
  fd.set("date", "2030-06-20");
  fd.set("start_hour", "10");
  return fd;
}

function mockSupabaseInsert(error: { code?: string; message?: string } | null) {
  const insert = vi.fn().mockResolvedValue({ error });
  const from = vi.fn().mockReturnValue({ insert });
  vi.mocked(createClient).mockResolvedValue({ from } as any);
  return { insert, from };
}

describe("createBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("propage l'erreur si l'utilisateur n'est pas connecté", async () => {
    vi.mocked(requireUser).mockRejectedValue(new Error("Non authentifié."));

    await expect(createBooking(PREV_STATE, validFormData())).rejects.toThrow(
      "Non authentifié.",
    );
  });

  it("retourne une erreur si les données du formulaire sont invalides", async () => {
    vi.mocked(requireUser).mockResolvedValue(MOCK_USER as any);

    const fd = new FormData();
    fd.set("court_id", "0"); // invalide : doit être > 0
    fd.set("date", "2030-06-20");
    fd.set("start_hour", "10");

    const result = await createBooking(PREV_STATE, fd);

    expect(result).toEqual({ ok: false, error: "Données de réservation invalides." });
  });

  it("retourne ok:true, insère avec le bon user_id et invalide le cache", async () => {
    vi.mocked(requireUser).mockResolvedValue(MOCK_USER as any);
    const { insert } = mockSupabaseInsert(null);

    const result = await createBooking(PREV_STATE, validFormData());

    expect(result).toEqual({ ok: true, error: null });
    expect(insert).toHaveBeenCalledWith({
      court_id: 1,
      user_id: "user-abc",
      date: "2030-06-20",
      start_hour: 10,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/mes-reservations");
  });
});
