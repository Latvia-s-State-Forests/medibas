import { useInterpret } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActionButton } from "~/components/action-button";
import { Spacer } from "~/components/spacer";
import {
    approveOrRejectIndividualHuntMachine,
    ApproveRejectStatusDialog,
} from "~/screens/hunt/individual-hunt/approve-reject-individual-hunt-machine";

type ConfirmRejectIndividualHuntProps = {
    huntId: number;
};

export function ConfirmRejectIndividualHunt(props: ConfirmRejectIndividualHuntProps) {
    const { huntId } = props;
    const { t } = useTranslation();
    const [isRejection, setIsRejection] = React.useState(false);
    const service = useInterpret(() => approveOrRejectIndividualHuntMachine);

    function onReject() {
        setIsRejection(true);
    }

    function onApproveSubmit() {
        service.send({
            type: "SUBMIT",
            payload: {
                id: huntId,
                isApproved: !isRejection,
            },
        });
    }

    return (
        <>
            <Spacer size={16} />
            <View style={styles.buttonContainer}>
                <ActionButton
                    title={t("hunt.individualHunt.action.decline")}
                    onPress={onReject}
                    iconName="blocked"
                    iconColor="gray5"
                />
                <Spacer horizontal size={10} />
                <ActionButton
                    title={t("hunt.individualHunt.action.seen")}
                    onPress={onApproveSubmit}
                    iconName="check"
                    iconColor="success"
                />
            </View>

            <ApproveRejectStatusDialog
                huntId={huntId}
                service={service}
                isRejection={isRejection}
                onCancelRejection={() => setIsRejection(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
    },
});
