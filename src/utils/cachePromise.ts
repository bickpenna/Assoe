/** Condivide richieste concorrenti e consente un nuovo tentativo dopo un errore. */
export function cachePromise<T>(factory: () => Promise<T>, enabled = true): () => Promise<T> {
  let cached: Promise<T> | undefined;

  return () => {
    if (!enabled) return factory();
    cached ??= factory().catch((error: unknown) => {
      cached = undefined;
      throw error;
    });
    return cached;
  };
}
