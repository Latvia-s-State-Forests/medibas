import { useActorRef, useSelector } from "@xstate/react";
import * as React from "react";
import { ActorRefFrom, assign, fromCallback, setup } from "xstate";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryClient, queryKeys } from "~/query-client";
import { HuntedTypeId } from "~/types/classifiers";
import { FeatureLayer, Report, ReportSyncError, ReportSyncResult } from "~/types/report";
import { UserStorage } from "~/user-storage";
import { networkStatusMachine } from "~/utils/network-status-machine";
import { processReports } from "~/utils/process-reports";

const ReportsContext = React.createContext<ActorRefFrom<typeof reportsMachine> | null>(null);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
    const storage = useUserStorage();
    const service = useActorRef(reportsMachine, {
        input: { storage },
        inspect: (inspectEvent) => {
            if (inspectEvent.type === "@xstate.snapshot") {
                const snapshot = inspectEvent.actorRef?.getSnapshot();
                if (snapshot?.machine?.id === reportsMachine.id) {
                    logger.log("🗒️ " + JSON.stringify(snapshot.value) + " " + JSON.stringify(inspectEvent.event));
                }
            }
        },
    });

    return <ReportsContext.Provider value={service}>{children}</ReportsContext.Provider>;
}

export function useReportsContext() {
    const context = React.useContext(ReportsContext);

    if (context === null) {
        throw new Error("ReportsContext not initialized");
    }

    return context;
}

export function useReports() {
    const reportsService = useReportsContext();
    return useSelector(reportsService, (state) => state.context.reports);
}

export function useReportCount() {
    const reportsService = useReportsContext();
    return useSelector(reportsService, (state) => state.context.reports.length);
}

export function useUnsyncedReportsCount() {
    const reportsService = useReportsContext();
    return useSelector(
        reportsService,
        (state) => state.context.reports.filter((report) => report.status !== "success").length
    );
}

export function useReport(id: string) {
    const reportsService = useReportsContext();
    return useSelector(reportsService, (state) => state.context.reports.find((report) => report.id === id));
}

export function useReportProgress(reportId: string) {
    const reportsService = useReportsContext();
    return useSelector(reportsService, (state) => {
        if (state.context.activeReportId !== reportId) {
            return undefined;
        }

        return state.context.progress;
    });
}

export function useIsReportWaitingForNetwork(reportId: string) {
    const reportsService = useReportsContext();
    return useSelector(reportsService, (state) => {
        if (state.context.activeReportId !== reportId) {
            return false;
        }

        return state.matches({ syncing: "waitingForNetworkConnection" });
    });
}

type ReportsEvent =
    | { type: "LOADED"; reports: Report[] }
    | { type: "ADD"; report: Report }
    | { type: "RETRY"; reportId: string }
    | { type: "NETWORK_AVAILABLE" }
    | { type: "NETWORK_UNAVAILABLE" }
    | { type: "SYNC_PROGRESS"; progress: number }
    | { type: "SYNC_SUCCESS"; result?: ReportSyncResult }
    | { type: "SYNC_FAILURE"; error: ReportSyncError };

const reportsMachine = setup({
    types: {
        context: {} as {
            storage: UserStorage;
            reports: Report[];
            activeReportId: string | undefined;
            progress: number;
        },
        events: {} as ReportsEvent,
        input: {} as { storage: UserStorage },
    },
    actions: {
        setReports: assign({
            reports: ({ context, event }) => {
                if (event.type !== "LOADED") {
                    return context.reports;
                }
                return context.reports.concat(event.reports);
            },
        }),
        setReport: assign({
            reports: ({ context, event }) => {
                if (event.type !== "ADD") {
                    return context.reports;
                }
                return context.reports.concat(event.report);
            },
        }),
        setActiveReportId: assign({
            activeReportId: ({ context }) => getNextReportToSync(context.reports)?.id,
        }),
        resetActiveReportId: assign({
            activeReportId: undefined,
        }),
        setProgress: assign({
            progress: ({ context, event }) => {
                if (event.type !== "SYNC_PROGRESS") {
                    return context.progress;
                }
                return event.progress;
            },
        }),
        resetProgress: assign({
            progress: 0,
        }),
        setPendingStatus: assign({
            reports: ({ context, event }) => {
                if (event.type !== "RETRY") {
                    return context.reports;
                }

                return context.reports.map((report) => {
                    if (report.id !== event.reportId) {
                        return report;
                    }
                    let updatedReport: Report;
                    if (report.status === "failure") {
                        const { error, ...reportWithoutError } = report;
                        updatedReport = { ...reportWithoutError, status: "pending" };
                    } else {
                        updatedReport = { ...report, status: "pending" };
                    }
                    return updatedReport;
                });
            },
        }),
        setLoadingStatus: assign({
            reports: ({ context }) =>
                context.reports.map((report) => {
                    if (report.id !== context.activeReportId) {
                        return report;
                    }
                    const updatedReport: Report = { ...report, status: "loading" };
                    return updatedReport;
                }),
        }),
        setSuccessResult: assign({
            reports: ({ context, event }) => {
                if (event.type !== "SYNC_SUCCESS") {
                    return context.reports;
                }

                return context.reports.map((report) => {
                    if (report.id !== context.activeReportId) {
                        return report;
                    }

                    const updatedReport: Report = { ...report, status: "success", result: event.result };
                    return updatedReport;
                });
            },
        }),
        setFailureResult: assign({
            reports: ({ context, event }) => {
                if (event.type !== "SYNC_FAILURE") {
                    return context.reports;
                }

                return context.reports.map((report) => {
                    if (report.id !== context.activeReportId) {
                        return report;
                    }

                    const updatedReport: Report = { ...report, status: "failure", error: event.error };
                    return updatedReport;
                });
            },
        }),
        saveReports: ({ context }) => {
            context.storage.setReports(context.reports);
        },
        updateLinkedReports: assign({
            reports: ({ context }) => {
                if (!context.activeReportId) {
                    return context.reports;
                }

                return getUpdatedLinkedReports(context.reports, context.activeReportId);
            },
        }),
        updatePermits: ({ context }) => {
            const report = context.reports.find((report) => report.id === context.activeReportId);

            if (report?.edits[0]?.id !== FeatureLayer.LimitedHuntReport) {
                return;
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.permits });
        },
    },
    guards: {
        isReportPending: ({ context }) => getNextReportToSync(context.reports) !== undefined,
    },
    actors: {
        load: fromCallback(
            ({ sendBack, input }: { sendBack: (event: ReportsEvent) => void; input: { storage: UserStorage } }) => {
                try {
                    const reports: Report[] = input.storage.getReports() ?? [];
                    if (!reports.length) {
                        sendBack({ type: "LOADED", reports });
                        return;
                    }
                    const result = processReports(reports);

                    if (result.expiredReports.length > 0) {
                        logger.log("Expired reports", result.expiredReports);
                    }

                    sendBack({ type: "LOADED", reports: result.validReports });
                } catch (error) {
                    logger.error("Failed to load reports", error);
                    sendBack({ type: "LOADED", reports: [] });
                }
            }
        ),
        sync: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: ReportsEvent) => void;
                input: { reports: Report[]; activeReportId?: string };
            }) => {
                const report = input.reports.find((report) => report.id === input.activeReportId);
                if (!report) {
                    logger.error("No report found for activeReportId: " + input.activeReportId);
                    sendBack({ type: "SYNC_FAILURE", error: { type: "other" } });
                    return;
                }

                api.postReport(report, (progress) => {
                    sendBack({ type: "SYNC_PROGRESS", progress });
                })
                    .then((result) => {
                        if (result.success) {
                            sendBack({ type: "SYNC_SUCCESS", result: result.result });
                        } else {
                            logger.error("Failed to sync report", result);
                            sendBack({ type: "SYNC_FAILURE", error: result.error });
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to sync report", error);
                        sendBack({ type: "SYNC_FAILURE", error: { type: "other" } });
                    });
            }
        ),
    },
}).createMachine({
    id: "reports",
    context: ({ input }) => ({ storage: input.storage, reports: [], progress: 0, activeReportId: undefined }),
    on: {
        ADD: { actions: ["setReport", "saveReports"] },
        RETRY: { actions: ["setPendingStatus", "saveReports"] },
    },
    initial: "loading",
    states: {
        loading: {
            invoke: {
                src: "load",
                input: ({ context }) => ({ storage: context.storage }),
            },
            on: {
                LOADED: { target: "idle", actions: ["setReports"] },
            },
        },
        idle: {
            always: { target: "syncing", guard: "isReportPending" },
        },
        syncing: {
            entry: ["setActiveReportId"],
            initial: "verifyingNetworkConnection",
            states: {
                verifyingNetworkConnection: {
                    invoke: { src: networkStatusMachine },
                    on: {
                        NETWORK_AVAILABLE: "syncing",
                        NETWORK_UNAVAILABLE: "waitingForNetworkConnection",
                    },
                },
                waitingForNetworkConnection: {
                    invoke: { src: networkStatusMachine },
                    on: {
                        NETWORK_AVAILABLE: "syncing",
                    },
                },
                syncing: {
                    entry: ["setLoadingStatus", "saveReports"],
                    invoke: {
                        src: "sync",
                        input: ({ context }) => ({ reports: context.reports, activeReportId: context.activeReportId }),
                    },
                    on: {
                        SYNC_PROGRESS: { actions: ["setProgress"] },
                        SYNC_SUCCESS: {
                            target: "#reports.idle",
                            actions: [
                                "setSuccessResult",
                                "updateLinkedReports",
                                "saveReports",
                                "updatePermits",
                                "resetActiveReportId",
                                "resetProgress",
                            ],
                        },
                        SYNC_FAILURE: {
                            target: "#reports.idle",
                            actions: ["setFailureResult", "saveReports", "resetActiveReportId", "resetProgress"],
                        },
                    },
                },
            },
        },
    },
});

function getNextReportToSync(reports: Report[]): Report | undefined {
    return reports.find((report) => {
        // Report has to be pending
        if (report.status !== "pending") {
            return false;
        }

        // Non-limited hunt reports can be synced immediately
        if (report.edits[0].id !== FeatureLayer.LimitedHuntReport) {
            return true;
        }

        // Original reports can be synced immediately
        if (report.edits[0].adds[0].attributes.huntTypeId === HuntedTypeId.Injured) {
            return true;
        }

        // Linked reports can be synced if the original report has been synced successfully
        const permitId = report.edits[0].adds[0].attributes.permitId;
        const hasPendingOriginalReport = reports.some(
            (report) =>
                report.status !== "success" &&
                report.edits[0].id === FeatureLayer.LimitedHuntReport &&
                report.edits[0].adds[0].attributes.huntTypeId === HuntedTypeId.Injured &&
                report.edits[0].adds[0].attributes.permitId === permitId
        );
        return !hasPendingOriginalReport;
    });
}

function getUpdatedLinkedReports(reports: Report[], activeReportId: string): Report[] {
    const activeReport = reports.find((report) => report.id === activeReportId);

    // Active report must be synced successfully
    if (activeReport?.status !== "success") {
        return reports;
    }

    // Only limited hunt reports can have linked reports (reports that must be synced after the active report)
    if (activeReport.edits[0].id !== FeatureLayer.LimitedHuntReport) {
        return reports;
    }

    // Active report must be a new report, not an update
    if (!activeReport.edits[0].adds[0].attributes.permitId) {
        return reports;
    }

    // Active report must have a result
    if (!activeReport.result || !activeReport.result.permitId || !activeReport.result.reportId) {
        return reports;
    }

    const activeReportGuid = activeReport.edits[0].adds[0].attributes.reportGuid;
    const permitId = activeReport.result.permitId;
    const reportId = activeReport.result.reportId;

    return reports.map((report) => {
        // Linked report must be of the same type
        if (report.edits[0].id !== FeatureLayer.LimitedHuntReport) {
            return report;
        }

        // Linked report must have the same report guid as the active report
        if (report.edits[0].adds[0].attributes.reportGuid !== activeReportGuid) {
            return report;
        }

        // Set the new permit id and report id on which the update is based
        const updatedReport: Report = {
            ...report,
            edits: [
                {
                    ...report.edits[0],
                    adds: [
                        {
                            ...report.edits[0].adds[0],
                            attributes: {
                                ...report.edits[0].adds[0].attributes,
                                permitId,
                                reportId,
                            },
                        },
                    ],
                },
            ],
        };

        return updatedReport;
    });
}
