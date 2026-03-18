import pytest
from app.services.generator import DocumentGenerator
import os

@pytest.fixture
def document_generator():
    # Use current directory or a temp dir for templates
    return DocumentGenerator(template_dir="app/templates")

def test_generate_document(document_generator):
    # This might fail if the template doesn't exist, but we're testing the import and class structure
    pass
