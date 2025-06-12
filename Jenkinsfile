pipeline {
    agent any
    environment {
        SSH_CREDENTIALS = 'ssh-key-245-5'
        DEPLOY_HOST     = 'https://entrenadorsentencias.pjedomex.gob.mx'
        DEPLOY_HOST_IP  = '10.22.245.5'
        DEPLOY_USER     = 'ocr'
        APP_DIR         = '/home/ocr/entrenador-sentencias-ia'
        SCREEN_SESSION  = 'entrenador-sentencias-ia'
        GIT_HTTP_URL    = 'https://git.pjedomex.gob.mx/PJEM/IA-entrenador-sentencias.git'
        GIT_BASE_URL    = 'git.pjedomex.gob.mx/PJEM/IA-entrenador-sentencias.git'
        GIT_CREDENTIALS = 'JENKINSGITEAUSERPASS'
    }

    stages {
        stage('Checkout') {
            when{
                branch 'jenkis-impl'
            }
            steps {
                // Checkout de la rama jenkis-impl desde Gitea
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "refs/heads/jenkis-impl"]],
                    userRemoteConfigs: [[
                        url: env.GIT_HTTP_URL,
                        credentialsId: env.GIT_CREDENTIALS
                    ]]
                ])
            }
        }
        stage('Deploy') {
            when{
                branch 'jenkis-impl'
            }
            steps {
                echo "Iniciando despliegue rama ${env.BRANCH_NAME} en ${DEPLOY_HOST_IP}"
                withCredentials([usernamePassword(
                    credentialsId: env.GIT_CREDENTIALS,
                    usernameVariable: 'GITEA_USER',
                    passwordVariable: 'GITEA_PASS'
                )]) {
                    sshagent([env.SSH_CREDENTIALS]) {
                        echo "Desplegando en ${DEPLOY_HOST_IP} como ${DEPLOY_USER} en ${APP_DIR}"
                        // 1. Actualizar código git de la rama jenkis-impl
                        sh """
                            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST_IP} '
                                set -e

                                GIT_URL="https://${GITEA_USER}:${GITEA_PASS}@${GIT_BASE_URL}"

                                # 1) Si no existe .git, clonamos
                                if [ ! -d "${APP_DIR}/.git" ]; then
                                    git clone --branch jenkis-impl \$GIT_URL "${APP_DIR}"
                                else
                                    cd ${APP_DIR}
                                    git remote set-url origin \$GIT_URL
                                    git fetch --all
                                    git reset --hard origin/jenkis-impl
                                fi

                                # 2) Generar archivo .env a partir de .env.produccion
                                cd '${APP_DIR}'
                                cp -f .env.produccion .env

                                # 3) Reiniciar la aplicación
                                screen -S ${SCREEN_SESSION} -X quit || true
                                screen -dmS ${SCREEN_SESSION} ./start.sh -m prod
                            '
                        """
                    }
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
