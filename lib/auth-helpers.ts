export function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get('X-User-Id')
}
