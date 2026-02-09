const { promisePool } = require('../config/database');

class LostItem {
  // Create new lost item
  static async create(itemData) {
    const { 
      user_id, 
      item_name, 
      description, 
      category, 
      date_lost, 
      location_lost, 
      contact_info, 
      image_path 
    } = itemData;
    
    const query = `
      INSERT INTO lost_items 
      (user_id, item_name, description, category, date_lost, location_lost, contact_info, image_path) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await promisePool.execute(query, [
      user_id,
      item_name,
      description || null,
      category || null,
      date_lost || null,
      location_lost || null,
      contact_info || null,
      image_path || null
    ]);
    
    return result.insertId;
  }

  // Get all lost items with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT li.*, u.username, u.email 
      FROM lost_items li
      JOIN users u ON li.user_id = u.id
      WHERE li.status = 'active'
    `;
    
    const params = [];
    
    if (filters.item_name) {
      query += ' AND li.item_name LIKE ?';
      params.push(`%${filters.item_name}%`);
    }
    
    if (filters.category) {
      query += ' AND li.category = ?';
      params.push(filters.category);
    }
    
    if (filters.location) {
      query += ' AND li.location_lost LIKE ?';
      params.push(`%${filters.location}%`);
    }
    
    if (filters.date_from) {
      query += ' AND li.date_lost >= ?';
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      query += ' AND li.date_lost <= ?';
      params.push(filters.date_to);
    }
    
    query += ' ORDER BY li.created_at DESC';
    
    const [rows] = await promisePool.execute(query, params);
    return rows;
  }

  // Get lost item by ID
  static async findById(id) {
    const query = `
      SELECT li.*, u.username, u.email 
      FROM lost_items li
      JOIN users u ON li.user_id = u.id
      WHERE li.id = ?
    `;
    
    const [rows] = await promisePool.execute(query, [id]);
    return rows[0];
  }

  // Get lost items by user ID
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM lost_items 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await promisePool.execute(query, [userId]);
    return rows;
  }

  // Update lost item status
  static async updateStatus(id, status) {
    const query = 'UPDATE lost_items SET status = ? WHERE id = ?';
    const [result] = await promisePool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Delete lost item
  static async delete(id) {
    const query = 'DELETE FROM lost_items WHERE id = ?';
    const [result] = await promisePool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Search lost items
  static async search(searchTerm) {
    const query = `
      SELECT li.*, u.username, u.email 
      FROM lost_items li
      JOIN users u ON li.user_id = u.id
      WHERE li.status = 'active' 
      AND (li.item_name LIKE ? OR li.description LIKE ? OR li.location_lost LIKE ?)
      ORDER BY li.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await promisePool.execute(query, [searchPattern, searchPattern, searchPattern]);
    return rows;
  }
}

module.exports = LostItem;