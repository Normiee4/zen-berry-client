// ---------------------------------------------------------------------------
// Unit/Integration Tests: app/api/productivity/route.ts
// ---------------------------------------------------------------------------
// Verifies the GET handler delegates to the controller and returns its response.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"

// ---- Mocks ----
const mockGetProductivity = vi.fn()
vi.mock("@/app/api/productivity/controller", () => ({
  getProductivity: mockGetProductivity,
}))

vi.mock("@/lib/auth-helpers", () => ({
  resolveUser: vi.fn(),
}))

// ---- Module under test ----
import { GET } from "@/app/api/productivity/route"

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/productivity", () => {
  it("calls getProductivity controller with the request", async () => {
    const request = new NextRequest("http://localhost/api/productivity")
    const controllerResponse = NextResponse.json({ ok: true })
    mockGetProductivity.mockResolvedValue(controllerResponse)

    const response = await GET(request)

    expect(mockGetProductivity).toHaveBeenCalledTimes(1)
    expect(mockGetProductivity).toHaveBeenCalledWith(request)
    expect(response).toBe(controllerResponse)
  })

  it("returns 200 response from controller when data is available", async () => {
    const request = new NextRequest("http://localhost/api/productivity")
    const expectedBody = {
      today: { pomodorosCompleted: 5, tasksCompleted: 3, mitsCompleted: 1, focusMinutes: 75, breakCount: 1 },
      streak: 2,
      lifetime: { totalTasks: 100, totalPomodoros: 200, totalFocusMinutes: 5000, totalSessions: 150 },
      weeklyHistory: [],
      weeklyTotals: { pomodoros: 0, tasks: 0, focusMinutes: 0 },
      peakHours: null,
      consistency: { activeDays: 4, totalDays: 7, rate: 57 },
      comparison: null,
    }

    mockGetProductivity.mockResolvedValue(NextResponse.json(expectedBody, { status: 200 }))

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(expectedBody)
  })

  it("returns 500 response from controller when an error occurs", async () => {
    const request = new NextRequest("http://localhost/api/productivity")
    mockGetProductivity.mockResolvedValue(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    )

    const response = await GET(request)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ error: "Internal Server Error" })
  })

  it("returns 200 with zeroed data for unauthenticated users", async () => {
    const request = new NextRequest("http://localhost/api/productivity")
    const zeroedBody = {
      today: { pomodorosCompleted: 0, tasksCompleted: 0, mitsCompleted: 0, focusMinutes: 0, breakCount: 0 },
      streak: 0,
      lifetime: { totalTasks: 0, totalPomodoros: 0, totalFocusMinutes: 0, totalSessions: 0 },
      weeklyHistory: [],
      weeklyTotals: { pomodoros: 0, tasks: 0, focusMinutes: 0 },
      peakHours: null,
      consistency: { activeDays: 0, totalDays: 7, rate: 0 },
      comparison: null,
    }

    mockGetProductivity.mockResolvedValue(NextResponse.json(zeroedBody, { status: 200 }))

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(zeroedBody)
  })

  it("passes through any status code from the controller", async () => {
    const request = new NextRequest("http://localhost/api/productivity")
    mockGetProductivity.mockResolvedValue(
      NextResponse.json({ error: "Rate limited" }, { status: 429 })
    )

    const response = await GET(request)
    expect(response.status).toBe(429)
  })
})
