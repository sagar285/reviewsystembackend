
export interface Company {
  _id: string;
  name: string;
  description?: string;
}

export interface Review {
  _id: string;
  companyId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date;
}

export const companies: Company[] = [
  { _id: '1', name: 'TechCorp', description: 'A leading tech company' },
  { _id: '2', name: 'Foodies', description: 'Best food in town' }
];

export const reviews: Review[] = [
  { _id: '1', companyId: '1', userName: 'Alice', rating: 5, text: 'Great place to work!', createdAt: new Date() },
  { _id: '2', companyId: '1', userName: 'Bob', rating: 4, text: 'Good benefits.', createdAt: new Date() },
  { _id: '3', companyId: '2', userName: 'Charlie', rating: 3, text: 'Food is okay, service is slow.', createdAt: new Date() }           
];
