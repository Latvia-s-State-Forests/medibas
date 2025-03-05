import { HuntSpecies } from "~/api";
import { MultiSelect } from "~/components/multi-select";
import { PlannedSpeciesOption } from "../get-planned-species-options";

type AddSpecialEquipmentMultiSelectProps = {
    label: string;
    options: PlannedSpeciesOption[];
    values: HuntSpecies[];
    onChange: (values: HuntSpecies[]) => void;
    disabled: boolean;
};

export function AddSpecialEquipmentMultiSelect(props: AddSpecialEquipmentMultiSelectProps) {
    return (
        <MultiSelect
            label={props.label}
            options={props.options}
            onChange={props.onChange}
            equals={(a, b) => a.speciesId === b.speciesId && a.permitTypeId === b.permitTypeId}
            keyExtractor={(value) =>
                value.permitTypeId ? `${value.speciesId}_${value.permitTypeId}` : `${value.speciesId}`
            }
            values={props.values}
            disabled={props.disabled}
        />
    );
}
