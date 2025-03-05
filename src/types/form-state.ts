import { DamageState } from "./damage";
import { LimitedPreyState, UnlimitedPreyState } from "./hunt";
import { RootNavigatorParams } from "./navigation";
import { ObservationsState } from "./observations";

export type FormState = { timestamp: number } & (
    | { type: "observations"; state: ObservationsState }
    | { type: "damages"; state: DamageState }
    | { type: "limited-prey"; state: LimitedPreyState; params: RootNavigatorParams["LimitedPreyScreen"] }
    | { type: "unlimited-prey"; state: UnlimitedPreyState; params: RootNavigatorParams["UnlimitedPreyScreen"] }
);
