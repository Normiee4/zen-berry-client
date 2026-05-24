"use client"

import { useState, type InputHTMLAttributes } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
}

export function PasswordInput({ id, className, disabled, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        className={`pr-10 ${className ?? ""}`}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
