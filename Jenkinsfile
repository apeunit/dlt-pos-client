pipeline {
  agent {
    dockerfile {
      filename 'Dockerfile.ci'
      args '-v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v /var/lib/jenkins:/var/lib/jenkins'
    }
  }

  environment {
    TEST_NODE = '31.13.249.3:3013'
  }

  stages {
    stage('Build') {
      steps {
        sh 'yarn build'
      }
    }
  }
}
