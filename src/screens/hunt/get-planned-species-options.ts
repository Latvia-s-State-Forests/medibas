import { AppLanguage, DEFAULT_APP_LANGUAGE } from "~/i18n";
import { Classifiers, PermitTypeClassifierOption } from "~/types/classifiers";

export type PlannedSpeciesOption = {
    label: string;
    value: {
        speciesId: number;
        permitTypeId?: number;
    };
};

export function getPlannedSpeciesOptions(classifiers: Classifiers, appLanguage: AppLanguage): PlannedSpeciesOption[] {
    const options: PlannedSpeciesOption[] = [];

    const permitTypesBySpeciesId = new Map<number, PermitTypeClassifierOption[]>();
    for (const permitType of classifiers.permitTypes.options) {
        const permitTypes = permitTypesBySpeciesId.get(permitType.speciesId) ?? [];
        permitTypes.push(permitType);
        permitTypesBySpeciesId.set(permitType.speciesId, permitTypes);
    }

    const orderBySpeciesId = new Map<number, number>();

    for (const species of classifiers.animalSpecies.options) {
        if (species.isPlannedSpeciesInHuntEvent === undefined) {
            continue;
        }
        orderBySpeciesId.set(species.id, species.isPlannedSpeciesInHuntEvent);

        const permitTypes = permitTypesBySpeciesId.get(species.id);
        if (permitTypes) {
            for (const permitType of permitTypes) {
                options.push({
                    label:
                        permitType.description[appLanguage] ??
                        permitType.description[DEFAULT_APP_LANGUAGE] ??
                        permitType.id.toString(),
                    value: {
                        speciesId: species.id,
                        permitTypeId: permitType.id,
                    },
                });
            }
        } else {
            options.push({
                label:
                    species.description[appLanguage] ??
                    species.description[DEFAULT_APP_LANGUAGE] ??
                    species.id.toString(),
                value: {
                    speciesId: species.id,
                },
            });
        }
    }

    options.sort((a, b) => {
        const aOrder = orderBySpeciesId.get(a.value.speciesId) ?? 0;
        const bOrder = orderBySpeciesId.get(b.value.speciesId) ?? 0;
        return aOrder - bOrder;
    });

    return options;
}
