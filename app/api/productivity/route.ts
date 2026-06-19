import { NextRequest } from "next/server"
import { getProductivity } from "@/app/api/productivity/controller"

export async function GET(request: NextRequest) {
  return getProductivity(request)
}
