# Delivery and security

This note describes the application repository's configured checks and the release process. The portfolio itself does not include a deployment workflow or live infrastructure configuration.

## GitHub verification

Pull requests targeting `main` and pushes to `main` run GitHub Actions for tests, typechecking, linting, and a build. The build uses placeholder environment values rather than Production credentials. Separate security jobs run dependency auditing, Semgrep OSS source scanning, and Gitleaks secret scanning.

Socket is a GitHub integration rather than a step in the Actions workflow. The active default-branch ruleset requires **Socket Security: Pull Request Alerts**, the test/typecheck/lint/build check, Dependency audit, Semgrep, and Gitleaks. It requires pull requests, resolved review conversations, and branches up to date before merging. No bypass actors were configured when inspected on November 3, 2026. A successful Socket Project Report is a different check from the required Pull Request Alerts check.

These tools inspect different aspects of a change. Their presence and successful results do not establish that an application has no vulnerabilities.

## Preview and Production

Vercel provides Preview and Production environments. Separate Neon database branches support development, Preview, Production, and integration testing. The dedicated integration-test branch guard prevents an unconfigured test run from silently falling back to the application's database connection.

The working release process includes reviewing changes, automated validation, Preview testing, explicit release approval, and post-release verification. GitHub's merge checks govern merges into the default branch. They do not independently prevent direct Vercel CLI deployments or deployment promotions. Vercel's current deployment restrictions and automatic deployment triggers still need a separate review before claiming an enforced end-to-end deployment gate.

## Reviewing AI-generated changes

Tasks specify scope, acceptance criteria, and permitted actions. Execution results are retrieved for review, then summarized for a human decision. Approval is a workflow boundary, not a capability restriction inherent in the agent API. A complete implementation-and-approval demonstration remains a prerequisite for externally sharing the portfolio's full AI development workflow description.
