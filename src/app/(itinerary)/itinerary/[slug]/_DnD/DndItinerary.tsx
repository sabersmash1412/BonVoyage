'use client'
import DayContainer from "./dayComponents/DayContainer"
import { DndContext } from "@dnd-kit/core"

import { DndProps } from "@/types/itinerary/Dnd/DndProps";
import { DndController, addDay } from "./DndController";
import { Button } from "@/components/ui/button";
import { useColourContext } from "../_context/ColourContext";

export default function Dnd({ activities, itinerary_id, itineraryOverview, setActivities }: DndProps) {
  const { DAYS, setDays, handleDragEnd } = DndController({ activities, itinerary_id, itineraryOverview, setActivities })
  const dateHueMap = useColourContext()
  return <div>
    <div className="gap-8">
      <DndContext onDragEnd={handleDragEnd}>
        {DAYS.map((row) =>
          <DayContainer key={row.id} row={row} activities={activities} setActivities={setActivities} itinerary_id={itinerary_id} setDays={setDays} />
        )}
      </DndContext>
    </div>
    <Button className="mb-10" onClick={() => addDay(itinerary_id, setDays, dateHueMap)} data-cy='add-day-button'>add day</Button>
  </div >
}