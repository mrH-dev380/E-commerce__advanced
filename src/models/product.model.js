'use strict'

const slugify = require('slugify')
const { Schema, model, Types } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

// Declare the Schema of the Mongo model
var productSchema = new Schema(
  {
    product_name: {
      type: String,
      trim: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_slug: String,
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      require: true,
    },
    product_type: {
      type: String,
      require: true,
      enum: ['Electronics', 'Clothing', 'Furniture'],
    },
    product_ratingAvg: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be above 5.0'],
      // 4.32132 => 4.3
      set: (val) => Math.round(val * 10) / 10,
    },
    product_shop: { type: Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, require: true },
    product_variation: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: 1, select: false },
    isPublished: { type: Boolean, default: false, index: 1, select: false },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
)
// create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// Document middleware: run before .save() and .create()
productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true })
  next()
})

// define product type = 'clothing'
const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    material: String,
    size: String,
    product_shop: { type: Types.ObjectId, ref: 'Shop' },
  },
  {
    collection: 'Clothes',
    timestamps: true,
  }
)

// define product type = 'electronics'
const electronicSchema = new Schema(
  {
    manufactories: { type: String, required: true },
    modal: String,
    color: String,
    product_shop: { type: Types.ObjectId, ref: 'Shop' },
  },
  {
    collection: 'Electronics',
    timestamps: true,
  }
)

// define product type = 'furniture'
const furnitureSchema = new Schema(
  {
    brand: { type: String, required: true },
    material: String,
    size: String,
    product_shop: { type: Types.ObjectId, ref: 'Shop' },
  },
  {
    collection: 'Furniture',
    timestamps: true,
  }
)

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model('Clothing', clothingSchema),
  electronic: model('Electronics', electronicSchema),
  furniture: model('Furniture', furnitureSchema),
}
