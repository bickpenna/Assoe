export function paginationItems(currentPage: number, lastPage: number): Array<number | null> {
  if (
    !Number.isInteger(currentPage) ||
    !Number.isInteger(lastPage) ||
    currentPage < 1 ||
    lastPage < 1 ||
    currentPage > lastPage
  ) {
    return [];
  }

  const visiblePages = [...new Set([
    1,
    lastPage,
    ...Array.from({ length: 5 }, (_, index) => currentPage + index - 2),
  ])]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= lastPage)
    .sort((first, second) => first - second);

  return visiblePages.flatMap((pageNumber, index): Array<number | null> => {
    const previous = visiblePages[index - 1];
    if (previous === undefined || pageNumber - previous === 1) return [pageNumber];
    return pageNumber - previous === 2 ? [previous + 1, pageNumber] : [null, pageNumber];
  });
}
