import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Company, { generateClaimToken } from '../models/Company';

export const searchCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const category = req.query.category as string | undefined;
    const filter: Record<string, unknown> = {};
    if (query) filter.name = { $regex: query, $options: 'i' };
    if (category) filter.category = category;

    const companies = await Company.find(filter)
      .limit(query || category ? 20 : 10)
      .select('-claimToken')
      .lean();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid Company ID' });
      return;
    }
    const company = await Company.findById(id).select('-claimToken').lean();
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, logo, website, category } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'Company name is required' });
      return;
    }

    const existing = await Company.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } }).select('_id').lean();
    if (existing) {
      res.status(409).json({ message: 'Company already exists' });
      return;
    }

    const newCompany = await Company.create({
      name: name.trim(),
      description: description?.trim?.() || undefined,
      logo: logo?.trim?.() || undefined,
      website: website?.trim?.() || undefined,
      category: category?.trim?.() || undefined,
      claimToken: generateClaimToken(),
    });
    const out = newCompany.toObject();
    res.status(201).json(out);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Company.distinct('category').then((arr) => arr.filter(Boolean).sort());
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
