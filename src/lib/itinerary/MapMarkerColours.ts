const TOTAL_HUES = 360;

function convertDateString(dayString: string) {
    const split = dayString.split('-')
    const month = parseInt(split[1])
    const day = parseInt(split[2])
    return month * 100 + day
}

function generateHueColor(hue: number) {
    return `hsl(${hue}, 100%, 50%)`;
}

// instantiate new instead then call load(days: string[]) to add days into Map
// need error handle if table is full
export class DateHueMap {
    private table: number[];
    private map: Map<string, string>;

    constructor() {
        console.log("new date hue map")
        this.table = Array.from({ length: TOTAL_HUES }, () => NaN)
        this.map = new Map()
    }

    // needa improve on this to make colours more distinct
    private hash(dayString: string): number {
        const dayNumber = convertDateString(dayString)
        let index = (dayNumber * 137) % TOTAL_HUES
        const original_index = index

        // handle collision with linear probing
        while (!isNaN(this.table[index])) {
            index = (index + 1) % TOTAL_HUES
            if (index == original_index) {
                // Table is full
                throw new Error("Number of days exceed 360. Unable to generate new Marker")
            }
        }
        return index
    }

    add(day: string) {
        if (this.map.has(day)) {
            return
        }
        
        const hashValue = this.hash(day)

        // mark as hashValue taken
        this.table[hashValue] = 0

        const hue = generateHueColor(hashValue)

        //add hue into map dict
        this.map.set(day, hue)
    }

    load(days: string[]) {
        for (const day of days) {
            console.log("adding ", day)
            this.add(day)
        }
    }

    getMap() {
        return this.map
    }

    get(key: string): string {
        // return hue from map or fallback color if not present
        return this.map.get(key) ?? 'hsl(175, 100%, 50%)';
    }

    reset() {
        this.table = Array.from({ length: TOTAL_HUES }, () => NaN)
        this.map.clear()
    }
}