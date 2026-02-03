import mongoose, { Document, Schema } from 'mongoose';

export interface IOwnerReply {
  text: string;
  createdAt: Date;
}

export interface IReview extends Document {
  companyId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  text: string;
  ownerReply?: IOwnerReply;
}

const OwnerReplySchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const ReviewSchema: Schema = new Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, maxlength: 5000 },
  ownerReply: { type: OwnerReplySchema },
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
