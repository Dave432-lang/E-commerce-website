import { query } from '../config/db.js';

// @desc    Get dashboard metrics & recent orders
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate total sales revenue (all orders that are paid/processing/shipped/delivered)
    const revenueRows = await query(
      "SELECT SUM(total_amount) AS totalSales FROM orders WHERE status != 'cancelled' AND status != 'pending'"
    );
    const totalSales = Number(revenueRows[0].totalSales) || 0;

    // 2. Count total number of orders
    const ordersCountRows = await query("SELECT COUNT(*) AS totalOrders FROM orders");
    const totalOrders = ordersCountRows[0].totalOrders || 0;

    // 3. Count total registered customers (non-admin role)
    const usersCountRows = await query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'customer'");
    const totalUsers = usersCountRows[0].totalUsers || 0;

    // 4. Fetch the 5 most recent orders with customer name
    const recentOrders = await query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, u.name as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    const formattedRecentOrders = recentOrders.map(order => ({
      id: `BTQ-${order.id}`,
      rawId: order.id,
      customerName: order.customerName || order.customer_name,
      total: Number(order.total_amount),
      status: order.status,
      date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    // 5. Calculate Average Order Value
    const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders) : 0;

    // 6. Fetch Monthly Revenue Trend (past 6 months)
    let monthlyRevenue = [];
    try {
      const monthlyRows = await query(`
        SELECT DATE_FORMAT(created_at, '%b') AS month,
               SUM(total_amount) AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE status != 'cancelled'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
        ORDER BY MIN(created_at) ASC
        LIMIT 6
      `);
      monthlyRevenue = monthlyRows.map(r => ({
        month: r.month,
        revenue: Number(r.revenue) || 0,
        orders: Number(r.orders) || 0
      }));
    } catch (e) {
      console.warn('Could not query monthly revenue stats:', e.message);
    }

    // 7. Fetch Category Distribution
    let categoryDistribution = [];
    try {
      const categoryRows = await query(`
        SELECT p.category, SUM(oi.price_at_time * oi.quantity) AS sales, COUNT(*) as itemsSold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY p.category
      `);
      categoryDistribution = categoryRows.map(r => ({
        category: r.category,
        sales: Number(r.sales) || 0,
        itemsSold: Number(r.itemsSold) || 0
      }));
    } catch (e) {
      console.warn('Could not query category distribution stats:', e.message);
    }

    // 8. Fetch Order Status Breakdown
    let statusBreakdown = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    try {
      const statusRows = await query(`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`);
      statusRows.forEach(r => {
        if (r.status) {
          const key = r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase();
          statusBreakdown[key] = Number(r.count) || 0;
        }
      });
    } catch (e) {
      console.warn('Could not query status breakdown stats:', e.message);
    }

    res.json({
      totalSales,
      totalOrders,
      totalUsers,
      averageOrderValue,
      recentOrders: formattedRecentOrders,
      monthlyRevenue,
      categoryDistribution,
      statusBreakdown
    });
  } catch (error) {
    console.error('Fetch Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server Error loading dashboard statistics' });
  }
};

// @desc    Get all boutique customer orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address, o.payment_method,
              u.name as customer_name, u.email as customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    const fullOrders = [];
    for (const order of orders) {
      // Fetch details of all items in this order
      const items = await query(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      fullOrders.push({
        id: `BTQ-${order.id}`,
        rawId: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        date: new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: items.map(item => ({
          id: item.product_id,
          name: item.name,
          image: item.image_url,
          quantity: item.quantity,
          size: item.selected_size,
          color: item.selected_color,
          price: Number(item.price_at_time)
        })),
        total: Number(order.total_amount),
        status: order.status,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method
      });
    }

    res.json(fullOrders);
  } catch (error) {
    console.error('Fetch All Orders Error:', error);
    res.status(500).json({ message: 'Server Error fetching store orders' });
  }
};

// @desc    Update status of an order
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing order status' });
  }

  try {
    const result = await query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', orderId: `BTQ-${id}`, status });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Server Error modifying order status' });
  }
};

// @desc    Add a product to the catalog
// @route   POST /api/admin/products
// @access  Private/Admin
export const addProduct = async (req, res) => {
  const { name, description, price, salePrice, gender, category, imageUrl, sizes, colors, stockQuantity, isFeatured, isNewArrival } = req.body;

  if (!name || !price || !category || !imageUrl) {
    return res.status(400).json({ message: 'Name, price, category, and image URL are required' });
  }

  try {
    const sizesJson = sizes ? JSON.stringify(sizes) : '[]';
    const colorsJson = colors ? JSON.stringify(colors) : '[]';
    const stock = stockQuantity !== undefined ? Number(stockQuantity) : 50;
    const sale = salePrice !== undefined && salePrice !== null && salePrice !== '' ? Number(salePrice) : null;
    const prodGender = gender ? gender.toLowerCase() : 'unisex';
    const featured = isFeatured ? 1 : 0;
    const newArrival = isNewArrival ? 1 : 0;

    const result = await query(
      `INSERT INTO products (name, description, price, sale_price, gender, category, image_url, sizes, colors, stock_quantity, is_featured, is_new_arrival)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', Number(price), sale, prodGender, category, imageUrl, sizesJson, colorsJson, stock, featured, newArrival]
    );

    res.status(201).json({
      message: 'Product successfully added',
      id: result.insertId,
      name,
      price: Number(price),
      sale_price: sale,
      gender: prodGender,
      category,
      stockQuantity: stock
    });
  } catch (error) {
    console.error('Add Product Error:', error);
    res.status(500).json({ message: 'Server Error adding product to catalogue' });
  }
};

// @desc    Update a product in the catalog
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, salePrice, gender, category, imageUrl, sizes, colors, stockQuantity, isArchived, isFeatured, isNewArrival } = req.body;

  if (!name || !price || !category || !imageUrl) {
    return res.status(400).json({ message: 'Name, price, category, and image URL are required' });
  }

  try {
    const sizesJson = sizes ? JSON.stringify(sizes) : '[]';
    const colorsJson = colors ? JSON.stringify(colors) : '[]';
    const stock = stockQuantity !== undefined ? Number(stockQuantity) : 50;
    const archived = isArchived !== undefined ? (isArchived ? 1 : 0) : 0;
    const sale = salePrice !== undefined && salePrice !== null && salePrice !== '' ? Number(salePrice) : null;
    const prodGender = gender ? gender.toLowerCase() : 'unisex';
    const featured = isFeatured ? 1 : 0;
    const newArrival = isNewArrival ? 1 : 0;

    const result = await query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, sale_price = ?, gender = ?, category = ?, image_url = ?, sizes = ?, colors = ?, stock_quantity = ?, is_archived = ?, is_featured = ?, is_new_arrival = ? 
       WHERE id = ?`,
      [name, description || '', Number(price), sale, prodGender, category, imageUrl, sizesJson, colorsJson, stock, archived, featured, newArrival, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', id });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Server Error updating product' });
  }
};

// @desc    Delete or soft-archive a product from the catalog
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product successfully deleted from catalog', id });
  } catch (error) {
    console.error('Delete Product Error:', error);
    // If product has existing customer orders, gracefully soft-archive it instead of throwing MySQL error
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      try {
        await query('UPDATE products SET is_archived = 1 WHERE id = ?', [id]);
        return res.json({ 
          message: 'Product contains historical customer orders and has been soft-archived instead of permanently deleted.', 
          id, 
          archived: true 
        });
      } catch (archiveErr) {
        console.error('Soft Archive Error:', archiveErr);
      }
    }
    res.status(500).json({ message: 'Server Error deleting product' });
  }
};

// @desc    Toggle product archive status
// @route   PATCH /api/admin/products/:id/archive
// @access  Private/Admin
export const toggleArchiveProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const products = await query('SELECT is_archived FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newArchived = products[0].is_archived ? 0 : 1;
    await query('UPDATE products SET is_archived = ? WHERE id = ?', [newArchived, id]);

    res.json({ 
      message: `Product successfully ${newArchived ? 'archived' : 'restored'}`, 
      id, 
      is_archived: Boolean(newArchived) 
    });
  } catch (error) {
    console.error('Toggle Archive Error:', error);
    res.status(500).json({ message: 'Server Error updating product archive status' });
  }
};

// @desc    Get all registered user accounts
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      date: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Fetch All Users Error:', error);
    res.status(500).json({ message: 'Server Error fetching user directory' });
  }
};
