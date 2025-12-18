import mongoose from 'mongoose';

const IndustrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Industry || mongoose.model('Industry', IndustrySchema);



