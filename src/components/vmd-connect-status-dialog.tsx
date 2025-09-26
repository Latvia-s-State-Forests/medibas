import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { ActorRefFrom } from "xstate";
import { vmdConnectMachine } from "~/machines/vmd-machine";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Spinner } from "./spinner";

type VmdConnectStatusDialogProps = {
    actor: ActorRefFrom<typeof vmdConnectMachine>;
};

export function VmdConnectStatusDialog({ actor }: VmdConnectStatusDialogProps) {
    const { t } = useTranslation();
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<"loading" | "updating" | "success" | "updateFailure" | "otherFailure">(
        "loading"
    );

    React.useEffect(() => {
        const subscription = actor.subscribe((state) => {
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
    }, [actor]);

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
                        <Button
                            title={t("vmdConnect.updateFailure.retry")}
                            onPress={() => actor.send({ type: "RETRY" })}
                        />
                        <Button
                            title={t("vmdConnect.updateFailure.cancel")}
                            onPress={() => actor.send({ type: "CANCEL" })}
                            variant="secondary-outlined"
                        />
                    </>
                }
                onBackButtonPress={() => actor.send({ type: "CANCEL" })}
            />
        ))
        .with("otherFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("vmdConnect.otherFailure.title")}
                buttons={
                    <>
                        <Button
                            title={t("vmdConnect.otherFailure.retry")}
                            onPress={() => actor.send({ type: "RETRY" })}
                        />
                        <Button
                            title={t("vmdConnect.otherFailure.cancel")}
                            onPress={() => actor.send({ type: "CANCEL" })}
                            variant="secondary-outlined"
                        />
                    </>
                }
                onBackButtonPress={() => actor.send({ type: "CANCEL" })}
            />
        ))
        .exhaustive();
}
