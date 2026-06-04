import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ActivityProps } from "@/types/itinerary/activity/activityProps";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import ActivityCardController from "./ActivityCardController";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { ActivityMarker } from "@/components/itinerary/CustomMarker";

export default function ActivityCard({ activity, setActivities, orderWithinDay, colour }: { activity: ActivityProps, setActivities: Dispatch<SetStateAction<ActivityProps[]>>, orderWithinDay: number, colour: string }) {
    const { handleDeleteActivity } = ActivityCardController(setActivities)

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform } = useDraggable({
        id: activity.activity_id,
    })

    const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
        id: activity.activity_id,
    });

    // Draggable and Droppable target determined based on:
    const setNodeRef = (node: HTMLElement | null) => {
        setDraggableNodeRef(node);
        setDroppableNodeRef(node);
    };

    // manually contain position of activity card on dragging
    const style = transform ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`
    }
        : {
            border: isOver ? "2px solid blue" : undefined,
        };

    return (<>
        {mounted
            ? (
                <Card style={style} className="group flex flex-row justify-between items-center w-full cursor-move hover:bg-gray-300 rounded-xl px-4 py-2 gap-2" data-cy="activity-card">
                    <div className="flex flex-row gap-2">
                        {/* contains the marker for each activity */}
                        <ActivityMarker orderWithinDay={orderWithinDay} colour={colour} />

                        {/* information for each activity */}
                        <div ref={setNodeRef} {...listeners} {...attributes} >
                            <p data-cy="activity-location">{activity.location}</p>
                            <br></br>
                            <p data-cy="activity-title">{activity.title}</p>
                        </div>
                    </div>
                    {/* delete activity button (hidden until hover on Card) */}
                    <Button variant="ghost" className="opacity-0 group-hover:opacity-100 hover:bg-gray-400 p-2" data-cy="activity-card-delete-button" onClick={() => handleDeleteActivity(activity)}>
                        <Image
                            src="/trash.svg"
                            alt="delete_itinerary_item"
                            height={15}
                            width={15}
                            style={{ width: 15, height: 'auto' }}
                        />
                    </Button>
                </Card >
            )
            : null
        }
    </>)
}