import pytest
from src.services.generator import DocumentGenerator

@pytest.fixture
def document_generator():
    return DocumentGenerator()

def test_generate_document(document_generator):
    template_data = {
        "title": "Test Document",
        "content": "This is a test document for Qualiopi compliance."
    }
    document = document_generator.generate(template_data)
    assert document is not None
    assert document.title == template_data["title"]
    assert document.content == template_data["content"]

def test_generate_document_with_invalid_data(document_generator):
    template_data = {
        "title": "",
        "content": "This document has an empty title."
    }
    with pytest.raises(ValueError):
        document_generator.generate(template_data)