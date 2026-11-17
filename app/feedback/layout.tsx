import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share a review or report an issue with Zen Berry.",
  robots: { index: false, follow: false },
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
