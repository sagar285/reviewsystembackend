
import { Router } from 'express';
import { searchCompanies, addCompany } from '../controllers/companyController';
import { getReviews, addReview } from '../controllers/reviewController';

const router = Router();

router.get('/companies', searchCompanies);
router.post('/companies', addCompany);

router.get('/reviews/:_id', getReviews);
router.post('/reviews/:_id', addReview);        

export default router;
