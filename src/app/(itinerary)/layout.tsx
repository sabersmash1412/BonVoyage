import Header from "@/components/layout/Header"

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <Header />
            <main className="h-[95vh] sm:h-[94vh] md:h-[93vh] lg:h-[93vh]">{children}</main>
        </div>
    )
}