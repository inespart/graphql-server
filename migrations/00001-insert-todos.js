// Insert todos into database
exports.up = async (sql) => {
  sql`
    INSERT INTO todos (title, checked) VALUES
      ('Make Coffee', false),
      ('Call Mum', true)
  `;
};

// Remove todos from database
exports.down = async (sql) => {
  sql`
    DELETE FROM todos
      WHERE title IN ('Make Coffee', 'Call Mum')
  `;
};
