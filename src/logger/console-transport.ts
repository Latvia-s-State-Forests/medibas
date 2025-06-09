import { LoggerTransport, LoggerMessage } from "./types";

export class ConsoleTransport implements LoggerTransport {
    send(message: LoggerMessage): void {
        if (message.level === "LOG") {
            console.log(...message.params);
        } else {
            console.error(...message.params);
        }
    }
}
