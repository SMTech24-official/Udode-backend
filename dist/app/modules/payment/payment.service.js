"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../../config"));
const isValidAmount_1 = require("../../utils/isValidAmount");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const client_1 = require("@prisma/client");
const Notification_service_1 = require("../Notification/Notification.service");
// Initialize Stripe with your secret API key
const stripe = new stripe_1.default(config_1.default.stripe.stripe_secret_key, {
    apiVersion: '2024-12-18.acacia',
});
// Step 1: Create a Customer and Save the Card
const saveCardWithCustomerInfoIntoStripe = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentMethodId } = payload;
        let existCustomer = yield prisma_1.default.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                senderCustomerID: true,
                fullName: true,
                email: true,
            },
        });
        if (!existCustomer) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Customer not found');
        }
        if (!existCustomer.senderCustomerID) {
            // Create a new Stripe customer
            const customer = yield stripe.customers.create({
                name: existCustomer.fullName,
                email: existCustomer.email,
            });
            // Attach PaymentMethod to the Customer
            yield stripe.paymentMethods.attach(paymentMethodId, {
                customer: customer.id,
            });
            // Set PaymentMethod as Default
            yield stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            yield prisma_1.default.user.update({
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
        }
        else {
            // Attach PaymentMethod to the existing Customer
            yield stripe.paymentMethods.attach(paymentMethodId, {
                customer: existCustomer.senderCustomerID,
            });
            // Set PaymentMethod as Default
            yield stripe.customers.update(existCustomer.senderCustomerID, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            return {
                customerId: existCustomer.senderCustomerID,
                paymentMethodId: paymentMethodId,
            };
        }
    }
    catch (error) {
        console.error('Error in saveCardWithCustomerInfoIntoStripe:', error);
        throw new Error(error.message);
    }
});
// Step 2: Authorize the Payment Using Saved Card
const authorizedPaymentWithSaveCardFromStripe = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentMethodId, parcelId } = payload;
    // Retrieve the Customer from the database
    const customerDetails = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
            role: client_1.UserRoleEnum.USER,
        },
    });
    if (!customerDetails) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not found');
    }
    // Retrieve the project details
    const parcel = yield prisma_1.default.parcel.findUnique({
        where: {
            id: parcelId,
            userId: userId,
            parcelStatus: client_1.ParcelStatus.ACCEPTED,
            paymentStatus: client_1.PaymentStatus.PENDING,
        },
    });
    console.log(parcel);
    if (!parcel) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Parcel not found');
    }
    if (!parcel.deliveryPersonId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Delivery person ID not found');
    }
    const deliveryPerson = yield prisma_1.default.user.findUnique({
        where: {
            id: parcel.deliveryPersonId,
        },
        select: {
            stripeCustomerId: true,
        },
    });
    if (!deliveryPerson) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Delivery person not found');
    }
    let customerId = customerDetails.senderCustomerID;
    if (customerId) {
        const attach = yield stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        const updateCustomer = yield stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
    }
    // If the customerId doesn't exist, create a new Stripe customer
    if (!customerId) {
        const stripeCustomer = yield stripe.customers.create({
            email: customerDetails.email
                ? customerDetails.email
                : (() => {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Email not found');
                })(),
        });
        const attach = yield stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomer.id,
        });
        // Set PaymentMethod as Default
        const updateCustomer = yield stripe.customers.update(stripeCustomer.id, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        // Update the database with the new Stripe customer ID
        yield prisma_1.default.user.update({
            where: { id: userId },
            data: { senderCustomerID: stripeCustomer.id },
        });
        customerId = stripeCustomer.id; // Use the new customerId
    }
    const transportPriceInKobo = Math.round(parcel.parcelTransportPrice * 100); // Convert to Kobo
    if (transportPriceInKobo < 25000) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Minimum amount to be paid is 250');
    }
    // Calculate the amount to be transferred to the delivery person (65% of the total price)
    const transferAmount = Math.round(parcel.parcelTransportPrice * 0.65 * 100);
    // Create a PaymentIntent with the specified PaymentMethod
    const paymentIntent = yield stripe.paymentIntents.create({
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
            destination: deliveryPerson.stripeCustomerId,
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
        const payment = yield prisma_1.default.payment.create({
            data: {
                paymentId: paymentIntent.id,
                stripeAccountIdReceiver: deliveryPerson.stripeCustomerId,
                paymentAmount: parcel.parcelTransportPrice,
                paymentDate: new Date(),
                parcelId: parcelId,
                status: client_1.PaymentStatus.REQUIRES_CAPTURE,
                stripeCustomerIdProvider: customerDetails.senderCustomerID,
            },
        });
        if (!payment) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to save payment information');
        }
        // Update the project status
        const updateParcelStatus = yield prisma_1.default.parcel.update({
            where: { id: parcelId },
            data: {
                paymentStatus: client_1.PaymentStatus.REQUIRES_CAPTURE,
            },
        });
        if (!updateParcelStatus) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to update project status');
        }
        // Send notification to the user
        const user = yield prisma_1.default.user.findUnique({
            where: { id: parcel.deliveryPersonId },
            select: { fcmToken: true },
        });
        const notificationTitle = 'Payment Successful';
        const notificationBody = 'Your payment has been processed successfully and hold for delivery. Start your delivery now';
        if (user && user.fcmToken) {
            yield Notification_service_1.notificationService.sendNotification(user.fcmToken, notificationTitle, notificationBody, parcel.deliveryPersonId);
        }
    }
    return paymentIntent;
});
// Step 3: Capture the Payment
const capturePaymentRequestToStripe = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { parcelId } = payload;
    const parcel = yield prisma_1.default.parcel.findUnique({
        where: {
            id: parcelId,
            parcelStatus: client_1.ParcelStatus.COMPLETED,
        },
    });
    if (!parcel) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Parcel not found');
    }
    const payment = yield prisma_1.default.payment.findUnique({
        where: { parcelId: parcelId },
        select: {
            paymentId: true,
            paymentAmount: true,
            stripeAccountIdReceiver: true,
        },
    });
    if (!payment) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment not found');
    }
    // Capture the authorized payment using the PaymentIntent ID
    const paymentIntent = yield stripe.paymentIntents.capture(payment.paymentId);
    if (paymentIntent.status !== 'succeeded') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment not captured');
    }
    const transfer = yield stripe.transfers.create({
        amount: payment.paymentAmount * 100, // Amount in the smallest currency unit (e.g., cents for USD)
        currency: 'usd', // Currency of the connected account
        destination: payment.stripeAccountIdReceiver, // Connected account ID
        metadata: {
            parcelId: parcelId, // Include parcel or order-related metadata
        },
    });
    if (!transfer) {
        throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, 'Transfer not created');
    }
    const paymentStatus = yield prisma_1.default.payment.update({
        where: { parcelId: parcelId },
        data: {
            status: client_1.PaymentStatus.COMPLETED,
        },
    });
    if (!paymentStatus) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment status not updated');
    }
    // Update the project status
    const parcelStatus = yield prisma_1.default.parcel.update({
        where: { id: parcelId },
        data: {
            paymentStatus: client_1.PaymentStatus.COMPLETED,
        },
    });
    if (!parcelStatus) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Project status not updated');
    }
    return paymentIntent;
});
// New Route: Save a New Card for Existing Customer
const saveNewCardWithExistingCustomerIntoStripe = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, paymentMethodId } = payload;
        // Attach the new PaymentMethod to the existing Customer
        yield stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        // Optionally, set the new PaymentMethod as the default
        yield stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        return {
            customerId: customerId,
            paymentMethodId: paymentMethodId,
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, error.message);
    }
});
const getCustomerSavedCardsFromStripe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        // Retrieve the customer details from Stripe
        if (!userData || !userData.senderCustomerID) {
            return { message: 'User data or customer ID not found' };
        }
        // List all payment methods for the customer
        const paymentMethods = yield stripe.paymentMethods.list({
            customer: userData.senderCustomerID,
            type: 'card',
        });
        return { paymentMethods: paymentMethods.data };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, error.message);
    }
});
// Delete a card from a customer in the stripe
const deleteCardFromCustomer = (paymentMethodId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield stripe.paymentMethods.detach(paymentMethodId);
        return { message: 'Card deleted successfully' };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, error.message);
    }
});
// Refund amount to customer in the stripe
const refundPaymentToCustomer = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Refund the payment intent
        const refund = yield stripe.refunds.create({
            payment_intent: payload === null || payload === void 0 ? void 0 : payload.paymentIntentId,
        });
        return refund;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, error.message);
    }
});
// Service function for creating a PaymentIntent
const createPaymentIntentService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.amount) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Amount is required');
    }
    if (!(0, isValidAmount_1.isValidAmount)(payload.amount)) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, `Amount '${payload.amount}' is not a valid amount`);
    }
    // Create a PaymentIntent with Stripe
    const paymentIntent = yield stripe.paymentIntents.create({
        amount: payload === null || payload === void 0 ? void 0 : payload.amount,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true, // Enable automatic payment methods like cards, Apple Pay, Google Pay
        },
    });
    return {
        clientSecret: paymentIntent.client_secret,
        dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    };
});
const getCustomerDetailsFromStripe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        // Retrieve the customer details from Stripe
        if (!userData || !userData.senderCustomerID) {
            return { message: 'User data or customer ID not found' };
        }
        const customer = yield stripe.customers.retrieve(userData.senderCustomerID);
        return customer;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, error.message);
    }
});
const getAllCustomersFromStripe = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve all customers from Stripe
        const customers = yield stripe.customers.list({
            limit: 2,
        });
        return customers;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, error.message);
    }
});
const createAccountIntoStripe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (userData.stripeAccountUrl && userData.stripeCustomerId) {
        const stripeAccountId = userData.stripeCustomerId;
        const accountLink = yield stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.FRONTEND_BASE_URL}/reauthenticate`,
            return_url: `${process.env.FRONTEND_BASE_URL}/onboarding-success`,
            type: 'account_onboarding',
        });
        yield prisma_1.default.user.update({
            where: { id: userData.id },
            data: {
                stripeAccountUrl: accountLink.url,
            },
        });
        return accountLink;
    }
    // Create a Stripe Connect account
    const stripeAccount = yield stripe.accounts.create({
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
    const accountLink = yield stripe.accountLinks.create({
        account: stripeAccount.id,
        refresh_url: `${process.env.FRONTEND_BASE_URL}/reauthenticate`,
        return_url: `${process.env.FRONTEND_BASE_URL}/onboarding-success`,
        type: 'account_onboarding',
    });
    const stripeAccountId = stripeAccount.id;
    // Save both Stripe customerId and accountId in the database
    const updateUser = yield prisma_1.default.user.update({
        where: { id: userData.id },
        data: {
            stripeAccountUrl: accountLink.url,
            stripeCustomerId: stripeAccountId,
        },
    });
    if (!updateUser) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to save account details');
    }
    return accountLink;
});
exports.StripeServices = {
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
