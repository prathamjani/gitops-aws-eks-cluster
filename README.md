# 🏗️ Production GitOps Architecture: Three-Tier Application on AWS EKS

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-%23EF7B4D.svg?style=for-the-badge&logo=argo&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

An end-to-end GitOps deployment of a containerized Three-Tier application (React, Node.js, MongoDB) managed via Kubernetes and AWS Elastic Kubernetes Service (EKS).

## 🌐 Architecture Overview

This project models the "Golden Path" of modern DevOps standards, moving away from manual Server deployments in favor of automated, declarative Infrastructure as Code.

Instead of deploying static applications, this repository defines a resilient, self-healing **GitOps** pipeline:

1. **Infrastructure as Code (Terraform):** Fully automates the provisioning of the AWS Virtual Private Cloud (VPC), Subnets, and an Elastic Kubernetes Service (EKS) cluster.
2. **Containerization (Docker):** The Frontend UI and Backend API are decoupled into lightweight Docker image microservices orchestrated natively.
3. **Continuous Integration & DevSecOps (Jenkins + Trivy):** Automates the CI pipeline. Upon a GitHub commit, Jenkins pulls the code, builds the new Docker images, surgically scans the containers for vulnerabilities using Trivy, pushes them to a Docker registry, and updates the manifests.
4. **GitOps & Continuous Delivery (ArgoCD):** GitHub serves as the "Single Source of Truth". ArgoCD monitors the repository and automatically initiates rolling updates to the live cluster pods with zero downtime.
5. **High Availability & Persistence:** The MongoDB database runs dynamically as a **3-Node Kubernetes StatefulSet** with resilient Persistent Volume Claims attached via an encrypted headless service.
6. **Elastic Scalability (HPA):** Custom Horizontal Pod Autoscalers automatically spin up exact replicas of the React and Node containers when cluster CPU spikes over 70%.

---

## 🚀 The Application

This repository features a custom **ToDo Tracker App** capable of dynamic interaction, serving to demonstrate live database persistence.

- **Frontend**: A React/Vite application utilizing TailwindCSS & Framer Motion natively reverse-proxied over NGINX.
- **Backend**: An Express/Node.js API running on port 5000.
- **Database**: A NoSQL MongoDB replica cluster.

---

## 📂 Repository Structure

```tree
.
├── backend/                  # Node.js Express API source code & Dockerfile
├── frontend/                 # React/Vite App source code, NGINX config & Dockerfile
├── k8s/                      # Kubernetes Manifests (Deployments, Services, StatefulSets, HPA)
├── terraform/                # Infrastructure as Code for provisioning AWS VPC/EKS
├── Jenkinsfile               # CI/CD Pipeline definition including Trivy security gates
├── jenkins-compose.yml       # Docker Compose for ephemeral Jenkins CI setup
├── argocd/                   # ArgoCD Application definitions for Continuous Delivery
└── README.md
```

---

## 🛠️ Local Testing & Deployment Sequence

You do not need a physical AWS cluster to verify this architecture. You can run the entire CI/CD pipeline natively on your machine using Minikube and Docker.

### 1. Boot up the Local Kubernetes Environment
Ensure you have Minikube and Docker installed.
```bash
minikube start
minikube addons enable metrics-server
```

### 2. Connect Your Application via ArgoCD (GitOps)
Apply the Application definition to forcefully sync your cluster with the GitHub repository!
```bash
kubectl create namespace three-tier-app
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.13.0/manifests/install.yaml
kubectl apply -f argocd/application.yaml
```

To view the ArgoCD Dashboard network:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Username: admin
# Password: run `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
```

### 3. CI Pipeline (Jenkins)
To spin up the continuous integration engine, run its containerized deployment instance:
```bash
docker-compose -f jenkins-compose.yml up -d
```
1. Visit `http://localhost:8081`
2. Create a "Pipeline" Job and link it to this GitHub repository.
3. Upon triggering a build, Jenkins will build the Docker images, scan them via Trivy, and push them upstream. ArgoCD will instantly detect this push and orchestrate the cluster rollout.

### 4. GitOps-Safe Secret Management (Sealed Secrets)
Do not commit plaintext Kubernetes secrets. Use Sealed Secrets so only encrypted data is stored in Git:

```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.27.3/controller.yaml

# Install kubeseal CLI (macOS)
brew install kubeseal

# Create a local plaintext secret file (ignored by git)
cp examples/secret.example.yaml k8s/secret.local.yaml
# Edit values in k8s/secret.local.yaml

# Seal it for the current cluster and namespace
kubeseal \
  --format yaml \
  --namespace three-tier-app \
  --name mongo-secret \
  < k8s/secret.local.yaml \
  > k8s/mongo-sealedsecret.yaml

# Commit only the sealed file
git add k8s/mongo-sealedsecret.yaml
```

ArgoCD will apply `k8s/mongo-sealedsecret.yaml`, and the controller will create/update the runtime `mongo-secret`.

### 5. Application Output
To natively view the completed React application running completely isolated inside Kubernetes:
```bash
minikube service frontend -n three-tier-app
```

### 6. Local Docker Compose Smoke Test
To test the app stack locally without Kubernetes:
```bash
docker compose up --build
```
Then open `http://localhost:3000`.

---

## ☁️ Production AWS Deployment

To port this local architecture structure permanently into the AWS Cloud, leverage the provided Terraform definitions:

```bash
cd terraform
terraform init
terraform plan
terraform apply --auto-approve
```
> `terraform/providers.tf` uses placeholder S3 backend values for portfolio safety.
> Create your S3 bucket + DynamoDB lock table first, then replace placeholder values before `terraform init`.
This physically constructs the EKS topology. Once the control plane generates, execute the exact same `argo` mapping commands documented above to inject the pipeline.
