# Notify

![2026-04-09 08 50 12](https://github.com/user-attachments/assets/19c52c62-7a91-4157-934c-17ce536eac21)

## What is it?
**Notify** is a distributed, high-performance notification engine written entirely in **Rust**. Built for the **Anteiku.** ecosystem, it is engineered to handle thousands of concurrent notifications per second with sub-millisecond overhead.

The system is designed with a **cloud-native approach**, allowing you to scale individual components (Producers, Consumers, and Load Balancers) independently based on your traffic patterns.

## Third Party Packages
Notify uses many different third party packages to do it's thing, and these packages are maintained by third-parties and are **NOT** evaluated by the Notify developers.

## Requirements
- Rust / Cargo
- Docker
- Docker Compose

## Usage
Notify is configured via a single YAML file. Below is an example configuration optimized for **local development**:

```yaml
consumer:
  topic: "user-notifs"
  brokers: "localhost:9092"
  user_notifications_database_addr: "127.0.0.1:9042"
  notification_preferences_database_addr: "127.0.0.1:9042"
  clients_node_addr: "127.0.0.1:6969"
  metrics_receiver_addr: "127.0.0.1:6979"

load_balancer:
  load_balancer_addr: "0.0.0.0:8989"
  load_balancer_metrics_addr: "0.0.0.0:6979"

producer:
  producer_addr: "0.0.0.0:8992"
  topic: "user-notifs"
  brokers: "localhost:9092"
```

### VERY IMPORTANT NOTE
Currently, Notify expects a specific schema and table names to be present in your Cassandra instance.

Schema Initialization:
The project includes a schema.cql file and an init.sh script to automate this. If you are using Docker, you can set init.sh as your container's entrypoint or execute it manually:
```bash
# Example: Running the init script inside a docker container
docker exec -it <cassandra_container_name> cqlsh -f /path/to/schema.cql
```
## Configuration notes

- **brokers** should point to your Kafka broker.
- **user_notifications_database_addr** and **notification_preferences_database_addr** should point to Cassandra.
- **clients_node_addr** is used by the consumer-side node communication.
- **metrics_receiver_addr** and **load_balancer_metrics_addr** are the metrics endpoints.
- **producer_addr** is the address the producer service binds to.
- **load_balancer_addr** is the address the load balancer binds to.

## Local development

### Start the infrastructure first:

```bash
docker compose up -d
```

### Then run one of the services:
```bash

cargo run -- producer
cargo run -- consumer
cargo run -- load-balancer
```

### What each service does

- **Producer**

    The producer starts the notification entrypoint and sends messages to Kafka.

- **Consumer**

    The consumer listens to the configured Kafka topic and handles notification processing.

- **Load Balancer**

    The load balancer accepts incoming traffic and distributes requests across nodes.

## Ports

### The default config uses these ports:

**9092** — Kafka

**9042** — Cassandra

**6969** — client node communication

**6979** — metrics

**8989** — load balancer

**8992** — producer

## License

Notify is licensed under the GNU GPL v3.0, see LICENSE
