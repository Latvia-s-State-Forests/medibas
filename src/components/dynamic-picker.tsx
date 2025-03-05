import * as React from "react";
import { RadioButtonGrid } from "~/components/radio-button-grid";
import { SegmentedControl } from "~/components/segmented-control";
import { Select } from "~/components/select";

type Option = {
    label: string;
    value: string;
};

type DynamicPickerProps = {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    disabled?: boolean;
};

export function DynamicPicker({ label, value, options, onChange, disabled }: DynamicPickerProps) {
    if (options.length < 4) {
        return (
            <SegmentedControl disabled={disabled} options={options} label={label} value={value} onChange={onChange} />
        );
    } else if (options.length < 7) {
        return (
            <RadioButtonGrid disabled={disabled} options={options} label={label} value={value} onChange={onChange} />
        );
    } else {
        return <Select disabled={disabled} options={options} label={label} value={value} onChange={onChange} />;
    }
}
