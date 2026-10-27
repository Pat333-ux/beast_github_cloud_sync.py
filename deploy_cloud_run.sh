#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# BEAST System 3.0 - Cloud Run Deployment Script
# Target Service: https://beastsystem-70875693050.us-central1.run.app
# ==============================================================================

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-beast-system-511916}"
REGION="us-central1"
SERVICE_NAME="beastsystem"
REPOSITORY_NAME="beast-repo"
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${SERVICE_NAME}:${IMAGE_TAG}"

echo "=================================================="
echo "🚀 Deploying BEAST System 3.0 to Cloud Run"
echo "Project ID : ${PROJECT_ID}"
echo "Region     : ${REGION}"
echo "Service    : ${SERVICE_NAME}"
echo "Image URI  : ${IMAGE_URI}"
echo "=================================================="

# Ensure Google Cloud project is active
gcloud config set project "${PROJECT_ID}"

# Create Artifact Registry repository if it does not exist
if ! gcloud artifacts repositories describe "${REPOSITORY_NAME}" --location="${REGION}" >/dev/null 2>&1; then
  echo "📦 Creating Artifact Registry repository: ${REPOSITORY_NAME}"
  gcloud artifacts repositories create "${REPOSITORY_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="BEAST System 3.0 Container Repository"
fi

# Configure Docker credentials for GCP Artifact Registry
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Build Docker Container Image using Cloud Build
echo "🏗️ Building container image..."
gcloud builds submit --tag "${IMAGE_URI}" .

# Deploy Image to Cloud Run
echo "⚡ Deploying to Google Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_URI}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --cpu=1 \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="SERVICE_URL=https://beastsystem-70875693050.us-central1.run.app,GITHUB_OWNER=pat333-ux"

echo "=================================================="
echo "✅ Deployment complete!"
echo "Service URL: https://beastsystem-70875693050.us-central1.run.app"
echo "=================================================="
