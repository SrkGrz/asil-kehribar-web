import { fetchApi } from '../api';

interface DeleteWithConfirmOptions {
    endpoint: string;
    confirmMessage: string;
    errorMessage: string;
    onSuccess: () => void;
}

/** Asks for confirmation, deletes the resource and reports failures to the user. */
export const deleteWithConfirm = async ({
    endpoint,
    confirmMessage,
    errorMessage,
    onSuccess
}: DeleteWithConfirmOptions) => {
    if (!window.confirm(confirmMessage)) return;
    try {
        await fetchApi(endpoint, { method: 'DELETE' });
        onSuccess();
    } catch (err: any) {
        alert(`${errorMessage}: ${err.message}`);
    }
};
