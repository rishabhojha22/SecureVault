const express = require('express');
const router = express.Router();
const {
  getVaultItems,
  getVaultItem,
  createVaultItem,
  updateVaultItem,
  deleteVaultItem,
  searchVaultItems
} = require('../controllers/vaultController');
const { protect } = require('../middleware/authMiddleware');
const { validateVaultItem } = require('../middleware/validationMiddleware');
const { logVaultEvent } = require('../middleware/activityLogger');

/**
 * Vault Routes
 * 
 * These routes handle vault item operations (passwords, API keys, notes).
 * 
 * Security Features:
 * - All routes are protected with JWT authentication
 * - Users can only access their own vault items
 * - Admin can access any vault item (for auditing)
 * - All sensitive data is encrypted before storage
 * - Data is decrypted only when sent to authenticated user
 * - Input validation to prevent injection attacks
 * - Activity logging for security monitoring
 */

/**
 * @route   GET /api/vault
 * @desc    Get all vault items for current user
 * @access  Private
 * @security: JWT protected, user-specific data
 */
router.get('/', protect, getVaultItems);

/**
 * @route   GET /api/vault/search
 * @desc    Search vault items
 * @access  Private
 * @security: JWT protected, user-specific data
 */
router.get('/search', protect, searchVaultItems);

/**
 * @route   GET /api/vault/:id
 * @desc    Get single vault item
 * @access  Private
 * @security: JWT protected, ownership checked
 */
router.get('/:id', protect, getVaultItem);

/**
 * @route   POST /api/vault
 * @desc    Create new vault item
 * @access  Private
 * @security: JWT protected, input validated, activity logged
 */
router.post('/', protect, validateVaultItem, logVaultEvent('VAULT_ITEM_CREATED'), createVaultItem);

/**
 * @route   PUT /api/vault/:id
 * @desc    Update vault item
 * @access  Private
 * @security: JWT protected, ownership checked, input validated, activity logged
 */
router.put('/:id', protect, validateVaultItem, logVaultEvent('VAULT_ITEM_UPDATED'), updateVaultItem);

/**
 * @route   DELETE /api/vault/:id
 * @desc    Delete vault item
 * @access  Private
 * @security: JWT protected, ownership checked, activity logged
 */
router.delete('/:id', protect, logVaultEvent('VAULT_ITEM_DELETED'), deleteVaultItem);

module.exports = router;
