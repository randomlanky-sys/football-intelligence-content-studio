import { z } from 'zod';
/**
 * Project schema for football intelligence & content studio.
 */
export declare const projectSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    name: z.ZodString;
    state: z.ZodEnum<["draft", "active", "archived", "completed"]>;
    schemaVer: z.ZodDefault<z.ZodNumber>;
    settings: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    ownerId: string;
    name: string;
    state: "draft" | "active" | "archived" | "completed";
    schemaVer: number;
    settings: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    rev: number;
}, {
    id: string;
    ownerId: string;
    name: string;
    state: "draft" | "active" | "archived" | "completed";
    createdAt: string;
    updatedAt: string;
    schemaVer?: number | undefined;
    settings?: Record<string, unknown> | undefined;
    rev?: number | undefined;
}>;
/**
 * Media asset schema.
 */
export declare const mediaSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    kind: z.ZodEnum<["video", "audio", "image"]>;
    fingerprint: z.ZodString;
    durationUs: z.ZodNumber;
    timescale: z.ZodNumber;
    availability: z.ZodDefault<z.ZodEnum<["local", "cloud", "proxy"]>>;
    storageMode: z.ZodDefault<z.ZodEnum<["local_handle", "opfs", "cloud"]>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    projectId: string;
    kind: "video" | "audio" | "image";
    fingerprint: string;
    durationUs: number;
    timescale: number;
    availability: "local" | "cloud" | "proxy";
    storageMode: "cloud" | "local_handle" | "opfs";
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    kind: "video" | "audio" | "image";
    fingerprint: string;
    durationUs: number;
    timescale: number;
    rev?: number | undefined;
    availability?: "local" | "cloud" | "proxy" | undefined;
    storageMode?: "cloud" | "local_handle" | "opfs" | undefined;
}>;
/**
 * Match schema.
 */
export declare const matchSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    competitionId: z.ZodNullable<z.ZodString>;
    date: z.ZodString;
    periodConfig: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    projectId: string;
    competitionId: string | null;
    periodConfig: Record<string, unknown>;
}, {
    id: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    competitionId: string | null;
    periodConfig: Record<string, unknown>;
    rev?: number | undefined;
}>;
/**
 * Team schema.
 */
export declare const teamSchema: z.ZodObject<{
    id: z.ZodString;
    matchId: z.ZodString;
    name: z.ZodString;
    identityState: z.ZodEnum<["home", "away"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    matchId: string;
    identityState: "home" | "away";
}, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    matchId: string;
    identityState: "home" | "away";
    rev?: number | undefined;
}>;
/**
 * Player schema.
 */
export declare const playerSchema: z.ZodObject<{
    id: z.ZodString;
    teamId: z.ZodString;
    name: z.ZodString;
    number: z.ZodNullable<z.ZodNumber>;
    identityState: z.ZodEnum<["starting", "substitute"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    number: number | null;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    identityState: "starting" | "substitute";
    teamId: string;
}, {
    number: number | null;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    identityState: "starting" | "substitute";
    teamId: string;
    rev?: number | undefined;
}>;
/**
 * Competition schema.
 */
export declare const competitionSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    name: z.ZodString;
    dateRange: z.ZodNullable<z.ZodString>;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    projectId: string;
    dateRange: string | null;
    config: Record<string, unknown>;
}, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    dateRange: string | null;
    rev?: number | undefined;
    config?: Record<string, unknown> | undefined;
}>;
/**
 * Event schema for match events.
 */
export declare const eventSchema: z.ZodObject<{
    id: z.ZodString;
    matchId: z.ZodString;
    type: z.ZodString;
    matchClock: z.ZodNumber;
    tUs: z.ZodNumber;
    pitchX: z.ZodNullable<z.ZodNumber>;
    pitchY: z.ZodNullable<z.ZodNumber>;
    source: z.ZodEnum<["import", "human", "ai"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    matchId: string;
    matchClock: number;
    tUs: number;
    pitchX: number | null;
    pitchY: number | null;
    source: "import" | "human" | "ai";
}, {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    matchId: string;
    matchClock: number;
    tUs: number;
    pitchX: number | null;
    pitchY: number | null;
    source: "import" | "human" | "ai";
    rev?: number | undefined;
}>;
/**
 * Clip schema.
 */
export declare const clipSchema: z.ZodObject<{
    id: z.ZodString;
    assetId: z.ZodString;
    inUs: z.ZodNumber;
    outUs: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    rev: number;
    assetId: string;
    inUs: number;
    outUs: number;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    assetId: string;
    inUs: number;
    outUs: number;
    rev?: number | undefined;
}>;
/**
 * Insight schema.
 */
export declare const insightSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    claim: z.ZodString;
    status: z.ZodEnum<["draft", "review", "approved", "rejected", "stale"]>;
    evidenceHash: z.ZodNullable<z.ZodString>;
    limitations: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    rev: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "draft" | "review" | "approved" | "rejected" | "stale";
    createdAt: string;
    updatedAt: string;
    rev: number;
    projectId: string;
    claim: string;
    evidenceHash: string | null;
    limitations: string | null;
}, {
    id: string;
    status: "draft" | "review" | "approved" | "rejected" | "stale";
    createdAt: string;
    updatedAt: string;
    projectId: string;
    claim: string;
    evidenceHash: string | null;
    limitations: string | null;
    rev?: number | undefined;
}>;
export declare const schemas: {
    project: z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        name: z.ZodString;
        state: z.ZodEnum<["draft", "active", "archived", "completed"]>;
        schemaVer: z.ZodDefault<z.ZodNumber>;
        settings: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        ownerId: string;
        name: string;
        state: "draft" | "active" | "archived" | "completed";
        schemaVer: number;
        settings: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
        rev: number;
    }, {
        id: string;
        ownerId: string;
        name: string;
        state: "draft" | "active" | "archived" | "completed";
        createdAt: string;
        updatedAt: string;
        schemaVer?: number | undefined;
        settings?: Record<string, unknown> | undefined;
        rev?: number | undefined;
    }>;
    media: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        kind: z.ZodEnum<["video", "audio", "image"]>;
        fingerprint: z.ZodString;
        durationUs: z.ZodNumber;
        timescale: z.ZodNumber;
        availability: z.ZodDefault<z.ZodEnum<["local", "cloud", "proxy"]>>;
        storageMode: z.ZodDefault<z.ZodEnum<["local_handle", "opfs", "cloud"]>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        projectId: string;
        kind: "video" | "audio" | "image";
        fingerprint: string;
        durationUs: number;
        timescale: number;
        availability: "local" | "cloud" | "proxy";
        storageMode: "cloud" | "local_handle" | "opfs";
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        projectId: string;
        kind: "video" | "audio" | "image";
        fingerprint: string;
        durationUs: number;
        timescale: number;
        rev?: number | undefined;
        availability?: "local" | "cloud" | "proxy" | undefined;
        storageMode?: "cloud" | "local_handle" | "opfs" | undefined;
    }>;
    match: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        competitionId: z.ZodNullable<z.ZodString>;
        date: z.ZodString;
        periodConfig: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        date: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        projectId: string;
        competitionId: string | null;
        periodConfig: Record<string, unknown>;
    }, {
        id: string;
        date: string;
        createdAt: string;
        updatedAt: string;
        projectId: string;
        competitionId: string | null;
        periodConfig: Record<string, unknown>;
        rev?: number | undefined;
    }>;
    team: z.ZodObject<{
        id: z.ZodString;
        matchId: z.ZodString;
        name: z.ZodString;
        identityState: z.ZodEnum<["home", "away"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        matchId: string;
        identityState: "home" | "away";
    }, {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        matchId: string;
        identityState: "home" | "away";
        rev?: number | undefined;
    }>;
    player: z.ZodObject<{
        id: z.ZodString;
        teamId: z.ZodString;
        name: z.ZodString;
        number: z.ZodNullable<z.ZodNumber>;
        identityState: z.ZodEnum<["starting", "substitute"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        number: number | null;
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        identityState: "starting" | "substitute";
        teamId: string;
    }, {
        number: number | null;
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        identityState: "starting" | "substitute";
        teamId: string;
        rev?: number | undefined;
    }>;
    competition: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        name: z.ZodString;
        dateRange: z.ZodNullable<z.ZodString>;
        config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        projectId: string;
        dateRange: string | null;
        config: Record<string, unknown>;
    }, {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        projectId: string;
        dateRange: string | null;
        rev?: number | undefined;
        config?: Record<string, unknown> | undefined;
    }>;
    event: z.ZodObject<{
        id: z.ZodString;
        matchId: z.ZodString;
        type: z.ZodString;
        matchClock: z.ZodNumber;
        tUs: z.ZodNumber;
        pitchX: z.ZodNullable<z.ZodNumber>;
        pitchY: z.ZodNullable<z.ZodNumber>;
        source: z.ZodEnum<["import", "human", "ai"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        matchId: string;
        matchClock: number;
        tUs: number;
        pitchX: number | null;
        pitchY: number | null;
        source: "import" | "human" | "ai";
    }, {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
        matchId: string;
        matchClock: number;
        tUs: number;
        pitchX: number | null;
        pitchY: number | null;
        source: "import" | "human" | "ai";
        rev?: number | undefined;
    }>;
    clip: z.ZodObject<{
        id: z.ZodString;
        assetId: z.ZodString;
        inUs: z.ZodNumber;
        outUs: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        rev: number;
        assetId: string;
        inUs: number;
        outUs: number;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        assetId: string;
        inUs: number;
        outUs: number;
        rev?: number | undefined;
    }>;
    insight: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        claim: z.ZodString;
        status: z.ZodEnum<["draft", "review", "approved", "rejected", "stale"]>;
        evidenceHash: z.ZodNullable<z.ZodString>;
        limitations: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        rev: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "draft" | "review" | "approved" | "rejected" | "stale";
        createdAt: string;
        updatedAt: string;
        rev: number;
        projectId: string;
        claim: string;
        evidenceHash: string | null;
        limitations: string | null;
    }, {
        id: string;
        status: "draft" | "review" | "approved" | "rejected" | "stale";
        createdAt: string;
        updatedAt: string;
        projectId: string;
        claim: string;
        evidenceHash: string | null;
        limitations: string | null;
        rev?: number | undefined;
    }>;
};
export type Project = z.infer<typeof projectSchema>;
export type MediaAsset = z.infer<typeof mediaSchema>;
export type Match = z.infer<typeof matchSchema>;
export type Team = z.infer<typeof teamSchema>;
export type Player = z.infer<typeof playerSchema>;
export type Competition = z.infer<typeof competitionSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Clip = z.infer<typeof clipSchema>;
export type Insight = z.infer<typeof insightSchema>;
//# sourceMappingURL=index.d.ts.map