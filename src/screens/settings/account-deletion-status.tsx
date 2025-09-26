import { useSelector } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActorRefFrom } from "xstate";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Spinner } from "~/components/spinner";
import { accountDeletionMachine } from "./account-deletion-machine";

type AccountDeletionStatusProps = {
    actor: ActorRefFrom<typeof accountDeletionMachine>;
};

export function AccountDeletionStatus({ actor }: AccountDeletionStatusProps) {
    const { t } = useTranslation();

    const countdown = useSelector(actor, (state) => state.context.countdown);
    const state = useSelector(actor, (state) => {
        if (state.matches("confirming")) {
            return "confirming";
        }
        if (state.matches("deleting")) {
            return "deleting";
        }
        if (state.matches("success")) {
            return "success";
        }
        if (state.matches("failure")) {
            return "failure";
        }
        return "other";
    });
    const isWaitingForConfirmation = useSelector(actor, (state) =>
        state.matches({ confirming: "waitingForConfirmation" })
    );

    if (state === "confirming") {
        return (
            <Dialog
                visible
                icon="failure"
                title={t("settings.deleteAccount.modal.title")}
                description={t("settings.deleteAccount.modal.subtitle")}
                buttons={
                    <>
                        <Button
                            title={countdown ? String(countdown) : t("general.delete")}
                            disabled={!isWaitingForConfirmation}
                            variant="danger"
                            onPress={() => actor.send({ type: "CONFIRM" })}
                        />
                        <Button
                            title={t("modal.cancel")}
                            variant="secondary-outlined"
                            onPress={() => actor.send({ type: "REJECT" })}
                        />
                    </>
                }
                onBackButtonPress={() => actor.send({ type: "REJECT" })}
            />
        );
    }

    if (state === "deleting") {
        return (
            <Dialog
                visible
                icon={<Spinner />}
                title={t("settings.deleteAccount.active.title")}
                description={t("settings.deleteAccount.active.subtitle")}
            />
        );
    }

    if (state === "success") {
        return <Dialog visible icon="success" title={t("settings.deleteAccount.success.title")} />;
    }

    if (state === "failure") {
        return (
            <Dialog
                visible
                icon="failure"
                title={t("settings.deleteAccount.failure.title")}
                description={t("settings.deleteAccount.failure.subtitle")}
                buttons={<Button onPress={() => actor.send({ type: "RETRY" })} title={t("reportStatus.retry")} />}
            />
        );
    }

    return null;
}
