import mongoose from 'mongoose';

const LanguageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    iso639_1: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Language || mongoose.model('Language', LanguageSchema);



