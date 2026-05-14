---
description: Deploy the application to Google Cloud Run
allowed-tools: Bash
---

Deploy the application to Google Cloud Run.

Steps:
1. Run the test suite with `npm test` and make sure all tests pass
2. Build and push with Cloud Build: `gcloud builds submit --tag us-central1-docker.pkg.dev/task-agent-rs-2026/task-agent/task-agent:latest --project=task-agent-rs-2026`
3. Deploy: `gcloud run deploy task-agent --image=us-central1-docker.pkg.dev/task-agent-rs-2026/task-agent/task-agent:latest --region=us-central1 --project=task-agent-rs-2026 --platform=managed --allow-unauthenticated`

If any step fails, stop and explain what went wrong.
