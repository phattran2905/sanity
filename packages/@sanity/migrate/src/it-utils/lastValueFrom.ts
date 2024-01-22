interface Options<T> {
  defaultValue?: T
}
export async function lastValueFrom<T>(
  it: AsyncIterableIterator<T>,
  options?: Options<T>,
): Promise<T> {
  const defaultGiven = 'defaultValue' in (options ?? {})
  let latestValue: T | undefined
  let didYield = false

  for await (const value of it) {
    didYield = true
    latestValue = value
  }
  if (!didYield) {
    if (defaultGiven) {
      return options!.defaultValue!
    }
    throw new Error(
      'No value yielded from async iterable. If this iterable is empty, provide a default value.',
    )
  }
  return latestValue!
}
