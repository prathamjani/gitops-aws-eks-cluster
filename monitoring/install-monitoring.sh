#!/bin/bash
set -e

echo "Installing Prometheus and Grafana using Helm..."

# Add the prometheus-community helm repository (a catalog of ready-to-deploy metrics apps)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create a dedicated namespace for monitoring
kubectl create namespace monitoring || true

# Install the entire kube-prometheus-stack 
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring

echo "Installation complete. It may take a few minutes for all pods to be running."
echo "To access your shiny new Grafana dashboard, run:"
echo "kubectl port-forward svc/prometheus-grafana 8080:80 -n monitoring"
echo "Default Grafana Credentials: admin / prom-operator"
