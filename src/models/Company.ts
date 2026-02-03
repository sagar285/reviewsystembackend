import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface ICompany extends Document {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  category?: string;
  claimToken?: string;
  averageRating: number;
  reviewCount: number;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  logo: { type: String },
  website: { type: String },
  category: { type: String, index: true },
  claimToken: { type: String, sparse: true },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

export function generateClaimToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export default mongoose.model<ICompany>('Company', CompanySchema);
