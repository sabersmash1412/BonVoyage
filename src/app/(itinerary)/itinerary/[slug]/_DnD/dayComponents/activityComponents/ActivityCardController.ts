import { Dispatch, SetStateAction } from "react";
import { notFound } from "next/navigation";
import axios from "axios";
import { ActivityProps } from "@/types/itinerary/activity/activityProps";
import { Day } from "@/types/itinerary/day/dayProps";
import { UpdateActivityProps } from "@/types/itinerary/Dnd/DndProps";
import { toast } from "sonner";
import { HandleAddActivityReturnProps } from "@/types/itinerary/activity/activityProps";

export default function ActivityCardController(setActivities: Dispatch<SetStateAction<ActivityProps[]>>) {
    const handleDeleteActivity = async (activity: ActivityProps) => {
        //update backend
        try {
            if (isNaN(parseInt(activity.activity_id))) {
                notFound()
            }
            const activity_id = parseInt(activity.activity_id)
            const promise = axios.delete("/api/activity", { data: { activity_id: activity_id } })
            toast.promise(promise, {
                loading: `Deleting activity ${activity.activity_id}`,
                success: `Successfully deleted activity ${activity.activity_id}`,
                error: `Failed to delete activtiy ${activity.activity_id}`,
            })
            await promise
        } catch (error) {
            console.error(error)
            notFound()
        }

        // update what user sees after deleting from db
        setActivities((prevActivities) => {
            return prevActivities.filter(a => a.id != activity.id)
        })
    }

    return { handleDeleteActivity }
}

export async function handleDeleteDay(day: string, itinerary_id: number, setDays: Dispatch<SetStateAction<Day[]>>, setActivities: Dispatch<SetStateAction<ActivityProps[]>>) {
    console.log("deleting ", day)
    // update db
    try {
        const promise = axios.delete('/api/day', { data: { day: day, itinerary_id: itinerary_id } })

        // loading message while awaiting promise
        // success message once promise received
        toast.promise(promise, {
            loading: `Deleting day: ${day}`,
            success: () => {
                return `Successfully deleted day: ${day}`;
            },
            error: 'Failed to delete day',
        });
        await promise
    } catch (error) {
        console.log("axios error: ", error)
    }

    // ensure db deletion before updating ui with removed day from Days & activities
    setDays((prevDays) => {
        if (prevDays.length === 0) {
            return prevDays;
        }

        const firstId = prevDays[0].id;
        const lastId = prevDays[prevDays.length - 1].id;

        return (day === firstId || day === lastId)
            ? prevDays.filter((prev) => prev.id !== day)
            : prevDays;
    });
    setActivities((prevActivities) => prevActivities.filter(activity => activity.date != day))
}

// activities is all activities (not filtered activities) in the particular itinerary
export function handleAddActivity({ day, activities, itinerary_id, setActivities, setIsOpenActivityBox }: UpdateActivityProps) {
    // calls useEffect in useDndController to updateActivities
    // will add to types in future; temp fix to not clash with input-validation branch
    const addActivity = (formValues: { title: string, location: string, lat: number, lng: number }) => {
        if (!activities) {
            console.error("activities is undefined")
            return;
        }

        const activitiesCpy = [...activities];

        // generate new activity object
        const activitiesByDay = activitiesCpy.filter(activity => activity.date == day);
        const lastActivityOfDay = activitiesByDay.slice(-1)[0]

        let newActivityObject: ActivityProps;
        if (activitiesByDay.length > 0) {
            newActivityObject = {
                id: -1,
                title: formValues.title,
                location: formValues.location,
                lat: formValues.lat,
                lng: formValues.lng,
                //arbitrary defaults
                activity_id: String(parseInt(lastActivityOfDay.activity_id) + 1),
                type: "activity",
                ordering: -1,
                duration_minutes: "60",
                notes: "",
                date: lastActivityOfDay.date,
                time: lastActivityOfDay.time,
            }
        } else {
            newActivityObject = {
                id: -1,
                title: formValues.title,
                location: formValues.location,
                lat: formValues.lat,
                lng: formValues.lng,
                //arbitrary defaults
                activity_id: '-1',
                type: "activity",
                ordering: -1,
                duration_minutes: "60",
                notes: "",
                date: day,
                time: "00:00",
            }
        }

        let insertIndex: string = '0';

        if (activitiesByDay.length > 0) {
            insertIndex = lastActivityOfDay.activity_id
        } else {
            insertIndex = String(activitiesCpy.length)
        }

        // insert activity into activitiesCpy
        const index = activitiesCpy.findIndex(act => act.activity_id == insertIndex)
        activitiesCpy.splice(index + 1, 0, newActivityObject)

        // update ordering & activity_id in activitiesCpy
        const updatedFieldsByIndex = activitiesCpy.map((activity, index) => {
            activity.activity_id = String(index);
            activity.ordering = index;
            return activity
        })
        console.log("updatedFieldsByIndex: ", updatedFieldsByIndex)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = newActivityObject
        const removedId = [rest] // remove id from newActivityObject as it will be assigned by db. id in db has identity constraint

        console.log("updating activities in db")
        const updateDb = async () => {
            try {
                // update exisiting activities in db, newActivityObject in activities is not added
                const promises = async () => {
                    const prevActivities = updatedFieldsByIndex.filter(a => a.activity_id != newActivityObject.activity_id)
                    await axios.put("/api/activity", { activities: prevActivities, itinerary_id: itinerary_id })

                    const foo = removedId.map(i => ({ ...i, itinerary_id: itinerary_id }))
                    // add new activity into db
                    const response = await axios.post("/api/activity", foo)
                    const newId = response.data.data[0].id
                    console.log("newId:: ", newId)
                    const toUpdateId = updatedFieldsByIndex.find(a => a.activity_id === newActivityObject.activity_id);
                    if (toUpdateId) {
                        toUpdateId.id = newId
                    }
                    setActivities(updatedFieldsByIndex)
                    console.log(updatedFieldsByIndex)
                }

                toast.promise(promises(), {
                    loading: "Adding activity...",
                    success: "Activity added successfully!",
                    error: "Failed to add activity.",
                })
            } catch (error) {
                console.error(error)
                notFound()
            } finally {
                setIsOpenActivityBox(false)
            }
        }
        updateDb()
    }
    // will add to types in future; temp fix to not clash with input-validation branch
    return (values: HandleAddActivityReturnProps) => { addActivity(values) }
}