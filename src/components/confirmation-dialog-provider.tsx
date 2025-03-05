import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Dialog } from "./dialog";

type ConfirmationDialogOptions = {
    title: string;
    confirmButtonTitle?: string;
    rejectButtonTitle?: string;
};

type ConfirmationDialogContextValue = {
    confirm: (options: ConfirmationDialogOptions) => Promise<boolean>;
};

const ConfirmationDialogContext = React.createContext<ConfirmationDialogContextValue | null>(null);

export function ConfirmationDialogProvider({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    const defaultConfirmButtonText = t("modal.accept");
    const defaultRejectButtonText = t("modal.cancel");

    const [state, setState] = React.useState<{
        visible: boolean;
        title: string;
        confirmButtonText: string;
        rejectButtonText: string;
        onConfirm: () => void;
        onReject: () => void;
    }>({
        visible: false,
        title: "",
        confirmButtonText: defaultConfirmButtonText,
        rejectButtonText: defaultRejectButtonText,
        onConfirm: ignore,
        onReject: ignore,
    });

    function resetState() {
        setState((confirmationDialogState) => ({
            ...confirmationDialogState,
            visible: false,
            onConfirm: ignore,
            onReject: ignore,
        }));
    }

    function confirm(options: ConfirmationDialogOptions): Promise<boolean> {
        return new Promise((resolve) => {
            setState({
                visible: true,
                title: options.title,
                confirmButtonText: options.confirmButtonTitle ?? defaultConfirmButtonText,
                rejectButtonText: options.rejectButtonTitle ?? defaultRejectButtonText,
                onConfirm: () => {
                    resolve(true);
                    resetState();
                },
                onReject: () => {
                    resolve(false);
                    resetState();
                },
            });
        });
    }

    return (
        <>
            <ConfirmationDialogContext.Provider value={{ confirm }}>{children}</ConfirmationDialogContext.Provider>
            <Dialog
                visible={state.visible}
                icon="hunt"
                title={state.title}
                onBackButtonPress={state.onReject}
                buttons={
                    <>
                        <Button title={state.confirmButtonText} onPress={state.onConfirm} />
                        <Button variant="secondary-outlined" title={state.rejectButtonText} onPress={state.onReject} />
                    </>
                }
            />
        </>
    );
}

function ignore() {
    // ignore
}

export function useConfirmationDialog() {
    const context = React.useContext(ConfirmationDialogContext);

    if (context === null) {
        throw new Error("ConfirmationDialogContext not initialized");
    }

    return context;
}
