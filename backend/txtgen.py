import random

class TextGenerator:
    def __init__(self):
        self.texts = [
            "The quick brown fox jumps over the lazy dog.",
            "Programming is the art of algorithm design.",
            "APC Bootcamp teaches practical coding skills.",
            "Typing speed improves with consistent practice."
        ]
    
    def get_random_text(self):
        return random.choice(self.texts)
    
    def add_custom_text(self, text):
        self.texts.append(text)