import csv
from sqlalchemy.orm import Session
from server.db.core import get_db
from server.db.models import User
from passlib.context import CryptContext
from server.utils.printer import Printer

printer = Printer(name="bulk_create_users")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def load_users_from_csv(csv_path: str, db: Session):
    with open(csv_path, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            username = row["username"]
            email = row["email"]
            password = row["password"]

            printer.yellow(
                f"🔑 Usuario: {username}, Email: {email}, Password: {password}"
            )

            exists = (
                db.query(User)
                .filter((User.username == username) | (User.email == email))
                .first()
            )

            if exists:
                printer.yellow(f"⚠️ Usuario ya existe, saltando: {username}")
                continue

            user = User(
                username=username,
                email=email,
                password_hash=get_password_hash(password),
            )
            db.add(user)
            printer.green(f"✅ Usuario agregado: {username}")

        db.commit()


if __name__ == "__main__":
    db = next(get_db())
    load_users_from_csv("users.csv", db)
