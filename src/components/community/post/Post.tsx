"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/community/avatar/Avatar";
import { PostProps } from "@/types/communityProps";

export default function Post({ onPostCreated }: PostProps) {
    const [fullName, setFullName] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [content, setContent] = useState<string>("");
    const [isPosting, setIsPosting] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/getUserProfile");
                const data = await res.json();
                if (res.ok) {
                    setFullName(data.fullName);
                    setAvatarUrl(data.avatarUrl);
                    setUserId(data.userId);
                } else {
                    console.error("Error fetching profile:", data.error);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            }
        };
        fetchProfile();
    }, []);

    async function createPost() {
        if (!userId) {
            console.log("User ID not loaded");
            alert("Please log in to post");
            return;
        }

        if (!content.trim()) {
            alert("Post content cannot be empty");
            return;
        }

        setIsPosting(true);

        try {
            let imageURLs: string[] = [];

            // 1. First upload images if any
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach(file => formData.append("files", file));

                const uploadResponse = await fetch("/api/uploadImage", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || "Failed to upload images");
                }

                const uploadData = await uploadResponse.json();
                imageURLs = uploadData.urls || [];
            }


            const postResponse = await fetch("/api/createPost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    content,
                    fullName,
                    avatarUrl,
                    imageURLs, 
                }),
            });

            if (!postResponse.ok) {
                const errorData = await postResponse.json();
                throw new Error(errorData.error || "Failed to create post");
            }

            const postData = await postResponse.json();
            console.log("Post created successfully:", postData);
            
            // Reset form
            setContent("");
            setSelectedFiles([]);
            
            setPreviews([]);
            onPostCreated?.();
            
        } catch (error) {
            console.error("Error:", error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("An unexpected error occurred");
            }
        } finally {
            setIsPosting(false);
        }
    }

    function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        const previewUrls = files.map(file => URL.createObjectURL(file));
        setPreviews(previewUrls);

        console.log("Selected files:", e.target.files);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await createPost(); 
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-1 px-2">
                    <div>
                        <Avatar url={avatarUrl} />
                    </div>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="grow py-3 h-15 placeholder-gray-500" 
                        placeholder={`How was your travel experience, ${fullName}`} 
                    />
                </div>
                <div className="flex gap-5 items-center mt-2">
                    <div className="grow text-left px-2">
                        <label className="flex gap-1">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAttach}
                                className="hidden"
                                multiple
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>

                            <span className="hidden md:block">Attach image</span>
                        </label>
                    </div>
                    <div className="grow text-right px-2">
                        <Button 
                            type="submit" 
                            disabled={isPosting || !content.trim()}
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </div>
            </form>
            {previews.length > 0 && (
                <div className="mt-4 px-2">
                    <h3 className="text-sm font-semibold">Previews:</h3>
                    <div className="flex gap-3">
                        {previews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-auto h-24 object-cover rounded"/>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}