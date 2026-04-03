from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Qualiopi Document Generation API"}

def test_authentication():
    response = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_create_document():
    response = client.post("/documents/", json={"title": "Test Document", "content": "This is a test."})
    assert response.status_code == 201
    assert response.json()["title"] == "Test Document"

def test_get_document():
    response = client.get("/documents/1")
    assert response.status_code == 200
    assert "title" in response.json()

def test_delete_document():
    response = client.delete("/documents/1")
    assert response.status_code == 204

def test_invalid_route():
    response = client.get("/invalid-route")
    assert response.status_code == 404