

export type PostProps = {
    onPostCreated?: () => void
};

export type FeedProps = {
    posts: Post[];
};

export type Post = {
    id: string;
    content: string;
    author: string;       
    created_at: string;    
    fullName: string;
    avatarUrl: string;
    imageURLs: string[];
};

export type PostCardProps = {
    post: Post;
    user_id: string;
    avatar: string;
    fullName: string;
}

export type Comment = {
    id: string;
    content: string;
    author: string;       
    created_at: string;    
    fullName: string;
    avatarUrl: string;
    imageURLs: string[];
    parent: string;
};