"""Tests for Materials upload, RAG Chat, Flashcards, and Exit Exams."""

import pytest
import io


@pytest.mark.asyncio
async def test_exit_exams_endpoint(client):
    """Verifies that the National Exit Exam question bank returns valid questions."""
    response = await client.get("/api/v1/quizzes/exit-exams?category=computer_science")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first_q = data[0]
    assert "question" in first_q
    assert "options" in first_q
    assert len(first_q["options"]) == 4
    assert "correct_index" in first_q
    assert "explanation" in first_q


@pytest.mark.asyncio
async def test_material_upload_and_chat(client):
    """Tests uploading a text course note, verifying RAG chat query, flashcards, and quizzes."""
    fake_content = (
        "Operating Systems Lecture 1: Deadlocks and Concurrency.\n"
        "A deadlock occurs when processes are unable to proceed because each is waiting for the other. "
        "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. "
        "Banker's algorithm is commonly used for deadlock avoidance."
    )
    files = {
        "file": ("os_lecture_notes.txt", io.BytesIO(fake_content.encode("utf-8")), "text/plain")
    }

    # 1. Upload Material
    upload_res = await client.post("/api/v1/materials/upload", files=files)
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    doc_id = doc_data["id"]
    assert doc_data["filename"] == "os_lecture_notes.txt"
    assert doc_data["status"] == "READY"

    # 2. Query Chat with RAG
    chat_res = await client.post(
        "/api/v1/chat/query",
        json={"query": "What are the four Coffman conditions?", "document_id": doc_id, "language": "en"},
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "answer" in chat_data
    assert "citation" in chat_data

    # 3. Generate Flashcards from document
    fc_res = await client.post(f"/api/v1/flashcards/generate/{doc_id}")
    assert fc_res.status_code == 200
    fc_data = fc_res.json()
    assert isinstance(fc_data, list)
    assert len(fc_data) > 0
    assert "front" in fc_data[0]
    assert "back" in fc_data[0]

    # 4. Generate Quiz from document
    quiz_res = await client.post(f"/api/v1/quizzes/generate/{doc_id}")
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()
    assert isinstance(quiz_data, list)
    assert len(quiz_data) > 0
    assert len(quiz_data[0]["options"]) == 4

    # 5. Cleanup document
    del_res = await client.delete(f"/api/v1/materials/{doc_id}")
    assert del_res.status_code == 204
