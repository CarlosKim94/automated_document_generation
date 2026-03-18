from jinja2 import Environment, FileSystemLoader
from pathlib import Path

class DocumentGenerator:
    def __init__(self, template_dir: str):
        self.env = Environment(loader=FileSystemLoader(template_dir))

    def generate_document(self, template_name: str, context: dict) -> str:
        template = self.env.get_template(template_name)
        return template.render(context)

def save_document(content: str, output_path: str):
    with open(output_path, 'w') as file:
        file.write(content)