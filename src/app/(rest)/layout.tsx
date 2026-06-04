import Header from "@/components/layout/Header"

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main>
            <Header />
            <div className="px-4">
                {children}
            </div>
        </main>
    )
}