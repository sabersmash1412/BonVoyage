import { InfoBetweenActivities, ActivityProps } from "@/types/itinerary/activity/activityProps";
import { Place, PlacesAPIMatrix } from "@/types/itinerary/Map/mapProps";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

async function getRouteMatrix(places: Place[]): Promise<PlacesAPIMatrix[] | null> {
    console.log("getting route matrix for coors: ", places.map(p => p.coordinates))
    try {
        const response = await axios.post('/api/routeMatrix', { places })
        const matrix: PlacesAPIMatrix[] = response.data
        console.log("matrix: ", matrix)
        return response.data
    } catch (error) {
        console.error(error)
        return null
    }
}

// preps AI route matrix output into a form that can be handled subsequently
function sanitiseRoutesMatrix(matrix: PlacesAPIMatrix[], n: number) {
    const distMatrix: number[][] = Array.from({ length: n })
        .map(() => Array.from({ length: n }, () => Infinity))
    for (let x = 0; x < n; x++) {
        distMatrix[x][x] = 0
    }
    // for same locations, api matrix has no distanceMetres field so need manually add in
    const filterMatrix = matrix.map(m => {
        if (m.destinationIndex != m.originIndex && m.condition == "ROUTE_EXISTS" && m.distanceMeters == undefined) {
            m.distanceMeters = 0
            return m
        }
        return m
    })
    // remove objs with same origin & dest => dist = 0
    // or route does not exist between points => dist = Infinity 
    // or there is no dist info which shouldn't happen
    const filtedMatrix = filterMatrix.filter(obj => obj.originIndex != obj.destinationIndex && obj.distanceMeters !== undefined && obj.condition === "ROUTE_EXISTS")

    for (const x of filtedMatrix) {
        if (x.distanceMeters !== undefined) {
            distMatrix[x.originIndex][x.destinationIndex] = x.distanceMeters
        }
    }

    return distMatrix
}

function TSP(distMatrix: number[][], n: number) {
    //Find out the shortest edge connecting the current vertex u and an unvisited vertex v
    function findShortestEdge(distMatrix: number[][], u: number, visited: boolean[]) {
        let res = -1
        let min = Infinity;
        for (let v = 0; v < visited.length; v++) {
            if (v == u || visited[v]) {
                continue;
            }
            if (distMatrix[u][v] < min) {
                res = v
                min = distMatrix[u][v]
            }
        }
        return res
    }

    function calculateDistance(distMatrix: number[][], path: number[]) {
        let total = 0
        for (let x = 0; x < n - 1; x++) {
            const u = path[x]
            const v = path[x + 1]
            total += distMatrix[u][v]
        }
        const lastElement = path[path.length - 1]
        const firstElement = path[0]
        total += distMatrix[lastElement][firstElement]
        return total
    }

    let minDist = Infinity
    // note for minPath, going back to starting point only accounted for in calculateDistance
    let minPath: number[] = []
    for (let start = 0; start < n; start++) {
        let curr = start
        const path = []
        const visited: boolean[] = Array.from({ length: n }, () => false);
        visited[curr] = true
        path.push(curr)
        // ensures we only have n nodes recorded
        while (path.length < n) {
            const v = findShortestEdge(distMatrix, curr, visited)
            // mark visited node along shortest edge
            visited[v] = true
            path.push(v)
            curr = v
        }
        // console.log("path: ", path)
        // path.push(start)
        const dist = calculateDistance(distMatrix, path)
        // console.log("curr path ", path, " curr dist: ", dist)
        if (dist < minDist) {
            minPath = path
            minDist = dist
        }
    }
    return { minPath: minPath, distance: minDist };
}

function arrayOfActivityToPlace(activities: ActivityProps[]) {
    const places: Place[] = activities.map(activity => {
        const place: Place = {
            place: activity.location,
            coordinates: {
                lat: activity.lat,
                lng: activity.lng
            }
        };
        return place
    })
    return places
}

export async function clickButton(activities: ActivityProps[], setActivities: Dispatch<SetStateAction<ActivityProps[]>>, date: string) {
    try {
        const places: Place[] = arrayOfActivityToPlace(activities)
        const routeMatrix = await getRouteMatrix(places);
        if (routeMatrix == null) {
            console.error("getRouteMatrix failed");
            toast.error("Unable to connect to Routes API.");
            return
        }

        // console.log(routeMatrix)
        const len = places.length
        const distMatrix = sanitiseRoutesMatrix(routeMatrix, len)

        // get shortest path
        const containsInfinity = distMatrix.some(row => row.includes(Infinity));
        if (containsInfinity) {
            console.error("Distance matrix contains unreachable paths");
            toast.error("Some routes are not reachable. Optimization cannot proceed.");
            return
        }

        const { minPath: minPath, distance: minDist } = TSP(distMatrix, len)

        console.log(minPath)
        if ([...new Set(minPath)].length !== minPath.length) {
            console.error("TSP contains duplicate index values")
            toast.error("Route contains duplicate points. Optimization failed.");
            return
        }

        if (minDist == Infinity) { // path does not exist
            console.error("Received Infinity")
            toast.error("Unable to calculate route — distance is infinite.");
            return
        }

        // change array according to path requirements
        console.log("minPath: ", minPath, " distance: ", minDist)

        setActivities(prev => {
            // group activities by date
            const activitiesByDate: { [key: string]: ActivityProps[] } = {};
            for (const activity of prev) {
                if (!activitiesByDate[activity.date]) {
                    activitiesByDate[activity.date] = [];
                }
                activitiesByDate[activity.date].push(activity);
            }

            // update activitiesByDate based on new sequence from minPath array
            const currDay = activitiesByDate[date]
            const newActivitySeq = minPath.map(idx => currDay[idx])

            activitiesByDate[date] = newActivitySeq
            const reorderedActivities = Object.values(activitiesByDate).flat()
                .map((a, index) => {
                    return {
                        ...a,
                        ordering: index
                    }
                })
            console.log("reordered activities: ", reorderedActivities)
            toast.success(`Route Optimisation successful for ${date}`)
            return reorderedActivities
        })
    } catch (error) {
        console.error("Failed to get matrix in clickButton:", error);
        toast.error(`Route Optimisation failed for ${date}`)
    }
}

export async function informationBetweenActivities(activities: ActivityProps[]): Promise<InfoBetweenActivities[]> {
    const places = arrayOfActivityToPlace(activities)
    const routeMatrix = await getRouteMatrix(places)
    const len = places.length
    if (routeMatrix == null) {
        console.error("getRouteMatrix failed");
        toast.error("Unable to connect to Routes API.");
        return Array.from({ length: len }, () => ({ distance: Infinity, duration: "Unknown" }))
    }

    const infoArray = generateInformationPathArray(routeMatrix, len)

    // might need to change this instead of just showing -1
    const sanitiseInfoArray = infoArray.map(i => i.distance == null ? { distance: -1, duration: i.duration } : i)
    return sanitiseInfoArray
}

function generateInformationPathArray(matrix: PlacesAPIMatrix[], n: number) {
    const array: { distance: number, duration: string }[] = Array.from({ length: n }, () => ({ distance: Infinity, duration: "Infinity" }));
    for (let i = 0; i < n - 1; i++) {
        // Find the matrix entry where originIndex = i and destinationIndex = i+1
        const entry = matrix.find(
            (p) =>
                p.originIndex === i &&
                p.destinationIndex === i + 1 &&
                p.condition === "ROUTE_EXISTS" &&
                p.distanceMeters !== undefined
        );

        array[i].distance = entry ? entry.distanceMeters as number : 0;
        array[i].duration = entry && entry?.duration ? entry.duration : '0';
    }

    return array
}
