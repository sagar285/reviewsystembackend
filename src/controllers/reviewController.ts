
import { Request, Response } from 'express';
import Review from '../models/Review';
import mongoose from 'mongoose';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { _id } = req.params;
    
    // Optimization: Using ObjectId validation and lean() for performance
    if (!_id || typeof _id !== 'string' || !mongoose.Types.ObjectId.isValid(_id)) {
        res.status(400).json({ message: 'Invalid Company ID' });
        return;
    }

    const companyReviews = await Review.find({ companyId: new mongoose.Types.ObjectId(_id) })     
      .sort({ createdAt: -1 })
      .limit(50) // Pagination limit
      .lean();
      
    res.json(companyReviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { _id, userName, rating, text } = req.body;
    
    if (!_id || !rating || !text) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Optimization: We could use a transaction if we were updating company stats simultaneously
    // For now, simple create is efficient
    const newReview = await Review.create({
      companyId: new mongoose.Types.ObjectId(_id),  
      userName: userName || 'Anonymous',
      rating,
      text
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
