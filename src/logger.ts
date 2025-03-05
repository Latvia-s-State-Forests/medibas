import * as Sharing from "expo-sharing";
import * as FileSystem from "react-native-fs";
import { ILogger, LoggerMessage, LoggerTransport } from "./types/logger";

class ConsoleLoggerTransport implements LoggerTransport {
    send(message: LoggerMessage): void {
        if (message.level === "LOG") {
            console.log(...message.params);
        } else {
            console.error(...message.params);
        }
    }
}

class FileLoggerTransport implements LoggerTransport {
    private filepath: string;
    private encoding: string;

    constructor() {
        this.filepath = FileSystem.DocumentDirectoryPath + "/logs.txt";
        this.encoding = "utf8";
    }

    send(message: LoggerMessage): void {
        const formattedMessage = this.formatMessage(message);
        FileSystem.appendFile(this.filepath, formattedMessage + "\n", this.encoding).catch((error) =>
            console.error("Failed to write to log file", error)
        );
    }

    async share() {
        const url = "file://" + this.filepath;
        const title = "Mednis atkļūdošanas informācija";
        await Sharing.shareAsync(url, { dialogTitle: title });
    }

    private formatMessage(message: LoggerMessage): string {
        const parts: unknown[] = [];
        parts.push(message.date.toISOString());
        parts.push(message.level);
        for (const param of message.params) {
            if (typeof param === "string" || typeof param === "number" || typeof param === "boolean") {
                parts.push(param);
            } else if (param instanceof Error) {
                parts.push(JSON.stringify(param, Object.getOwnPropertyNames(param)));
            } else {
                parts.push(JSON.stringify(param));
            }
        }
        return parts.join(" ");
    }
}

export class Logger implements ILogger {
    private transports: LoggerTransport[];

    constructor(transports: LoggerTransport[]) {
        this.transports = transports;
    }

    log(message: unknown, ...params: unknown[]) {
        const date = new Date();
        for (const transport of this.transports) {
            transport.send({
                level: "LOG",
                date,
                params: [message, ...params],
            });
        }
    }

    error(message: unknown, ...params: unknown[]) {
        const date = new Date();
        for (const transport of this.transports) {
            transport.send({
                level: "ERROR",
                date,
                params: [message, ...params],
            });
        }
    }
}

const consoleLoggerTransport = new ConsoleLoggerTransport();

export const fileLoggerTransport = new FileLoggerTransport();

export const logger = new Logger([consoleLoggerTransport, fileLoggerTransport]);
