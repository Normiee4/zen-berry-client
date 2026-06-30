// ---------------------------------------------------------------------------
// Unit Tests: app/api/feedback/review/controller.ts
// ---------------------------------------------------------------------------
// Tests the handleCreateReview controller function.
// Mocks resolveUser, supabase client, and review service functions.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextResponse } from "next/server"

// ---- Mocks ----
const mockResolveUser = vi.fn()
vi.mock("@/lib/auth-helpers", () => ({
  resolveUser: mockResolveUser,
}))

const mockReviewService = vi.hoisted(() => ({
  insertReview: vi.fn(),
  formatReview: vi.fn(),
}))

vi.mock("@/app/api/feedback/review/service", () => mockReviewService)

// ---- Module under test ----
import { handleCreateReview } from "@/app/api/feedback/review/controller"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockSupabase() {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { username: "testuser" }, error: null }),
    }),
  } as any
}

function mockAuth(userId: string | null) {
  const supabase = createMockSupabase()
  mockResolveUser.mockResolvedValue({ userId, supabase })
}

const validReviewPayload = {
  rating: 4,
  struggles_solved: "Helped me focus",
  routine_improvement: "Better mornings",
  completed_more: "Tasks done",
  part_of_routine: "Yes, daily",
  recommend_to_others: "Absolutely",
}

const formattedReview = {
  id: "rev-1",
  username: "testuser",
  rating: 4,
  strugglesSolved: "Helped me focus",
  routineImprovement: "Better mornings",
  completedMore: "Tasks done",
  partOfRoutine: "Yes, daily",
  recommendToOthers: "Absolutely",
  additionalFeedback: null,
  createdAt: "2026-06-30T12:00:00Z",
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleCreateReview", () => {
  // -----------------------------------------------------------------------
  // Happy path
  // -----------------------------------------------------------------------

  it("returns 201 for valid review body", async () => {
    mockAuth("user-1")
    mockReviewService.insertReview.mockResolvedValue({
      data: { id: "rev-1", ...validReviewPayload, username: "testuser", user_id: "user-1", additional_feedback: null, created_at: "2026-06-30T12:00:00Z" },
      error: null,
    })
    mockReviewService.formatReview.mockReturnValue(formattedReview)

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReviewPayload),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual(formattedReview)
  })

  it("calls insertReview with the correct userId and data", async () => {
    mockAuth("user-42")
    mockReviewService.insertReview.mockResolvedValue({
      data: { id: "rev-1", ...validReviewPayload, username: "testuser", user_id: "user-42", additional_feedback: null, created_at: "2026-06-30T12:00:00Z" },
      error: null,
    })
    mockReviewService.formatReview.mockReturnValue(formattedReview)

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReviewPayload),
    })
    await handleCreateReview(request)

    expect(mockReviewService.insertReview).toHaveBeenCalledWith(
      expect.anything(),
      "user-42",
      expect.objectContaining({
        username: "testuser",
        rating: 4,
        struggles_solved: "Helped me focus",
      }),
    )
  })

  // -----------------------------------------------------------------------
  // Validation errors
  // -----------------------------------------------------------------------

  it("returns 400 when rating is missing", async () => {
    mockAuth("user-1")
    const { rating: _, ...noRating } = validReviewPayload

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noRating),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty("error")
  })

  it("returns 400 when rating is out of range (0)", async () => {
    mockAuth("user-1")

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validReviewPayload, rating: 0 }),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(400)
  })

  it("returns 400 when rating is out of range (6)", async () => {
    mockAuth("user-1")

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validReviewPayload, rating: 6 }),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(400)
  })

  it("returns 400 when a required string field is empty", async () => {
    mockAuth("user-1")

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validReviewPayload, struggles_solved: "" }),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty("error")
  })

  it("returns 400 when additional_feedback is a number instead of string", async () => {
    mockAuth("user-1")

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validReviewPayload, additional_feedback: 123 }),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(400)
  })

  // -----------------------------------------------------------------------
  // Auth errors
  // -----------------------------------------------------------------------

  it("returns 401 when user is not authenticated", async () => {
    mockAuth(null)

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReviewPayload),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("does not call insertReview when user is not authenticated", async () => {
    mockAuth(null)

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReviewPayload),
    })
    await handleCreateReview(request)

    expect(mockReviewService.insertReview).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // User lookup errors
  // -----------------------------------------------------------------------

  it("returns 404 when user profile is not found", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error("Not found") }),
      }),
    } as any
    mockResolveUser.mockResolvedValue({ userId: "user-unknown", supabase })

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReviewPayload),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(404)
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it("returns 500 when resolveUser throws", async () => {
    mockResolveUser.mockRejectedValue(new Error("Auth service failure"))

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReviewPayload),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ error: "Internal Server Error" })
  })

  it("returns 500 when insertReview throws", async () => {
    mockAuth("user-1")
    mockReviewService.insertReview.mockRejectedValue(new Error("DB connection lost"))

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReviewPayload),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(500)
  })

  it("handles invalid JSON body gracefully", async () => {
    mockAuth("user-1")

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(500)
  })
})
