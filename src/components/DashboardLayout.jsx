import { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">
                        Resi<span className="text-primary-600">Hub</span>
                    </h1>
                    <div className="w-10" />
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
