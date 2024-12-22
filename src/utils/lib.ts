/* eslint-disable no-unused-vars */
import toast from 'react-hot-toast';

export const notifier = ({ message, type }:{ message:string, type:string }) => {
    const types = ['success', 'error'];

    if (!types.includes(type)) {
        console.warn(`Unsupported toast type: ${type}`);
        return;
    }

    switch (type) {
        case 'success':
            toast.success(message);
            break;
        case 'error':
            toast.error(message);
            break;
        default:
            toast(message); // Fallback for a generic message
            break;
    }
};

export const copy = async (value:string, message = "copied") => {
    try {
        await navigator.clipboard.writeText(value);
        notifier({ message: message, type: "success" });
    } catch ($e) {
        notifier({ message: "unable to copy", type: "error" });
    }
};

export const formatCurrency = (value:string|number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(+value);
};
