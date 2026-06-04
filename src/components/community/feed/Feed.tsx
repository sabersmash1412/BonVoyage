import { Card } from "@/components/ui/card"
import Avatar from "../avatar/Avatar"
import { FeedProps, PostCardProps, Comment } from "@/types/communityProps"
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns"
import { useState, useEffect } from "react"


export default function Feed({ posts }: FeedProps) {
    const [userId, setUserId] = useState<string>("");
    const [userAvatar, setUserAvatar] = useState<string>("");
    const [userFullName, setUserFullName] = useState<string>("");
    useEffect(() => {
            const fetchProfile = async () => {
                try {
                    const res = await fetch("/api/getUserProfile");
                    const data = await res.json();
                    if (res.ok) {
                        setUserId(data.userId);
                        setUserAvatar(data.avatarUrl)
                        setUserFullName(data.fullName)
                    } else {
                        console.error("Error fetching profile:", data.error);
                    }
                } catch (err) {
                    console.error("Unexpected error:", err);
                }
            };
            fetchProfile();
        }, []);

    return (
        posts.map((post) => (
            <PostCard key={post.id} post={post} user_id={userId} avatar={userAvatar} fullName={userFullName}/>
        ))
    )
}

function PostCard({ post, user_id, avatar, fullName }: PostCardProps) {
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);

    const fetchLikes = async () => {
        try {
            const res = await fetch(`/api/getLikes?post_id=${post.id}`);
            const count = await res.json(); 
            setLikes(count);

            const likeRes = await fetch(`/api/hasLiked?post_id=${post.id}&user_id=${user_id}`);
            const { liked } = await likeRes.json();
            setHasLiked(liked);
        } catch (err) { 
            console.error("Error:", err);
        } 
    };
    useEffect(() => {
        if (user_id) {
            fetchLikes();
        }
    }, [user_id, post.id]);

    const handleLike = async () => {
        const endpoint = hasLiked ? '/api/unlikePost' : '/api/likePost';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            post_id: post.id, 
            user_id: user_id  
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log("Like successful!", result.like);
            setHasLiked(!hasLiked);
            fetchLikes();
        }
    };

    const postComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const response = await fetch('/api/createComment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user_id,
                content: comment,
                fullName: fullName, 
                avatarUrl: avatar, 
                imageURLs: [],             
                parentId: post.id
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log("Comment created:", result.data);
            setComment("");
            fetchComments();
        } else {
            console.error("Failed:", result.error);
        }
    };

    const fetchComments = async () => {
        const res = await fetch(`/api/getComments?parentId=${post.id}`);
        const data = await res.json();
        setComments(data);
    };

    useEffect(() => {
        fetchComments();
    }, [post.id]);

    return (
            <Card key={post.id}>
                <div className="flex gap-3 px-2">
                    <div>
                        <Avatar url={post.avatarUrl}/>
                    </div>
                    <div>
                            <p><a className="font-semibold">{post.fullName}</a> shared a post</p>
                        <p className="text-gray-700 text-sm">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                    </div>
                </div>
                <div className="px-2">
                    <p className="my-2 text-sm">{post.content}</p>
                    {post.imageURLs?.length > 0 && (
                        <div className="flex gap-4">
                            {post.imageURLs.map(image => (
                                <div key={image}> 
                                    <img src={image} className="rounded-md" alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="px-2 flex gap-5">
                    <button className={`flex gap-2 items-center ${hasLiked ? "text-red-600" : "text-gray-700"}`} onClick={handleLike}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        {likes}
                    </button>
                    <button className="flex gap-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                        {comments.length} 
                    </button>
                </div> 
                <div className="flex mt-4 gap-3 px-2">
                    <div>
                        <Avatar url={avatar}/>
                    </div>
                    <form onSubmit={postComment} className="flex-1">
                        <input 
                            value={comment}
                            onChange={ev => setComment(ev.target.value)}
                            className="border border-gray-300 rounded-xl w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Leave a comment"
                        />
                    </form>
                </div>
                <div>
                    {comments.length > 0 && comments.map(com => (
                        <div key={com.id} className="px-5 mt-2 flex gap-2 items-center">
                            <Avatar url={com.avatarUrl} />
                            <div className="bg-gray-200 p-2 rounded-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-gray-500">{com.fullName}</span>
                                    <span className="text-xs text-gray-400">{formatDistanceToNowStrict(new Date(com.created_at))}</span>
                                </div>
                                <p className="text-sm">{com.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
    )
} 