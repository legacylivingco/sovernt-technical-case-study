/**
 * Label: Simplified illustrative example
 *
 * Integration tests must use a dedicated database branch. They never fall
 * back to DATABASE_URL. Real branch IDs from production tooling are omitted.
 */

export const integrationTestBranchId = "br-example-test";
const developmentBranchId = "br-example-development";

export function integrationTestDatabaseUrl(env: Record<string, string | undefined>): string | undefined {
  return env.TEST_DATABASE_URL;
}

export function assertIntegrationTestBranch(branchId: string): void {
  if (branchId === developmentBranchId) {
    throw new Error("Refusing integration tests against the Development branch.");
  }
  if (branchId !== integrationTestBranchId) {
    throw new Error(
      "Refusing integration tests because the database branch is not the dedicated test branch.",
    );
  }
}
