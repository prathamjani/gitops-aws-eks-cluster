# 🏗️ DevOps Practice: AWS GitOps Three-Tier Architecture

An end-to-end GitOps deployment of a containerized Three-Tier application (React, Node.js, MongoDB) managed via Kubernetes and AWS EKS. 

## 🌐 Architecture Overview
This project models the "Golden Path" of modern DevOps standards, moving away from manual Server deployments in favor of automated, declarative Infrastructure as Code.

1. **Infrastructure as Code (Terraform):** Fully automates the provisioning of the AWS Virtual Private Cloud (VPC), Subnets, and an Elastic Kubernetes Service (EKS) cluster.
2. **Containerization (Docker):** The Frontend UI and Backend API are decoupled into lightweight Docker images.
3. **Continuous Integration (Jenkins):** Automates the pipeline. Upon a GitHub commit, Jenkins automatically pulls the code, builds the new Docker images, pushes them to a secure registry, and updates the Kubernetes manifests with the latest version tags.
4. **GitOps & Continuous Delivery (ArgoCD):** GitHub serves as the "Single Source of Truth". ArgoCD sits inside the EKS cluster, monitoring the repository. Upon detecting changes to the manifests by Jenkins, it automatically initiates rolling updates to the live cluster pods with zero downtime.
5. **Observability (Prometheus & Grafana):** Installed via Helm to monitor the node hardware, network latency, and service health visually.

## 🚀 Application
This repository features a custom **ToDo Tracker App**, serving to demonstrate microservice interaction.
- **Frontend**: A React/Vite application utilizing TailwindCSS & Framer Motion.
- **Backend**: An Express/Node.js API running on port 5000.
- **Database**: A NoSQL MongoDB 8.0 stateful set.
