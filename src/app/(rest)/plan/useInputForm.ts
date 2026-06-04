import { ItineraryFormProps } from "@/types/plan/planProps";
import { itineraryFormSchema } from "@/types/itinerary/itinerarySchema";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// For preferences and date in shadcn, may consider: DatePickerWithRange, CheckboxReactHookFormSingle
export function useInputForm() {
    const form = useForm<ItineraryFormProps>({
        resolver: zodResolver(itineraryFormSchema),
        defaultValues: {
            fromCountry: "",
            country: "",
            budget: 1000,
            personCount: 1,
            preferences: [],
        }
    });
    return { form }
}