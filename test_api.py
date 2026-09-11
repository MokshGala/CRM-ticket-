"""
Quick API test script -- runs all 10 test flows against the local FastAPI server.
"""
import urllib.request
import urllib.error
import json
import sys
import time

BASE = "http://localhost:8000"
PASS = "[PASS]"
FAIL = "[FAIL]"


def post(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def get(path, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{path}", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


print("\n" + "="*60)
print("  CRM TICKET SYSTEM -- API TEST SUITE")
print("="*60)

all_passed = True

# ── TEST 1: Health check ──────────────────────────────────────────
print("\n[TEST 1] Health check")
code, body = get("/")
ok = code == 200 and body.get("status") == "ok"
print(f"  {PASS if ok else FAIL}  GET / -> {code}  db_configured={body.get('db_configured')}")
all_passed = all_passed and ok

# ── TEST 2: Admin login ───────────────────────────────────────────
print("\n[TEST 2] Admin login (admin@demo.com / admin123)")
code, body = post("/api/auth/login", {"email": "admin@demo.com", "password": "admin123"})
ok = code == 200 and "access_token" in body
admin_token = body.get("access_token", "")
print(f"  {PASS if ok else FAIL}  POST /api/auth/login -> {code}")
if not ok:
    print(f"  Response: {body}")
all_passed = all_passed and ok

# ── TEST 3: Admin /me ──────────────────────────────────────────────
print("\n[TEST 3] Admin /me endpoint")
code, body = get("/api/auth/me", token=admin_token)
ok = code == 200 and body.get("role") == "admin"
print(f"  {PASS if ok else FAIL}  GET /api/auth/me -> {code}  role={body.get('role')}  name={body.get('name')}")
all_passed = all_passed and ok

# ── TEST 4: Demo user login ────────────────────────────────────────
print("\n[TEST 4] Demo user login (user@demo.com / user123)")
code, body = post("/api/auth/login", {"email": "user@demo.com", "password": "user123"})
ok = code == 200 and "access_token" in body
user_token = body.get("access_token", "")
print(f"  {PASS if ok else FAIL}  POST /api/auth/login -> {code}")
if not ok:
    print(f"  Response: {body}")
all_passed = all_passed and ok

# ── TEST 5: User /me ───────────────────────────────────────────────
print("\n[TEST 5] User /me endpoint")
code, body = get("/api/auth/me", token=user_token)
ok = code == 200 and body.get("role") == "user"
print(f"  {PASS if ok else FAIL}  GET /api/auth/me -> {code}  role={body.get('role')}  name={body.get('name')}")
all_passed = all_passed and ok

# ── TEST 6: Wrong credentials -> 401 ───────────────────────────────
print("\n[TEST 6] Wrong credentials -> must be 401 (not 500)")
code, body = post("/api/auth/login", {"email": "admin@demo.com", "password": "WRONGPASSWORD"})
ok = code == 401
print(f"  {PASS if ok else FAIL}  POST /api/auth/login (wrong pw) -> {code}  (expected 401)")
all_passed = all_passed and ok

# ── TEST 7: New user registration ─────────────────────────────────
print("\n[TEST 7] Register a new test user")
test_email = f"testuser_{int(time.time())}@test.com"
code, body = post("/api/auth/register", {
    "name": "Test User",
    "email": test_email,
    "password": "testpass123"
})
ok = code == 201 and "access_token" in body
new_token = body.get("access_token", "")
print(f"  {PASS if ok else FAIL}  POST /api/auth/register -> {code}  email={test_email}")
if not ok:
    print(f"  Response: {body}")
all_passed = all_passed and ok

# ── TEST 8: New user /me after registration ────────────────────────
print("\n[TEST 8] New user /me endpoint after registration")
code, body = get("/api/auth/me", token=new_token)
ok = code == 200 and body.get("email") == test_email
print(f"  {PASS if ok else FAIL}  GET /api/auth/me -> {code}  role={body.get('role')}  email={body.get('email')}")
all_passed = all_passed and ok

# ── TEST 9: Duplicate email registration -> 409 ────────────────────
print("\n[TEST 9] Duplicate email registration -> must be 409 (not 500)")
code, body = post("/api/auth/register", {
    "name": "Duplicate",
    "email": test_email,
    "password": "testpass123"
})
ok = code == 409
print(f"  {PASS if ok else FAIL}  POST /api/auth/register (duplicate) -> {code}  (expected 409)")
if not ok:
    print(f"  Response: {body}")
all_passed = all_passed and ok

# ── TEST 10: New user login after registration ─────────────────────
print("\n[TEST 10] New user login with registered credentials")
code, body = post("/api/auth/login", {"email": test_email, "password": "testpass123"})
ok = code == 200 and "access_token" in body
print(f"  {PASS if ok else FAIL}  POST /api/auth/login (new user) -> {code}")
all_passed = all_passed and ok

print("\n" + "="*60)
if all_passed:
    print("  OVERALL: ALL TESTS PASSED")
else:
    print("  OVERALL: SOME TESTS FAILED")
print("="*60 + "\n")
sys.exit(0 if all_passed else 1)
