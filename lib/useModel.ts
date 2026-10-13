import { SetStateAction, useState } from "react";

export function useModel<T>(defaultValue: T) {
    const [value, setValue] = useState<T>(defaultValue);

    return {
        value,
        onChange: (e: { target: { value: SetStateAction<T> } }) =>
            setValue(e.target.value),
    };
}
