# DevOPs-with-kubernets

This repository contains exercises and solutions developed as part of the **DevOps with Kubernetes** course.

## Chapters

### Chapter 2
- [Exercise 1.1](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.1)
- [Exercise 1.2](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.2)
- [Exercise 1.3](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.3)
- [Exercise 1.4](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.4)
- [Exercise 1.5](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.5)
- [Exercise 1.6](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.6)
- [Exercise 1.7](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.7)
- [Exercise 1.8](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.8)
- [Exercise 1.9](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.9)
- [Exercise 1.10](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.10)
- [Exercise 1.11](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.11)
- [Exercise 1.12](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.12)
- [Exercise 1.13](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/1.13)
### Chapter 3
- [Exercise 2.1](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.1)
- [Exercise 2.2](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.2)
- [Exercise 2.3](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.3)
- [Exercise 2.4](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.4)
- [Exercise 2.5](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.5)
- [Exercise 2.6](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.6)
- [Exercise 2.7](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.7)
- [Exercise 2.8](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.8)
- [Exercise 2.9](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.9)
- [Exercise 2.10](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/2.10)
### Chapter 4
- [Exercise 3.1](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.1)
- [Exercise 3.2](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.2)
- [Exercise 3.3](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.3)
- [Exercise 3.4](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.4)
- [Exercise 3.5](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.5)
- [Exercise 3.6](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.6)
- [Exercise 3.7](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.7)
- [Exercise 3.8](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.8)
- ## 3.9. DBaaS vs DIY

In the context of database architecture, both approaches offer distinct advantages depending on the project's needs. Below is a comparison focusing on initialization, maintenance, backups, and costs.

### DBaaS (Database as a Service)
**Pros:**
* **Initialization:** extremely fast. You can deploy a production-ready database instance in minutes without worrying about the underlying OS or software installation.
* **Maintenance:** "Set and forget." The provider handles OS patching, database updates, and hardware health.
* **Backups:** usually automated. Most providers offer "Point-in-Time Recovery" (PITR) and automated snapshots with a simple UI configuration.
* **Scalability:** Vertical or horizontal scaling is often as simple as clicking a button or moving a slider.

**Cons:**
* **Cost:** Higher recurring costs as you pay for the management layer. Costs scale linearly or exponentially with usage.
* **Control:** You do not have access to the file system or the OS configuration (limited customization).

### DIY (Do It Yourself)
**Pros:**
* **Control:** You have full granular control over the OS, the database configuration files, and the hardware resources.
* **Cost at Scale:** For very large/stable workloads, paying only for the raw infrastructure (IaaS) can be cheaper than the managed premium of DBaaS, provided you have the team to manage it.

**Cons:**
* **Initialization:** requires significant effort. You must provision the server, install the OS, configure security groups, install the DB engine, and tune it manually.
* **Maintenance & Backups:** High operational overhead. You are responsible for creating backup scripts, testing restoration procedures, setting up replication manually, and applying security patches.
* **Complexity:** Scaling requires manual configuration of new nodes and load balancing, increasing the risk of human error. 
- [Exercise 3.10](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.10)
- [Exercise 3.11](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.11)
- [Exercise 3.12](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/3.12)
- [Exercise 4.1](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/4.1)
- [Exercise 4.2](https://github.com/RubenDmon/DevOPs-with-kubernets/tree/4.2)