from werkzeug.security import generate_password_hash, check_password_hash

class AuthService:
    def __init__(self, db):
        self.db = db
    
    def register_user(self, username, password):
        try:
            self.db.conn.execute(
                'INSERT INTO users (username, created_at) VALUES (?, ?)',
                (username, datetime.now().isoformat())
            )
            self.db.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def login_user(self, username):
        cursor = self.db.conn.execute(
            'SELECT id FROM users WHERE username = ?',
            (username,)
        )
        return cursor.fetchone()