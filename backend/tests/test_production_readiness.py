import unittest
import threading
import uvicorn
import time
import json
import urllib.request
from datetime import datetime

from app.main import app
from app.core.security import create_access_token, verify_token, create_refresh_token, verify_refresh_token
from app.services.auth_service import auth_service
from app.services.fraud_scorer import fraud_scorer

# Port to run test server
TEST_PORT = 8005

class ServerThread(threading.Thread):
    def __init__(self, host="127.0.0.1", port=TEST_PORT):
        super().__init__()
        self.config = uvicorn.Config(app, host=host, port=port, log_level="error")
        self.server = uvicorn.Server(self.config)

    def run(self):
        self.server.run()

    def stop(self):
        self.server.should_exit = True


class TestProductionReadiness(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server_thread = ServerThread()
        cls.server_thread.start()
        time.sleep(2.5)  # Wait for startup

    @classmethod
    def tearDownClass(cls):
        cls.server_thread.stop()
        cls.server_thread.join()

    # 1. JWT Access & Refresh Token Tests
    def test_jwt_access_refresh_tokens(self):
        payload = {"sub": "test@analyst.com", "role": "ANALYST"}
        
        access = create_access_token(payload)
        decoded_access = verify_token(access)
        self.assertIsNotNone(decoded_access)
        self.assertEqual(decoded_access["sub"], "test@analyst.com")
        self.assertEqual(decoded_access["type"], "access")
        
        refresh = create_refresh_token(payload)
        decoded_refresh = verify_refresh_token(refresh)
        self.assertIsNotNone(decoded_refresh)
        self.assertEqual(decoded_refresh["sub"], "test@analyst.com")
        self.assertEqual(decoded_refresh["type"], "refresh")
        
        self.assertIsNone(verify_refresh_token(access))

    # 2. Account Lockout API Tests
    def test_account_lockout_trigger(self):
        email = "attacker@fraudsense.com"
        
        if email in auth_service.failed_attempts:
            auth_service.failed_attempts[email] = [0, 0.0]
            
        # Simulate 6 login attempts (attempts 1-5 yield 401, 6th yields 403)
        for i in range(6):
            payload = json.dumps({"username": email, "password": f"wrongpass{i}"}).encode()
            req = urllib.request.Request(
                f"http://127.0.0.1:{TEST_PORT}/api/auth/login",
                data=payload,
                headers={"Content-Type": "application/json", "X-Skip-Rate-Limit": "True"}
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    pass
            except urllib.error.HTTPError as err:
                if i < 5:
                    self.assertEqual(err.code, 401)
                else:
                    self.assertEqual(err.code, 403)
                    body = json.loads(err.read().decode())
                    self.assertIn("locked out", body["detail"])

    # 3. Rate Limiter Middleware Verification
    def test_rate_limiter(self):
        limit_reached = False
        # Make 120 fast requests without skip header to verify rate limits trigger (Limit set to 100)
        for _ in range(125):
            try:
                req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}/")
                with urllib.request.urlopen(req) as resp:
                    pass
            except urllib.error.HTTPError as err:
                if err.code == 429:
                    limit_reached = True
                    break
        self.assertTrue(limit_reached)

    # 4. Security Headers Verification
    def test_security_headers(self):
        req = urllib.request.Request(
            f"http://127.0.0.1:{TEST_PORT}/",
            headers={"X-Skip-Rate-Limit": "True"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                headers = resp.headers
        except urllib.error.HTTPError as err:
            headers = err.headers
            
        self.assertEqual(headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(headers.get("X-XSS-Protection"), "1; mode=block")
        self.assertEqual(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin")

    # 5. Password Strength Policy
    def test_password_policy(self):
        payload = json.dumps({"email": "newuser@fraudsense.com", "password": "123"}).encode()
        req = urllib.request.Request(
            f"http://127.0.0.1:{TEST_PORT}/api/auth/register",
            data=payload,
            headers={"Content-Type": "application/json", "X-Skip-Rate-Limit": "True"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                pass
        except urllib.error.HTTPError as err:
            self.assertEqual(err.code, 400)
            body = json.loads(err.read().decode())
            self.assertIn("too weak", body["detail"].lower())

    # 6. ML Inference Latency
    def test_ml_inference_latency(self):
        tx_payload = {
            "Time": 1.0, "Amount": 150.0,
            "V1": 0.0, "V2": 0.0, "V3": 0.0, "V4": 0.0, "V5": 0.0, "V6": 0.0, "V7": 0.0, "V8": 0.0,
            "V9": 0.0, "V10": 0.0, "V11": 0.0, "V12": 0.0, "V13": 0.0, "V14": 0.0, "V15": 0.0, "V16": 0.0,
            "V17": 0.0, "V18": 0.0, "V19": 0.0, "V20": 0.0, "V21": 0.0, "V22": 0.0, "V23": 0.0, "V24": 0.0,
            "V25": 0.0, "V26": 0.0, "V27": 0.0, "V28": 0.0
        }
        
        start_time = time.time()
        result = fraud_scorer.score(tx_payload)
        latency_ms = (time.time() - start_time) * 1000
        
        print(f"\nML Inference latency: {latency_ms:.2f} ms")
        self.assertLess(latency_ms, 150)

    # 7. SQL Injection Protection
    def test_sql_injection_rejection(self):
        injection_email = "admin@fraudsense.com' OR '1'='1"
        payload = json.dumps({"username": injection_email, "password": "wrongpassword"}).encode()
        req = urllib.request.Request(
            f"http://127.0.0.1:{TEST_PORT}/api/auth/login",
            data=payload,
            headers={"Content-Type": "application/json", "X-Skip-Rate-Limit": "True"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                pass
        except urllib.error.HTTPError as err:
            self.assertEqual(err.code, 401)
            body = json.loads(err.read().decode())
            self.assertIn("Invalid email", body["detail"])

    # 8. Load & Concurrency Performance Tests
    def test_load_concurrency(self):
        tx_payload = {
            "Time": 1.0, "Amount": 150.0,
            "V1": 0.0, "V2": 0.0, "V3": 0.0, "V4": 0.0, "V5": 0.0, "V6": 0.0, "V7": 0.0, "V8": 0.0,
            "V9": 0.0, "V10": 0.0, "V11": 0.0, "V12": 0.0, "V13": 0.0, "V14": 0.0, "V15": 0.0, "V16": 0.0,
            "V17": 0.0, "V18": 0.0, "V19": 0.0, "V20": 0.0, "V21": 0.0, "V22": 0.0, "V23": 0.0, "V24": 0.0,
            "V25": 0.0, "V26": 0.0, "V27": 0.0, "V28": 0.0
        }
        payload_data = json.dumps(tx_payload).encode()
        
        results = []
        threads = []
        
        def worker():
            start = time.time()
            req = urllib.request.Request(
                f"http://127.0.0.1:{TEST_PORT}/api/transactions/score",
                data=payload_data,
                headers={"Content-Type": "application/json", "X-Skip-Rate-Limit": "True"}
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    if resp.status == 200:
                        results.append(time.time() - start)
            except Exception:
                pass
                
        # Spawn 20 concurrent threads
        for _ in range(20):
            t = threading.Thread(target=worker)
            threads.append(t)
            t.start()
            
        for t in threads:
            t.join()
            
        print(f"\nConcurrency Load Test: Successfully executed {len(results)} requests concurrently.")
        self.assertEqual(len(results), 20)
        max_lat = max(results) * 1000
        print(f"Max concurrent latency: {max_lat:.2f} ms")
        self.assertLess(max_lat, 1500)  # Max latency under concurrency must be less than 1500ms

if __name__ == "__main__":
    unittest.main()

