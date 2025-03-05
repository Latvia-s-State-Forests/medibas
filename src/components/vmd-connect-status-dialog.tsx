import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { ActorRefFrom } from "xstate";
import { logger } from "~/logger";
import { vmdConnectMachine } from "~/machines/vmd-machine";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Spinner } from "./spinner";

type VmdConnectStatusDialogProps = {
    service: ActorRefFrom<typeof vmdConnectMachine>;
};

export function VmdConnectStatusDialog({ service }: VmdConnectStatusDialogProps) {
    const { t } = useTranslation();
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<"loading" | "updating" | "success" | "updateFailure" | "otherFailure">(
        "loading"
    );

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "🌲 " + JSON.stringify(state.value) + " " + JSON.stringify(state.event.type);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            if (state.matches("exchanging") || state.matches("connecting")) {
                setVisible(true);
                setStatus("loading");
            } else if (state.matches("updating")) {
                setVisible(true);
                setStatus("updating");
            } else if (state.matches("success")) {
                setVisible(true);
                setStatus("success");
            } else if (state.matches("updateFailure")) {
                setVisible(true);
                setStatus("updateFailure");
            } else if (state.matches("otherFailure")) {
                setVisible(true);
                setStatus("otherFailure");
            } else {
                setVisible(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [service]);

    return match(status)
        .with("loading", () => <Dialog visible={visible} icon={<Spinner />} title={t("vmdConnect.connecting.title")} />)
        .with("updating", () => <Dialog visible={visible} icon={<Spinner />} title={t("vmdConnect.updating.title")} />)
        .with("success", () => <Dialog visible={visible} icon="success" title={t("vmdConnect.success.title")} />)
        .with("updateFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("vmdConnect.updateFailure.title")}
                description={t("vmdConnect.updateFailure.description")}
                buttons={
                    <>
                        <Button title={t("vmdConnect.updateFailure.retry")} onPress={() => service.send("RETRY")} />
                        <Button
                            title={t("vmdConnect.updateFailure.cancel")}
                            onPress={() => service.send("CANCEL")}
                            variant="secondary-outlined"
                        />
                    </>
                }
                onBackButtonPress={() => service.send("CANCEL")}
            />
        ))
        .with("otherFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("vmdConnect.otherFailure.title")}
                buttons={
                    <>
                        <Button title={t("vmdConnect.otherFailure.retry")} onPress={() => service.send("RETRY")} />
                        <Button
                            title={t("vmdConnect.otherFailure.cancel")}
                            onPress={() => service.send("CANCEL")}
                            variant="secondary-outlined"
                        />
                    </>
                }
                onBackButtonPress={() => service.send("CANCEL")}
            />
        ))
        .exhaustive();
}
