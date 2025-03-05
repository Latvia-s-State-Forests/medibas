import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { theme } from "~/theme";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Spinner } from "./spinner";

export function DialogExampleScreen() {
    const insets = useSafeAreaInsets();
    const [showPhotoPrompt, setShowPhotoPrompt] = React.useState(false);
    const [showPhotoConfirmDelete, setShowPhotoConfirmDelete] = React.useState(false);
    const [showPhotoFailure, setShowPhotoFailure] = React.useState(false);
    const [showReportPending, setShowReportPending] = React.useState(false);
    const [showReportActive, setShowReportActive] = React.useState(false);
    const [showReportSuccess, setShowReportSuccess] = React.useState(false);
    const [showReportFailure, setShowReportFailure] = React.useState(false);
    const [showConfirmAccountDelete, setShowConfirmAccountDelete] = React.useState(false);

    return (
        <View style={styles.container}>
            <Header title="Dialog" />
            <ScrollView contentContainerStyle={[{ paddingBottom: insets.bottom + 24 }]}>
                <PressableListItem label="Photo Prompt" background="white" onPress={() => setShowPhotoPrompt(true)} />
                <Dialog
                    visible={showPhotoPrompt}
                    onBackButtonPress={() => setShowPhotoPrompt(false)}
                    buttons={
                        <>
                            <Button
                                title="Choose from photos"
                                icon="camera"
                                onPress={() => setShowPhotoPrompt(false)}
                            />
                            <Button title="Capture photo" icon="browse" onPress={() => setShowPhotoPrompt(false)} />
                            <Button
                                title="Cancel"
                                variant="secondary-outlined"
                                onPress={() => setShowPhotoPrompt(false)}
                            />
                        </>
                    }
                />

                <PressableListItem
                    label="Photo Confirm Delete"
                    background="white"
                    onPress={() => setShowPhotoConfirmDelete(true)}
                />
                <Dialog
                    visible={showPhotoConfirmDelete}
                    icon="delete"
                    title="Do you want to delete the photo?"
                    onBackButtonPress={() => setShowPhotoPrompt(false)}
                    buttons={
                        <>
                            <Button title="Delete" onPress={() => setShowPhotoConfirmDelete(false)} />
                            <Button
                                variant="secondary-outlined"
                                title="Cancel"
                                onPress={() => setShowPhotoConfirmDelete(false)}
                            />
                        </>
                    }
                />

                <PressableListItem label="Photo Failure" background="white" onPress={() => setShowPhotoFailure(true)} />
                <Dialog
                    visible={showPhotoFailure}
                    icon="failure"
                    title="Failed to add photo"
                    description="Make sure access to photos and camera is enabled and try again"
                    buttons={<Button title="OK" onPress={() => setShowPhotoFailure(false)} />}
                />

                <PressableListItem
                    label="Report Pending"
                    background="white"
                    onPress={() => setShowReportPending(true)}
                />
                <Dialog
                    visible={showReportPending}
                    icon={<Spinner />}
                    title="Waiting to send information"
                    description={'You can view the sending status for this and other reports in "Items submitted"'}
                    buttons={<Button title="Continue in the background" onPress={() => setShowReportPending(false)} />}
                />

                <PressableListItem label="Report Active" background="white" onPress={() => setShowReportActive(true)} />
                <Dialog
                    visible={showReportActive}
                    icon={<Spinner progress={75} />}
                    title="Sending information"
                    description={'You can view the sending status for this and other reports in "Items submitted"'}
                    buttons={<Button title="Continue in the background" onPress={() => setShowReportActive(false)} />}
                />

                <PressableListItem
                    label="Report Success"
                    background="white"
                    onPress={() => setShowReportSuccess(true)}
                />
                <Dialog
                    visible={showReportSuccess}
                    icon="success"
                    title="Information sent"
                    description={'You can view the sending status for this and other reports in "Items submitted"'}
                    buttons={<Button title="Continue" onPress={() => setShowReportSuccess(false)} />}
                />

                <PressableListItem
                    label="Report Failure"
                    background="white"
                    onPress={() => setShowReportFailure(true)}
                />
                <Dialog
                    visible={showReportFailure}
                    icon="failure"
                    title="Failed to send information"
                    description="Timeout error. It took longer than 5 minutes to send the information."
                    buttons={
                        <>
                            <Button
                                title="Postpone"
                                variant="secondary-outlined"
                                onPress={() => setShowReportFailure(false)}
                            />
                            <Button title="Try again" onPress={() => setShowReportFailure(false)} />
                        </>
                    }
                />

                <PressableListItem
                    label="Confirm Account Delete"
                    background="white"
                    onPress={() => setShowConfirmAccountDelete(true)}
                />
                <Dialog
                    visible={showConfirmAccountDelete}
                    icon="failure"
                    title="Do you really want to delete your Mednis account?"
                    description="This cannot be undone"
                    buttons={
                        <>
                            <Button
                                title="Delete"
                                variant="danger"
                                onPress={() => setShowConfirmAccountDelete(false)}
                            />
                            <Button
                                title="Cancel"
                                variant="secondary-outlined"
                                onPress={() => setShowConfirmAccountDelete(false)}
                            />
                        </>
                    }
                    onBackButtonPress={() => setShowConfirmAccountDelete(false)}
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
