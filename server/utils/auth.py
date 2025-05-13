import os
import httpx

def get_access_token():
    # Cargar variables de entorno
    url = os.getenv("DECLARACIONES_TOKEN_URL")
    username = os.getenv("DECLARACIONES_USERNAME")
    password = os.getenv("DECLARACIONES_PASSWORD")
    client_id = os.getenv("DECLARACIONES_CLIENT_ID")
    client_secret = os.getenv("DECLARACIONES_CLIENT_SECRET")
    scope = os.getenv("DECLARACIONES_SCOPE", "read")

    # Verificar que todas estén presentes
    missing = [k for k, v in {
        "DECLARACIONES_TOKEN_URL": url,
        "DECLARACIONES_USERNAME": username,
        "DECLARACIONES_PASSWORD": password,
        "DECLARACIONES_CLIENT_ID": client_id,
        "DECLARACIONES_CLIENT_SECRET": client_secret
    }.items() if not v]

    if missing:
        raise EnvironmentError(f"Faltan variables de entorno: {', '.join(missing)}")

    # Preparar solicitud
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }

    payload = {
        "grant_type": "password",
        "username": username,
        "password": password,
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": scope,
    }

    try:
        response = httpx.post(url, data=payload, headers=headers, timeout=10.0)
        response.raise_for_status()
        return response.json()["access_token"]
    except httpx.HTTPStatusError as e:
        raise Exception(f"Error de autenticación: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Error al obtener el token: {str(e)}")
