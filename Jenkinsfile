pipeline {
    agent any
    environment {
        SSH_CREDENTIALS = 'ssh-key-245-5'
        DEPLOY_HOST     = 'https://entrenadorsentencias.pjedomex.gob.mx'
        DEPLOY_HOST_IP  = '10.22.245.5'
        DEPLOY_USER     = 'ocr'
        APP_DIR         = '/home/ocr/entrenador-sentencias-ia'
        SCREEN_SESSION  = 'entrenador-sentencias-ia'
        GIT_SSH_URL     = 'git@gitea.pjedomex.gob.mx:PJEM/IA-entrenador-sentencias.git'
        GIT_CREDENTIALS = 'JENKINSGITEAUSERPASS'
    }

    stages {
        when{
            branch 'jenkins-impl'
        }
        stage('Checkout') {
            steps {
                // Checkout de la rama jenkins-impl desde Gitea
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "refs/heads/jenkins-impl"]],
                    userRemoteConfigs: [[
                        url: env.GIT_SSH_URL,
                        credentialsId: env.SSH_CREDENTIALS
                    ]]
                ])
            }
        }
        stage('Deploy') {
            when{
                branch 'jenkins-impl'
            }
            steps {
                echo "Iniciando despliegue rama ${env.BRANCH_NAME} en ${DEPLOY_HOST_IP}"
                sshagent([env.SSH_CREDENTIALS]) {
                    echo "Desplegando en ${DEPLOY_HOST_IP} como ${DEPLOY_USER} en ${APP_DIR}"
                    // 1. Actualizar código git de la rama jenkins-impl
                    sh "cd ${APP_DIR} && git fetch --all && git reset --hard origin/jenkins-impl"

                    // // 3. Detener la screen anterior si existe
                    // sh """
                    //     ssh ${DEPLOY_USER}@${DEPLOY_HOST} '
                    //         screen -S ${SCREEN_SESSION} -X quit || true
                    //     '
                    // """

                    // // 4. Iniciar nueva sesión screen y lanzar start.sh
                    // sh """
                    //     ssh ${DEPLOY_USER}@${DEPLOY_HOST} '
                    //         cd ${APP_DIR} &&
                    //         screen -dmS ${SCREEN_SESSION} ./start.sh -m prod
                    //     '
                    // """
                }
            }
        }
    }

    post {
        success {
            echo 'Despliegue completado correctamente ✅'
        }
        failure {
            echo '¡Algo falló en el despliegue! ❌'
        }
    }
}
