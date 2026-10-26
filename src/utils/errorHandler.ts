export function getErrorHandler(err: any) {
    return (
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.non_field_errors[0] ||
        err?.message ||
        "An unexpected error occurred."
    );
}
