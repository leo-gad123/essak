import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/nova";

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// MongoDB Schemas
const categorySchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Number, default: Date.now },
  createdBy: String,
});

const supplierSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  supplies: String,
});

const itemSchema = new mongoose.Schema({
  name: String,
  categoryId: String,
  supplierId: String,
  quantityAdded: Number,
  quantityUsed: Number,
  remaining: Number,
  unitType: { type: String, enum: ["kg", "liters", "pieces"] },
  size: String,
  notes: String,
});

const stockMovementSchema = new mongoose.Schema({
  itemId: String,
  quantity: Number,
  takenBy: String,
  notes: String,
  createdAt: { type: Number, default: Date.now },
  createdBy: String,
});

const notificationSchema = new mongoose.Schema({
  itemId: String,
  itemName: String,
  remaining: Number,
  threshold: Number,
  createdAt: { type: Number, default: Date.now },
  read: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  createdAt: { type: Number, default: Date.now },
});

const settingsSchema = new mongoose.Schema({
  appName: String,
  lowStockPercent: Number,
  currency: String,
  notifyOnLowStock: Boolean,
  updatedAt: { type: Number, default: Date.now },
});

// Models
const Category = mongoose.model("Category", categorySchema);
const Supplier = mongoose.model("Supplier", supplierSchema);
const Item = mongoose.model("Item", itemSchema);
const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const User = mongoose.model("User", userSchema);
const Settings = mongoose.model("Settings", settingsSchema);

// Utility function to convert MongoDB docs to proper format
const toJSON = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    ...doc.toObject(),
    _id: undefined,
  };
};

// ==================== Categories Routes ====================
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories.map(toJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    res.json(toJSON(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(toJSON(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Suppliers Routes ====================
app.get("/api/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers.map(toJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/suppliers", async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const saved = await supplier.save();
    res.json(toJSON(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/suppliers/:id", async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(toJSON(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/suppliers/:id", async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Items Routes ====================
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items.map(toJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const item = new Item(req.body);
    const saved = await item.save();
    res.json(toJSON(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/items/:id", async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(toJSON(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Stock Movements Routes ====================
app.get("/api/stock-movements", async (req, res) => {
  try {
    const movements = await StockMovement.find();
    res.json(movements.map(toJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/stock-movements", async (req, res) => {
  try {
    const movement = new StockMovement(req.body);
    const saved = await movement.save();
    res.json(toJSON(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/stock-movements/:id", async (req, res) => {
  try {
    await StockMovement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Notifications Routes ====================
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications.map(toJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const saved = await notification.save();
    res.json(toJSON(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/notifications/:id", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(toJSON(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Users Routes ====================
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(toJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.json(toJSON(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(toJSON(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Settings Routes ====================
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        appName: "StockNova",
        lowStockPercent: 25,
        currency: "USD",
        notifyOnLowStock: true,
      });
    }
    res.json(toJSON(settings));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, req.body, { updatedAt: Date.now() });
      await settings.save();
    } else {
      settings = await Settings.create({
        ...req.body,
        updatedAt: Date.now(),
      });
    }
    res.json(toJSON(settings));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
