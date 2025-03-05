import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { HuntDog } from "~/api";
import { BorderlessBadge } from "~/components/borderless-badge";
import { MediumIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { DEFAULT_APP_LANGUAGE, getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { DogSubBreedOption } from "~/types/classifiers";
import { DogPickerModal } from "./dog-picker-modal";
import { DogPickerOption } from "./types";

type DogPickerProps = {
    title: string;
    dogs: HuntDog[];
    onDogsChange: (dogs: HuntDog[]) => void;
    editable?: boolean;
    forceMinCount?: boolean;
};

export function DogPicker(props: DogPickerProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const appLanguage = getAppLanguage();
    const [modalVisible, setModalVisible] = React.useState(false);

    const options = React.useMemo(() => {
        const options: DogPickerOption[] = [];

        const subBreedsByBreedId = new Map<number, DogSubBreedOption[]>();
        for (const subBreed of classifiers.dogSubbreeds.options) {
            const subBreeds = subBreedsByBreedId.get(subBreed.breedId) ?? [];
            subBreedsByBreedId.set(subBreed.breedId, subBreeds.concat(subBreed));
        }

        for (const breed of classifiers.dogBreeds.options) {
            if (breed.id === configuration.hunt.otherDogSpeciesId) {
                continue;
            }

            const breedDescription = breed.description[appLanguage] ?? breed.description[DEFAULT_APP_LANGUAGE] ?? "??";

            const subBreeds = subBreedsByBreedId.get(breed.id);
            if (subBreeds) {
                for (const subBreed of subBreeds) {
                    const subBreedDescription =
                        subBreed.description[appLanguage] ?? subBreed.description[DEFAULT_APP_LANGUAGE] ?? "??";
                    const title = `${breedDescription} (${subBreedDescription})`;
                    options.push({
                        guid: randomUUID(),
                        title,
                        breedId: breed.id,
                        subBreedId: subBreed.id,
                        count: 0,
                    });
                }
            } else {
                options.push({
                    guid: randomUUID(),
                    title: breedDescription,
                    breedId: breed.id,
                    count: 0,
                });
            }
        }

        for (const dog of props.dogs) {
            if (dog.dogBreedOther) {
                const option: DogPickerOption = {
                    guid: dog.guid,
                    title: t("hunt.dogPicker.otherBreed", { otherBreed: dog.dogBreedOther }),
                    breedId: dog.dogBreedId,
                    otherBreed: dog.dogBreedOther,
                    count: dog.count,
                };
                if (dog.id) {
                    option.id = dog.id;
                }
                options.push(option);
            } else {
                const option = options.find(
                    (option) => option.breedId === dog.dogBreedId && option.subBreedId === dog.dogSubbreedId
                );
                if (option) {
                    if (dog.id) {
                        option.id = dog.id;
                    }
                    option.count = dog.count;
                    option.guid = dog.guid;
                }
            }
        }

        options.sort((a, b) => a.title.localeCompare(b.title));

        return options;
    }, [t, appLanguage, classifiers.dogBreeds.options, classifiers.dogSubbreeds.options, props.dogs]);

    const activeOptions = React.useMemo(() => {
        return options.filter((dog) => dog.count > 0);
    }, [options]);

    function onAddButtonPress() {
        setModalVisible(true);
    }

    function onConfirm(options: DogPickerOption[]) {
        const dogs: HuntDog[] = [];

        for (const option of options) {
            if (option.count < 1) {
                continue;
            }

            dogs.push({
                id: option.id,
                guid: option.guid,
                dogBreedId: option.breedId,
                dogSubbreedId: option.subBreedId,
                dogBreedOther: option.otherBreed,
                count: option.count,
            });
        }

        props.onDogsChange(dogs);
        setModalVisible(false);
    }

    function onReject() {
        setModalVisible(false);
    }

    const editable = props.editable ?? true;

    if (!editable && activeOptions.length === 0) {
        return null;
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.titleRow}>
                    <Text size={12} color="gray7" weight="bold" style={styles.title}>
                        {props.title}
                    </Text>
                    <BorderlessBadge count={activeOptions.length} variant="default" />
                </View>
                <View style={styles.list}>
                    {activeOptions.map((dog, index) => (
                        <View key={dog.guid} style={styles.listItem}>
                            <Text>{index + 1}.</Text>
                            <Text style={styles.listItemTitle}>{dog.title}</Text>
                            <Text style={styles.listItemCount} weight="bold">
                                {`× ${dog.count}`}
                            </Text>
                        </View>
                    ))}
                    {editable ? (
                        <TouchableOpacity onPress={onAddButtonPress} activeOpacity={0.75} style={styles.addButton}>
                            <Text weight="bold" color="teal">
                                {t("hunt.dogPicker.add")}
                            </Text>
                            <MediumIcon name="plus" color="teal" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            <DogPickerModal
                visible={modalVisible}
                options={options}
                onConfirm={onConfirm}
                onReject={onReject}
                forceMinCount={props.forceMinCount}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        gap: 10,
        paddingRight: 20,
        paddingVertical: 10,
    },
    title: {
        flex: 1,
    },
    list: {
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
    },
    listItem: {
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
        borderBottomColor: theme.color.gray2,
        borderBottomWidth: 1,
        paddingRight: 4,
    },
    listItemTitle: {
        flex: 1,
    },
    listItemCount: {
        marginRight: 16,
    },
    addButton: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        height: 56,
        borderBottomWidth: 1,
        borderColor: theme.color.gray2,
        paddingRight: 16,
    },
});
