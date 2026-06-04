import { Card } from "@/components/ui/card"

export default function Sidebar() {
    return (
            <Card>
                <div className="px-4 py-2">
                    <h2 className="font-bold">Navigation *under refinement*</h2>
                    <a href="" className="flex gap-3 py-3">Home</a>
                    <a href="" className="flex gap-3 py-3">Friends</a>
                    <a href="" className="flex gap-3 py-3">Saved posts</a>
                    <a href="" className="flex gap-3 py-3">Notifications</a>
                </div>
                
            </Card>        
    )
}