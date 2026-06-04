import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { ActivityAddToDbProps, BaseActivity } from "@/types/itinerary/activity/activityProps";
import { ItineraryFormProps, AIoutputProps } from "@/types/plan/planProps";
import { getUser } from "../getUser";
import { SupabaseClient } from "@supabase/supabase-js";
import { getActivities, insertNewActivities } from "./activityMethods";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY }); //get from supabase env var; process.env.GEMINI_KEY

function sanitiseAIoutput(response: GenerateContentResponse) {
  console.log("sanitising AI output...")
  const activitiesJSONString = (response.text as string).replace(/^```json\s*/, '').replace(/\s*```$/, '')
  return JSON.parse(activitiesJSONString)
}

function generateAIprompt(formInput: ItineraryFormProps) {
  console.log("generating itinerary...")
  const formInputString = JSON.stringify(formInput)
  const prompt = `Given the following input: ${formInputString}
        And these 5 requirements:
        1. For activities, possible types are: 
        - transport: All travel-related movements
        - accomodation: Hotel or lodging stays and check-ins/outs
        - activity: Sightseeing, tours, cultural visits, events
        - meal: Eating or food-related activities
        - rest: Downtime, free time, or breaks
        2. Suppose a country instead of a city is given, you can output the itinerary in terms of the usual touristy places people go to, while accounting for the input constraints.
        3. Please plan each day full of activities.
        4. lat is the latitude of the location and lng is the longitude of the location
        5. Do not include any activities related to the hotel as currently hotel is unknown

        Output for me a travel itinerary in JSON in the following example format:
        {
          "costBreakdown":{
              "origin_airport_code": "SIN",
              "destination_airport_code": "NRT"
          }
          "activities": [
            {
                "date": "2025-06-10",
                "time": "09:00",
                "title": "Fushimi Inari Shrine",
                "location": "68 Fukakusa Yabunouchicho, Kyoto",
                "type": "sightseeing",
                "duration_minutes": 90,
                "notes": "",
                lat:,
                lng:
            },
            {
                "date": "2025-06-10",
                "time": "12:00",
                "title": "Lunch at Veggie Café",
                "location": "123 Kyoto Veg Rd",
                "type": "restaurant",
                "duration_minutes": 60,
                "notes": "",
                lat:,
                lng:
            },
            {
                "date": "2025-06-10",
                "time": "14:00",
                "title": "Nishiki Market Walk",
                "location": "Downtown Kyoto",
                "type": "shopping",
                "duration_minutes": 90,
                "notes": "",
                lat:,
                lng:
            },
            {
                "date": "2025-06-11",
                "time": "10:00",
                "title": "Kinkaku-ji (Golden Pavilion)",
                "location": "1 Kinkakuji-cho, Kita-ku, Kyoto",
                "type": "sightseeing",
                "duration_minutes": 60,
                "notes": "",
                lat:,
                lng:
            },
            {
                "date": "2025-06-11",
                "time": "13:00",
                "title": "Tea Ceremony Experience",
                "location": "Camellia Flower Teahouse",
                "type": "cultural",
                "duration_minutes": 75,
                "notes": "",
                lat:,
                lng:
            }
          ]
        }
        `
  return prompt
}

async function getAIresponse(prompt: string) {
  console.log("getting response from gemini")
  return ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
}

async function insertNewItinerary(supabase: SupabaseClient, user_id: string, formInput: ItineraryFormProps, itineraryObject: AIoutputProps) {
  console.log("inserting new AI itinerary")
  // insert general details into public.itineraries
  const { data: itinerariesIdData, error: itinerariesError } = await supabase.from('itineraries')
    .insert([
      {
        user_id: user_id,
        title: `${formInput.country}`,
        start_date: formInput.fromDate,
        end_date: formInput.toDate,
        input: JSON.stringify(formInput),
        output: itineraryObject,
        fromCountry: formInput.fromCountry
      },
    ])
    .select('id')
  if (itinerariesError != null) {
    throw new Error(`error during insertion: ${itinerariesError}`)
  }

  const itineraryId = await itinerariesIdData[0].id
  return itineraryId
}

// convert BaseActivity[] to ActivityAddToDbProps[]
function convertAiActivityArray(activities: BaseActivity[], user_id: string, itineraryId: number) {
  const activitiesForDb: ActivityAddToDbProps[] = activities.map((activity: BaseActivity, index: number) => ({
    ...activity,
    user_id: user_id as string,
    itinerary_id: itineraryId,
    activity_id: String(index),
    ordering: index,
  }));
  return activitiesForDb
}

export async function generateItinerary(formInput: ItineraryFormProps, supabase: SupabaseClient, user_id: string) {
  try {
    const prompt = generateAIprompt(formInput)
    const AIresponse = await getAIresponse(prompt)
    const itineraryObject = sanitiseAIoutput(AIresponse)
    const itineraryId = await insertNewItinerary(supabase, user_id, formInput, itineraryObject)
    const activitiesForDb = convertAiActivityArray(itineraryObject.activities, user_id, itineraryId)
    await insertNewActivities(supabase, activitiesForDb)
    return itineraryId
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function getItineraryOverview(supabase: SupabaseClient, itinerary_id: number) {
  const { data: itineraryOverview, error: err3 } = await supabase
    .from('itineraries')
    .select(`title, start_date, end_date, output->costBreakdown`)
    .eq("id", itinerary_id)
  if (err3 != null) {
    console.error("Error getting itinerary details: ", err3);
    return null
  }
  return itineraryOverview[0]
}

export async function getItinerary(itinerary_id: number) {
  try {
    const { supabase, userId: user_id } = await getUser()
    console.log("Getting itinerary ", itinerary_id)

    const activities = await getActivities(supabase, user_id, itinerary_id)
    if (activities == null) {
      console.error("Error getting activities");
      return null
    }

    const itineraryOverview = await getItineraryOverview(supabase, itinerary_id)
    if (itineraryOverview == null) {
      console.error("Error getting itineraryOverview");
      return null
    }

    const { costBreakdown } = itineraryOverview;
    const validatedCostBreakdown = costBreakdown as {
      origin_airport_code: string;
      destination_airport_code: string;
    };


    return { itineraryOverview: { ...itineraryOverview, costBreakdown: validatedCostBreakdown }, activities: activities }
  } catch (error) {
    console.error("Error parsing request:", error);
    return null
  }
}

export async function getAllItineraries(supabase: SupabaseClient, user_id: string) {
  const { data: itineraries, error } = await supabase
    .from('itineraries')
    .select('id, title, start_date, end_date, created_at')
    .eq("user_id", user_id)
  if (error != null) {
    console.error("Error getting all itineraries:", error);
    return null
  }
  return itineraries
}

export async function deleteItinerary(supabase: SupabaseClient, itinerary_id: number) {
  // deleting itineraries also deletes activities due to cascade
  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', itinerary_id)

  if (error != null) {
    console.error("Error getting all itineraries:", error);
    return null
  }
  return 1
}
