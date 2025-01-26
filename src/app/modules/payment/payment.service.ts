import httpStatus from 'http-status';
import Stripe from 'stripe';
import config from '../../../config';
import { isValidAmount } from '../../utils/isValidAmount';
import { TStripeSaveWithCustomerInfo } from './payment.interface';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { ParcelStatus, PaymentStatus, UserRoleEnum } from '@prisma/client';

// Initialize Stripe with your secret API key
const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: '2024-12-18.acacia',
});

// Step 1: Create a Customer and Save the Card
const saveCardWithCustomerInfoIntoStripe = async (
  payload: TStripeSaveWithCustomerInfo,
  user: any,
) => {
  try {
    const { paymentMethodId } = payload;
    let existCustomer = await prisma.user.findUnique({
      where: {
        id: user.id as string,
      },
      select: {
        senderCustomerID: true,
        fullName: true,
        email: true,
      },
    });

    if (!existCustomer) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Customer not found');
    }

    if (!existCustomer.senderCustomerID) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        name: existCustomer.fullName,
        email: existCustomer.email,
      });

      // Attach PaymentMethod to the Customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set PaymentMethod as Default
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          senderCustomerID: customer.id,
        },
      });

      return {
        customerId: customer.id,
        paymentMethodId: paymentMethodId,
      };
    } else {
      // Attach PaymentMethod to the existing Customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: existCustomer.senderCustomerID,
      });

      // Set PaymentMethod as Default
      await stripe.customers.update(existCustomer.senderCustomerID, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return {
        customerId: existCustomer.senderCustomerID,
        paymentMethodId: paymentMethodId,
      };
    }
  } catch (error: any) {
    console.error('Error in saveCardWithCustomerInfoIntoStripe:', error);
    throw new Error(error.message);
  }
};
// Step 2: Authorize the Payment Using Saved Card
const authorizedPaymentWithSaveCardFromStripe = async (
  userId: string,
  payload: {
    paymentMethodId: string;
    parcelId: string;
  },
) => {
  const { paymentMethodId, parcelId } = payload;

  // Retrieve the Customer from the database
  const customerDetails = await prisma.user.findUnique({
    where: {
      id: userId,
      role: UserRoleEnum.USER,
    },
  });

  if (!customerDetails) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  // Retrieve the project details
  const parcel = await prisma.parcel.findUnique({
    where: {
      id: parcelId,
      userId: userId,
      parcelStatus: ParcelStatus.ACCEPTED,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  console.log(parcel);

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Parcel not found');
  }

  if (!parcel.deliveryPersonId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Delivery person ID not found');
  }

  const deliveryPerson = await prisma.user.findUnique({
    where: {
      id: parcel.deliveryPersonId,
    },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!deliveryPerson) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Delivery person not found');
  }

  let customerId = customerDetails.senderCustomerID;

  if (customerId) {
    const attach = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    const updateCustomer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  // If the customerId doesn't exist, create a new Stripe customer
  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: customerDetails.email
        ? customerDetails.email
        : (() => {
            throw new AppError(httpStatus.BAD_REQUEST, 'Email not found');
          })(),
    });

    const attach = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer.id,
    });

    // Set PaymentMethod as Default
    const updateCustomer = await stripe.customers.update(stripeCustomer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update the database with the new Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { senderCustomerID: stripeCustomer.id },
    });

    customerId = stripeCustomer.id; // Use the new customerId
  }

  const transportPriceInKobo = Math.round(parcel.parcelTransportPrice * 100); // Convert to Kobo

  if (transportPriceInKobo < 25000) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Minimum amount to be paid is 250',
    );
  }
  // Calculate the amount to be transferred to the delivery person (65% of the total price)
  const transferAmount = Math.round(parcel.parcelTransportPrice * 0.65 * 100);

  // Create a PaymentIntent with the specified PaymentMethod
  const paymentIntent = await stripe.paymentIntents.create({
    amount: transportPriceInKobo,
    currency: 'ngn',
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    metadata: {
      parcelId: parcelId,
      deliveryPersonId: parcel.deliveryPersonId,
    },
    capture_method: 'manual',
    transfer_data: {
      destination: deliveryPerson.stripeCustomerId as string,
      amount: transferAmount,
    },
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
  });

  // Handle successful payment
  if (paymentIntent.status === 'requires_capture') {
    // Save payment information to the database
    const payment = await prisma.payment.create({
      data: {
        paymentId: paymentIntent.id,
        stripeAccountIdReceiver: deliveryPerson.stripeCustomerId as string,
        paymentAmount: paymentIntent.amount,
        paymentDate: new Date(),
        parcelId: parcelId,
        status: PaymentStatus.REQUIRES_CAPTURE,
        stripeCustomerIdProvider: customerDetails.senderCustomerID as string,
      },
    });

    if (!payment) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Failed to save payment information',
      );
    }
    // Update the project status
    const updateParcelStatus = await prisma.parcel.update({
      where: { id: parcelId },
      data: {
        paymentStatus: PaymentStatus.REQUIRES_CAPTURE,
      },
    });

    if (!updateParcelStatus) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Failed to update project status',
      );
    }

    // Send notification to the user
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   select: { fcmToken: true },
    // });

    // const notificationTitle = 'Payment Successful';
    // const notificationBody = 'Your payment has been processed successfully and your project is confirmed';

    // if (user && user.fcmToken) {
    //   await notificationService.sendNotification(user.fcmToken, notificationTitle, notificationBody, userId);
    // }
  }

  return paymentIntent;
};

// Step 3: Capture the Payment
const capturePaymentRequestToStripe = async (payload: { parcelId: string }) => {
  const { parcelId } = payload;

  const parcel = await prisma.parcel.findUnique({
    where: {
      id: parcelId,
      parcelStatus: ParcelStatus.DELIVERED,
    },
  });
  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Parcel not found');
  }

  const payment = await prisma.payment.findUnique({
    where: { parcelId: parcelId },
    select: {
      paymentId: true,
      paymentAmount: true,
      stripeAccountIdReceiver: true,
    },
  });
  if (!payment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment not found');
  }

  // Capture the authorized payment using the PaymentIntent ID
  const paymentIntent = await stripe.paymentIntents.capture(payment.paymentId);
  if (paymentIntent.status !== 'succeeded') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment not captured');
  }

  const transfer = await stripe.transfers.create({
    amount: payment.paymentAmount, // Amount in the smallest currency unit (e.g., cents for USD)
    currency: 'ngn', // Currency of the connected account
    destination: payment.stripeAccountIdReceiver, // Connected account ID
    metadata: {
      parcelId: parcelId, // Include parcel or order-related metadata
    },
  });
  if (!transfer) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Transfer not created');
  }

  const paymentStatus = await prisma.payment.update({
    where: { parcelId: parcelId },
    data: {
      status: PaymentStatus.COMPLETED,
    },
  });
  if (!paymentStatus) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment status not updated');
  }
  // Update the project status
  const parcelStatus = await prisma.parcel.update({
    where: { id: parcelId },
    data: {
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });
  if (!parcelStatus) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Project status not updated');
  }

  return paymentIntent;
};

// New Route: Save a New Card for Existing Customer
const saveNewCardWithExistingCustomerIntoStripe = async (payload: {
  customerId: string;
  paymentMethodId: string;
}) => {
  try {
    const { customerId, paymentMethodId } = payload;

    // Attach the new PaymentMethod to the existing Customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Optionally, set the new PaymentMethod as the default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return {
      customerId: customerId,
      paymentMethodId: paymentMethodId,
    };
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

const getCustomerSavedCardsFromStripe = async (userId: string) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Retrieve the customer details from Stripe
    if (!userData || !userData.senderCustomerID) {
      return { message: 'User data or customer ID not found' };
    }
    // List all payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: userData.senderCustomerID,
      type: 'card',
    });

    return { paymentMethods: paymentMethods.data };
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

// Delete a card from a customer in the stripe
const deleteCardFromCustomer = async (paymentMethodId: string) => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    return { message: 'Card deleted successfully' };
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

// Refund amount to customer in the stripe
const refundPaymentToCustomer = async (payload: {
  paymentIntentId: string;
}) => {
  try {
    // Refund the payment intent
    const refund = await stripe.refunds.create({
      payment_intent: payload?.paymentIntentId,
    });

    return refund;
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

// Service function for creating a PaymentIntent
const createPaymentIntentService = async (payload: { amount: number }) => {
  if (!payload.amount) {
    throw new AppError(httpStatus.CONFLICT, 'Amount is required');
  }

  if (!isValidAmount(payload.amount)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Amount '${payload.amount}' is not a valid amount`,
    );
  }

  // Create a PaymentIntent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: payload?.amount,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true, // Enable automatic payment methods like cards, Apple Pay, Google Pay
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
  };
};

const getCustomerDetailsFromStripe = async (userId: string) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Retrieve the customer details from Stripe
    if (!userData || !userData.senderCustomerID) {
      return { message: 'User data or customer ID not found' };
    }
    const customer = await stripe.customers.retrieve(userData.senderCustomerID);

    return customer;
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_FOUND, error.message);
  }
};

const getAllCustomersFromStripe = async () => {
  try {
    // Retrieve all customers from Stripe
    const customers = await stripe.customers.list({
      limit: 2,
    });

    return customers;
  } catch (error: any) {
    throw new AppError(httpStatus.CONFLICT, error.message);
  }
};

const createAccountIntoStripe = async (userId: string) => {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (userData.stripeAccountUrl && userData.stripeCustomerId) {
    const stripeAccountId = userData.stripeCustomerId;
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.FRONTEND_BASE_URL}/reauthenticate`,
      return_url: `${process.env.FRONTEND_BASE_URL}/onboarding-success`,
      type: 'account_onboarding',
    });

    await prisma.user.update({
      where: { id: userData.id },
      data: {
        stripeAccountUrl: accountLink.url,
      },
    });

    return accountLink;
  }

  // Create a Stripe Connect account
  const stripeAccount = await stripe.accounts.create({
    type: 'express',
    email: userData.email,
    metadata: {
      userId: userData.id,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Generate the onboarding link for the Stripe Express account
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccount.id,
    refresh_url: `${process.env.FRONTEND_BASE_URL}/reauthenticate`,
    return_url: `${process.env.FRONTEND_BASE_URL}/onboarding-success`,
    type: 'account_onboarding',
  });

  const stripeAccountId = stripeAccount.id;

  // Save both Stripe customerId and accountId in the database
  const updateUser = await prisma.user.update({
    where: { id: userData.id },
    data: {
      stripeAccountUrl: accountLink.url,
      stripeCustomerId: stripeAccountId,
    },
  });

  if (!updateUser) {
    throw new AppError(httpStatus.CONFLICT, 'Failed to save account details');
  }

  return accountLink;
};

export const StripeServices = {
  saveCardWithCustomerInfoIntoStripe,
  authorizedPaymentWithSaveCardFromStripe,
  capturePaymentRequestToStripe,
  saveNewCardWithExistingCustomerIntoStripe,
  getCustomerSavedCardsFromStripe,
  deleteCardFromCustomer,
  refundPaymentToCustomer,
  createPaymentIntentService,
  getCustomerDetailsFromStripe,
  getAllCustomersFromStripe,
  createAccountIntoStripe,
};
