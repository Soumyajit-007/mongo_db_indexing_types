const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  // 1. Single-Field Index & 7. Unique Index
  username: { 
    type: String, 
    required: true, 
    unique: true // Automatically creates a unique single-field index
  },
  
  // 7. Unique Index
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  
  // 3. Multikey Index target
  tags: [{ type: String }],
  
  // 4. Text Index target
  description: { type: String },
  
  // 5. Geospatial Index target (GeoJSON Point format)
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: true 
    }
  },
  
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending'], 
    default: 'active' 
  }
}, { timestamps: true });

// 2. Compound Index (Optimizes combined sorting and exact matches)
itemSchema.index({ firstName: 1, lastName: 1 });

// 3. Multikey Index (Indexing individual elements inside the tags array)
itemSchema.index({ tags: 1 });

// 4. Text Index (Full-text search on description)
itemSchema.index({ description: 'text' });

// 5. Geospatial Index (Spherical calculations)
itemSchema.index({ location: '2dsphere' });

// 6. Partial Index (Only indexes documents where status is 'active')
itemSchema.index(
  { status: 1 }, 
  { partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('Item', itemSchema);