import { AuthProvider } from "@/context/AuthContext";
import Header from "./_component/Header";
import Sidebar from "./_component/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                {/* Sidebar */}
                <div className="hidden xl:block xl:w-64 xl:shrink-0">
                    <Sidebar />
                </div>

                {/* Main Content (independent scroll area) */}
                <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
                    <Header />
                    <main className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
