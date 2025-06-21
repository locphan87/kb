---
title: Scalability
tags: [scalability, system-design]
---

## Types of Scalability

- **Vertical**: providing additional capabilities to an existing device.
- **Horizontal**: increasing the number of machines in the network.

## Scaling Techniques

| Technique    | Description                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| Sharding     | Distributes data across multiple servers in smaller units                       |
| Replication  | Creates and maintains copies of data across multiple servers                    |
| Partitioning | Divides a database into smaller, organised segments                             |
| Caching      | Improves response times through efficient retrieval of frequently accessed data |

## How to achieve it?

- **Modular design**
- **CDN**
- **Load balancing**
- **Caching**
- Elasticity
- Asynchronous Processing

## What to avoid

- Monolithic architectures
- Stateful components
- No load testing

## Resources

- [What's scalability in System Design (PDF?](https://www.educative.io/api/cheatsheet/4612976917741568/download)
