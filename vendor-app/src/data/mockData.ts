import {
    School,
    SchoolPermission,
    SchoolProduct,
    GeneralProduct,
    Order,
    DashboardStats,
    ActionItem,
    VendorProfile,
} from '@/types';

// ============================================
// Mock Schools Database
// ============================================

export const mockSchools: School[] = [
    {
        id: 'sch_001',
        name: 'St. Xavier\'s High School',
        code: 'SXHS-DEL',
        logoUrl: '/schools/st-xaviers.png',
        address: '12, Raj Nagar Colony',
        city: 'New Delhi',
        state: 'Delhi',
        board: 'CBSE',
        studentCount: 2500,
        isActive: true,
    },
    {
        id: 'sch_002',
        name: 'Delhi Public School',
        code: 'DPS-RKP',
        logoUrl: '/schools/dps.png',
        address: 'Sector 24, R.K. Puram',
        city: 'New Delhi',
        state: 'Delhi',
        board: 'CBSE',
        studentCount: 4200,
        isActive: true,
    },
    {
        id: 'sch_003',
        name: 'The Bishop\'s School',
        code: 'TBS-PUN',
        logoUrl: '/schools/bishops.png',
        address: 'Camp, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        board: 'ICSE',
        studentCount: 1800,
        isActive: true,
    },
    {
        id: 'sch_004',
        name: 'Kendriya Vidyalaya',
        code: 'KV-BLR',
        logoUrl: '/schools/kv.png',
        address: 'IISc Campus',
        city: 'Bangalore',
        state: 'Karnataka',
        board: 'CBSE',
        studentCount: 3100,
        isActive: true,
    },
    {
        id: 'sch_005',
        name: 'La Martiniere College',
        code: 'LMC-LKO',
        logoUrl: '/schools/la-martiniere.png',
        address: 'Cantonment',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        board: 'ICSE',
        studentCount: 2200,
        isActive: true,
    },
    {
        id: 'sch_006',
        name: 'Ryan International School',
        code: 'RIS-MUM',
        logoUrl: '/schools/ryan.png',
        address: 'Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        board: 'CBSE',
        studentCount: 3500,
        isActive: true,
    },
];

// ============================================
// Mock Vendor School Permissions
// ============================================

export const mockSchoolPermissions: SchoolPermission[] = [
    {
        id: 'perm_001',
        vendorId: 'vendor_001',
        school: mockSchools[0], // St. Xavier's
        requestedCategories: ['booksets', 'uniforms'],
        status: 'approved',
        requestedAt: new Date('2024-01-15'),
        reviewedAt: new Date('2024-01-18'),
    },
    {
        id: 'perm_002',
        vendorId: 'vendor_001',
        school: mockSchools[1], // DPS
        requestedCategories: ['booksets', 'uniforms', 'merchandise'],
        status: 'approved',
        requestedAt: new Date('2024-02-01'),
        reviewedAt: new Date('2024-02-05'),
    },
    {
        id: 'perm_003',
        vendorId: 'vendor_001',
        school: mockSchools[2], // Bishop's
        requestedCategories: ['booksets'],
        status: 'pending',
        requestedAt: new Date('2024-03-10'),
    },
    {
        id: 'perm_004',
        vendorId: 'vendor_001',
        school: mockSchools[3], // KV
        requestedCategories: ['uniforms', 'merchandise'],
        status: 'rejected',
        rejectionReason: 'Already have an exclusive vendor for this school',
        requestedAt: new Date('2024-02-20'),
        reviewedAt: new Date('2024-02-25'),
    },
];

// ============================================
// Mock School Products
// ============================================

export const mockSchoolProducts: SchoolProduct[] = [
    {
        id: 'prod_001',
        vendorId: 'vendor_001',
        type: 'school',
        schoolId: 'sch_001',
        school: mockSchools[0],
        name: 'Class 10 Complete Book Set - CBSE 2024',
        sku: 'SX-C10-BOOKSET-2024',
        description: 'Complete book set for Class 10 CBSE including NCERT textbooks and reference materials',
        price: 2499,
        mrp: 3200,
        stockQuantity: 150,
        category: 'booksets',
        approvalStatus: 'live',
        imageUrls: ['/products/bookset-1.jpg'],
        bundleItems: [
            { id: 'bi_001', productId: 'prod_001', itemName: 'Mathematics NCERT', quantity: 1 },
            { id: 'bi_002', productId: 'prod_001', itemName: 'Science NCERT', quantity: 1 },
            { id: 'bi_003', productId: 'prod_001', itemName: 'Social Science NCERT', quantity: 1 },
            { id: 'bi_004', productId: 'prod_001', itemName: 'English Core', quantity: 1 },
            { id: 'bi_005', productId: 'prod_001', itemName: 'Hindi Course A', quantity: 1 },
        ],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-25'),
    },
    {
        id: 'prod_002',
        vendorId: 'vendor_001',
        type: 'school',
        schoolId: 'sch_001',
        school: mockSchools[0],
        name: 'Boys Summer Uniform Set',
        sku: 'SX-UNI-BOYS-SUM',
        description: 'Complete summer uniform set including shirt, shorts, tie, and belt',
        price: 1299,
        mrp: 1599,
        stockQuantity: 200,
        category: 'uniforms',
        approvalStatus: 'live',
        imageUrls: ['/products/uniform-boys.jpg'],
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
    },
    {
        id: 'prod_003',
        vendorId: 'vendor_001',
        type: 'school',
        schoolId: 'sch_002',
        school: mockSchools[1],
        name: 'Class 8 Science Lab Kit',
        sku: 'DPS-C8-LABKIT',
        description: 'Complete science laboratory kit for Class 8 experiments',
        price: 899,
        mrp: 1199,
        stockQuantity: 75,
        category: 'merchandise',
        approvalStatus: 'pending',
        imageUrls: ['/products/labkit.jpg'],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
    },
    {
        id: 'prod_004',
        vendorId: 'vendor_001',
        type: 'school',
        schoolId: 'sch_002',
        school: mockSchools[1],
        name: 'Girls Winter Uniform Set',
        sku: 'DPS-UNI-GIRLS-WIN',
        description: 'Complete winter uniform set including blazer, sweater, and skirt',
        price: 2199,
        mrp: 2699,
        stockQuantity: 8,
        category: 'uniforms',
        approvalStatus: 'rejected',
        rejectionReason: 'Image quality is poor. Please upload high-resolution product images.',
        imageUrls: ['/products/uniform-girls.jpg'],
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-20'),
    },
];

// ============================================
// Mock General Products
// ============================================

export const mockGeneralProducts: GeneralProduct[] = [
    {
        id: 'gen_001',
        vendorId: 'vendor_001',
        type: 'general',
        name: 'Premium School Backpack - 35L',
        sku: 'GEN-BAG-PRE-35L',
        description: 'High-quality ergonomic school backpack with laptop compartment',
        price: 1499,
        mrp: 1999,
        stockQuantity: 500,
        category: 'bags',
        approvalStatus: 'live',
        imageUrls: ['/products/backpack.jpg'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
    },
    {
        id: 'gen_002',
        vendorId: 'vendor_001',
        type: 'general',
        name: 'Stainless Steel Water Bottle - 1L',
        sku: 'GEN-BOT-SS-1L',
        description: 'Insulated stainless steel bottle, keeps water cold for 24 hours',
        price: 599,
        mrp: 799,
        stockQuantity: 300,
        category: 'bottles',
        approvalStatus: 'live',
        imageUrls: ['/products/bottle.jpg'],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
    },
    {
        id: 'gen_003',
        vendorId: 'vendor_001',
        type: 'general',
        name: 'Art & Craft Kit Deluxe',
        sku: 'GEN-ART-DLX',
        description: 'Complete art kit with colors, brushes, canvas, and more',
        price: 899,
        mrp: 1199,
        stockQuantity: 12,
        category: 'art_supplies',
        approvalStatus: 'live',
        imageUrls: ['/products/artkit.jpg'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
    },
    {
        id: 'gen_004',
        vendorId: 'vendor_001',
        type: 'general',
        name: 'Executive Pen Set',
        sku: 'GEN-PEN-EXEC',
        description: 'Premium ball pen set with gel ink, pack of 10',
        price: 299,
        mrp: 399,
        stockQuantity: 1000,
        category: 'stationery',
        approvalStatus: 'live',
        imageUrls: ['/products/penset.jpg'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
    },
];

// ============================================
// Mock Orders
// ============================================

export const mockOrders: Order[] = [
    {
        id: 'ord_001',
        orderNumber: 'BKZ-2024-001234',
        vendorId: 'vendor_001',
        orderType: 'school_bundle',
        school: mockSchools[0],
        items: [
            {
                id: 'item_001',
                product: mockSchoolProducts[0],
                quantity: 2,
                unitPrice: 2499,
                totalPrice: 4998,
            },
        ],
        customerName: 'Rajesh Kumar',
        customerPhone: '9876543210',
        shippingAddress: '45, Green Park Extension, New Delhi - 110016',
        totalAmount: 4998,
        status: 'confirmed',
        createdAt: new Date('2024-03-15T10:30:00'),
        updatedAt: new Date('2024-03-15T11:00:00'),
    },
    {
        id: 'ord_002',
        orderNumber: 'BKZ-2024-001235',
        vendorId: 'vendor_001',
        orderType: 'general',
        items: [
            {
                id: 'item_002',
                product: mockGeneralProducts[0],
                quantity: 1,
                unitPrice: 1499,
                totalPrice: 1499,
            },
            {
                id: 'item_003',
                product: mockGeneralProducts[1],
                quantity: 2,
                unitPrice: 599,
                totalPrice: 1198,
            },
        ],
        customerName: 'Priya Sharma',
        customerPhone: '9123456780',
        shippingAddress: '78, Koramangala 4th Block, Bangalore - 560034',
        totalAmount: 2697,
        status: 'processing',
        createdAt: new Date('2024-03-14T15:45:00'),
        updatedAt: new Date('2024-03-15T09:00:00'),
    },
    {
        id: 'ord_003',
        orderNumber: 'BKZ-2024-001236',
        vendorId: 'vendor_001',
        orderType: 'school_bundle',
        school: mockSchools[1],
        items: [
            {
                id: 'item_004',
                product: mockSchoolProducts[1],
                quantity: 3,
                unitPrice: 1299,
                totalPrice: 3897,
            },
        ],
        customerName: 'Amit Patel',
        customerPhone: '9988776655',
        shippingAddress: '23, Sector 15, Noida - 201301',
        totalAmount: 3897,
        status: 'shipped',
        createdAt: new Date('2024-03-12T08:20:00'),
        updatedAt: new Date('2024-03-14T16:00:00'),
    },
    {
        id: 'ord_004',
        orderNumber: 'BKZ-2024-001237',
        vendorId: 'vendor_001',
        orderType: 'general',
        items: [
            {
                id: 'item_005',
                product: mockGeneralProducts[2],
                quantity: 5,
                unitPrice: 899,
                totalPrice: 4495,
            },
        ],
        customerName: 'Sunita Verma',
        customerPhone: '9456123780',
        shippingAddress: '112, Banjara Hills, Hyderabad - 500034',
        totalAmount: 4495,
        status: 'delivered',
        createdAt: new Date('2024-03-10T11:00:00'),
        updatedAt: new Date('2024-03-13T14:00:00'),
    },
];

// ============================================
// Mock Dashboard Stats
// ============================================

export const mockDashboardStats: DashboardStats = {
    totalSales: 245670,
    activeOrders: 12,
    lowStockAlerts: 3,
    pendingSchoolApprovals: 2,
    totalProducts: 24,
    totalSchools: 2,
};

// ============================================
// Mock Action Items
// ============================================

export const mockActionItems: ActionItem[] = [
    {
        id: 'action_001',
        type: 'school_request',
        title: 'The Bishop\'s School - Pune',
        description: 'Your franchise request is pending approval',
        status: 'Pending',
        priority: 'high',
        createdAt: new Date('2024-03-10'),
    },
    {
        id: 'action_002',
        type: 'product_approval',
        title: 'Girls Winter Uniform Set',
        description: 'Rejected - Fix image quality issue',
        status: 'Rejected',
        priority: 'high',
        createdAt: new Date('2024-02-20'),
    },
    {
        id: 'action_003',
        type: 'product_approval',
        title: 'Class 8 Science Lab Kit',
        description: 'Pending admin review',
        status: 'Pending',
        priority: 'medium',
        createdAt: new Date('2024-03-01'),
    },
    {
        id: 'action_004',
        type: 'low_stock',
        title: 'Art & Craft Kit Deluxe',
        description: 'Only 12 units remaining',
        status: 'Low Stock',
        priority: 'medium',
        createdAt: new Date('2024-03-15'),
    },
    {
        id: 'action_005',
        type: 'low_stock',
        title: 'Girls Winter Uniform Set (DPS)',
        description: 'Only 8 units remaining',
        status: 'Low Stock',
        priority: 'low',
        createdAt: new Date('2024-03-15'),
    },
];

// ============================================
// Mock Vendor Profile
// ============================================

export const mockVendorProfile: VendorProfile = {
    id: 'vendor_001',
    personalDetails: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@example.com',
        emailVerified: true,
        mobile: '9876543210',
        mobileVerified: true,
    },
    businessDetails: {
        businessName: 'Sharma Books & Stationery',
        businessCategory: 'all_categories',
        gstin: '07AAACH7409R1ZZ',
        businessAddress: {
            addressLine1: '234, Chandni Chowk',
            addressLine2: 'Near Red Fort',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110006',
        },
    },
    bankDetails: {
        accountHolderName: 'Rahul Sharma',
        accountNumber: '1234567890123456',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Chandni Chowk',
    },
    status: 'verified',
    completionPercentage: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-01'),
};

// ============================================
// Indian States for Dropdowns
// ============================================

export const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Chandigarh', 'Puducherry',
];

// ============================================
// Mock Inventory Items (For Health Dashboard)
// ============================================

import {
    InventoryItem,
    ProductVertical,
    ProductCategoryItem,
    ProductBrand,
    Return,
    Cancellation,
} from '@/types';

export const mockInventoryItems: InventoryItem[] = [
    {
        id: 'inv_001',
        productId: 'gen_001',
        productName: 'Premium School Backpack - 35L',
        sku: 'GEN-BAG-PRE-35L',
        stockCount: 500,
        stockStatus: 'in_stock',
        salesLossPotential: 0,
        lastUpdated: new Date('2024-03-15'),
    },
    {
        id: 'inv_002',
        productId: 'gen_002',
        productName: 'Stainless Steel Water Bottle - 1L',
        sku: 'GEN-BOT-SS-1L',
        stockCount: 300,
        stockStatus: 'in_stock',
        salesLossPotential: 0,
        lastUpdated: new Date('2024-03-15'),
    },
    {
        id: 'inv_003',
        productId: 'gen_003',
        productName: 'Art & Craft Kit Deluxe',
        sku: 'GEN-ART-DLX',
        stockCount: 12,
        stockStatus: 'low_stock',
        salesLossPotential: 4500,
        lastUpdated: new Date('2024-03-14'),
    },
    {
        id: 'inv_004',
        productId: 'gen_004',
        productName: 'Executive Pen Set',
        sku: 'GEN-PEN-EXEC',
        stockCount: 1000,
        stockStatus: 'in_stock',
        salesLossPotential: 0,
        lastUpdated: new Date('2024-03-15'),
    },
    {
        id: 'inv_005',
        productId: 'prod_004',
        productName: 'Girls Winter Uniform Set',
        sku: 'DPS-UNI-GIRLS-WIN',
        stockCount: 8,
        stockStatus: 'low_stock',
        salesLossPotential: 8800,
        lastUpdated: new Date('2024-03-14'),
    },
    {
        id: 'inv_006',
        productId: 'prod_005',
        productName: 'Class 9 Science Textbook',
        sku: 'SX-C9-SCI-TXT',
        stockCount: 0,
        stockStatus: 'out_of_stock',
        salesLossPotential: 12500,
        lastUpdated: new Date('2024-03-10'),
    },
    {
        id: 'inv_007',
        productId: 'prod_006',
        productName: 'Boys Sports Uniform',
        sku: 'KV-UNI-SPORTS-B',
        stockCount: 0,
        stockStatus: 'out_of_stock',
        salesLossPotential: 9200,
        lastUpdated: new Date('2024-03-12'),
    },
    {
        id: 'inv_008',
        productId: 'gen_008',
        productName: 'Geometry Box Premium',
        sku: 'GEN-GEO-PRE',
        stockCount: 5,
        stockStatus: 'low_stock',
        salesLossPotential: 2500,
        lastUpdated: new Date('2024-03-13'),
    },
];

// ============================================
// Mock Product Verticals & Categories
// ============================================

export const mockProductVerticals: ProductVertical[] = [
    { id: 'vert_001', name: 'School Essentials', icon: '🎒' },
    { id: 'vert_002', name: 'Stationery', icon: '✏️' },
    { id: 'vert_003', name: 'Clothing', icon: '👕' },
    { id: 'vert_004', name: 'Electronics', icon: '💻' },
    { id: 'vert_005', name: 'Sports & Games', icon: '⚽' },
    { id: 'vert_006', name: 'Art Supplies', icon: '🎨' },
];

export const mockProductCategories: ProductCategoryItem[] = [
    // School Essentials
    { id: 'cat_001', verticalId: 'vert_001', name: 'Geometry Box', imageUrl: '/categories/geometry-box.jpg' },
    { id: 'cat_002', verticalId: 'vert_001', name: 'Water Bottle', imageUrl: '/categories/bottle.jpg' },
    { id: 'cat_003', verticalId: 'vert_001', name: 'Lunch Box', imageUrl: '/categories/lunchbox.jpg' },
    { id: 'cat_004', verticalId: 'vert_001', name: 'School Bag', imageUrl: '/categories/bag.jpg' },
    { id: 'cat_005', verticalId: 'vert_001', name: 'Pencil Case', imageUrl: '/categories/pencil-case.jpg' },

    // Stationery
    { id: 'cat_006', verticalId: 'vert_002', name: 'Notebooks', imageUrl: '/categories/notebook.jpg' },
    { id: 'cat_007', verticalId: 'vert_002', name: 'Pens & Pencils', imageUrl: '/categories/pens.jpg' },
    { id: 'cat_008', verticalId: 'vert_002', name: 'Erasers & Sharpeners', imageUrl: '/categories/erasers.jpg' },
    { id: 'cat_009', verticalId: 'vert_002', name: 'Rulers & Scales', imageUrl: '/categories/rulers.jpg' },

    // Clothing
    { id: 'cat_010', verticalId: 'vert_003', name: 'Uniform Set', imageUrl: '/categories/uniform.jpg' },
    { id: 'cat_011', verticalId: 'vert_003', name: 'Sports Wear', imageUrl: '/categories/sports-wear.jpg' },
    { id: 'cat_012', verticalId: 'vert_003', name: 'Shoes', imageUrl: '/categories/shoes.jpg' },
    { id: 'cat_013', verticalId: 'vert_003', name: 'Socks', imageUrl: '/categories/socks.jpg' },

    // Electronics
    { id: 'cat_014', verticalId: 'vert_004', name: 'Calculators', imageUrl: '/categories/calculator.jpg' },
    { id: 'cat_015', verticalId: 'vert_004', name: 'USB Drives', imageUrl: '/categories/usb.jpg' },

    // Sports & Games
    { id: 'cat_016', verticalId: 'vert_005', name: 'Cricket Equipment', imageUrl: '/categories/cricket.jpg' },
    { id: 'cat_017', verticalId: 'vert_005', name: 'Football', imageUrl: '/categories/football.jpg' },
    { id: 'cat_018', verticalId: 'vert_005', name: 'Badminton', imageUrl: '/categories/badminton.jpg' },

    // Art Supplies
    { id: 'cat_019', verticalId: 'vert_006', name: 'Color Pencils', imageUrl: '/categories/color-pencils.jpg' },
    { id: 'cat_020', verticalId: 'vert_006', name: 'Sketch Books', imageUrl: '/categories/sketchbook.jpg' },
    { id: 'cat_021', verticalId: 'vert_006', name: 'Paint Sets', imageUrl: '/categories/paint.jpg' },
];

export const mockProductBrands: ProductBrand[] = [
    { id: 'brand_001', name: 'Classmate', logoUrl: '/brands/classmate.png' },
    { id: 'brand_002', name: 'Faber-Castell', logoUrl: '/brands/faber-castell.png' },
    { id: 'brand_003', name: 'Camlin', logoUrl: '/brands/camlin.png' },
    { id: 'brand_004', name: 'Apsara', logoUrl: '/brands/apsara.png' },
    { id: 'brand_005', name: 'Safari Bags', logoUrl: '/brands/safari.png' },
    { id: 'brand_006', name: 'Milton', logoUrl: '/brands/milton.png' },
    { id: 'brand_007', name: 'Cello', logoUrl: '/brands/cello.png' },
    { id: 'brand_008', name: 'Other / Unbranded', logoUrl: '' },
];

// ============================================
// Mock Returns
// ============================================

export const mockReturns: Return[] = [
    {
        id: 'ret_001',
        orderId: 'ord_001',
        orderNumber: 'BKZ-2024-001234',
        returnType: 'customer_return',
        status: 'in_transit',
        productName: 'Class 10 Complete Book Set',
        productSku: 'SX-C10-BOOKSET-2024',
        quantity: 1,
        returnReason: 'Wrong item received',
        trackingId: 'AWB123456789',
        initiatedAt: new Date('2024-03-18'),
        expectedArrival: new Date('2024-03-20'),
        refundAmount: 2499,
    },
    {
        id: 'ret_002',
        orderId: 'ord_005',
        orderNumber: 'BKZ-2024-001240',
        returnType: 'courier_return',
        status: 'received',
        productName: 'Premium School Backpack',
        productSku: 'GEN-BAG-PRE-35L',
        quantity: 1,
        returnReason: 'Customer not available - RTO',
        trackingId: 'AWB987654321',
        initiatedAt: new Date('2024-03-15'),
        receivedAt: new Date('2024-03-19'),
        refundAmount: 0,
    },
    {
        id: 'ret_003',
        orderId: 'ord_006',
        orderNumber: 'BKZ-2024-001241',
        returnType: 'customer_return',
        status: 'initiated',
        productName: 'Art & Craft Kit Deluxe',
        productSku: 'GEN-ART-DLX',
        quantity: 2,
        returnReason: 'Product damaged',
        initiatedAt: new Date('2024-03-19'),
        refundAmount: 1798,
    },
];

// ============================================
// Mock Cancellations
// ============================================

export const mockCancellations: Cancellation[] = [
    {
        id: 'canc_001',
        orderId: 'ord_010',
        orderNumber: 'BKZ-2024-001250',
        cancellationType: 'seller_cancelled',
        reason: 'out_of_stock',
        reasonDetails: 'Item went out of stock before fulfillment',
        productName: 'Class 9 Science Textbook',
        productSku: 'SX-C9-SCI-TXT',
        quantity: 3,
        orderAmount: 1497,
        cancelledAt: new Date('2024-03-17'),
        cancelledBy: 'System',
    },
    {
        id: 'canc_002',
        orderId: 'ord_011',
        orderNumber: 'BKZ-2024-001251',
        cancellationType: 'customer_cancelled',
        reason: 'customer_request',
        reasonDetails: 'Customer changed their mind',
        productName: 'Boys Summer Uniform Set',
        productSku: 'SX-UNI-BOYS-SUM',
        quantity: 2,
        orderAmount: 2598,
        cancelledAt: new Date('2024-03-16'),
        cancelledBy: 'Customer',
    },
    {
        id: 'canc_003',
        orderId: 'ord_012',
        orderNumber: 'BKZ-2024-001252',
        cancellationType: 'seller_cancelled',
        reason: 'price_error',
        reasonDetails: 'Incorrect pricing listed',
        productName: 'Executive Pen Set',
        productSku: 'GEN-PEN-EXEC',
        quantity: 10,
        orderAmount: 2990,
        cancelledAt: new Date('2024-03-15'),
        cancelledBy: 'Vendor',
    },
    {
        id: 'canc_004',
        orderId: 'ord_013',
        orderNumber: 'BKZ-2024-001253',
        cancellationType: 'customer_cancelled',
        reason: 'payment_failed',
        productName: 'Stainless Steel Water Bottle',
        productSku: 'GEN-BOT-SS-1L',
        quantity: 5,
        orderAmount: 2995,
        cancelledAt: new Date('2024-03-18'),
        cancelledBy: 'System',
    },
];

