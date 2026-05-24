"use client"

import { Component, type ReactNode } from "react"
import { toast } from "sonner"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    toast.error(this.props.name || "Something went wrong", {
      description: error.message,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null
    }
    return this.props.children
  }
}
