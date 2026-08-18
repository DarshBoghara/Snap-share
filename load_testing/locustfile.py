import time
import uuid
from locust import HttpUser, task, between


class SnapShareLoadTestUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Register and log in a unique test user session."""
        self.username = f"user_{uuid.uuid4().hex[:8]}"
        self.password = "password123"
        self.email = f"{self.username}@loadtest.com"

        # Register
        reg_resp = self.client.post("/api/v1/auth/register", json={
            "username": self.username,
            "email": self.email,
            "password": self.password
        })

        if reg_resp.status_code == 201:
            tokens = reg_resp.json()
            self.access_token = tokens["access_token"]
            self.headers = {"Authorization": f"Bearer {self.access_token}"}
        else:
            self.access_token = None

    @task(3)
    def search_users(self):
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/users/search?q=user", headers=self.headers)

    @task(2)
    def check_health(self):
        self.client.get("/api/v1/health")

    @task(1)
    def get_unread_counts(self):
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/messages/unread-counts", headers=self.headers)
