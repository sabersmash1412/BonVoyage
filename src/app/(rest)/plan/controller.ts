import { useInputForm } from "./useInputForm";
import { useSubmitForm } from "./useSubmitForm";
import useUserAuth from "./useUserAuth";

export default function InputFormController() {
    const { form } = useInputForm();
    const { loading } = useUserAuth();
    const { submiting, submitForm, submitError } = useSubmitForm()
    return { form, submiting, submitForm, loading, submitError }
}
