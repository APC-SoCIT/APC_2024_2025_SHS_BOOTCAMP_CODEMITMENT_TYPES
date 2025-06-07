import sqlite3
from datetime import datetime

class Database:
    def __init__(self):
        self.conn = sqlite3.connect('typing_tests.db')
        self._create_tables()
    
    def _create_tables(self):
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                created_at TEXT
            )
        ''')
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS test_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                wpm REAL,
                accuracy REAL,
                test_date TEXT,
                test_text TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        self.conn.commit()
    
    def save_result(self, user_id, wpm, accuracy, test_text):
        self.conn.execute(
            '''INSERT INTO test_results 
            (user_id, wpm, accuracy, test_date, test_text) 
            VALUES (?, ?, ?, ?, ?)''',
            (user_id, wpm, accuracy, datetime.now().isoformat(), test_text)
        )
        self.conn.commit()
    
    def get_leaderboard(self):
        cursor = self.conn.execute('''
            SELECT users.username, test_results.wpm, test_results.accuracy, test_results.test_date
            FROM test_results
            JOIN users ON test_results.user_id = users.id
            ORDER BY wpm DESC
            LIMIT 10
        ''')
        return cursor.fetchall()