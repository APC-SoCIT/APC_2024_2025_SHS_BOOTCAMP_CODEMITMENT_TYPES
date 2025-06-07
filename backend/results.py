class ResultsService:
    def __init__(self, db):
        self.db = db
    
    def get_user_history(self, user_id):
        cursor = self.db.conn.execute(
            'SELECT wpm, accuracy, test_date FROM test_results WHERE user_id = ? ORDER BY test_date DESC',
            (user_id,)
        )
        return cursor.fetchall()
    
    def get_global_stats(self):
        cursor = self.db.conn.execute(
            'SELECT AVG(wpm) as avg_wpm, MAX(wpm) as max_wpm FROM test_results'
        )
        return cursor.fetchone()