"use client"
import { RowProps, UpdateActivityProps } from "@/types/itinerary/Dnd/DndProps";
import { useDroppable } from "@dnd-kit/core";
import ActivityCard from "./activityComponents/ActivityCard";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { clickButton, informationBetweenActivities } from '@/lib/itinerary/routes/route-optimiser';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { handleAddActivity, handleDeleteDay } from "./activityComponents/ActivityCardController";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useOnclickOutside from "react-cool-onclickoutside";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coordinates } from "@/types/itinerary/Map/mapProps";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { IoClose } from "react-icons/io5";
import { useAddActivityForm } from "./useAddActivityForm";
import { useColourContext } from "../../_context/ColourContext";
import BetweenActivities from "@/components/itinerary/BetweenActivities";
import { InfoBetweenActivities } from "@/types/itinerary/activity/activityProps";

type PlaceSearchResult = {
    label: string;
    lat: number;
    lng: number;
}

export default function DayContainer({ row, activities, setActivities, itinerary_id, setDays }: RowProps) {
    const [isOpenActivityBox, setIsOpenActivityBox] = useState(false)
    const [hasListener, setHasListener] = useState(false)
    const boxRef = useRef<HTMLDivElement>(null);

    const closeActivityBox = useCallback((event: MouseEvent) => {
        if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
            closeActivityBoxFtn()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const closeActivityBoxFtn = useCallback(() => {
        setIsOpenActivityBox(false)
        document.removeEventListener('mousedown', closeActivityBox)
        setHasListener(false)
        console.log("remove listener")
    }, [closeActivityBox])

    useEffect(() => {
        // add event listener if box is open
        if (isOpenActivityBox && !hasListener) {
            document.addEventListener('mousedown', closeActivityBox)
            setHasListener(true)
            console.log("add listener")
        }

        // if box is closed and has event listener, remove event listener
        if (!isOpenActivityBox && hasListener) {
            closeActivityBoxFtn()
        }
    }, [isOpenActivityBox, hasListener, boxRef, closeActivityBox, closeActivityBoxFtn])

    const { setNodeRef, } = useDroppable({
        id: row.id,
    })

    // prevent activitity[] passed to <ActivityList/> from continuous being computed, causing excessive external API
    const dayActivities = useMemo(() => {
        return activities.filter(activity => activity.date == row.id)
    }, [activities, row.id])

    return <div ref={setNodeRef} data-cy="day-card">
        {/* filter all activities for only activity.date == row.id, where row.id is particular date */}
        <ActivityList row={row} activities={dayActivities} setActivities={setActivities} itinerary_id={itinerary_id} setDays={setDays} setIsOpenActivityBox={setIsOpenActivityBox} />
        <div className="flex flex-col items-center" ref={boxRef}>
            {isOpenActivityBox && <PlacesAutoCompleteForm day={row.id} activities={activities} itinerary_id={itinerary_id} setActivities={setActivities} setIsOpenActivityBox={setIsOpenActivityBox} closeActivityBoxFtn={closeActivityBoxFtn} />}
        </div>
        <Separator orientation="horizontal" className="h-3 bg-gray-300" />
    </div>
}

// contains acccordion, delete day alert box and indiv activity cards in a single day
function ActivityList({ row, activities, setActivities, itinerary_id, setDays, setIsOpenActivityBox }: RowProps & { setIsOpenActivityBox: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const openDropDown = () => setDropdownOpen(true);
    const closeDropDown = () => setDropdownOpen(false);

    useEffect(() => {
        if (!dropdownOpen) { // scroll to add activity form of this day once dropdown box closes
            const dayAddActivityForm: string = "#add-activity-form-" + row.title;
            const Dnd = document.getElementById("Dnd");
            setTimeout(() => {
                const requiredForm = Dnd?.querySelector(dayAddActivityForm);
                if (Dnd && requiredForm) {
                    requiredForm.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest",
                    });
                }
            }, 300); // timeout for component to render
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dropdownOpen])

    const dateHueMap = useColourContext()
    const dayColour = dateHueMap.get(row.title)
    
    // handles the distance between activity locations
    const activitiesCount = activities.length
    // const EMPTY_DIST_MATRIX = Array.from({ length: activitiesCount }, () => 0)

    const [informationArray, setInformationArray] = useState<InfoBetweenActivities[]>([])
    // fetch status to conditionally rendern activity card to prevent hydration error
    const [fetchingMatrix, setFetchingMatrix] = useState<boolean>(true)

    // tracks whether any array changes are made
    // if changes made, memoKey is updated and useEffect below is fired
    const memoKey = useMemo(() => {
        return activities.map(a => `${a.id}-${a.ordering}`).join(',');
    }, [activities]);

    useEffect(() => {
        if (activities.length < 2) {
            setFetchingMatrix(false)
            return
        }

        console.log("fetching new distances...")
        const fetchMatrix = async () => {
            const response = await informationBetweenActivities(activities)

            setInformationArray(response)
            // console.log("matrix is ", matrix)
            setFetchingMatrix(false)
        }
        fetchMatrix()
        // only fire useEffect is the activities array memoKey array is changed
        // cannot put activities as dep as always fresh instance of activities is passed to activityList on component re-renders
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memoKey])

    return <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={row.title}
    >
        <AccordionItem value={row.title}>
            <div className="flex flex row justify-between">
                <AccordionTrigger className="cursor-pointer">
                    <h1 className="text-xl" data-cy="day-container-date">{row.title}</h1>
                </AccordionTrigger>
                {/* wrap Dropdown Menu with AlertDialog, so when click on Delete Day, Dropdown menu closes while alert dialog STAYS OPEN*/}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <div className="inline-flex items-center justify-center">
                        <DropdownMenuTrigger className="text-xl" onClick={openDropDown} data-cy="open-dropdown-menu">&hellip;</DropdownMenuTrigger>
                    </div>
                    <DropdownMenuContent className="flex flex-col">
                        <DropdownMenuItem asChild>
                            <AlertDialog>
                                <AlertDialogTrigger>Optimise Route</AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Optimise Route for {row.title}?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel data-cy="cancel-button-optimise-route">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                            clickButton(activities, setActivities, row.title);
                                            closeDropDown();
                                        }} data-cy="optimise-button">Optimise!</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <AlertDialog>
                                <AlertDialogTrigger data-cy="delete-day-dialog-trigger">Delete Day</AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure you want to delete this day?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the day and all associated activities.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel data-cy="cancel-button">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                            handleDeleteDay(row.id, itinerary_id, setDays, setActivities);
                                            closeDropDown();
                                        }} data-cy="continue-button">Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <AlertDialog>
                                <AlertDialogTrigger data-cy="add-activity-dialog-trigger">Add Activity</AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Add new activity?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel data-cy="cancel-button-add-activity">No</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                            setIsOpenActivityBox(true);
                                            closeDropDown();
                                        }} data-cy="continue-button-add-activity">Yes</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <AccordionContent className="flex flex-col">
                {activities.length == 0 ? <h1>No activities for this day. Add some!</h1> : (<>
                    {activities.map((activity, index) => {
                        return (!fetchingMatrix &&
                            <div key={index}>
                                <ActivityCard key={activity.ordering} activity={activity} setActivities={setActivities} data-testid="activity-card" orderWithinDay={index + 1} colour={dayColour}></ActivityCard>
                                {index != (activitiesCount - 1)
                                    ? <BetweenActivities distance={informationArray[index].distance} duration={informationArray[index].duration} />
                                    : <></>}
                            </div>
                        )
                    })}
                </>)
                }
            </AccordionContent>
        </AccordionItem >
    </Accordion >
}

function PlacesAutoCompleteForm({ day, activities, itinerary_id, setActivities, setIsOpenActivityBox, closeActivityBoxFtn }: UpdateActivityProps & { closeActivityBoxFtn: () => void }) {
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
    const [value, setValue] = useState("")
    const [suggestions, setSuggestions] = useState<PlaceSearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const clearSuggestions = useCallback(() => {
        setSuggestions([])
    }, [])

    useEffect(() => {
        if (value.trim().length < 3) {
            clearSuggestions()
            return
        }

        const controller = new AbortController()
        const timeout = window.setTimeout(async () => {
            try {
                setIsSearching(true)
                const response = await fetch(`/api/placeSearch?q=${encodeURIComponent(value)}`, {
                    signal: controller.signal,
                })
                if (!response.ok) {
                    setSuggestions([])
                    return
                }

                const data = await response.json() as { results?: PlaceSearchResult[] }
                setSuggestions(data.results ?? [])
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return
                console.error(error)
                setSuggestions([])
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => {
            controller.abort()
            window.clearTimeout(timeout)
        }
    }, [clearSuggestions, value])

    // When the user clicks outside of the component, clear searched suggestions using this method
    const ref = useOnclickOutside(() => {
        clearSuggestions();
    });

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Update keyword of input element
        setValue(e.target.value);
    };

    const handleSelect = (suggestion: PlaceSearchResult) =>
        () => {
            setValue(suggestion.label);
            clearSuggestions();
            setCoordinates({ lat: suggestion.lat, lng: suggestion.lng })
        };

    const renderSuggestions = () =>
        suggestions.map((suggestion) => (
            <li key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`} onClick={handleSelect(suggestion)} className="hover:bg-gray-400">
                <strong>{suggestion.label}</strong>
            </li>
        ));

    // pass AddActivityFormType values to onsubmit
    // location pass as argument here unused as it only contains text user types, not actual autocomplete value
    const handleSubmit = (data: { location: string, description: string }) => {
        console.log("received data: ", data)

        // value wouldnt be null as it would be prevented by react hook form using error messages
        const castCoordinates = coordinates as Coordinates
        if (!castCoordinates) {
            form.setError("location", { message: "Please select a location from the suggestions" })
            return
        }

        const submitFunction = handleAddActivity({ day, activities, itinerary_id, setActivities, setIsOpenActivityBox })
        const addActivityObject = {
            title: data.description,
            location: value,
            lat: castCoordinates.lat,
            lng: castCoordinates.lng
        }
        console.log(addActivityObject)
        submitFunction(addActivityObject)
        closeActivityBoxFtn()
    }

    const { form } = useAddActivityForm()

    return (<div className="pb-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full max-w-md">
                <div className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-row justify-between">
                                    <FormLabel>Location</FormLabel>
                                    <IoClose size={25} onClick={closeActivityBoxFtn} className="cursor-pointer" />
                                </div>
                                <FormControl>
                                    <div ref={ref} className="relative">
                                        <Input
                                            {...field}
                                            value={value}
                                            onChange={(e) => {
                                                field.onChange(e);  // update react-hook-form
                                                handleInput(e);     // update autocomplete state
                                            }}
                                            placeholder="Type a location"
                                        />
                                        {suggestions.length > 0 && (
                                            <ul data-cy="rendered-suggestions" className="cursor-pointer">{renderSuggestions()}</ul>
                                        )}
                                        {isSearching && <div className="text-sm text-muted-foreground">Searching...</div>}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="Describe what you are doing at the location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button id={"add-activity-form-" + day} type="submit" data-cy="submit-add-activity-form">Add activity!</Button>
                </div>
            </form>
        </Form>
    </div>)
}
