const { promisePool } = require('../config/database');

class FoundItem {
  // Create new found item
  static async create(itemData) {
    const { 
      user_id, 
      item_name, 
      description, 
      category, 
      date_found, 
      location_found, 
      contact_info, 
      image_path 
    } = itemData;
    
    const query = `
      INSERT INTO found_items 
      (user_id, item_name, description, category, date_found, location_found, contact_info, image_path) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await promisePool.execute(query, [
      user_id,
      item_name,
      description || null,
      category || null,
      date_found || null,
      location_found || null,
      contact_info || null,
      image_path || null
    ]);
    
    return result.insertId;
  }

  // Get all found items with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT fi.*, u.username, u.email 
      FROM found_items fi
      JOIN users u ON fi.user_id = u.id
      WHERE fi.status = 'available'
    `;
    
    const params = [];
    
    if (filters.item_name) {
      query += ' AND fi.item_name LIKE ?';
      params.push(`%${filters.item_name}%`);
    }
    
    if (filters.category) {
      query += ' AND fi.category = ?';
      params.push(filters.category);
    }
    
    if (filters.location) {
      query += ' AND fi.location_found LIKE ?';
      params.push(`%${filters.location}%`);
    }
    
    if (filters.date_from) {
      query += ' AND fi.date_found >= ?';
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      query += ' AND fi.date_found <= ?';
      params.push(filters.date_to);
    }
    
    query += ' ORDER BY fi.created_at DESC';
    
    const [rows] = await promisePool.execute(query, params);
    return rows;
  }

  // Get found item by ID
  static async findById(id) {
    const query = `
      SELECT fi.*, u.username, u.email 
      FROM found_items fi
      JOIN users u ON fi.user_id = u.id
      WHERE fi.id = ?
    `;
    
    const [rows] = await promisePool.execute(query, [id]);
    return rows[0];
  }

  // Get found items by user ID
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM found_items 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await promisePool.execute(query, [userId]);
    return rows;
  }

  // Update found item status
  static async updateStatus(id, status) {
    const query = 'UPDATE found_items SET status = ? WHERE id = ?';
    const [result] = await promisePool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Delete found item
  static async delete(id) {
    const query = 'DELETE FROM found_items WHERE id = ?';
    const [result] = await promisePool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Search found items
  static async search(searchTerm) {
    const query = `
      SELECT fi.*, u.username, u.email 
      FROM found_items fi
      JOIN users u ON fi.user_id = u.id
      WHERE fi.status = 'available' 
      AND (fi.item_name LIKE ? OR fi.description LIKE ? OR fi.location_found LIKE ?)
      ORDER BY fi.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await promisePool.execute(query, [searchPattern, searchPattern, searchPattern]);
    return rows;
  }
}

module.exports = FoundItem;