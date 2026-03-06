import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { Footer } from "@/components/layout/footer";
import { AuthErrorHandler } from "@/components/auth/auth-error-handler";
import { Suspense } from "react";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HeaderWrapper />
            <main className="flex-grow flex flex-col items-center justify-start w-full">
                <Suspense>
                    <AuthErrorHandler />
                </Suspense>
                {children}
            </main>
            <Footer />
        </>
    );
}
