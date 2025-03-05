import { useMachine } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { FieldLabel } from "~/components/field-label";
import { Spacer } from "~/components/spacer";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { PhotoMode, photoMachine } from "./photo-machine";
import { PhotoPreview } from "./photo-preview";
import { PhotoPreviewModal } from "./photo-preview-modal";
import { PhotoSelect } from "./photo-select";

type PhotoProps = {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    mode?: PhotoMode; // Defaults to "prompt"
    onPhotoSelectOpen?: () => void;
    onPhotoSelectClose?: () => void;
};

export function Photo(props: PhotoProps) {
    const { t } = useTranslation();
    const userStorage = useUserStorage();
    const [state, send, service] = useMachine(
        () => photoMachine.withContext({ photo: props.value, mode: props.mode ?? "prompt", userStorage }),
        {
            actions: {
                onPhotoSelected: (context) => {
                    if (context.photo) {
                        props.onChange(context.photo);
                    }
                },
                onPhotoDeleted: () => {
                    props.onChange(undefined);
                },
                onPhotoSelectOpen: () => {
                    if (props.onPhotoSelectOpen) {
                        props.onPhotoSelectOpen();
                    }
                },
                onPhotoSelectClose: (context, event) => {
                    // Used for when Android activity restarts
                    if (event.type === "xstate.stop") {
                        return;
                    }

                    if (props.onPhotoSelectClose) {
                        props.onPhotoSelectClose();
                    }
                },
            },
        }
    );

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "📷 " + JSON.stringify(state.value) + " " + JSON.stringify(state.event.type);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    return (
        <>
            <FieldLabel label={t("hunt.photo")} />
            <Spacer size={20} />
            {state.matches("selected") && state.context.photo ? (
                <PhotoPreview
                    photo={state.context.photo}
                    onDelete={() => send("DELETE_PHOTO")}
                    onOpenPreview={() => send("OPEN_PREVIEW")}
                />
            ) : (
                <PhotoSelect onPress={() => send("SELECT_PHOTO")} />
            )}

            {match(state)
                .with({ value: { empty: "prompting" } }, () => (
                    <Dialog
                        visible
                        onBackButtonPress={() => send("PROMPT_CANCELLED")}
                        buttons={
                            <>
                                <Button
                                    title={t("photo.prompt.chooseFromPhotos")}
                                    icon="browse"
                                    onPress={() => send("CHOOSE_PHOTO")}
                                />
                                <Button
                                    title={t("photo.prompt.capture")}
                                    icon="camera"
                                    onPress={() => send("CAPTURE_PHOTO")}
                                />
                                <Button
                                    title={t("modal.cancel")}
                                    icon="close"
                                    variant="secondary-outlined"
                                    onPress={() => send("PROMPT_CANCELLED")}
                                />
                            </>
                        }
                    />
                ))
                .with({ value: { empty: "error" } }, () => (
                    <Dialog
                        visible
                        icon="failure"
                        title={t("photo.failure.title")}
                        description={t("photo.failure.message")}
                        onBackButtonPress={() => send("ERROR_CLOSE")}
                        buttons={
                            <>
                                <Button
                                    title={t("photo.failure.openSettings")}
                                    onPress={() => send("ERROR_OPEN_SETTINGS")}
                                />
                                <Button
                                    variant="secondary-outlined"
                                    title={t("photo.failure.cancel")}
                                    onPress={() => send("ERROR_CLOSE")}
                                />
                            </>
                        }
                    />
                ))
                .with({ value: { selected: "confirmingDelete" } }, () => (
                    <Dialog
                        visible
                        icon="delete"
                        title={t("photo.remove.title")}
                        onBackButtonPress={() => send("DELETE_REJECTED")}
                        buttons={
                            <>
                                <Button title={t("general.delete")} onPress={() => send("DELETE_CONFIRMED")} />
                                <Button
                                    variant="secondary-outlined"
                                    title={t("modal.cancel")}
                                    onPress={() => send("DELETE_REJECTED")}
                                />
                            </>
                        }
                    />
                ))
                .with({ value: { selected: "previewing" } }, () => (
                    <PhotoPreviewModal photo={state.context.photo!} onClose={() => send("CLOSE_PREVIEW")} />
                ))
                .otherwise(() => null)}
        </>
    );
}
