// ---------------------------------------------------------------------------
// Unit Tests: app/api/feedback/review/service.ts
// ---------------------------------------------------------------------------
// Tests insertReview query construction and formatReview data transformation.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"

// ---- Module under test ----
import * as S from "@/app/api/feedback/review/service"
import type { ReviewRow, FormattedReview, CreateReviewInput } from "@/app/api/feedback/review/service"

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function createMockSupabase() {
  const builder: Record<string, vi.Mock> = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  const from = vi.fn().mockReturnValue(builder)

  return {
    from,
    __builder: builder,
  } as unknown as SupabaseClient & { __builder: typeof builder }
}

// ---------------------------------------------------------------------------
// Tests: insertReview
// ---------------------------------------------------------------------------

describe("insertReview", () => {
  const userId = "user-123"
  const validInput: CreateReviewInput = {
    username: "testuser",
    rating: 4,
    struggles_solved: "Helped me focus better",
    routine_improvement: "I wake up earlier",
    completed_more: "Finished more tasks",
    part_of_routine: "Yes, I use it daily",
    recommend_to_others: "Definitely!",
  }

  it("inserts into the reviews table with correct data", async () => {
    const mock = createMockSupabase()

    await S.insertReview(mock, userId, validInput)

    expect(mock.from).toHaveBeenCalledWith("reviews")
    expect(mock.__builder.insert).toHaveBeenCalledWith([
      {
        user_id: userId,
        username: "testuser",
        rating: 4,
        struggles_solved: "Helped me focus better",
        routine_improvement: "I wake up earlier",
        completed_more: "Finished more tasks",
        part_of_routine: "Yes, I use it daily",
        recommend_to_others: "Definitely!",
        additional_feedback: null,
      },
    ])
  })

  it("calls .select() and .single() after insert", async () => {
    const mock = createMockSupabase()

    await S.insertReview(mock, userId, validInput)

    expect(mock.__builder.select).toHaveBeenCalled()
    expect(mock.__builder.single).toHaveBeenCalled()
  })

  it("includes additional_feedback when provided", async () => {
    const mock = createMockSupabase()
    const inputWithFeedback: CreateReviewInput = {
      ...validInput,
      additional_feedback: "Love the app!",
    }

    await S.insertReview(mock, userId, inputWithFeedback)

    expect(mock.__builder.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        additional_feedback: "Love the app!",
      }),
    ])
  })

  it("sets additional_feedback to null when undefined", async () => {
    const mock = createMockSupabase()

    await S.insertReview(mock, userId, validInput)

    const insertCall = mock.__builder.insert.mock.calls[0][0][0]
    expect(insertCall.additional_feedback).toBeNull()
  })

  it("sets additional_feedback to null when empty string", async () => {
    const mock = createMockSupabase()
    const inputEmptyFeedback: CreateReviewInput = {
      ...validInput,
      additional_feedback: "",
    }

    await S.insertReview(mock, userId, inputEmptyFeedback)

    const insertCall = mock.__builder.insert.mock.calls[0][0][0]
    expect(insertCall.additional_feedback).toBeNull()
  })

  it("returns the inserted row data on success", async () => {
    const mock = createMockSupabase()
    const insertedRow: ReviewRow = {
      id: "rev-new",
      user_id: userId,
      username: "testuser",
      rating: 4,
      struggles_solved: "Helped me focus better",
      routine_improvement: "I wake up earlier",
      completed_more: "Finished more tasks",
      part_of_routine: "Yes, I use it daily",
      recommend_to_others: "Definitely!",
      additional_feedback: null,
      created_at: "2026-06-30T12:00:00Z",
    }
    mock.__builder.single.mockResolvedValue({ data: insertedRow, error: null })

    const result = await S.insertReview(mock, userId, validInput)
    expect(result.data).toEqual(insertedRow)
    expect(result.error).toBeNull()
  })

  it("propagates supabase errors", async () => {
    const mock = createMockSupabase()
    mock.__builder.single.mockResolvedValue({
      data: null,
      error: new Error("RLS violation"),
    })

    const result = await S.insertReview(mock, userId, validInput)
    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.error!.message).toBe("RLS violation")
  })
})

// ---------------------------------------------------------------------------
// Tests: formatReview
// ---------------------------------------------------------------------------

describe("formatReview", () => {
  it("transforms ReviewRow to camelCase FormattedReview", () => {
    const row: ReviewRow = {
      id: "rev-1",
      user_id: "user-123",
      username: "jane",
      rating: 5,
      struggles_solved: "Solved my procrastination",
      routine_improvement: "I have a morning routine now",
      completed_more: "I complete 3 MITs daily",
      part_of_routine: "Part of my morning routine",
      recommend_to_others: "Yes, already recommended",
      additional_feedback: "Game changer!",
      created_at: "2026-06-30T12:00:00Z",
    }

    const formatted = S.formatReview(row)

    expect(formatted).toEqual<FormattedReview>({
      id: "rev-1",
      username: "jane",
      rating: 5,
      strugglesSolved: "Solved my procrastination",
      routineImprovement: "I have a morning routine now",
      completedMore: "I complete 3 MITs daily",
      partOfRoutine: "Part of my morning routine",
      recommendToOthers: "Yes, already recommended",
      additionalFeedback: "Game changer!",
      createdAt: "2026-06-30T12:00:00Z",
    })
  })

  it("maps additional_feedback to additionalFeedback (null)", () => {
    const row: ReviewRow = {
      id: "rev-2",
      user_id: "user-456",
      username: "bob",
      rating: 3,
      struggles_solved: "Some help",
      routine_improvement: "A bit",
      completed_more: "Not much",
      part_of_routine: "Occasionally",
      recommend_to_others: "Maybe",
      additional_feedback: null,
      created_at: "2026-06-29T08:00:00Z",
    }

    const formatted = S.formatReview(row)
    expect(formatted.additionalFeedback).toBeNull()
  })

  it("preserves additional_feedback string value when present", () => {
    const row: ReviewRow = {
      id: "rev-3",
      user_id: "user-789",
      username: "alice",
      rating: 4,
      struggles_solved: "Great",
      routine_improvement: "Better",
      completed_more: "More",
      part_of_routine: "Yes",
      recommend_to_others: "Yes",
      additional_feedback: "Add dark mode please",
      created_at: "2026-06-28T10:00:00Z",
    }

    const formatted = S.formatReview(row)
    expect(formatted.additionalFeedback).toBe("Add dark mode please")
  })

  it("has all expected camelCase keys in the output", () => {
    const row: ReviewRow = {
      id: "rev-4",
      user_id: "user-000",
      username: "test",
      rating: 1,
      struggles_solved: "x",
      routine_improvement: "x",
      completed_more: "x",
      part_of_routine: "x",
      recommend_to_others: "x",
      additional_feedback: null,
      created_at: "2026-06-27T00:00:00Z",
    }

    const formatted = S.formatReview(row)
    const keys = Object.keys(formatted)
    expect(keys).toContain("strugglesSolved")
    expect(keys).toContain("routineImprovement")
    expect(keys).toContain("completedMore")
    expect(keys).toContain("partOfRoutine")
    expect(keys).toContain("recommendToOthers")
    expect(keys).toContain("additionalFeedback")
    expect(keys).toContain("createdAt")

    // Should NOT contain snake_case keys
    expect(keys).not.toContain("struggles_solved")
    expect(keys).not.toContain("additional_feedback")
  })
})
