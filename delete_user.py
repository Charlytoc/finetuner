from sqlalchemy.orm import Session
from server.db.core import get_db
from server.db.models import User
from server.utils.printer import Printer

printer = Printer(name="delete_user_by_email")

def delete_user_by_email(email: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        printer.yellow(f"⚠️ No se encontró un usuario con el email: {email}")
        return

    db.delete(user)
    db.commit()
    printer.green(f"✅ Usuario eliminado: {user.username} ({email})")

if __name__ == "__main__":
    db = next(get_db())
    email = input("Introduce el email del usuario a eliminar: ").strip()
    if not email:
        printer.red("❌ Debes ingresar un email válido.")
    else:
        delete_user_by_email(email, db)
