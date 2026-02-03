import { Request, Response } from 'express';
import Review from '../models/Review';
import Company from '../models/Company';
import mongoose from 'mongoose';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const _id = typeof req.params._id === 'string' ? req.params._id : req.params._id?.[0];
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(String(req.query.limit), 10) || DEFAULT_PAGE_SIZE));

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      res.status(400).json({ message: 'Invalid Company ID' });
      return;
    }

    const companyId = new mongoose.Types.ObjectId(_id);
    const [reviews, total] = await Promise.all([
      Review.find({ companyId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Review.countDocuments({ companyId }),
    ]);

    res.json({ reviews, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyIdParam = typeof req.params._id === 'string' ? req.params._id : req.params._id?.[0];
    const { userName, rating, text } = req.body;

    if (!companyIdParam || !mongoose.Types.ObjectId.isValid(companyIdParam)) {
      res.status(400).json({ message: 'Invalid Company ID' });
      return;
    }

    const r = typeof rating === 'string' ? parseInt(rating, 10) : Number(rating);
    const textStr = typeof text === 'string' ? text.trim() : '';
    if (!textStr || textStr.length < 10) {
      res.status(400).json({ message: 'Review text must be at least 10 characters' });
      return;
    }
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }

    const companyId = new mongoose.Types.ObjectId(companyIdParam);
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    const newReview = await Review.create({
      companyId,
      userName: (userName && String(userName).trim()) || 'Anonymous',
      rating: r,
      text: textStr.slice(0, 5000),
    });

    const currentCount = company.reviewCount ?? 0;
    const currentAvg = company.averageRating ?? 0;
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + r) / newCount;
    await Company.updateOne(
      { _id: companyId },
      { $set: { reviewCount: newCount, averageRating: Math.round(newAvg * 10) / 10 } }
    );

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const replyToReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = typeof req.params.reviewId === 'string' ? req.params.reviewId : req.params.reviewId?.[0];
    const { claimToken, text } = req.body;

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({ message: 'Invalid Review ID' });
      return;
    }
    const textStr = typeof text === 'string' ? text.trim() : '';
    if (!textStr || textStr.length < 1) {
      res.status(400).json({ message: 'Reply text is required' });
      return;
    }
    if (!claimToken || typeof claimToken !== 'string') {
      res.status(401).json({ message: 'Claim token is required to reply as company owner' });
      return;
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    const company = await Company.findById(review.companyId);
    if (!company || company.claimToken !== claimToken.trim()) {
      res.status(403).json({ message: 'Invalid claim token for this company' });
      return;
    }

    review.ownerReply = { text: textStr.slice(0, 2000), createdAt: new Date() };
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
