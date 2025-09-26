import { AppLanguage, DEFAULT_APP_LANGUAGE } from "~/i18n";
import { Classifiers } from "~/types/classifiers";

// Base dog type that both HuntDog and statistics dogs share
type BaseDogInfo = {
    dogBreedId: number;
    dogSubbreedId?: number;
    dogBreedOther?: string;
    count: number;
};

/**
 * Formats hunt dogs information into a readable string
 * @param dogs - Array of hunt dogs (either HuntDog or statistics dogs)
 * @param classifiers - Classifiers containing dog breed information
 * @param language - Current app language
 * @param t - Translation function for handling "other breed" cases
 * @returns Formatted string of dogs with breeds and counts
 */
export function formatIndividualHuntDogs(
    dogs: BaseDogInfo[],
    classifiers: Classifiers,
    language: AppLanguage,
    t: (key: string, options?: Record<string, string>) => string
): string {
    const dogsArray: string[] = [];

    // Build breed lookup map
    const breedById = new Map<number, string>();
    for (const breed of classifiers.dogBreeds.options) {
        const description = breed.description[language] ?? breed.description[DEFAULT_APP_LANGUAGE] ?? "??";
        breedById.set(breed.id, description);
    }

    // Build sub-breed lookup map
    const subBreedById = new Map<number, string>();
    for (const subBreed of classifiers.dogSubbreeds.options) {
        const breed = breedById.get(subBreed.breedId);
        if (breed) {
            const description = subBreed.description[language] ?? subBreed.description[DEFAULT_APP_LANGUAGE] ?? "??";
            subBreedById.set(subBreed.id, `${breed} (${description})`);
        }
    }

    // Process each dog
    for (const dog of dogs) {
        if (dog.dogSubbreedId) {
            const subBreed = subBreedById.get(dog.dogSubbreedId);
            if (subBreed) {
                dogsArray.push(`${subBreed} × ${dog.count}`);
            }
        } else if (dog.dogBreedOther) {
            dogsArray.push(`${t("hunt.individualHunt.otherBreed", { otherBreed: dog.dogBreedOther })} × ${dog.count}`);
        } else {
            const breed = breedById.get(dog.dogBreedId);
            if (breed) {
                dogsArray.push(`${breed} × ${dog.count}`);
            }
        }
    }

    dogsArray.sort((a, b) => a.localeCompare(b));

    return dogsArray.join(", ");
}
