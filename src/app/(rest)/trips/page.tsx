"use client"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { dateConvert } from "@/utils/dateFunctions"
import TripsController from "./controller"

export default function Page() {
    const { itineraries, loading } = TripsController()
    return (<div className="w-3xl mx-auto">
        <div className="justify-items-center">
            <h1 className="text-left font-bold text-3xl mb-5">My trips</h1>
        </div>
        {loading
            ? (<div className="flex justify-center items-center">
                <p className="text-xl font-medium text-center">Fetching your itineraries</p>
            </div>)
            : itineraries.length == 0
                ? (<div className="flex justify-center items-center">
                    <p className="text-xl font-medium text-center">
                        No trips created. Head over to <Link href="/plan" className="underline text-blue-600">/plan</Link> now!
                    </p>
                </div>)
                : (<div className="grid grid-cols-2 gap-4">
                    {itineraries.map((itinerary, index) => (
                        <Card className="w-full" key={index}>
                            <Link href={`/itinerary/${itinerary.id}`}>
                                <CardContent className="flex-col gap-2 items-start">
                                    <CardTitle className="text-2xl">Trip to {itinerary.title}</CardTitle>
                                    <CardDescription className="text-lg">
                                        {dateConvert(itinerary.start_date)} to {dateConvert(itinerary.end_date)}
                                    </CardDescription>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>)
        }
    </div>)
}