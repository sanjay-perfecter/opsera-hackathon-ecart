# Stripe CLI official image (pinned — fixes hadolint DL3007)
FROM stripe/stripe-cli:v1.21.8

# Default working directory
WORKDIR /stripe

# Environment variables (override in docker-compose or docker run)
ENV STRIPE_API_KEY=""
ENV FORWARD_URL="http://host.docker.internal:5005/api/payments/webhook"

# Run as non-root (fixes checkov CKV_DOCKER_3)
USER 1000:1000

# Start Stripe webhook listener
ENTRYPOINT ["sh", "-c"]
CMD ["stripe listen --api-key $STRIPE_API_KEY --forward-to $FORWARD_URL"]
