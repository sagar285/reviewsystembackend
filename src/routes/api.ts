
import { Router } from 'express';
import { searchCompanies, getCompanyById, addCompany, getCategories } from '../controllers/companyController';
import { getReviews, addReview, replyToReview } from '../controllers/reviewController';

const router = Router();

router.get('/companies/categories', getCategories);
router.get('/companies', searchCompanies);
router.get('/companies/:id', getCompanyById);
router.post('/companies', addCompany);

router.get('/reviews/:_id', getReviews);
router.post('/reviews/:_id', addReview);
router.post('/reviews/:reviewId/reply', replyToReview);

export default router;
