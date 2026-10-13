// packages/project-core/src/index.ts
/**
 * Appends a command to the project's command log and returns a sequence identifier.
 * In a real implementation, this would write to an append-only log.
 * For this placeholder, we generate a unique sequence ID based on projectId and timestamp.
 * @param projectId - The ID of the project.
 * @param command - The command object to append.
 * @returns A string representing the sequence identifier.
 */
export function appendCommand(projectId: string, command: any): string {
  // In a real system, we would write to a log and return the log position or a monotonically increasing ID.
  // Here we simulate by using a timestamp and a random component to ensure uniqueness.
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${projectId}-${timestamp}-${random}`;
}

/**
 * Creates a snapshot of the project state and returns a snapshot reference.
 * In a real implementation, this would serialize the project state and store it.
 * @param projectId - The ID of the project.
 * @param payload - The project state to snapshot.
 * @returns A string representing the snapshot reference.
 */
export function snapshotProject(projectId: string, payload: any): string {
  const timestamp = Date.now();
  return `${projectId}-snapshot-${timestamp}`;
}

/**
 * Recovers a project from a snapshot reference.
 * In a real implementation, this would deserialize the snapshot and restore the project state.
 * @param snapshotRef - The snapshot reference returned by snapshotProject.
 * @returns An object representing the recovered project state, with a snapshotRef and a recovered flag.
 */
export function recoverFromSnapshot(snapshotRef: string): {snapshotRef: string; recovered: boolean} {
  return {
    snapshotRef,
    recovered: true
  };
}