import Link from "next/link"

export function SignUpLink() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Don&apos;t have an account?{" "}
      <Link
        href="/auth/signup"
        className="font-medium text-matcha hover:underline"
      >
        Sign up
      </Link>
    </p>
  )
}
