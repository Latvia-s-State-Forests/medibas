import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Spinner } from "~/components/spinner";

type NewsStatusModalProps = {
    isLoading: boolean;
    isError: boolean;
    isHuntNotFound: boolean;
    onRetry: () => void;
    onCancel: () => void;
};

export function NewsStatusModal(props: NewsStatusModalProps) {
    const { t } = useTranslation();

    return match(props)
        .with({ isLoading: true }, () => (
            <Dialog
                visible={true}
                icon={<Spinner />}
                title={t("menu.news.loading")}
                onBackButtonPress={props.onCancel}
            />
        ))
        .with({ isHuntNotFound: true }, () => (
            <Dialog
                visible={true}
                icon="failure"
                title={t("menu.news.unavailableHunts")}
                buttons={<Button title={t("general.continue")} onPress={props.onCancel} />}
                onBackButtonPress={props.onCancel}
            />
        ))
        .with({ isError: true }, () => (
            <Dialog
                visible={true}
                icon="failure"
                title={t("menu.news.loadHuntError")}
                buttons={
                    <>
                        <Button title={t("general.retry")} onPress={props.onRetry} />
                        <Button title={t("general.cancel")} variant="secondary-outlined" onPress={props.onCancel} />
                    </>
                }
                onBackButtonPress={props.onCancel}
            />
        ))
        .otherwise(() => null);
}
