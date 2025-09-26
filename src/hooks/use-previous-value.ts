import * as React from "react";

export function usePreviousValue<T>(value: T) {
    const ref = React.useRef<T>(value);

    React.useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
