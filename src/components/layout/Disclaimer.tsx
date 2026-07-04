"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShieldCheck, MapPin, Route, Clock, AlertTriangle } from "lucide-react"

export function HomeDisclaimer() {
  const [open, setOpen] = useState(true)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-2xl md:p-8 gap-6 backdrop-blur-md bg-background/95 max-h-[90vh] overflow-y-auto">
        
        <AlertDialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold tracking-tight">
            Feature Status & Disclaimer
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground">
            Only My Itineraries & Community Pages work. Use the Demo Video Link to see how all the features work. 
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Working Features */}
        <div className="space-y-4 my-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-500 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              WHAT WORKS
            </h3>
            
            <div className="flex gap-3 items-start p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm">
                <strong className="text-foreground font-medium">Community Platform: </strong> You can create post, attach images, like, comment and interact with other users. 
              </p>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <Route className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm">
                <strong className="text-foreground font-medium">Itineraries: </strong> Pre-existing itineraries which were created during production.
              </p>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <Route className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm">
                <strong className="text-foreground font-medium">Flights, Hotels & Costs: </strong> Estimated costs for each itinerary, based of available info online.
              </p>
            </div>
          </div>

          {/* What Doesn't Work */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              WHAT DOESN&apos;T WORK &amp; WHY
            </h3>
            
            <div className="flex gap-3 items-start p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-foreground font-medium">AI itinerary generation (Plan Page): </strong> 
                <span className="text-muted-foreground">Lack of credits (overspent on gemini)</span>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Route className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-foreground font-medium">Map Display: </strong>
                <span className="text-muted-foreground">Uses public OpenStreetMap-based services for demo purposes</span>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Route className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-foreground font-medium">Route Optimiser: </strong>
                <span className="text-muted-foreground">Uses best-effort public OSRM routing for demo purposes</span>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-end gap-2 pt-2 border-t">
          <AlertDialogAction 
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto px-6 py-5 rounded-md shadow-lg shadow-primary/20 text-base"
          >
            Gotcha
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  )
}
