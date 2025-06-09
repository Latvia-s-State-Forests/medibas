import { ConsoleTransport } from "./console-transport";
import { DatabaseTransport } from "./database-transport";
import { ILogger, LoggerMessage } from "./types";

export class Logger implements ILogger {
    private consoleTransport: ConsoleTransport;
    private databaseTransport: DatabaseTransport;

    constructor() {
        this.consoleTransport = new ConsoleTransport();
        this.databaseTransport = new DatabaseTransport();
    }

    log(message: unknown, ...params: unknown[]) {
        const loggerMessage: LoggerMessage = {
            level: "LOG",
            date: new Date().toISOString(),
            params: [message, ...params],
        };
        this.consoleTransport.send(loggerMessage);
        this.databaseTransport.send(loggerMessage);
    }

    error(message: unknown, ...params: unknown[]) {
        const loggerMessage: LoggerMessage = {
            level: "ERROR",
            date: new Date().toISOString(),
            params: [message, ...params],
        };
        this.consoleTransport.send(loggerMessage);
        this.databaseTransport.send(loggerMessage);
    }

    share() {
        return this.databaseTransport.share();
    }
}
