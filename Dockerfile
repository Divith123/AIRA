# Build stage
FROM rustlang/rust:nightly-slim as builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev

WORKDIR /app

# Copy backend files (backend is in subdirectory)
# Note: Cargo.lock may not exist, so copy Cargo.toml first and generate lock
COPY backend/Cargo.toml ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN cargo generate-lockfile 2>/dev/null || true

# Now copy actual source code
COPY backend/src ./src
COPY backend/migrations ./migrations

# Build release binary
RUN cargo build --release

# Runtime stage
FROM ubuntu:24.04

RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/backend /app/backend
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8000
CMD ["./backend"]
