import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { ConcludeConfirmationModal } from "~/components/modal/conclude-confirmation-modal";
import { DeleteConfirmationModal } from "~/components/modal/delete-confirmation-modal";
import { Modal } from "~/components/modal/modal";
import { StatusModal } from "~/components/modal/status-modal";
import { theme } from "~/theme";

export function ModalExampleScreen() {
    const insets = useSafeAreaInsets();
    const [showEmptyModal, setShowEmptyModal] = React.useState(false);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [showSuccessNoDescriptionModal, setShowSuccessNoDescriptionModal] = React.useState(false);
    const [showFailureModal, setShowFailureModal] = React.useState(false);
    const [showDefaultButtonModal, setShowDefaultButtonModal] = React.useState(false);
    const [showDefaultButtonDescriptionModal, setShowDefaultButtonDescriptionModal] = React.useState(false);
    const [showDangerButtonModal, setShowDangerButtonModal] = React.useState(false);
    const [showConcludeModal, setShowConcludeModal] = React.useState(false);

    function ignore() {
        //do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Modal" />
            <ScrollView contentContainerStyle={[{ paddingBottom: insets.bottom + 24 }]}>
                <PressableListItem label="Empty Modal" background="white" onPress={() => setShowEmptyModal(true)} />
                <Modal visible={showEmptyModal} onClose={() => setShowEmptyModal(false)}>
                    <View></View>
                </Modal>
                <PressableListItem
                    label="Success with description"
                    background="white"
                    onPress={() => setShowSuccessModal(true)}
                />
                <StatusModal
                    visible={showSuccessModal}
                    description="Description"
                    title="Title"
                    status="success"
                    onClose={() => setShowSuccessModal(false)}
                />
                <PressableListItem
                    label="Success without description"
                    background="white"
                    onPress={() => setShowSuccessNoDescriptionModal(true)}
                />
                <StatusModal
                    visible={showSuccessNoDescriptionModal}
                    onClose={() => setShowSuccessNoDescriptionModal(false)}
                    title="Title"
                    status="success"
                />
                <PressableListItem
                    label="Failure with description"
                    background="white"
                    onPress={() => setShowFailureModal(true)}
                />
                <StatusModal
                    visible={showFailureModal}
                    onClose={() => setShowFailureModal(false)}
                    description="Make sure access to photos and camera is enabled and try again"
                    title="Failed to add photo"
                    status="failure"
                />
                <PressableListItem
                    label="Button variant set to default"
                    background="white"
                    onPress={() => setShowDefaultButtonModal(true)}
                />
                <DeleteConfirmationModal
                    visible={showDefaultButtonModal}
                    onConfirm={ignore}
                    onCancel={() => setShowDefaultButtonModal(false)}
                    onClose={() => setShowDefaultButtonModal(false)}
                    title="Do you want to delete?"
                />
                <PressableListItem
                    label="Button variant set to default with description"
                    background="white"
                    onPress={() => setShowDefaultButtonDescriptionModal(true)}
                />
                <DeleteConfirmationModal
                    visible={showDefaultButtonDescriptionModal}
                    onConfirm={ignore}
                    onCancel={() => setShowDefaultButtonDescriptionModal(false)}
                    onClose={() => setShowDefaultButtonDescriptionModal(false)}
                    description="Description"
                    title="Title"
                />
                <PressableListItem
                    label="Button variant set to danger"
                    background="white"
                    onPress={() => setShowDangerButtonModal(true)}
                />
                <DeleteConfirmationModal
                    visible={showDangerButtonModal}
                    onConfirm={ignore}
                    onCancel={() => setShowDangerButtonModal(false)}
                    onClose={() => setShowDangerButtonModal(false)}
                    description="Description"
                    title="Title"
                    variant="danger"
                />
                <PressableListItem
                    label="Conclude Modal"
                    background="white"
                    onPress={() => setShowConcludeModal(true)}
                />
                <ConcludeConfirmationModal
                    visible={showConcludeModal}
                    onConfirm={ignore}
                    onCancel={() => setShowConcludeModal(false)}
                    onClose={() => setShowConcludeModal(false)}
                    title="Title"
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
});
