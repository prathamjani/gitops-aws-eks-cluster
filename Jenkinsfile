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
        // Keep local demo pipeline practical; tighten to HIGH,CRITICAL in stricter environments.
        TRIVY_SEVERITY = 'CRITICAL'
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
        
        stage('Trivy Vulnerability Scan') {
            steps {
                script {
                    // Scanning the recently built Docker images for HIGH and CRITICAL vulnerabilities before they are rolled out to Kubernetes
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --severity ${env.TRIVY_SEVERITY} --ignore-unfixed --scanners vuln ${env.BACKEND_IMAGE}"
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --severity ${env.TRIVY_SEVERITY} --ignore-unfixed --scanners vuln ${env.FRONTEND_IMAGE}"
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
                    sh '''
                        git add k8s/backend.yaml k8s/frontend.yaml
                        git -c user.email="jenkins@example.com" -c user.name="Jenkins CI" \
                            commit -m "Jenkins automatically updated application version to ${IMAGE_TAG} [skip ci]" || echo "No changes to commit, skipping"
                        REPO_HOST_PATH=$(echo "${GIT_REPO_URL}" | sed -E 's|^https://||')
                        git push https://${GIT_USERNAME}:${GIT_PASSWORD}@${REPO_HOST_PATH} HEAD:main
                    '''
                }
            }
        }
    }
    
    post {
        failure {
            echo "Pipeline failed — notifying team"
        }
        always {
            sh "docker rmi ${env.BACKEND_IMAGE} || true"
            sh "docker rmi ${env.FRONTEND_IMAGE} || true"
        }
    }
}
