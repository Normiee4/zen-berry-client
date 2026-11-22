import Image from "next/image"
import Link from "next/link"

export function BrandHeader() {
  return (
    <div className="text-center">
      <Link href="/" className="mb-6 inline-flex items-center justify-center">
        <Image
          src="/zen-berry-logo.png"
          alt="Zen Berry logo"
          width={56}
          height={56}
          priority
          className="size-14 rounded-xl object-contain"
        />
      </Link>
      <h1 className="text-3xl font-bold text-foreground">Get started</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join thousands growing their focus, one session at a time.
      </p>
    </div>
  )
}
