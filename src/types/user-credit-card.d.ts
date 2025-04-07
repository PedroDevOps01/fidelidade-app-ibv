type UserCreditCard = {
  id: string;
  first_six_digits: string;
  last_four_digits: string;
  brand: string;
  holder_name: string;
  holder_document: string;
  exp_month: number;
  exp_year: number;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
  billing_address: {
    zip_code: string;
    city: string;
    state: string;
    country: string;
    line_1: string;
    line_2: string;
  };
  metadata: {
    origin: string;
    internal_name: string;
    version: string;
    created_at: string;
  };
};
