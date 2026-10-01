# Azure Infrastructure Architecture

Mind Craft is deployed on an Azure Virtual Machine or Azure Container Apps cluster.

## Components:
- **Compute**: Azure D4s_v5 VM (Ubuntu 22.04 LTS) with nested virtualization/cgroup v1 enabled.
- **Storage**: Azure Managed Disks for MongoDB and Judge0 Postgres.
- **Security**: Network Security Group (NSG) restricting ports 22 (SSH via bastion), 80/443 (Nginx), and internal 2358 (Judge0).
