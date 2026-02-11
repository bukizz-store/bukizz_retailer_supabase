import { z } from 'zod';

// ============================================
// Common Validation Patterns
// ============================================

const mobileRegex = /^[6-9]\d{9}$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

// ============================================
// Step 1: Mobile Verification Schema
// ============================================

export const mobileVerificationSchema = z.object({
    mobile: z
        .string()
        .min(10, 'Mobile number must be 10 digits')
        .max(10, 'Mobile number must be 10 digits')
        .regex(mobileRegex, 'Please enter a valid Indian mobile number'),
    otp: z
        .string()
        .length(6, 'OTP must be 6 digits')
        .optional(),
});

export type MobileVerificationData = z.infer<typeof mobileVerificationSchema>;

// ============================================
// Step 2: Email Verification Schema
// ============================================

export const emailVerificationSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    otp: z
        .string()
        .length(6, 'OTP must be 6 digits')
        .optional(),
});

export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;

// ============================================
// Step 3: Business Details Schema
// ============================================

// Base schema for common fields
const businessDetailsBaseSchema = z.object({
    businessName: z
        .string()
        .min(3, 'Business name must be at least 3 characters')
        .max(100, 'Business name must be less than 100 characters'),
    businessCategory: z.enum(['all_categories', 'only_books'], {
        required_error: 'Please select a business category',
    }),
    addressLine1: z
        .string()
        .min(5, 'Address must be at least 5 characters'),
    addressLine2: z.string().optional(),
    city: z
        .string()
        .min(2, 'City name is required'),
    state: z
        .string()
        .min(2, 'State is required'),
    pincode: z
        .string()
        .regex(pincodeRegex, 'Please enter a valid 6-digit pincode'),
});

// Schema for All Categories (GSTIN mandatory)
const allCategoriesSchema = businessDetailsBaseSchema.extend({
    businessCategory: z.literal('all_categories'),
    gstin: z
        .string()
        .regex(gstinRegex, 'Please enter a valid 15-character GSTIN'),
    panNumber: z.string().optional(),
});

// Schema for Only Books (PAN mandatory, GSTIN optional)
const onlyBooksSchema = businessDetailsBaseSchema.extend({
    businessCategory: z.literal('only_books'),
    gstin: z
        .string()
        .regex(gstinRegex, 'Please enter a valid GSTIN')
        .optional()
        .or(z.literal('')),
    panNumber: z
        .string()
        .regex(panRegex, 'Please enter a valid 10-character PAN'),
});

// Combined discriminated union schema
export const businessDetailsSchema = z.discriminatedUnion('businessCategory', [
    allCategoriesSchema,
    onlyBooksSchema,
]);

export type BusinessDetailsData = z.infer<typeof businessDetailsSchema>;

// ============================================
// Step 4: Bank Details Schema
// ============================================

// Base schema without refinement (for combining with other schemas)
const bankDetailsBaseSchema = z.object({
    accountHolderName: z
        .string()
        .min(3, 'Account holder name is required')
        .max(100, 'Name must be less than 100 characters'),
    accountNumber: z
        .string()
        .min(9, 'Account number must be at least 9 digits')
        .max(18, 'Account number must be at most 18 digits')
        .regex(/^\d+$/, 'Account number must contain only digits'),
    confirmAccountNumber: z
        .string()
        .min(1, 'Please confirm account number'),
    ifscCode: z
        .string()
        .length(11, 'IFSC code must be 11 characters')
        .regex(ifscRegex, 'Please enter a valid IFSC code'),
    bankName: z
        .string()
        .min(2, 'Bank name is required'),
    branchName: z
        .string()
        .min(2, 'Branch name is required'),
});

// Full schema with account number matching validation
export const bankDetailsSchema = bankDetailsBaseSchema.refine(
    (data) => data.accountNumber === data.confirmAccountNumber,
    {
        message: "Account numbers don't match",
        path: ['confirmAccountNumber'],
    }
);

export type BankDetailsData = z.infer<typeof bankDetailsSchema>;

// ============================================
// Combined Registration Schema
// ============================================

export const registrationSchema = z.object({
    mobile: mobileVerificationSchema.shape.mobile,
    email: emailVerificationSchema.shape.email,
    ...businessDetailsBaseSchema.shape,
    gstin: z.string().optional(),
    panNumber: z.string().optional(),
    ...bankDetailsBaseSchema.omit({ confirmAccountNumber: true }).shape,
});

export type RegistrationData = z.infer<typeof registrationSchema>;

// ============================================
// School Request Schema
// ============================================

export const schoolRequestSchema = z.object({
    schoolId: z.string().min(1, 'Please select a school'),
    requestedCategories: z
        .array(z.enum(['booksets', 'uniforms', 'merchandise']))
        .min(1, 'Please select at least one category'),
    notes: z.string().optional(),
});

export type SchoolRequestData = z.infer<typeof schoolRequestSchema>;

// ============================================
// Product Schema
// ============================================

export const productSchema = z.object({
    name: z
        .string()
        .min(3, 'Product name must be at least 3 characters')
        .max(200, 'Product name must be less than 200 characters'),
    sku: z
        .string()
        .min(3, 'SKU is required')
        .max(50, 'SKU must be less than 50 characters'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be less than 2000 characters'),
    price: z
        .number()
        .positive('Price must be greater than 0')
        .max(1000000, 'Price seems too high'),
    mrp: z
        .number()
        .positive('MRP must be greater than 0'),
    stockQuantity: z
        .number()
        .int()
        .min(0, 'Stock cannot be negative'),
}).refine((data) => data.price <= data.mrp, {
    message: 'Selling price cannot exceed MRP',
    path: ['price'],
});

export type ProductData = z.infer<typeof productSchema>;
