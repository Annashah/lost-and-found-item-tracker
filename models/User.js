const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const { username, email, password, full_name, phone } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, email, password, full_name, phone) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await promisePool.execute(query, [
      username,
      email,
      hashedPassword,
      full_name || null,
      phone || null
    ]);
    
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await promisePool.execute(query, [email]);
    return rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await promisePool.execute(query, [username]);
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, username, email, full_name, phone, created_at FROM users WHERE id = ?';
    const [rows] = await promisePool.execute(query, [id]);
    return rows[0];
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Update user
  static async update(id, updateData) {
    const { full_name, phone } = updateData;
    
    const query = `
      UPDATE users 
      SET full_name = ?, phone = ?
      WHERE id = ?
    `;
    
    const [result] = await promisePool.execute(query, [full_name, phone, id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;