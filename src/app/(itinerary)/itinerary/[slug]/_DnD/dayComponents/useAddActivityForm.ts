import { AddActivityFormType } from "@/types/itinerary/activity/activityProps";
import { addActivityFormSchema } from "@/types/itinerary/activity/activitySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function useAddActivityForm() {
    const form = useForm<AddActivityFormType>({
        resolver: zodResolver(addActivityFormSchema),
        defaultValues: {
            location: "",
            description: "",
        },
    });
    return { form }
}