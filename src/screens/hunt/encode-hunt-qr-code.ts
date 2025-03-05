import { Buffer } from "buffer";
import { z } from "zod";

const huntQrCodeDataSchema = z.object({
    huntId: z.number(),
    vmdCode: z.string(),
    districts: z.array(
        z.object({
            id: z.number(),
            descriptionLv: z.string(),
        })
    ),
    plannedFrom: z.string(),
    eventGuid: z.string(),
});
type HuntQrCodeData = z.infer<typeof huntQrCodeDataSchema>;

// TODO migrate to this function
export function encodeHuntQrCode(data: HuntQrCodeData): string {
    const jsonValue = JSON.stringify(data);
    const result = Buffer.from(jsonValue).toString("base64");
    return result;
}

export function decodeHuntQrCode(huntQrCode: string): HuntQrCodeData {
    const decodedValue = Buffer.from(huntQrCode, "base64").toString("utf-8");
    const jsonValue = JSON.parse(decodedValue);
    const result = huntQrCodeDataSchema.parse(jsonValue);
    return result;
}
