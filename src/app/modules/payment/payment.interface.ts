export interface TStripeSaveWithCustomerInfo {
  paymentMethodId: string;
}

interface Address {
  line: string;
  city: string;
  postal_code: string;
  country: string;
}

interface User {
  name: string;
  email: string;
}
