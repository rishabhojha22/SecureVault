const VaultItem = require('../models/VaultItem');
const { encrypt, decrypt, encryptObject, decryptObject } = require('../utils/encryption');
const SecurityLog = require('../models/SecurityLog');

/**
 * Vault Controller
 * 
 * Handles CRUD operations for vault items (passwords, API keys, notes).
 * 
 * Security Features:
 * - All sensitive data is encrypted before storage
 * - Data is decrypted only when sent to authenticated user
 * - Users can only access their own vault items
 * - Admin can view all items (for auditing)
 * - All operations are logged for security monitoring
 */

/**
 * Get all vault items for the current user
 * 
 * GET /api/vault
 */
const getVaultItems = async (req, res) => {
  try {
    // Find all vault items belonging to the user
    const items = await VaultItem.find({ user: req.user._id });

    // Decrypt sensitive fields before sending to client
    const decryptedItems = items.map(item => {
      const itemObj = item.toObject();
      return decryptObject(itemObj, ['password', 'apiKey', 'notes']);
    });

    res.status(200).json({
      success: true,
      count: decryptedItems.length,
      items: decryptedItems
    });

  } catch (error) {
    console.error('Get vault items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vault items'
    });
  }
};

/**
 * Get a single vault item by ID
 * 
 * GET /api/vault/:id
 */
const getVaultItem = async (req, res) => {
  try {
    const item = await VaultItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
    }

    // Check ownership: user can only access their own items
    // Admin can access any item
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      await SecurityLog.logEvent({
        user: req.user._id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        description: 'Attempted to access another user\'s vault item',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
        metadata: { itemId: req.params.id }
      });

      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this item'
      });
    }

    // Decrypt sensitive fields
    const decryptedItem = decryptObject(item.toObject(), ['password', 'apiKey', 'notes']);

    // Log access
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'VAULT_ITEM_VIEWED',
      description: 'Vault item viewed',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { itemId: item._id, title: item.title }
    });

    res.status(200).json({
      success: true,
      item: decryptedItem
    });

  } catch (error) {
    console.error('Get vault item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vault item'
    });
  }
};

/**
 * Create a new vault item
 * 
 * POST /api/vault
 */
const createVaultItem = async (req, res) => {
  try {
    const { title, website, username, password, apiKey, notes, category, tags } = req.body;

    // Encrypt sensitive fields before saving
    const encryptedData = encryptObject({
      title,
      website,
      username,
      password,
      apiKey,
      notes,
      category,
      tags
    }, ['password', 'apiKey', 'notes']);

    // Create vault item
    const item = await VaultItem.create({
      user: req.user._id,
      ...encryptedData
    });

    // Log creation
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'VAULT_ITEM_CREATED',
      description: 'New vault item created',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { itemId: item._id, title: item.title }
    });

    // Decrypt for response
    const decryptedItem = decryptObject(item.toObject(), ['password', 'apiKey', 'notes']);

    res.status(201).json({
      success: true,
      message: 'Vault item created successfully',
      item: decryptedItem
    });

  } catch (error) {
    console.error('Create vault item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vault item'
    });
  }
};

/**
 * Update a vault item
 * 
 * PUT /api/vault/:id
 */
const updateVaultItem = async (req, res) => {
  try {
    let item = await VaultItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this item'
      });
    }

    // Encrypt sensitive fields if they are being updated
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = encrypt(updateData.password);
    }
    if (updateData.apiKey) {
      updateData.apiKey = encrypt(updateData.apiKey);
    }
    if (updateData.notes) {
      updateData.notes = encrypt(updateData.notes);
    }

    // Update item
    item = await VaultItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Log update
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'VAULT_ITEM_UPDATED',
      description: 'Vault item updated',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { itemId: item._id, title: item.title }
    });

    // Decrypt for response
    const decryptedItem = decryptObject(item.toObject(), ['password', 'apiKey', 'notes']);

    res.status(200).json({
      success: true,
      message: 'Vault item updated successfully',
      item: decryptedItem
    });

  } catch (error) {
    console.error('Update vault item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vault item'
    });
  }
};

/**
 * Delete a vault item
 * 
 * DELETE /api/vault/:id
 */
const deleteVaultItem = async (req, res) => {
  try {
    const item = await VaultItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this item'
      });
    }

    await item.deleteOne();

    // Log deletion
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'VAULT_ITEM_DELETED',
      description: 'Vault item deleted',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { itemId: item._id, title: item.title }
    });

    res.status(200).json({
      success: true,
      message: 'Vault item deleted successfully'
    });

  } catch (error) {
    console.error('Delete vault item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vault item'
    });
  }
};

/**
 * Search vault items
 * 
 * GET /api/vault/search?q=query
 */
const searchVaultItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in user's vault items by title or username
    const items = await VaultItem.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { website: { $regex: q, $options: 'i' } }
      ]
    });

    // Decrypt sensitive fields
    const decryptedItems = items.map(item => {
      const itemObj = item.toObject();
      return decryptObject(itemObj, ['password', 'apiKey', 'notes']);
    });

    res.status(200).json({
      success: true,
      count: decryptedItems.length,
      items: decryptedItems
    });

  } catch (error) {
    console.error('Search vault items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search vault items'
    });
  }
};

module.exports = {
  getVaultItems,
  getVaultItem,
  createVaultItem,
  updateVaultItem,
  deleteVaultItem,
  searchVaultItems
};
