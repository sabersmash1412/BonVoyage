'use client'
import axios from "axios";
import { notFound } from "next/navigation";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";
import { DeleteDialogProps } from "@/types/itinerary/itineraryProps";
import { toast } from "sonner";

export default function DeleteDialog({ slug }: DeleteDialogProps) {
    const router = useRouter()
    const deleteItinerary = () => {
        const handleDeleteItinerary = async () => {
            console.log("deleting itinerary: ", slug)
            try {
                if (isNaN(parseInt(slug))) {
                    notFound()
                }
                const itinerary_id = parseInt(slug)
                const response = await axios.delete('/api/itinerary/', { data: { itinerary_id: itinerary_id } })
                console.log(`deleted itinerary ${itinerary_id}: `, response)
                router.push('/trips')
            } catch (error) {
                console.error(error)
                notFound()
            }
        }
        toast.promise(handleDeleteItinerary(), {
            loading: `Deleting itinerary ${slug}`,
            success: `Itinerary ${slug} deleted successfully!`,
            error: `Failed to delete itinerary ${slug}.`,
        })
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger>
                {/* copied shadcn destructive button cause i like the style */}
                <div data-cy='delete-itinerary-button' className='inline-flex items-center justify-center rounded-md text-sm font-medium 
                   bg-red-600 text-white hover:bg-red-700 
                   focus:outline-none focus:ring-2 focus:ring-red-500 
                   focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none 
                   h-10 px-4 py-2 cursor-pointer transition-colors'>
                    Delete Itinerary
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your itinerary.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel data-cy='cancel-button'>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteItinerary} data-cy='continue-button'>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}