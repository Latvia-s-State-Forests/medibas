import { InterpreterFrom } from "xstate";
import { z } from "zod";
import { authenticationMachine } from "../machines/authentication-machine";

export const sessionMethodSchema = z.enum(["login", "register"]);

export type SessionMethod = z.infer<typeof sessionMethodSchema>;

export const sessionSchema = z.object({
    method: sessionMethodSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type Session = z.infer<typeof sessionSchema>;

export const pendingSessionSchema = z.object({
    method: sessionMethodSchema,
    timestamp: z.number(),
    codeVerifier: z.string(),
});

export const accountDeletionSchema = z.object({
    status: z.string(),
});

export type PendingSession = z.infer<typeof pendingSessionSchema>;

export type AuthenticationService = InterpreterFrom<typeof authenticationMachine>;
