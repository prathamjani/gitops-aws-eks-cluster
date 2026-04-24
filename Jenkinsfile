pipeline {
    agent any
    
    environment {
        // We define the locations of our tracking configuration
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        GIT_REPO_URL = 'https://github.com/prathamjani/gitops-aws-eks-cluster.git'
        GIT_CREDENTIALS_ID = 'github-credentials'
        
        // This dynamically generates a new tag for the containers every run (e.g., v15)
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        FRONTEND_IMAGE = "pratham30/frontend:${IMAGE_TAG}" // Your Repo
        BACKEND_IMAGE = "pratham30/backend:${IMAGE_TAG}"   // Your Repo
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: env.GIT_CREDENTIALS_ID, url: env.GIT_REPO_URL
            }
        }
        
        stage('Build & Push Backend') {
            steps {
                script {
                    docker.withRegistry('', env.DOCKER_CREDENTIALS_ID) {
                        def backendApp = docker.build(env.BACKEND_IMAGE, './backend')
                        backendApp.push()
                    }
                }
            }
        }
        
        stage('Build & Push Frontend') {
            steps {
                script {
                    docker.withRegistry('', env.DOCKER_CREDENTIALS_ID) {
                        def frontendApp = docker.build(env.FRONTEND_IMAGE, './frontend')
                        frontendApp.push()
                    }
                }
            }
        }
        
        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    // Replaces the placeholder text in our YAML files with the NEW image tags created in the stages above
                    sh """
                        sed -i -E "s|image: .*/backend:.*|image: ${env.BACKEND_IMAGE}|g" k8s/backend.yaml || true
                        sed -i -E "s|image: .*/frontend:.*|image: ${env.FRONTEND_IMAGE}|g" k8s/frontend.yaml || true
                        sed -i "s|image: REPLACE_ME_BACKEND_IMAGE|image: ${env.BACKEND_IMAGE}|g" k8s/backend.yaml || true
                        sed -i "s|image: REPLACE_ME_FRONTEND_IMAGE|image: ${env.FRONTEND_IMAGE}|g" k8s/frontend.yaml || true
                    """
                }
            }
        }
        
        stage('Commit & Push to GitHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.GIT_CREDENTIALS_ID, passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                    sh """
                        git config user.email "jenkins@example.com"
                        git config user.name "Jenkins CI"
                        git add k8s/backend.yaml k8s/frontend.yaml
                        git commit -m "Jenkins automatically updated application version to ${env.IMAGE_TAG} [skip ci]" || echo "No changes to commit, skipping"
                        git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/prathamjani/gitops-aws-eks-cluster.git HEAD:main
                    """
                }
            }
        }
    }
}
