#!/bin/bash
set -e

echo "Waiting for Kafka..."

until /bin/kafka-topics --bootstrap-server kafka:29092 --list >/dev/null 2>&1; do
  sleep 2
done

echo "Creating topic..."

/bin/kafka-topics --bootstrap-server kafka:29092 \
  --create \
  --if-not-exists \
  --topic user-notifs \
  --partitions 1 \
  --replication-factor 1

echo "Done."