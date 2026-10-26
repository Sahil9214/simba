import { useState, useMemo } from 'react'

interface Filters {
  startDate: string
  endDate: string
  manager: string
  search: string
}

export function useSalesReportFilters(data: any[]) {
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    manager: '',
    search: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesManager = filters.manager
        ? item.manager === filters.manager
        : true

      const matchesSearch = filters.search
        ? item.customer
          .toLowerCase()
          .includes(filters.search.toLowerCase())
        : true

      const matchesDate =
        (!filters.startDate ||
          new Date(item.date) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          new Date(item.date) <= new Date(filters.endDate))

      return matchesManager && matchesSearch && matchesDate
    })
  }, [data, filters])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentPageData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return {
    filters,
    setFilters,
    filteredData,
    currentPageData,
    currentPage,
    totalPages,
    goToPage,
  }
}
