import { addDays, startOfDay } from "date-fns";
import { Directory, File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { SQLiteDatabase, openDatabaseSync } from "expo-sqlite";
import { LoggerMessage, LoggerTransport } from "./types";

export class DatabaseTransport implements LoggerTransport {
    private db: SQLiteDatabase;
    private retentionDays: number;
    private temporaryDirectory: Directory;

    constructor() {
        this.retentionDays = 90;
        this.temporaryDirectory = new Directory(Paths.cache, "temporary_logs");
        this.db = openDatabaseSync("logs.db");
        this.db.execSync(
            `
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY NOT NULL,
                date TEXT NOT NULL,
                level TEXT NOT NULL,
                message TEXT NOT NULL
            );
            `
        );
        this.cleanup();
    }

    send(loggerMessage: LoggerMessage) {
        const message = this.formatMessage(loggerMessage);
        this.db
            .runAsync("INSERT INTO logs (date,level,message) VALUES (?,?,?)", [
                loggerMessage.date,
                loggerMessage.level,
                message,
            ])
            .catch((error) => {
                console.error("Failed to persist logger message", loggerMessage, error);
            });
    }

    private formatMessage(message: LoggerMessage): string {
        const parts: unknown[] = [];
        for (const param of message.params) {
            if (typeof param === "string" || typeof param === "number" || typeof param === "boolean") {
                parts.push(param);
            } else if (param instanceof Error) {
                parts.push(param.message);
            } else {
                parts.push(JSON.stringify(param));
            }
        }
        return parts.join(" ");
    }

    async share() {
        if (!this.temporaryDirectory.exists) {
            this.temporaryDirectory.create();
        }

        const temporaryFile = new File(this.temporaryDirectory, `mednis_${new Date().getTime()}.log`);
        temporaryFile.create();

        const logs = await this.db.getAllAsync<{ date: string; level: string; message: string }>(
            "SELECT date, level, message FROM logs ORDER BY date ASC"
        );

        const content = logs.map((log) => `${log.date} | ${log.level} | ${log.message}`).join("\n");

        temporaryFile.write(content);

        await Sharing.shareAsync(temporaryFile.uri, { dialogTitle: "Mednis atkļūdošanas informācija" });
    }

    private cleanup() {
        const currentDate = startOfDay(new Date());
        const expiryDate = addDays(currentDate, this.retentionDays * -1).toISOString();
        this.db.runAsync("DELETE FROM logs where date < ?", [expiryDate]).catch((error) => {
            console.error("Failed to delete expired logs from database", error);
        });
        if (this.temporaryDirectory.exists) {
            try {
                this.temporaryDirectory.delete();
            } catch (error) {
                console.error("Failed to delete temporary log files", error);
            }
        }
    }
}
