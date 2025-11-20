export function groupBy<T, K extends string | number | symbol>(
  items: T[],
  getKey: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (acc, cur) => {
      const key = getKey(cur);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(cur);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}
