
import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  companyId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  text: string;
}

const ReviewSchema: Schema = new Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
