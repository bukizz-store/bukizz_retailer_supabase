// ============================================
// Vendor Types
// ============================================

export type BusinessCategory = 'all_categories' | 'only_books';

export interface VendorProfile {
    id: string;
    personalDetails: {
        firstName: string;
        lastName: string;
        email: string;
        emailVerified: boolean;
        mobile: string;
        mobileVerified: boolean;
    };
    businessDetails: {
        businessName: string;
        businessCategory: BusinessCategory;
        // Conditional: Required for 'all_categories', optional for 'only_books'
        gstin?: string;
        // Conditional: Required for 'only_books'
        panNumber?: string;
        businessAddress: {
            addressLine1: string;
            addressLine2?: string;
            city: string;
            state: string;
            pincode: string;
        };
    };
    bankDetails: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        branchName: string;
    };
    status: 'draft' | 'pending_verification' | 'verified' | 'suspended';
    completionPercentage: number;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// School Types
// ============================================

export type SchoolBoard = 'CBSE' | 'ICSE' | 'State' | 'IB' | 'Cambridge';

export interface School {
    id: string;
    name: string;
    code: string;
    logoUrl: string;
    address: string;
    city: string;
    state: string;
    board: SchoolBoard;
    studentCount?: number;
    isActive: boolean;
}

// ============================================
// School Permission Types
// ============================================

export type SchoolRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SchoolPermission {
    id: string;
    vendorId: string;
    school: School;
    requestedCategories: SchoolProductCategory[];
    status: SchoolRequestStatus;
    rejectionReason?: string;
    requestedAt: Date;
    reviewedAt?: Date;
}

// ============================================
// Product Types
// ============================================

export type SchoolProductCategory = 'booksets' | 'uniforms' | 'merchandise';
export type GeneralProductCategory = 'bags' | 'bottles' | 'stationery' | 'art_supplies' | 'general_books';
export type ProductApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'live';

export interface ProductBase {
    id: string;
    vendorId: string;
    name: string;
    sku: string;
    description: string;
    price: number;
    mrp: number;
    stockQuantity: number;
    imageUrls: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SchoolProduct extends ProductBase {
    type: 'school';
    schoolId: string;
    school?: School;
    category: SchoolProductCategory;
    approvalStatus: ProductApprovalStatus;
    rejectionReason?: string;
    bundleItems?: BundleItem[];
}

export interface GeneralProduct extends ProductBase {
    type: 'general';
    category: GeneralProductCategory;
    // General products are auto-approved
    approvalStatus: 'live';
}

export type Product = SchoolProduct | GeneralProduct;

export interface BundleItem {
    id: string;
    productId: string;
    itemName: string;
    quantity: number;
    description?: string;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderType = 'school_bundle' | 'general';

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    vendorId: string;
    orderType: OrderType;
    school?: School;
    items: OrderItem[];
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface DashboardStats {
    totalSales: number;
    activeOrders: number;
    lowStockAlerts: number;
    pendingSchoolApprovals: number;
    totalProducts: number;
    totalSchools: number;
}

export interface ActionItem {
    id: string;
    type: 'school_request' | 'product_approval' | 'low_stock' | 'order';
    title: string;
    description: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: Date;
}

// ============================================
// Onboarding Types
// ============================================

export type OnboardingStep = 'mobile' | 'email' | 'business' | 'bank';

export interface OnboardingState {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    mobileVerified: boolean;
    emailVerified: boolean;
    businessDetailsComplete: boolean;
    bankDetailsComplete: boolean;
}

// ============================================
// Inventory Health Types
// ============================================

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    imageUrl?: string;
    stockCount: number;
    stockStatus: StockStatus;
    salesLossPotential: number; // Revenue lost due to stock issues
    lastUpdated: Date;
}

// ============================================
// Product Vertical/Category Types
// ============================================

export interface ProductVertical {
    id: string;
    name: string;
    icon: string;
    description?: string;
}

export interface ProductCategoryItem {
    id: string;
    verticalId: string;
    name: string;
    imageUrl?: string;
    description?: string;
}

export interface ProductBrand {
    id: string;
    name: string;
    logoUrl?: string;
}

// ============================================
// Returns & Cancellations Types
// ============================================

export type ReturnType = 'courier_return' | 'customer_return';
export type ReturnStatus = 'initiated' | 'in_transit' | 'received' | 'processed' | 'refunded';

export interface Return {
    id: string;
    orderId: string;
    orderNumber: string;
    returnType: ReturnType;
    status: ReturnStatus;
    productName: string;
    productSku: string;
    quantity: number;
    returnReason: string;
    trackingId?: string;
    initiatedAt: Date;
    expectedArrival?: Date;
    receivedAt?: Date;
    refundAmount: number;
}

export type CancellationType = 'seller_cancelled' | 'customer_cancelled';
export type CancellationReason =
    | 'out_of_stock'
    | 'price_error'
    | 'customer_request'
    | 'payment_failed'
    | 'address_issue'
    | 'other';

export interface Cancellation {
    id: string;
    orderId: string;
    orderNumber: string;
    cancellationType: CancellationType;
    reason: CancellationReason;
    reasonDetails?: string;
    productName: string;
    productSku: string;
    quantity: number;
    orderAmount: number;
    cancelledAt: Date;
    cancelledBy: string;
}

