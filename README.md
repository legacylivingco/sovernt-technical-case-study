# SovernT

## Application architecture, production delivery, and AI-assisted development

**Patrick Brown** · [LinkedIn](https://www.linkedin.com/in/patrickbrowna/) · [Legacy Living Co. on GitHub](https://github.com/legacylivingco)

SovernT is a production web application that brings together business onboarding, account relationships, permissions, and commerce operations. This portfolio explains selected engineering decisions behind it through small, sanitized code examples.

My role was to turn business requirements into concrete application behavior, direct AI-assisted implementation, evaluate tradeoffs, validate workflows, and oversee releases. I used ChatGPT for planning, technical discussion, and review, and Cursor for much of the implementation. The examples here show the systems I helped define and deliver; they are not a claim that I personally wrote every line of code.

The application uses Next.js, React, TypeScript, Better Auth, PostgreSQL on Neon, Drizzle ORM, Vitest, and Vercel.

## Start here

The most useful examples cover three questions:

- How do you determine what someone may do when one login can represent several business relationships?
- How do you make invitation-based registration reliable without confusing checkout confirmation with account activation?
- How do you validate changes while keeping test and Preview activity away from Production data?

### 1. Separate identity from permission

A signed-in user may be a customer, a business owner, or an administrator. Business capabilities belong to accounts, while access depends on memberships and the operation being attempted. A single role attached to a login would not capture those relationships.

The design separates session identity from authorization. Server services load the relevant account context and enforce explicit permission checks. Administrative access also requires verified email and MFA verification on the current session. Hiding a button is only a presentation choice; authorization happens on the server.

Another distinction is between reading an inactive business account and performing new operations on it. Keeping those permissions separate supports investigation and support without allowing an inactive account to continue transacting.

Explore [the authorization design](architecture/authorization.md), [session versus authorization](code-examples/01-session-vs-authorization.ts), and [safe post-login destinations](code-examples/02-safe-next-path.ts).

### 2. Make onboarding resilient to real user behavior

Business onboarding follows an invitation, validates a storefront identifier, directs the applicant to an external subscription checkout, and leaves the resulting account pending administrative activation.

Each step has a different responsibility. Form validation gives useful feedback; database constraints provide the final uniqueness checks. Retried submissions must return the original result rather than create duplicate accounts. A repeated request with conflicting information must be rejected.

The checkout step has an explicit limitation: an applicant's confirmation is not processor-verified payment. Registration does not activate the account. Keeping that distinction visible avoids promising a payment integration the application does not have.

Explore [storefront validation](code-examples/03-storefront-slug.ts), [checkout gating](code-examples/04-checkout-gating.ts), and [an illustrative idempotent write](code-examples/11-idempotent-write.ts). The idempotency example demonstrates replay behavior; it does not reproduce the application's database locking implementation.

### 3. Put data integrity and environment isolation into the design

Important account rules should survive concurrent requests and future application changes. The data model uses database constraints to enforce membership relationships rather than relying entirely on form checks.

Development, Preview, Production, and integration testing have distinct database responsibilities. The integration-test harness requires an explicitly configured test database and refuses an unexpected branch instead of falling back to the application's connection. Preview connection handling addresses serverless pooling separately.

This separation makes validation more deliberate: automated checks exercise defined behavior, Preview supports user-facing review, and Production release remains an explicit decision.

Explore [the architecture overview](architecture/overview.md), [membership constraints](code-examples/06-membership-constraints.ts), [Preview connection handling](code-examples/09-preview-pooler.ts), and [the illustrative test-database guard](code-examples/10-test-branch-guard.ts).

## CI/CD and layered security

GitHub Actions runs tests, typechecking, linting, and a build on pull requests targeting `main` and pushes to `main`. A separate security workflow runs dependency auditing, Semgrep source scanning, and Gitleaks secret scanning. The CI build uses placeholder environment values rather than Production credentials.

Socket integrates directly with GitHub. The active default-branch ruleset requires **Socket Security: Pull Request Alerts** alongside the build/test check, dependency audit, Semgrep, and Gitleaks. It requires a pull request, resolved review conversations, and an up-to-date branch before merging, with no configured bypass actors. Socket is therefore part of the enforced merge gate, rather than simply an informational report.

Vercel provides Preview and Production environments, with separate database environments supporting validation before release. The GitHub merge gate and Vercel deployment controls are distinct: required checks on `main` do not by themselves prevent a direct CLI deployment or promotion. Production deployment remains a separately approved step in my working process.

See [delivery and security architecture](architecture/delivery-and-security.md) for the checks, merge requirements, and deployment boundaries.

## An additional example: preserve an order's history

Commerce records need to remain understandable after account relationships or catalog information change. The application snapshots relevant order information, limits financial edits after purchase is recorded, and represents adjustments without silently rewriting completed payment history.

The portfolio demonstrates those patterns without exposing pricing formulas, supplier information, or commercial terms. See [the commerce design](architecture/commerce.md), [order edit policy](code-examples/07-order-edit-policy.ts), and [illustrative payment relationships](code-examples/08-payment-hops.ts).

## How I work with AI

I use a coordinated workflow in which I remain responsible for requirements and approvals:

1. I discuss the problem, constraints, and acceptance criteria with ChatGPT.
2. ChatGPT dispatches a scoped task to Cursor through its Cloud Agents API.
3. Cursor inspects the repository or implements approved work and returns its results.
4. ChatGPT retrieves the results, reviews the evidence, and summarizes the outcome and unresolved questions.
5. I decide whether to approve changes and any subsequent release.

The API handoff removes the need to carry long prompts and execution reports between chat windows. The approval boundaries are part of how I direct the work; the API itself does not guarantee that an agent cannot make changes.

I ask for evidence appropriate to the task: inspected source, diffs, test results, Preview behavior, and release verification. An agent's completion message is a starting point for review. It is not sufficient evidence on its own.

## Reading and running the examples

Files distinguish between **sanitized application excerpts** and **simplified illustrative examples**. Illustrative examples explain a design concept with a smaller surface and fictional data. They are not presented as exact Production source.

The [example tests](tests/README.md) cover redirect validation, storefront identifiers, checkout gating, and order edit policy. They run locally without a database and are separate from the application's Production test suite. Passing them establishes behavior for these examples, not a security certification or full-system verification.

This portfolio excludes customer data, credentials, live infrastructure identifiers, commercial formulas, and the application's Git history. It presents selected design patterns rather than distributing the complete application.
