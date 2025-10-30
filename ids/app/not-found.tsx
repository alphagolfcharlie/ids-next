import Link from "next/link";

export default function NotFound() {
    return (
        <div
            className="min-h-screen p-6 flex items-center justify-center"
            style={{
                backgroundImage: "url('/bnr.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h1 className="text-5xl font-bold text-white mb-4">404 – Page Not Found</h1>
                <p className="mb-6 text-lg text-gray-400">
                    The page you are looking for does not exist.
                </p>
                <Link
                    href="/"
                    className="px-4 py-2 bg-primary rounded-lg"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
