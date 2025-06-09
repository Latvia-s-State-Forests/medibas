export interface LoggerMessage {
    level: "LOG" | "ERROR";
    date: string;
    params: unknown[];
}

export interface LoggerTransport {
    send(message: LoggerMessage): void;
}

export interface ILogger {
    log(message: unknown, ...params: unknown[]): void;
    error(message: unknown, ...params: unknown[]): void;
}
