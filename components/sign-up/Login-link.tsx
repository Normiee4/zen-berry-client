import Link from "next/link"

export function LoginLink() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Already have an account?{" "}
      <Link
        href="/auth/login"
        className="font-medium text-matcha hover:underline"
      >
        Sign in
      </Link>
    </p>
  )
}