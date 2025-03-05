export interface LoggerMessage {
    level: "LOG" | "ERROR";
    date: Date;
    params: unknown[];
}

export interface LoggerTransport {
    send(message: LoggerMessage): void;
}

export interface ILogger {
    log(message: unknown, ...params: unknown[]): void;
    error(message: unknown, ...params: unknown[]): void;
}
