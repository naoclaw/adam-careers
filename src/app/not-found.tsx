import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
        404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
        Page not found
      </h1>
      <p className="mt-2 text-gray-600">
        The page you were looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back to home
      </Link>
    </div>
  );
}
