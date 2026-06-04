"use client";

import Sidebar from "@/components/community/sidebar/Sidebar";
import Post from "@/components/community/post/Post";
import Feed from "@/components/community/feed/Feed";
import { useState, useEffect } from "react";


export default function Community() {
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        try {
        const response = await fetch("/api/getPosts");
        const data = await response.json();
        
        if (response.ok) {
            setPosts(data);
        } else {
            console.error("Failed to fetch posts:", data.error);
        }
        } catch (error) {
        console.error("Error fetching posts:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="flex mt-4 max-w-4xl mx-auto gap-4">
        <div className="w-1/4">
            <Sidebar />
        </div>
        <div className="w-3/4">
            <Post onPostCreated={() => fetchPosts()}/>
            <Feed posts={posts} />
        </div>
        </div>
    );
}