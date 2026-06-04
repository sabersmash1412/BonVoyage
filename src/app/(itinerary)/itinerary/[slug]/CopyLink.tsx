'use client'

export default function CopyLink({ id }: { id: number }) {
  const copyLink = async () => {
    const shareUrl = `${window.location.origin}/itinerary/share/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied!");
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to copy link");
    }
  };

  return (
    <button
      onClick={copyLink}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Share Itinerary
    </button>
  );
}