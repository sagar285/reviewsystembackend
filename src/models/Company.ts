
import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  description?: string;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, index: true },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model<ICompany>('Company', CompanySchema);
