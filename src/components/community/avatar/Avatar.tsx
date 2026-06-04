export default function Avatar({ url }: { url: string }) {
    return (
        <div className="w-12 rounded-full overflow-hidden">
            {url ? (
                <img src={url} alt="Avatar" />
            ) : null}
        </div>
    )
}