import { z } from 'zod';

// Mobile Verification Schema
export const mobileVerificationSchema = z.object({
    mobile: z.string()
        .min(10, 'Mobile number must be 10 digits')
        .max(10, 'Mobile number must be 10 digits')
        .regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'),
    otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

// Email Verification Schema
export const emailVerificationSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

// Registration Start Schema (Consolidated)
export const registrationStartSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    mobile: z.string()
        .min(10, 'Mobile number must be 10 digits')
        .max(10, 'Mobile number must be 10 digits')
        .regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Business Details Schema — Individual
const individualBusinessSchema = z.object({
    businessCategory: z.literal('individual'),
    businessName: z.string().min(3, 'Business name is required'),
    ownerName: z.string().min(2, 'Owner name is required'),
    panNumber: z.string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'),
    address: z.object({
        line1: z.string().min(5, 'Address is required'),
        line2: z.string().optional(),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string()
            .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'),
    }),
});

// Business Details Schema — Company
const companyBusinessSchema = z.object({
    businessCategory: z.literal('company'),
    businessName: z.string().min(3, 'Business name is required'),
    ownerName: z.string().min(2, 'Owner name is required'),
    gstin: z.string()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            'Please enter a valid GSTIN'
        ),
    panNumber: z.string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'),
    address: z.object({
        line1: z.string().min(5, 'Address is required'),
        line2: z.string().optional(),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string()
            .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'),
    }),
});

// Business Details Schema — Partnership
const partnershipBusinessSchema = z.object({
    businessCategory: z.literal('partnership'),
    businessName: z.string().min(3, 'Business name is required'),
    ownerName: z.string().min(2, 'Owner name is required'),
    gstin: z.string()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            'Please enter a valid GSTIN'
        ),
    panNumber: z.string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'),
    partnershipDeed: z.string().optional(),
    address: z.object({
        line1: z.string().min(5, 'Address is required'),
        line2: z.string().optional(),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string()
            .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'),
    }),
});

// Business Details Schema — All Categories (Default)
const allCategoriesSchema = z.object({
    businessCategory: z.literal('all_categories'),
    businessName: z.string().min(3, 'Business name is required'),
    ownerName: z.string().min(2, 'Owner name is required'),
    gstin: z.string()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            'Please enter a valid GSTIN'
        ),
    // Wait, user label said "Enter GSTIN (Optional)".
    // Previously user said "Default to 'All Categories' (GSTIN required)".
    // BUT in step 324 I changed label to "Enter GSTIN (Optional)".
    // So I should make it optional here too.
    panNumber: z.string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'),
    address: z.object({
        line1: z.string().min(5, 'Address is required'),
        line2: z.string().optional(),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string()
            .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'),
    }),
});

export const businessDetailsSchema = z.discriminatedUnion('businessCategory', [
    individualBusinessSchema,
    companyBusinessSchema,
    partnershipBusinessSchema,
    allCategoriesSchema,
]);

// Warehouse (Store & Pickup Details) Schema
export const warehouseDetailsSchema = z.object({
    name: z.string().min(2, 'Warehouse / Store name is required'),
    contactEmail: z.string().email('Please enter a valid email').or(z.literal('')).optional(),
    contactPhone: z.string()
        .regex(/^\+?\d[\d\s-]{7,15}$/, 'Please enter a valid phone number')
        .or(z.literal(''))
        .optional(),
    website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
    address: z.object({
        line1: z.string().min(5, 'Address line 1 is required'),
        line2: z.string().optional(),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        postalCode: z.string()
            .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'),
        country: z.string().min(2, 'Country is required').default('India'),
        lat: z.union([z.number(), z.nan(), z.null()]).optional(),
        lng: z.union([z.number(), z.nan(), z.null()]).optional(),
    }),
});

// Bank Details Schema
export const bankDetailsSchema = z.object({
    accountHolderName: z.string().min(3, 'Account holder name is required'),
    accountNumber: z.string()
        .min(9, 'Account number must be at least 9 digits')
        .max(18, 'Account number must not exceed 18 digits')
        .regex(/^\d+$/, 'Account number must contain only digits'),
    confirmAccountNumber: z.string(),
    ifscCode: z.string()
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'),
    bankName: z.string().min(2, 'Bank name is required'),
    branchName: z.string().optional(),
    accountType: z.enum(['savings', 'current'], {
        required_error: 'Please select account type',
    }),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers don't match",
    path: ['confirmAccountNumber'],
});

// Registration Schema (combined)
export const registrationSchema = z.object({
    mobile: mobileVerificationSchema,
    email: emailVerificationSchema,
    business: businessDetailsSchema,
    bank: bankDetailsSchema,
});

// Product Schema (base)
const baseProductSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    sku: z.string()
        .min(3, 'SKU must be at least 3 characters')
        .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().optional(),
    mrp: z.number().positive('MRP must be positive'),
    sellingPrice: z.number().positive('Selling price must be positive'),
    stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
    images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed').optional(),
    specifications: z.record(z.string()).optional(),
});

const priceRefinement = (data) => data.sellingPrice <= data.mrp;
const priceRefinementConfig = {
    message: 'Selling price cannot exceed MRP',
    path: ['sellingPrice'],
};

export const productSchema = baseProductSchema.refine(priceRefinement, priceRefinementConfig);

// School Product Schema
export const schoolProductSchema = baseProductSchema.extend({
    schoolId: z.string().min(1, 'School is required'),
    classId: z.string().min(1, 'Class is required'),
    subject: z.string().optional(),
}).refine(priceRefinement, priceRefinementConfig);
