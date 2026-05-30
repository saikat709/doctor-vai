import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-gray-900">
      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
            404 Error
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Page not found
          </h2>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition-colors duration-200"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}
