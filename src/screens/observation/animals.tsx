import * as React from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, ScrollView, StyleSheet } from "react-native";
import { Button } from "~/components/button";
import { ObservationsCollapsible } from "~/components/collapsible/observations-collapsible";
import { DeleteConfirmationModal } from "~/components/modal/delete-confirmation-modal";
import { Spacer } from "~/components/spacer";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { AnimalsItem, getDefaultAnimalsItemState } from "~/screens/observation/animals-item";
import { theme } from "~/theme";
import { AnimalsItemState } from "~/types/observations";
import { getActiveClassifiers } from "~/utils/filter-classifiers";

interface AnimalsProps {
    scrollViewRef: React.RefObject<ScrollView>;
    animals: AnimalsItemState[];
    onChange: (update: (animals: AnimalsItemState[]) => AnimalsItemState[]) => void;
}

export function Animals(props: AnimalsProps) {
    const { t } = useTranslation();
    const [itemToDelete, setItemToDelete] = React.useState<string | undefined>();
    const classifiers = useClassifiers();

    function onItemChange(id: string) {
        return (update: Partial<AnimalsItemState> | ((prevState: AnimalsItemState) => AnimalsItemState)) => {
            props.onChange((animals) =>
                animals.map((item) => {
                    if (item.id === id) {
                        if (typeof update === "function") {
                            return update(item);
                        }

                        return { ...item, ...update };
                    }

                    return item;
                })
            );
        };
    }

    function deleteItem(id: string) {
        props.onChange((animals) => {
            const filtered = animals.filter((item) => item.id !== id);

            // Only item should never be collapsed
            if (filtered.length === 1) {
                filtered[0] = { ...filtered[0], isCollapsed: false };
            }

            return filtered;
        });
    }

    function onItemDelete(item: AnimalsItemState) {
        return () => {
            const defaultItemState = getDefaultAnimalsItemState(classifiers);
            const isFormChanged =
                item.gender !== defaultItemState.gender ||
                item.age !== defaultItemState.age ||
                item.count !== defaultItemState.count ||
                item.observedSignsOfDisease !== defaultItemState.observedSignsOfDisease;
            // ignore signsOfDisease -> available when observedSignsOfDisease is checked
            // ignore notesOnDiseases -> available when observedSignsOfDisease is checked
            // ignore isCollapsed -> visual state, not related to data
            // ignore id -> always different

            if (isFormChanged) {
                // Open confirmation modal
                setItemToDelete(item.id);
            } else {
                deleteItem(item.id);
            }
        };
    }

    function onConfirmDeleteItem() {
        if (itemToDelete) {
            deleteItem(itemToDelete);
        }

        // Close confirmation modal
        setItemToDelete(undefined);
    }

    function onCancelDeleteItem() {
        // Close confirmation modal
        setItemToDelete(undefined);
    }

    function onAddItem() {
        props.onChange((animals) => {
            if (animals.length === configuration.observations.animals.maxCount) {
                return animals;
            }
            return [...animals, getDefaultAnimalsItemState(classifiers)];
        });
    }

    // Whenever a new item is added, scroll to it
    const previousLastItemIndex = React.useRef(props.animals.length - 1);
    function onLastItemLayout(index: number) {
        return (event: LayoutChangeEvent) => {
            if (index > previousLastItemIndex.current) {
                const y = event.nativeEvent.layout.y;
                props.scrollViewRef.current?.scrollTo({ y, animated: true });
            }
            previousLastItemIndex.current = index;
        };
    }

    const switchOff = !props.animals[props.animals.length - 1].observedSignsOfDisease;

    return (
        <>
            {props.animals.length > 1 ? (
                props.animals.map((item, index) => {
                    const language = getAppLanguage();
                    const genderClassifiers = getActiveClassifiers(classifiers, "genders");
                    const genderClassifier = genderClassifiers.find((classifier) => classifier.id === item.gender);
                    const genderLabel = genderClassifier?.description?.[language];
                    const ageClassifiers = getActiveClassifiers(classifiers, "ages");
                    const ageClassifier = ageClassifiers.find((classifier) => classifier.id === item.age);
                    const ageLabel = ageClassifier?.description?.[language];
                    const title = `${genderLabel}, ${ageLabel}`;
                    const isLastItem = index === props.animals.length - 1;
                    return (
                        <ObservationsCollapsible
                            style={isLastItem ? styles.collapsibleWithoutPadding : styles.collapsiblePadding}
                            lastInList={isLastItem}
                            onDeletePress={onItemDelete(item)}
                            defaultCollapsed={false}
                            key={item.id}
                            title={title}
                            onLayout={isLastItem ? onLastItemLayout(index) : undefined}
                        >
                            <AnimalsItem item={item} onChange={onItemChange(item.id)} />
                        </ObservationsCollapsible>
                    );
                })
            ) : (
                <AnimalsItem
                    item={props.animals[0]}
                    onChange={onItemChange(props.animals[0].id)}
                    onLayout={onLastItemLayout(0)}
                />
            )}

            {props.animals.length < configuration.observations.animals.maxCount ? (
                <>
                    <Button
                        style={[styles.buttonWithSwitchOn, switchOff && styles.buttonWithSwitchOff]}
                        variant="secondary-dark"
                        onPress={onAddItem}
                        icon="plus"
                        title={t("observations.addAnother")}
                    />
                    <Spacer size={24} />
                </>
            ) : (
                <Spacer size={24} />
            )}

            <DeleteConfirmationModal
                visible={itemToDelete != undefined}
                title={t("observations.deleteAnimalsItem.title")}
                onCancel={onCancelDeleteItem}
                onClose={onCancelDeleteItem}
                onConfirm={onConfirmDeleteItem}
            />
        </>
    );
}

const styles = StyleSheet.create({
    collapsibleWithoutPadding: {
        paddingBottom: 0,
    },
    collapsiblePadding: {
        paddingBottom: 28,
    },
    buttonWithSwitchOn: {
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
        paddingVertical: 26,
    },
    buttonWithSwitchOff: {
        paddingTop: 14,
    },
});
