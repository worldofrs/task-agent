Deploy the application to Google Cloud Run.

Steps:
1. Run the test suite with `npm test` and make sure all tests pass
2. Build the Docker image: `docker build -t task-agent .`
3. Tag it for Artifact Registry: `docker tag task-agent us-central1-docker.pkg.dev/$PROJECT_ID/task-agent/task-agent:latest`
4. Push: `docker push us-central1-docker.pkg.dev/$PROJECT_ID/task-agent/task-agent:latest`
5. Deploy: `gcloud run deploy task-agent --image us-central1-docker.pkg.dev/$PROJECT_ID/task-agent/task-agent:latest --region us-central1 --platform managed --allow-unauthenticated`

If any step fails, stop and explain what went wrong.
