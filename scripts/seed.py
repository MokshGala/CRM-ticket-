import sys
import os

_here = os.path.dirname(os.path.abspath(__file__))
_backend = os.path.join(_here, '..', 'backend')
sys.path.insert(0, _backend)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_backend, '.env'))
except ImportError:
    pass

from app.database import engine, SessionLocal
from app import models
from app.crud import get_user_by_email, create_user

DEMO_USERS = [
    {'name': 'Demo User',  'email': 'user@demo.com',  'password': 'user123',  'role': 'user'},
    {'name': 'Admin User', 'email': 'admin@demo.com', 'password': 'admin123', 'role': 'admin'},
]

def main():
    if engine is None:
        print('[ERROR] DATABASE_URL is not set.')
        sys.exit(1)
    print('[INFO] Creating tables (if they do not exist)...')
    models.Base.metadata.create_all(bind=engine)
    print('[OK] Tables ready.')
    db = SessionLocal()
    try:
        for u in DEMO_USERS:
            if get_user_by_email(db, u['email']):
                print(f"[SKIP] {u['role']} already exists: {u['email']}")
            else:
                create_user(db, name=u['name'], email=u['email'], password=u['password'], role=u['role'])
                print(f"[OK] Seeded {u['role']}: {u['email']}  /  password: {u['password']}")
    finally:
        db.close()
    print('')
    print('Done. Credentials:')
    for u in DEMO_USERS:
        print(f"  {u['role']:6s}  {u['email']}  /  {u['password']}")

if __name__ == '__main__':
    main()