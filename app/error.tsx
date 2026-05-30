'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-gray-900">
      <div className="max-w-md space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Something went wrong on our end!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          An unexpected server error occurred. Please try reloading the page.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition-colors duration-200"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
