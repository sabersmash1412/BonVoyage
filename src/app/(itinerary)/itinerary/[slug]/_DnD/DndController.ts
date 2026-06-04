'use client'
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { arrayMove } from '@dnd-kit/sortable';
import { Day } from "@/types/itinerary/day/dayProps";
import axios from "axios";
import { notFound } from "next/navigation";
import { DragEndEvent } from "@dnd-kit/core"
import { DndProps } from "@/types/itinerary/Dnd/DndProps";
import { getDateRange, incrementDateStringByOne } from "@/utils/dateFunctions";
import { DateHueMap } from "@/lib/itinerary/MapMarkerColours";

export function DndController({ activities, itinerary_id, itineraryOverview, setActivities }: DndProps) {
    useEffect(() => {
        const updateActivities = async () => {
            try {
                console.log("updating activities")
                await axios.put("/api/activity", { activities: activities, itinerary_id: itinerary_id })
            } catch (error) {
                console.error(error)
                notFound()
            }
        }
        updateActivities()
    }, [activities, itinerary_id])

    const [DAYS, setDays] = useState(() => {
        const dateRange = getDateRange(itineraryOverview.start_date, itineraryOverview.end_date)
        const dayArray: Day[] = dateRange.map(date => ({
            id: date,
            title: date,
        }))
        return dayArray
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over) {
            return;
        }
        const activityId = active.id as string;
        const newDate = over.id as string // to be dropped over
        // console.log("activityId ", active)
        // console.log("newDate ", over)

        // no change after DragEndEvent since same click target and drop target
        if (activityId == newDate) {
            return;
        }
        // move activity-0 to diff container
        // check if container id == newDate
        if (DAYS.some(row => row.id == newDate)) {
            console.log(newDate)
            console.log(activityId)
            // for activity-0
            const index = activities.findIndex(activity => activity.activity_id == activityId)
            activities[index].date = newDate
            activities[index].ordering = -1 // so that activity-0 will be at top of container during sorting later

            const changeDate = activities
                // sort by date then ordering, so that activity that was shifted is always at top of day container
                .sort((a, b) => {
                    if (a.date < b.date) return -1;
                    if (a.date > b.date) return 1;
                    return a.ordering - b.ordering;
                })
                // reorder
                .map((activity, index) => {
                    activity.ordering = index;
                    return activity;
                })

            console.log(changeDate)
            setActivities(changeDate)
        } else { // within same container
            const oldIndex = activities.findIndex(activity => activity.activity_id == activityId)
            const newIndex = activities.findIndex(activity => activity.activity_id == newDate)
            const date1 = activities[oldIndex].date
            const date2 = activities[newIndex].date
            //shift activity position within array
            const moved = arrayMove(activities, oldIndex, newIndex)
            if (date1 != date2) { // item to another item in diff container
                moved[newIndex].date = date2 //update date of moved item
            }
            // reorder all activities based on index
            moved.forEach((activity, index) => { activity.ordering = index; return activity })
            setActivities(moved)
        }
        // setUpdateDb(true)
    }
    return { DAYS, setDays, handleDragEnd, activities }
}

export async function addDay(itinerary_id: number, setDays: Dispatch<SetStateAction<Day[]>>, dateHueMap: DateHueMap) {
    setDays((prevDays) => {
        const lastDateString = (prevDays.at(prevDays.length - 1) as Day).id
        // get newDateString by adding 1 day
        const newDateString = incrementDateStringByOne(lastDateString)

        console.log("new date: ", newDateString)
        const newDay: Day = {
            id: newDateString,
            title: newDateString
        }

        // update db
        try {
            axios.put('/api/day', { itinerary_id: itinerary_id, newDateString: newDateString })
        } catch (error) {
            console.log("axios error, ", error)
            return prevDays
        }

        // add new colour to marker
        dateHueMap.add(newDateString)

        return prevDays.concat(newDay)
    })
}