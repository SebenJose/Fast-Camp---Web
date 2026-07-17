type Listener = () => void;

const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function reportUnauthorizedResponse(response: Response): void {
  if (response.status === 401) {
    listeners.forEach((listener) => listener());
  }
}
