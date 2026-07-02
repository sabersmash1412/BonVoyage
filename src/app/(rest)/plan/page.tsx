"use client"
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import InputFormController from "./controller"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { planPreferences } from "@/lib/itinerary/inputFormInfo"
import { PlanLoadingScreen } from "@/components/plan/PlanLoadingScreen"

export default function InputForm() {
    const {
        form,
        submiting,
        submitForm,
        loading,
        submitError
    } = InputFormController()

    return (<>
        {loading
            // awaiting auth
            ? <div>Loading...</div>
            : !submiting
                // shows form i.e. when form hasn't been submitted
                ? <div className="flex flex-col gap-5 w-3xl mx-auto">
                    <div className="flex gap-3 justify-center mb-4">
                        <Button asChild variant="outline">
                            <a href="https://drive.google.com/file/d/1bFVTc_FFaIgeOkD15p6EhG8T3gOVufHN/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                            Project Poster
                            </a>
                        </Button>
                        
                        <Button asChild variant="outline">
                            <a href="https://drive.google.com/file/d/1HQajaHgwM4FIURltRFrfehqmX2yvcG3n/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                            Project Demo Video
                            </a>
                        </Button>
                        
                        <Button asChild variant="outline">
                            <a href="https://drive.google.com/file/d/1mAi9-vZ-qErbM773rd4hpDrdg4hrFRzu/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                            Project Documentation
                            </a>
                        </Button>
                    </div>
                    <div className="justify-items-center">
                        <h1 className="text-3xl">
                            Tell us your preferences
                        </h1>
                    </div>
                    <Card className="shadow-md rounded-lg ">
                        <CardContent>
                            {submitError && (
                                <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {submitError}
                                </div>
                            )}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(submitForm)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="fromCountry"
                                        render={({ field }) => (
                                            <FormItem className="" data-cy="fromCountry-input">
                                                <FormLabel>What country are you flying from?</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Singapore" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <br></br>
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem className="" data-cy="country-input">
                                                <FormLabel>What country do you want to travel to?</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Japan/Korea/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fromDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col" style={{ marginTop: '20px', marginBottom: '20px' }} data-cy="fromDate-input">
                                                <FormLabel>From Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-[200px] pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date < new Date()
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="toDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col" style={{ marginTop: '20px', marginBottom: '20px' }} data-cy="toDate-input">
                                                <FormLabel>To Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-[200px] pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => {
                                                                const fromDate = form.watch("fromDate");
                                                                return !fromDate || date < fromDate; // disable if date before 'fromDate'
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem style={{ marginTop: '20px', marginBottom: '20px' }} data-cy="budget-input">
                                                <FormLabel>Budget ($SGD)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1000/2000/3000/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="personCount"
                                        render={({ field }) => (
                                            <FormItem style={{ marginTop: '20px', marginBottom: '20px' }} data-cy="personCount-input">
                                                <FormLabel>Number of People travelling</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1/4/8/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="preferences"
                                        render={({ field }) => (
                                            <FormItem style={{ marginTop: '20px', marginBottom: '20px' }} data-cy="preferences-input">
                                                <FormLabel>Activity preferences?</FormLabel>
                                                <FormDescription>You may select any number of options</FormDescription>
                                                <FormControl>
                                                    <ToggleGroup
                                                        type="multiple"
                                                        value={field.value || []}
                                                        onValueChange={field.onChange}
                                                        className="flex flex-wrap gap-2"
                                                    >
                                                        {planPreferences.map((pref, key) =>
                                                        (<ToggleGroupItem value={pref} key={key} data-cy={pref}
                                                            className="rounded-full 
                                                                bg-purple-300 hover:tex-black 
                                                                data-[state=on]:bg-purple-500 data-[state=on]:text-white 
                                                                hover:bg-purple-500 hover:text-white
                                                                data-[state=on]:hover:bg-purple-300 data-[state=on]:hover:text-black
                                                                ">
                                                            {pref}
                                                        </ToggleGroupItem>)
                                                        )}
                                                    </ToggleGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" data-cy="itinerary-submit">Submit</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                // while submitting form to server loading message:
                : <PlanLoadingScreen />
        }
    </>)
}
