import { useActor } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActorRefFrom } from "xstate";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Spinner } from "~/components/spinner";
import { logger } from "~/logger";
import { accountDeletionMachine } from "./account-deletion-machine";

type AccountDeletionStatusProps = {
    actor: ActorRefFrom<typeof accountDeletionMachine>;
};

export function AccountDeletionStatus(props: AccountDeletionStatusProps) {
    const { t } = useTranslation();
    const [state, send] = useActor(props.actor);

    React.useEffect(() => {
        const subscription = props.actor.subscribe((state) => {
            logger.log("🗑️ AD " + JSON.stringify(state.value) + " " + JSON.stringify(state.event));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [props.actor]);

    if (state.matches("confirming")) {
        return (
            <Dialog
                visible
                icon="failure"
                title={t("settings.deleteAccount.modal.title")}
                description={t("settings.deleteAccount.modal.subtitle")}
                buttons={
                    <>
                        <Button
                            title={state.context.countdown ? String(state.context.countdown) : t("general.delete")}
                            disabled={!state.matches({ confirming: "waitingForConfirmation" })}
                            variant="danger"
                            onPress={() => send({ type: "CONFIRM" })}
                        />
                        <Button
                            title={t("modal.cancel")}
                            variant="secondary-outlined"
                            onPress={() => send({ type: "REJECT" })}
                        />
                    </>
                }
                onBackButtonPress={() => send({ type: "REJECT" })}
            />
        );
    }

    if (state.matches("deleting")) {
        return (
            <Dialog
                visible
                icon={<Spinner />}
                title={t("settings.deleteAccount.active.title")}
                description={t("settings.deleteAccount.active.subtitle")}
            />
        );
    }

    if (state.matches("success")) {
        return <Dialog visible icon="success" title={t("settings.deleteAccount.success.title")} />;
    }

    if (state.matches("failure")) {
        return (
            <Dialog
                visible
                icon="failure"
                title={t("settings.deleteAccount.failure.title")}
                description={t("settings.deleteAccount.failure.subtitle")}
                buttons={<Button onPress={() => send({ type: "RETRY" })} title={t("reportStatus.retry")} />}
            />
        );
    }

    return null;
}
