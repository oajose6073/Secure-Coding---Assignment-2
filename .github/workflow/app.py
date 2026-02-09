
"""
INSECURE DEMO FILE — DO NOT USE IN PRODUCTION

This file intentionally contains multiple security vulnerabilities
for educational purposes only.
"""

import sqlite3
import os
import pickle
from flask import Flask, request

app = Flask(__name__)

# ❌ Hard‑coded secret key
app.secret_key = "super-secret-key-123"

# ❌ Hard‑coded database credentials
DB_PATH = "users.db"

# ❌ Debug mode enabled (leaks stack traces and secrets)
app.config["DEBUG"] = True


def get_db():
    return sqlite3.connect(DB_PATH)


@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")

    # ❌ SQL Injection vulnerability (string concatenation)
    query = f"""
        SELECT * FROM users
        WHERE username = '{username}'
        AND password = '{password}'
    """

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query)
    user = cursor.fetchone()

    if user:
        return "Login successful"
    else:
        return "Invalid credentials", 401


@app.route("/run", methods=["POST"])
def run_code():
    code = request.form.get("code")

    # ❌ Arbitrary code execution via eval
    result = eval(code)
    return f"Result: {result}"


@app.route("/upload", methods=["POST"])
def upload():
    data = request.files["file"].read()

    # ❌ Insecure deserialization (remote code execution risk)
    obj = pickle.loads(data)

    return f"Loaded object: {obj}"


@app.route("/read-file", methods=["GET"])
def read_file():
    filename = request.args.get("name")

    # ❌ Path traversal vulnerability
    with open(filename, "r") as f:
        return f.read()


# ❌ Insecure random usage for tokens
def generate_token():
    return str(os.urandom(4))


if __name__ == "__main__":
    # ❌ Running directly with debug enabled
    app.run(host="0.0.0.0", port=5000)
