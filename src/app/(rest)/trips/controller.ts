import { useEffect, useState } from "react"
import axios from "axios"
import { AllItinerariesProps } from "@/types/itinerary/itineraryProps"
import { useRouter } from "next/navigation"

// make http request for all of user's itineraries
export default function TripsController() {
    const [itineraries, setItineraries] = useState<AllItinerariesProps[]>([])
    const [loading, setLoading] = useState(true);

    const router = useRouter()
    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                console.log("axios get /api/itinerary")
                const response = await axios.get('/api/itinerary')
                const data: AllItinerariesProps[] = response.data.data
                console.log("response from get /api/itinerary : ", data)
                setItineraries(data)
            } catch (error) {
                console.log("error: ", error)
                router.push('/404')
            } finally {
                setLoading(false)
            }
        }
        fetchItineraries()
    }, [router])
    return { itineraries, loading }
}