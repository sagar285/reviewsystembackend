
import { Request, Response } from 'express';
import Company from '../models/Company';

export const searchCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      // Return top 10 companies or just empty array if no query, optimized with lean()
      const companies = await Company.find().limit(10).lean();
      res.json(companies);
      return;
    } 
    
    // Optimized: using regex with index, lean() for plain objects
    const results = await Company.find({ name: { $regex: query, $options: 'i' } })
      .limit(20)
      .lean();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Company name is required' });
      return;
    }

    // Optimization: findOne with select id to check existence quickly
    const existing = await Company.findOne({ name: { $regex: `^${name}$`, $options: 'i' } }).select('_id').lean();
    if (existing) {
      res.status(409).json({ message: 'Company already exists' });
      return;
    }

    const newCompany = await Company.create({ name, description });
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
