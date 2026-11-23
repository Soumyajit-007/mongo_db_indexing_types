const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// 1. POST /api/demo - Add new document
router.post('/demo', async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    // Unique indexes return code 11000 on duplicate key failure
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate key error: username or email already exists.' 
      });
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid item data.',
        error: error.message
      });
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/demo/search - Advanced searches (Text, Multikey, GeoSpatial)
router.get('/demo/search', async (req, res) => {
  try {
    const { text, tag, lng, lat, maxDistance = 5000 } = req.query;
    let query = {};
    const hasLongitude = lng !== undefined;
    const hasLatitude = lat !== undefined;

    // $text and $near each require a special index and cannot be combined.
    if (text && (hasLongitude || hasLatitude)) {
      return res.status(400).json({
        success: false,
        message: 'Text search cannot be combined with a geospatial search.'
      });
    }

    if (hasLongitude !== hasLatitude) {
      return res.status(400).json({
        success: false,
        message: 'Both lng and lat are required for a geospatial search.'
      });
    }

    let coordinates;
    let distanceInMetres;

    if (hasLongitude) {
      const longitude = Number(lng);
      const latitude = Number(lat);
      distanceInMetres = Number(maxDistance);

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        longitude < -180 || longitude > 180 ||
        latitude < -90 || latitude > 90 ||
        !Number.isFinite(distanceInMetres) || distanceInMetres <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'lng, lat, and maxDistance must be valid coordinates and a positive distance in metres.'
        });
      }

      coordinates = [longitude, latitude];
    }

    // Uses 4. Text Index
    if (text) {
      query.$text = { $search: text };
    }

    // Uses 3. Multikey Index
    if (tag) {
      query.tags = tag;
    }

    // Uses 5. Geospatial Index ($near operator)
    if (coordinates) {
      query.location = {
        $near: {
          $geometry: { 
            type: 'Point', 
            coordinates
          },
          $maxDistance: distanceInMetres
        }
      };
    }

    const results = await Item.find(query);
    res.json({ count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/demo - Standard filtering (Single, Compound, Partial)
router.get('/demo', async (req, res) => {
  try {
    const { username, firstName, lastName, status } = req.query;
    let query = {};

    // Uses 1. Single-field / Unique Index
    if (username) query.username = username;

    // Uses 2. Compound Index
    if (firstName && lastName) {
      query.firstName = firstName;
      query.lastName = lastName;
    }

    // Uses 6. Partial Index (Only performs index scan if status === 'active')
    if (status) query.status = status;

    const results = await Item.find(query);
    res.json({ count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
