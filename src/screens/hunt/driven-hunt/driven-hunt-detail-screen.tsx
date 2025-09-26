import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isSameDay } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HuntDog } from "~/api";
import { ActionButton } from "~/components/action-button";
import { useConfirmationDialog } from "~/components/confirmation-dialog-provider";
import { ErrorMessage } from "~/components/error-message";
import { Header } from "~/components/header";
import { useHuntActivitiesContext } from "~/components/hunt-activities-provider";
import { NavigationButtonField } from "~/components/navigation-button-field";
import { QRContainer } from "~/components/qr-code/qr-container";
import { ReadOnlyField } from "~/components/read-only-field";
import { ShareButton } from "~/components/share-button";
import { Spacer } from "~/components/spacer";
import { ENV } from "~/env";
import { useHunt } from "~/hooks/use-hunt";
import { usePermissions } from "~/hooks/use-permissions";
import { useProfile } from "~/hooks/use-profile";
import { logger } from "~/logger";
import { theme } from "~/theme";
import { HuntActivityType, SimplifiedHuntActivity } from "~/types/hunt-activities";
import { Hunt, HuntEventStatus } from "~/types/hunts";
import { RootNavigatorParams } from "~/types/navigation";
import { formatDate, formatTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";
import { generateQRCodeValue } from "~/utils/generate-qr-code";
import { getQrHuntDescription } from "~/utils/get-qr-hunt-description";
import { DogPicker } from "../dog-picker/dog-picker";
import { BeaterManagementUsingActivities } from "./beater-management-using-activities";
import { HuntLocationViewer } from "./hunt-location-viewer";
import { HunterManagementUsingActivities } from "./hunter-management-using-activities";
import { JoinDrivenHuntUsingButton } from "./join-driven-hunt/join-driven-hunt-using-button";
import { BeaterList } from "./lists/beater-list";
import { HuntedSpeciesList } from "./lists/hunted-species-list";
import { HunterList } from "./lists/hunter-list";
import { TargetSpeciesList } from "./lists/target-species-list";
import { getDrivenHuntManagementErrors } from "./validation";

type DrivenHuntDetailScreenProps = NativeStackScreenProps<RootNavigatorParams, "DrivenHuntDetailScreen">;

export function DrivenHuntDetailScreen({ navigation, route }: DrivenHuntDetailScreenProps) {
    const hunt = useHunt(route.params.huntId);

    if (!hunt) {
        logger.error(`Driven hunt with id ${route.params.huntId} not available`);
        navigation.goBack();
        return null;
    }

    return <Content hunt={hunt} />;
}

type ContentProps = {
    hunt: Hunt;
};

function Content({ hunt }: ContentProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const permissions = usePermissions();
    const { confirm } = useConfirmationDialog();
    const { createActivity, createActivities } = useHuntActivitiesContext();
    const isHuntToday = isSameDay(new Date(hunt.plannedFrom), new Date());
    const hasPermissionToManageDrivenHunt = permissions.manageDrivenHunt(hunt.huntManagerPersonId);
    const errors = getDrivenHuntManagementErrors(hunt);
    const profile = useProfile();
    const isHunterInList = hunt.hunters.some((hunter) => hunter.personId === profile.personId);
    const isBeaterInList = hunt.beaters.some((beater) => beater.hunterPersonId === profile.personId);
    const locationLabel = `${hunt.vmdCode} ${t("hunt.drivenHunt.meetingPlace")}`;

    async function onSharePress() {
        try {
            const eventGuid = hunt.eventGuid;
            const districts = hunt.districts
                .map((district: { descriptionLv: string }) => district.descriptionLv)
                .join(", ");
            const date = formatDate(hunt.plannedFrom);
            const url = `${ENV.DRIVEN_HUNT_REDIRECT_URL}${eventGuid}`;
            const message = `${t("hunt.drivenHunt.shareHunt.shareLink", {
                huntTitle: hunt.vmdCode,
                huntDistricts: districts,
                huntDate: date,
            })}: ${url}`;

            await Share.share({
                message,
            });
        } catch (error) {
            console.error("Error while sharing", error);
        }
    }

    function onDogsChange(dogs: HuntDog[]) {
        const activities: SimplifiedHuntActivity[] = [];
        const countByGuid = new Map<string, number>();
        for (const dog of hunt.dogs) {
            countByGuid.set(dog.guid, dog.count);
        }

        const guids = new Set<string>();
        for (const dog of dogs) {
            guids.add(dog.guid);
            if (dog.count !== (countByGuid.get(dog.guid) ?? 0)) {
                activities.push({
                    type: HuntActivityType.AddDog,
                    huntId: hunt.id,
                    huntCode: hunt.vmdCode,
                    dogGuid: dog.guid!,
                    dogBreedId: dog.dogBreedId,
                    dogSubbreedId: dog.dogSubbreedId,
                    dogBreedOther: dog.dogBreedOther,
                    dogCount: dog.count,
                });
            }
        }

        for (const dog of hunt.dogs) {
            if (!guids.has(dog.guid)) {
                activities.push({
                    type: HuntActivityType.DeleteDog,
                    huntId: hunt.id,
                    huntCode: hunt.vmdCode,
                    dogGuid: dog.guid,
                    dogBreedId: dog.dogBreedId,
                    dogSubbreedId: dog.dogSubbreedId,
                    dogBreedOther: dog.dogBreedOther,
                });
            }
        }

        if (activities.length > 0) {
            createActivities(activities);
        }
    }

    const districts = React.useMemo(() => {
        const districtDescriptions = hunt.districts.map((district) => district.descriptionLv.trim());
        districtDescriptions.sort((a, b) => a.localeCompare(b));
        const districts = districtDescriptions.join(";\n") + (hunt.districts.length > 1 ? "." : "");
        return districts;
    }, [hunt.districts]);

    const districtIds = React.useMemo(() => {
        return hunt.districts.map((district) => district.id);
    }, [hunt.districts]);

    const isHuntConcluded = hunt.huntEventStatusId === HuntEventStatus.Concluded;

    return (
        <View style={styles.container}>
            <Header
                title={hunt.vmdCode}
                showEditButton={
                    hunt.huntEventStatusId === HuntEventStatus.Scheduled &&
                    permissions.editDrivenHunt(
                        hunt.districts.map((district) => district.id),
                        hunt.huntManagerPersonId
                    )
                }
                onEditButtonPress={() => {
                    navigation.navigate("DrivenHuntFormScreen", {
                        huntToEdit: hunt,
                    });
                }}
            />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <View style={styles.formContentContainer}>
                    <View style={styles.codeContainer}>
                        <ReadOnlyField
                            style={styles.huntCode}
                            label={t("hunt.drivenHunt.detailScreen.huntCode")}
                            value={hunt.vmdCode ?? ""}
                        />
                        <View style={styles.shareAndQRButtonContainer}>
                            {hunt.huntEventStatusId === HuntEventStatus.Scheduled ? (
                                <>
                                    <ShareButton onPress={onSharePress} />
                                    <Spacer horizontal size={12} />
                                    <QRContainer
                                        title={t("qrcode.title.hunt")}
                                        description={getQrHuntDescription(hunt)}
                                        value={generateQRCodeValue(hunt)}
                                    />
                                </>
                            ) : null}
                        </View>
                    </View>
                    <ReadOnlyField
                        label={t("hunt.drivenHunt.detailScreen.huntDate")}
                        value={formatDate(hunt.plannedFrom)}
                    />
                    {hunt.notes ? (
                        <ReadOnlyField label={t("hunt.drivenHunt.detailScreen.notes")} value={hunt.notes} />
                    ) : null}
                    {hunt.meetingTime ? (
                        <ReadOnlyField
                            label={t("hunt.drivenHunt.detailScreen.meetingTime")}
                            value={formatTime(hunt.meetingTime)}
                        />
                    ) : null}
                    {hunt.meetingPointY && hunt.meetingPointX ? (
                        <>
                            <HuntLocationViewer
                                huntType="drivenHunt"
                                latitude={hunt.meetingPointY}
                                longitude={hunt.meetingPointX}
                            />

                            <NavigationButtonField
                                label={t("hunt.individualHunt.locationCoordinates")}
                                value={formatPosition({
                                    latitude: hunt.meetingPointY,
                                    longitude: hunt.meetingPointX,
                                })}
                                latitude={hunt.meetingPointY}
                                longitude={hunt.meetingPointX}
                                locationLabel={locationLabel}
                                hideNavigationButton={isHuntConcluded}
                            />
                        </>
                    ) : null}

                    <ReadOnlyField label={t("hunt.drivenHunt.detailScreen.districts")} value={districts} />
                    <ReadOnlyField
                        label={t("hunt.drivenHunt.detailScreen.huntManager")}
                        value={hunt.huntManagerName || t("hunt.drivenHunt.detailScreen.huntManagerEmpty")}
                    />

                    <TargetSpeciesList hunt={hunt} />
                    <HuntedSpeciesList hunt={hunt} />
                    {isHuntToday &&
                    hasPermissionToManageDrivenHunt &&
                    hunt.huntEventStatusId !== HuntEventStatus.Concluded ? (
                        <HunterManagementUsingActivities
                            huntId={hunt.id}
                            huntCode={hunt.vmdCode}
                            districtIds={districtIds}
                            huntManagerPersonId={hunt.huntManagerPersonId}
                            hunters={hunt.hunters}
                            guestHunters={hunt.guestHunters}
                            beaters={hunt.beaters}
                            districtMembers={hunt.districtMembers ?? []}
                        />
                    ) : (
                        <HunterList hunt={hunt} />
                    )}
                    {isHuntToday &&
                    hasPermissionToManageDrivenHunt &&
                    hunt.huntEventStatusId !== HuntEventStatus.Concluded ? (
                        <BeaterManagementUsingActivities
                            huntId={hunt.id}
                            huntCode={hunt.vmdCode}
                            districtIds={districtIds}
                            huntManagerPersonId={hunt.huntManagerPersonId}
                            beaters={hunt.beaters}
                            guestBeaters={hunt.guestBeaters}
                            hunters={hunt.hunters}
                            districtMembers={hunt.districtMembers ?? []}
                        />
                    ) : (
                        <BeaterList hunt={hunt} />
                    )}
                    <DogPicker
                        title={t("hunt.drivenHunt.detailScreen.dogs")}
                        dogs={hunt.dogs}
                        onDogsChange={onDogsChange}
                        forceMinCount={hunt.huntEventStatusId !== HuntEventStatus.Scheduled}
                        editable={hasPermissionToManageDrivenHunt && isHuntToday}
                    />
                </View>

                {hasPermissionToManageDrivenHunt && errors.length > 0 ? (
                    <View style={styles.errorsContainer}>
                        {errors.map((error, index) => (
                            <ErrorMessage text={error} key={`${error}-${index}`} />
                        ))}
                    </View>
                ) : null}

                <Spacer size={24} />
                <JoinDrivenHuntUsingButton
                    visible={
                        !hasPermissionToManageDrivenHunt &&
                        !isHunterInList &&
                        !isBeaterInList &&
                        hunt.huntEventStatusId === HuntEventStatus.Scheduled
                    }
                    hunt={hunt}
                />

                {permissions.createDrivenHunt() && hunt.huntEventStatusId === HuntEventStatus.Concluded ? (
                    <View>
                        <ActionButton
                            iconName="copy"
                            title={t("hunt.drivenHunt.detailScreen.copyData")}
                            onPress={() =>
                                navigation.navigate("DrivenHuntFormScreen", {
                                    huntToCopy: hunt,
                                })
                            }
                        />
                        <Spacer size={hasPermissionToManageDrivenHunt ? 16 : 0} />
                    </View>
                ) : null}

                {hasPermissionToManageDrivenHunt ? (
                    <View style={styles.buttonsContainer}>
                        {isHuntToday && hunt.huntEventStatusId === HuntEventStatus.Scheduled ? (
                            <ActionButton
                                iconName="play"
                                title={t("hunt.drivenHunt.detailScreen.startHunt")}
                                disabled={errors.length > 0}
                                onPress={async () => {
                                    const confirmed = await confirm({
                                        title: t("hunt.drivenHunt.detailScreen.startHuntConfirmation.title", {
                                            huntCode: hunt.vmdCode,
                                        }),
                                        confirmButtonTitle: t(
                                            "hunt.drivenHunt.detailScreen.startHuntConfirmation.confirm"
                                        ),
                                        rejectButtonTitle: t(
                                            "hunt.drivenHunt.detailScreen.startHuntConfirmation.reject"
                                        ),
                                    });
                                    if (confirmed) {
                                        createActivity({
                                            type: HuntActivityType.StartHunt,
                                            huntId: hunt.id,
                                            huntCode: hunt.vmdCode,
                                        });
                                    }
                                }}
                            />
                        ) : null}
                        {isHuntToday && hunt.huntEventStatusId === HuntEventStatus.Active ? (
                            <ActionButton
                                iconName="pause"
                                title={t("hunt.drivenHunt.detailScreen.pauseHunt")}
                                disabled={!isHuntToday}
                                onPress={async () => {
                                    const confirmed = await confirm({
                                        title: t("hunt.drivenHunt.detailScreen.pauseHuntConfirmation.title", {
                                            huntCode: hunt.vmdCode,
                                        }),
                                        confirmButtonTitle: t(
                                            "hunt.drivenHunt.detailScreen.pauseHuntConfirmation.confirm"
                                        ),
                                        rejectButtonTitle: t(
                                            "hunt.drivenHunt.detailScreen.pauseHuntConfirmation.reject"
                                        ),
                                    });
                                    if (confirmed) {
                                        createActivity({
                                            type: HuntActivityType.PauseHunt,
                                            huntId: hunt.id,
                                            huntCode: hunt.vmdCode,
                                        });
                                    }
                                }}
                            />
                        ) : null}
                        {isHuntToday && hunt.huntEventStatusId === HuntEventStatus.Paused ? (
                            <ActionButton
                                iconName="play"
                                title={t("hunt.drivenHunt.detailScreen.resumeHunt")}
                                disabled={!isHuntToday}
                                onPress={async () => {
                                    const confirmed = await confirm({
                                        title: t("hunt.drivenHunt.detailScreen.resumeHuntConfirmation.title", {
                                            huntCode: hunt.vmdCode,
                                        }),
                                        confirmButtonTitle: t(
                                            "hunt.drivenHunt.detailScreen.resumeHuntConfirmation.confirm"
                                        ),
                                        rejectButtonTitle: t(
                                            "hunt.drivenHunt.detailScreen.resumeHuntConfirmation.reject"
                                        ),
                                    });
                                    if (confirmed) {
                                        createActivity({
                                            type: HuntActivityType.ResumeHunt,
                                            huntId: hunt.id,
                                            huntCode: hunt.vmdCode,
                                        });
                                    }
                                }}
                            />
                        ) : null}
                        {isHuntToday &&
                        (hunt.huntEventStatusId === HuntEventStatus.Active ||
                            hunt.huntEventStatusId === HuntEventStatus.Paused) ? (
                            <ActionButton
                                iconName="lock"
                                title={t("hunt.drivenHunt.detailScreen.endHunt")}
                                disabled={!isHuntToday}
                                onPress={async () => {
                                    const confirmed = await confirm({
                                        title: t("hunt.drivenHunt.detailScreen.endHuntConfirmation.title", {
                                            huntCode: hunt.vmdCode,
                                        }),
                                        confirmButtonTitle: t(
                                            "hunt.drivenHunt.detailScreen.endHuntConfirmation.confirm"
                                        ),
                                        rejectButtonTitle: t("hunt.drivenHunt.detailScreen.endHuntConfirmation.reject"),
                                    });
                                    if (confirmed) {
                                        createActivity({
                                            type: HuntActivityType.EndHunt,
                                            huntId: hunt.id,
                                            huntCode: hunt.vmdCode,
                                        });
                                    }
                                }}
                            />
                        ) : null}

                        {isHuntToday && hunt.huntEventStatusId === HuntEventStatus.Active ? (
                            <ActionButton
                                iconName="register"
                                title={t("hunt.drivenHunt.detailScreen.registerPrey")}
                                disabled={!isHuntToday}
                                onPress={() => {
                                    navigation.navigate("RegisterPreyScreen", {
                                        activeHuntHunters: hunt.hunters.filter(
                                            (hunter) => hunter.statusId !== HuntEventStatus.PausedForParticipants
                                        ),
                                    });
                                }}
                            />
                        ) : null}

                        {hunt.huntEventStatusId !== HuntEventStatus.Scheduled ? (
                            <ActionButton
                                iconName="binoculars"
                                title={t("hunt.drivenHunt.detailScreen.enterObservations")}
                                onPress={() => {
                                    navigation.navigate("ObservationsScreenRoot", {
                                        huntEventId: hunt.id,
                                        huntVmdCode: hunt.vmdCode,
                                    });
                                }}
                            />
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        flexGrow: 1,
        paddingTop: 24,
    },
    formContentContainer: {
        flex: 1,
        gap: 24,
    },
    codeContainer: {
        flexDirection: "row",
    },
    shareAndQRButtonContainer: {
        flexDirection: "row",
    },
    huntCode: {
        flex: 1,
    },
    errorsContainer: {
        gap: 19,
        marginTop: 24,
    },
    buttonsContainer: {
        gap: 16,
    },
});
