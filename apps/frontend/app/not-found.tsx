import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
    return (
        <AppShell>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
                <h2 className="text-xl font-semibold tracking-tight">Page Not Found</h2>
                <p className="text-muted-foreground max-w-[500px]">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Button asChild>
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        </AppShell>
    )
}
