from fastapi import Header

def get_user_id(x_user_id: int = Header(..., alias="X-User-ID")):
    return x_user_id