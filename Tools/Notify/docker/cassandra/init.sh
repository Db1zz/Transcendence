#!/bin/bash

echo "Waiting for Cassandra to start..."

until cqlsh cassandra 9042 -e "describe keyspaces"; do
  echo "Cassandra not ready yet..."
  sleep 2
done

echo "Running schema script..."
cqlsh cassandra 9042 -f /cassandra/schema.cql

echo "Schema initialized"