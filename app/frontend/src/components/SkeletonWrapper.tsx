import { useEffect, useRef, useState } from "react";

interface Props {
    loading: boolean;
    minDuration?: number;
    children: React.ReactNode;
}

export function SkeletonWrapper({
    loading,
    minDuration = 400,
    children,
    }: Props) {
    const [show, setShow] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // CLEAR any pending timeout
        if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        }

        if (loading) {
        // Only update if not already showing
        if (!show) {
            startTimeRef.current = Date.now();
            // defer state update (avoids sync warning)
            timeoutRef.current = window.setTimeout(() => {
            setShow(true);
            }, 0);
        }
        } else if (startTimeRef.current !== null) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(minDuration - elapsed, 0);

        timeoutRef.current = window.setTimeout(() => {
            setShow(false);
            startTimeRef.current = null;
        }, remaining);
        }

        return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        };
    }, [loading, minDuration, show]);

    if (!show) return null;
    return <>{children}</>;
}
