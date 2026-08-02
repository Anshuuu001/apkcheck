import { Project } from './database';

export interface AnalysisResult {
  domain: string;
  theme: 'Dark' | 'Light' | 'Glassmorphic';
  features: string[];
  users: string[];
  businessLogic: string[];
  databaseTables: Array<{
    name: string;
    columns: string[];
  }>;
  apiEndpoints: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
  }>;
}

export interface RequirementWarning {
  severity: 'warning' | 'error';
  category: string;
  message: string;
}

// 1. Industry Templates Database (Offline fallback)
export const HeuristicTemplates: Record<string, AnalysisResult> = {
  food_delivery: {
    domain: 'Food Delivery App',
    theme: 'Dark',
    features: ['Wishlist', 'Coupons', 'Wallet', 'Live Tracking', 'Reviews', 'Rating', 'Referral', 'Notifications', 'Chat', 'Order History', 'Analytics'],
    users: ['Customer', 'Driver', 'Restaurant Admin', 'System Admin'],
    businessLogic: [
      'Customer places food order',
      'Restaurant accepts and prepares order',
      'Driver accepts delivery request',
      'Driver picks up food from restaurant',
      'Driver delivers order to customer (GPS tracking active)',
      'Customer processes payment and reviews rating'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'restaurants', columns: ['id (Int, PK)', 'name (Text)', 'cuisine (Text)', 'address (Text)'] },
      { name: 'products', columns: ['id (Int, PK)', 'restaurant_id (Int, FK)', 'name (Text)', 'price (Float)', 'image_url (Text)'] },
      { name: 'orders', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'restaurant_id (Int, FK)', 'total_amount (Float)', 'status (Text)', 'created_at (Text)'] },
      { name: 'order_items', columns: ['id (Int, PK)', 'order_id (Int, FK)', 'product_id (Int, FK)', 'quantity (Int)', 'price (Float)'] },
      { name: 'delivery_tracking', columns: ['id (Int, PK)', 'order_id (Int, FK)', 'driver_id (Int, FK)', 'latitude (Float)', 'longitude (Float)', 'status (Text)'] },
      { name: 'reviews', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'restaurant_id (Int, FK)', 'rating (Int)', 'comment (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Create a new user account' },
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate user credentials' },
      { method: 'GET', path: '/api/restaurants', description: 'Get all available restaurants' },
      { method: 'GET', path: '/api/restaurants/:id/products', description: 'Get restaurant products menu' },
      { method: 'POST', path: '/api/orders/place', description: 'Place a new food order' },
      { method: 'GET', path: '/api/orders/history', description: 'Fetch user order history logs' },
      { method: 'POST', path: '/api/checkout/pay', description: 'Process payments and checkout' },
      { method: 'GET', path: '/api/delivery/track/:orderId', description: 'Fetch live courier GPS tracker coordinates' },
      { method: 'POST', path: '/api/reviews/submit', description: 'Submit order rating and feedback' }
    ]
  },
  ecommerce: {
    domain: 'E-Commerce Storefront',
    theme: 'Dark',
    features: ['Wishlist', 'Coupons', 'Wallet', 'Reviews', 'Rating', 'Notifications', 'Order History', 'Search Filter', 'Stripe checkout', 'Admin Panel'],
    users: ['Buyer', 'Seller', 'Support Agent', 'Administrator'],
    businessLogic: [
      'Buyer browses product catalog',
      'Buyer adds items to cart or wishlist',
      'Buyer checkouts and pays using payment gateway',
      'Seller receives notification and packs order',
      'Carrier processes shipment tracking details',
      'Buyer receives package and submits product review'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'products', columns: ['id (Int, PK)', 'seller_id (Int, FK)', 'name (Text)', 'description (Text)', 'price (Float)', 'stock_count (Int)', 'image_url (Text)'] },
      { name: 'orders', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'total_amount (Float)', 'status (Text)', 'created_at (Text)'] },
      { name: 'order_items', columns: ['id (Int, PK)', 'order_id (Int, FK)', 'product_id (Int, FK)', 'quantity (Int)', 'price (Float)'] },
      { name: 'wishlist', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'product_id (Int, FK)', 'created_at (Text)'] },
      { name: 'coupons', columns: ['id (Int, PK)', 'code (Text)', 'discount_percent (Int)', 'expiry_date (Text)', 'active (Int)'] },
      { name: 'reviews', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'product_id (Int, FK)', 'rating (Int)', 'comment (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Register new buyer or seller account' },
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate buyer or seller session' },
      { method: 'GET', path: '/api/products', description: 'Get products lists with query search filters' },
      { method: 'GET', path: '/api/products/:id', description: 'Retrieve detailed product details' },
      { method: 'POST', path: '/api/orders', description: 'Place a new product order' },
      { method: 'GET', path: '/api/orders/history', description: 'Get billing and invoice histories' },
      { method: 'POST', path: '/api/wishlist/toggle', description: 'Add/remove products in buyer wishlist' },
      { method: 'POST', path: '/api/checkout/pay', description: 'Trigger credit card Stripe charges' }
    ]
  },
  taxi: {
    domain: 'Taxi App / Ride-sharing',
    theme: 'Glassmorphic',
    features: ['Book Ride', 'Driver Matching', 'In-app Wallet', 'Live Location', 'Ride History', 'Promo Coupons', 'Support Chat', 'Ratings & Reviews'],
    users: ['Passenger', 'Driver', 'Administrator'],
    businessLogic: [
      'Passenger requests ride and defines addresses',
      'System locates and matches passenger with nearest driver',
      'Driver accepts travel contract request',
      'Driver navigates to passenger pickup location',
      'Ride starts (updates coordinates dynamically)',
      'Ride completes (triggers automatic card payment charges)',
      'Passenger rates driver experience'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'rides', columns: ['id (Int, PK)', 'passenger_id (Int, FK)', 'driver_id (Int, FK)', 'pickup_lat (Float)', 'pickup_lng (Float)', 'dropoff_lat (Float)', 'dropoff_lng (Float)', 'fare (Float)', 'status (Text)', 'created_at (Text)'] },
      { name: 'coordinates', columns: ['id (Int, PK)', 'ride_id (Int, FK)', 'latitude (Float)', 'longitude (Float)', 'timestamp (Text)'] },
      { name: 'wallets', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'balance (Float)', 'updated_at (Text)'] },
      { name: 'reviews', columns: ['id (Int, PK)', 'ride_id (Int, FK)', 'reviewer_id (Int, FK)', 'rating (Int)', 'comment (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Register new passenger or driver' },
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate user account' },
      { method: 'POST', path: '/api/rides/request', description: 'Initiate a ride matchmaking lookup' },
      { method: 'POST', path: '/api/rides/accept', description: 'Driver accepts trip request' },
      { method: 'POST', path: '/api/location/ping', description: 'Update current driver coordinate tracker' },
      { method: 'GET', path: '/api/rides/track/:rideId', description: 'Get live coordinates of matching ride' },
      { method: 'POST', path: '/api/rides/complete', description: 'Mark ride complete and charge passenger wallet' },
      { method: 'POST', path: '/api/reviews/submit', description: 'Submit ride feedback scores' }
    ]
  },
  hospital: {
    domain: 'Hospital / Healthcare portal',
    theme: 'Light',
    features: ['Appointments', 'Prescription', 'Billing', 'Reports', 'Medicine', 'Doctor Panel', 'Patient Panel', 'Lab Reports', 'Emergency Contact'],
    users: ['Patient', 'Doctor', 'Pharmacist', 'Administrator'],
    businessLogic: [
      'Patient registers account and books appointment slot',
      'Doctor approves slot in personal doctor panel',
      'Consultation conducted (video or in-clinic)',
      'Doctor writes prescription and orders diagnostic lab reports',
      'Hospital billing department issues treatment invoice',
      'Patient pays bill online and reviews test reports'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'appointments', columns: ['id (Int, PK)', 'patient_id (Int, FK)', 'doctor_id (Int, FK)', 'slot_time (Text)', 'status (Text)'] },
      { name: 'prescriptions', columns: ['id (Int, PK)', 'appointment_id (Int, FK)', 'medicine_details (Text)', 'dosage_instructions (Text)', 'created_at (Text)'] },
      { name: 'lab_reports', columns: ['id (Int, PK)', 'patient_id (Int, FK)', 'doctor_id (Int, FK)', 'test_name (Text)', 'findings (Text)', 'file_url (Text)', 'created_at (Text)'] },
      { name: 'billing', columns: ['id (Int, PK)', 'patient_id (Int, FK)', 'total_amount (Float)', 'paid_status (Int)', 'due_date (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Login to patient/doctor profile' },
      { method: 'POST', path: '/api/appointments/book', description: 'Request appointment slot' },
      { method: 'GET', path: '/api/appointments', description: 'List doctor schedules and appointments' },
      { method: 'POST', path: '/api/prescriptions/create', description: 'Draft a new prescription' },
      { method: 'GET', path: '/api/reports/my-files', description: 'Get user lab reports PDF URLs' },
      { method: 'POST', path: '/api/billing/pay', description: 'Process medical bills payment' }
    ]
  },
  school: {
    domain: 'School Management Panel',
    theme: 'Light',
    features: ['Student Profile', 'Teacher Panel', 'Attendance Log', 'Grades & Exams', 'Classes Timetable', 'Fee Payment', 'Library Inventory', 'Chat System'],
    users: ['Student', 'Teacher', 'Parent', 'Administrator'],
    businessLogic: [
      'Administrator configures classes and teacher profiles',
      'Teacher logs student attendance daily',
      'Teacher submits examination marks',
      'Parents check attendance logs and pay tuition fees',
      'Students access timetables and message teachers'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'classes', columns: ['id (Int, PK)', 'name (Text)', 'room (Text)', 'teacher_id (Int, FK)'] },
      { name: 'attendance', columns: ['id (Int, PK)', 'student_id (Int, FK)', 'class_id (Int, FK)', 'date (Text)', 'present (Int)'] },
      { name: 'grades', columns: ['id (Int, PK)', 'student_id (Int, FK)', 'class_id (Int, FK)', 'exam_name (Text)', 'score (Float)'] },
      { name: 'fees', columns: ['id (Int, PK)', 'student_id (Int, FK)', 'amount_due (Float)', 'status (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate student/teacher credentials' },
      { method: 'POST', path: '/api/attendance/log', description: 'Submit class attendance registers' },
      { method: 'POST', path: '/api/grades/submit', description: 'Record student exam grades' },
      { method: 'GET', path: '/api/timetable/:userId', description: 'Fetch course timetable schedule' },
      { method: 'POST', path: '/api/fees/pay', description: 'Process tuition payments' }
    ]
  },
  fitness: {
    domain: 'Fitness Tracker App',
    theme: 'Dark',
    features: ['Workouts Log', 'Progress Tracker', 'Meal Planner', 'Trainer Chat', 'Exercise Library', 'Custom Goals', 'Wearable Sync', 'Payments'],
    users: ['Member', 'Trainer', 'System Admin'],
    businessLogic: [
      'Member signs up and sets weight goals',
      'Trainer creates custom workout program',
      'Member logs exercises and sets duration',
      'Member updates daily calorie intake logs',
      'Member pays subscription invoice fee'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'workout_programs', columns: ['id (Int, PK)', 'trainer_id (Int, FK)', 'title (Text)', 'difficulty (Text)'] },
      { name: 'exercise_logs', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'exercise_name (Text)', 'reps (Int)', 'sets (Int)', 'weight_kg (Float)', 'log_date (Text)'] },
      { name: 'calorie_logs', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'calories (Int)', 'meal_type (Text)', 'log_date (Text)'] },
      { name: 'subscriptions', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'plan_name (Text)', 'status (Text)', 'price (Float)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate user profile' },
      { method: 'POST', path: '/api/workouts/log', description: 'Record exercise sets and reps' },
      { method: 'GET', path: '/api/workouts/history', description: 'Retrieve history logs chart data' },
      { method: 'POST', path: '/api/meals/log', description: 'Log food items calories' },
      { method: 'POST', path: '/api/billing/subscribe', description: 'Process subscription payments' }
    ]
  },
  social_media: {
    domain: 'Social Media App',
    theme: 'Dark',
    features: ['User Feed', 'Image Upload', 'Comments', 'Likes', 'Followers', 'Direct Message', 'Activity Feed', 'Explore Feed'],
    users: ['User', 'Content Moderator', 'Administrator'],
    businessLogic: [
      'User registers and uploads profile picture',
      'User follows other active user accounts',
      'User uploads image post with caption text',
      'Followers view post on active timeline feed',
      'Followers like post and write comment text'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'posts', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'image_url (Text)', 'caption (Text)', 'likes_count (Int)', 'created_at (Text)'] },
      { name: 'comments', columns: ['id (Int, PK)', 'post_id (Int, FK)', 'user_id (Int, FK)', 'text (Text)', 'created_at (Text)'] },
      { name: 'follows', columns: ['id (Int, PK)', 'follower_id (Int, FK)', 'followed_id (Int, FK)', 'created_at (Text)'] },
      { name: 'messages', columns: ['id (Int, PK)', 'sender_id (Int, FK)', 'receiver_id (Int, FK)', 'text (Text)', 'created_at (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Register new user account' },
      { method: 'POST', path: '/api/posts/create', description: 'Upload a new picture post' },
      { method: 'GET', path: '/api/feed/home', description: 'Fetch timeline posts feed' },
      { method: 'POST', path: '/api/posts/:id/like', description: 'Like/unlike active post item' },
      { method: 'POST', path: '/api/posts/:id/comment', description: 'Write comment feedback on post' }
    ]
  },
  inventory: {
    domain: 'Inventory Control & Warehouse',
    theme: 'Light',
    features: ['Stock Level', 'Supplier Directory', 'Orders tracking', 'Barcode Scanner', 'Low Stock alerts', 'Warehouse Map', 'Analytics charts', 'Export CSV'],
    users: ['Warehouse Manager', 'Stock Associate', 'Purchasing Agent'],
    businessLogic: [
      'Stock Associate scans barcode scanner items',
      'System updates database quantities level',
      'Quantity drops below safety threshold level',
      'Purchasing Agent receives warning notification alerts',
      'Purchasing Agent orders shipment restock from supplier'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'products', columns: ['id (Int, PK)', 'sku (Text)', 'name (Text)', 'stock_qty (Int)', 'reorder_level (Int)', 'supplier_id (Int, FK)'] },
      { name: 'suppliers', columns: ['id (Int, PK)', 'name (Text)', 'contact_email (Text)', 'phone (Text)'] },
      { name: 'stock_transactions', columns: ['id (Int, PK)', 'product_id (Int, FK)', 'user_id (Int, FK)', 'qty_change (Int)', 'tx_type (Text)', 'created_at (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Login to manager account' },
      { method: 'GET', path: '/api/products', description: 'Fetch all product stock levels' },
      { method: 'POST', path: '/api/products/adjust', description: 'Record manual quantity adjustments' },
      { method: 'POST', path: '/api/products/scan', description: 'Adjust stock quantities via barcode' },
      { method: 'GET', path: '/api/suppliers', description: 'Fetch suppliers directory details' }
    ]
  },
  real_estate: {
    domain: 'Real Estate Portal',
    theme: 'Light',
    features: ['Property listings', 'Search Filters', 'Appointment scheduler', 'Agent Directory', 'Mortgage calculator', 'Favorite properties', 'Map integration'],
    users: ['Buyer', 'Seller', 'Real Estate Agent'],
    businessLogic: [
      'Seller creates property listing with address',
      'Buyer browses properties using search filters',
      'Buyer schedules booking tour appointment slot',
      'Agent approves slot and conducts tour review',
      'Buyer submits offer bid document to seller'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'properties', columns: ['id (Int, PK)', 'title (Text)', 'price (Float)', 'address (Text)', 'bedrooms (Int)', 'bathrooms (Int)', 'status (Text)'] },
      { name: 'bookings', columns: ['id (Int, PK)', 'property_id (Int, FK)', 'buyer_id (Int, FK)', 'agent_id (Int, FK)', 'tour_time (Text)', 'status (Text)'] },
      { name: 'bids', columns: ['id (Int, PK)', 'property_id (Int, FK)', 'buyer_id (Int, FK)', 'bid_amount (Float)', 'status (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate user credentials' },
      { method: 'GET', path: '/api/properties', description: 'Fetch matching listings with query filter' },
      { method: 'POST', path: '/api/bookings/schedule', description: 'Request tour appointment slot' },
      { method: 'POST', path: '/api/properties/create', description: 'Submit a new property listing' },
      { method: 'POST', path: '/api/bids/submit', description: 'Record buyer bid document' }
    ]
  },
  portfolio: {
    domain: 'Developer Portfolio',
    theme: 'Dark',
    features: ['Project Showcase', 'Skill Badges', 'Contact Form', 'Resume Download', 'Timeline milestone', 'Social links', 'Light Theme toggler'],
    users: ['Developer', 'Visitor', 'Recruiter'],
    businessLogic: [
      'Developer configures project showcase descriptions',
      'Visitor reviews developer skill timeline badges',
      'Visitor submits contact inquiry message details',
      'Recruiter downloads resume portfolio PDF doc'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'projects', columns: ['id (Int, PK)', 'title (Text)', 'description (Text)', 'tags (Text)', 'github_url (Text)'] },
      { name: 'contact_messages', columns: ['id (Int, PK)', 'sender_name (Text)', 'sender_email (Text)', 'message_body (Text)', 'created_at (Text)'] }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/projects', description: 'Fetch all developer projects showcase' },
      { method: 'POST', path: '/api/contact/submit', description: 'Submit contact form messages' }
    ]
  },
  travel: {
    domain: 'Travel Booking Portal',
    theme: 'Light',
    features: ['Flight booking', 'Hotel reservation', 'Destination guides', 'Review system', 'Weather API', 'Itinerary planner', 'Stripe payment'],
    users: ['Traveler', 'Agent', 'Hotel Admin'],
    businessLogic: [
      'Traveler searches flights and hotels details',
      'Traveler reserves hotel booking slots',
      'Traveler logs payment transaction charge',
      'Hotel Admin verifies traveler check-in status',
      'Traveler writes review feedback rating'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'hotels', columns: ['id (Int, PK)', 'name (Text)', 'destination (Text)', 'price_per_night (Float)', 'rating (Float)'] },
      { name: 'hotel_bookings', columns: ['id (Int, PK)', 'hotel_id (Int, FK)', 'user_id (Int, FK)', 'check_in (Text)', 'check_out (Text)', 'total_price (Float)', 'status (Text)'] },
      { name: 'flight_bookings', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'airline (Text)', 'flight_number (Text)', 'departure_time (Text)', 'fare (Float)', 'status (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Create user profile' },
      { method: 'GET', path: '/api/hotels', description: 'Search matching hotel details' },
      { method: 'POST', path: '/api/hotel/book', description: 'Request hotel reservation' },
      { method: 'POST', path: '/api/flight/book', description: 'Confirm flight ticket purchase' },
      { method: 'POST', path: '/api/checkout/pay', description: 'Process booking card payments' }
    ]
  },
  event_management: {
    domain: 'Event Management & Booking',
    theme: 'Light',
    features: ['Event calendar', 'Ticket Purchase', 'Barcode ticket', 'Organizer panel', 'Location maps', 'Attendee Directory', 'Sponsor banners'],
    users: ['Attendee', 'Event Organizer', 'Guest'],
    businessLogic: [
      'Organizer publishes event with ticket quota',
      'Attendee purchases event entry ticket',
      'System sends barcode ticket confirmation',
      'Organizer scans ticket barcode at gate entrance',
      'Attendee attends event panel'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'events', columns: ['id (Int, PK)', 'title (Text)', 'location (Text)', 'event_date (Text)', 'ticket_price (Float)', 'max_attendees (Int)'] },
      { name: 'tickets', columns: ['id (Int, PK)', 'event_id (Int, FK)', 'attendee_id (Int, FK)', 'ticket_code (Text)', 'paid_status (Text)', 'scanned (Int)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate attendee profile' },
      { method: 'GET', path: '/api/events', description: 'Fetch upcoming calendar events' },
      { method: 'POST', path: '/api/tickets/purchase', description: 'Reserve event entry tickets' },
      { method: 'POST', path: '/api/tickets/scan', description: 'Mark event tickets as scanned' }
    ]
  },
  saas_dashboard: {
    domain: 'SaaS Analytics Dashboard',
    theme: 'Dark',
    features: ['KPI Metrics', 'Revenue Charts', 'User Management', 'Activity feed', 'Invoicing bills', 'Stripe checkout', 'Export CSV', 'Alert banners'],
    users: ['Admin', 'Billing Admin', 'Viewer Member'],
    businessLogic: [
      'System aggregates hourly KPI sales metrics',
      'Admin reviews active user growth charts',
      'Billing Admin generates invoice bill records',
      'Admin downgrades/upgrades Stripe subscription plans',
      'Viewer Member exports metrics report logs'
    ],
    databaseTables: [
      { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'role (Text)', 'created_at (Text)'] },
      { name: 'invoices', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'amount (Float)', 'status (Text)', 'due_date (Text)'] },
      { name: 'analytics_metrics', columns: ['id (Int, PK)', 'metric_key (Text)', 'value (Float)', 'recorded_at (Text)'] }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Login to console dashboard' },
      { method: 'GET', path: '/api/analytics/summary', description: 'Fetch total active summary KPI counts' },
      { method: 'GET', path: '/api/analytics/charts', description: 'Fetch monthly revenue charts values' },
      { method: 'GET', path: '/api/invoices', description: 'Fetch invoice records list' },
      { method: 'POST', path: '/api/subscription/upgrade', description: 'Trigger plan updates card payment' }
    ]
  }
};

// Generic template to use as a base fallback
const DefaultTemplate: AnalysisResult = {
  domain: 'Custom Application',
  theme: 'Dark',
  features: ['User Authorization', 'Dashboard', 'Data Lists', 'Settings'],
  users: ['User', 'Admin'],
  businessLogic: [
    'User registers and logs in',
    'User views app dashboard',
    'User submits details into form fields',
    'Admin reviews database values'
  ],
  databaseTables: [
    { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)', 'full_name (Text)', 'created_at (Text)'] },
    { name: 'items', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'title (Text)', 'description (Text)', 'updated_at (Text)'] }
  ],
  apiEndpoints: [
    { method: 'POST', path: '/api/auth/register', description: 'Create user profile' },
    { method: 'POST', path: '/api/auth/login', description: 'Create user session' },
    { method: 'GET', path: '/api/items', description: 'Get items list' },
    { method: 'POST', path: '/api/items/create', description: 'Submit a new item' }
  ]
};

// 2. Intelligent Message Analyzer Engine
export class IntelligenceEngine {
  
  static analyzeRequest(message: string, currentBlueprint: any, apiKeyGemini?: string, apiKeyOpenAI?: string, aiProvider: string = 'local'): Promise<AnalysisResult> {
    // If API keys are available, attempt LLM call. Otherwise fallback to Heuristics.
    if (aiProvider === 'gemini' && apiKeyGemini) {
      return this.analyzeWithGemini(message, currentBlueprint, apiKeyGemini);
    }
    if (aiProvider === 'openai' && apiKeyOpenAI) {
      return this.analyzeWithOpenAI(message, currentBlueprint, apiKeyOpenAI);
    }
    
    // Offline Heuristic matching fallback
    return Promise.resolve(this.analyzeWithHeuristics(message, currentBlueprint));
  }

  static async callAI(prompt: string, provider: string, apiKey: string): Promise<string> {
    if (provider === 'gemini' && apiKey) {
      return this.queryGemini(prompt, apiKey);
    }
    if (provider === 'openai' && apiKey) {
      return this.queryOpenAI(prompt, apiKey);
    }
    throw new Error('AI Provider key not configured');
  }

  private static analyzeWithHeuristics(message: string, currentBlueprint?: any): AnalysisResult {
    const msg = message.toLowerCase();
    let matchedTemplate: any = null;
    
    if (msg.includes('food') || msg.includes('delivery') || msg.includes('restaurant') || msg.includes('pizza') || msg.includes('swiggy') || msg.includes('zomato')) {
      matchedTemplate = HeuristicTemplates.food_delivery;
    } else if (msg.includes('taxi') || msg.includes('cab') || msg.includes('uber') || msg.includes('ride') || msg.includes('driver') || msg.includes('passenger')) {
      matchedTemplate = HeuristicTemplates.taxi;
    } else if (msg.includes('shop') || msg.includes('e-commerce') || msg.includes('ecommerce') || msg.includes('store') || msg.includes('cart') || msg.includes('stripe') || msg.includes('payment')) {
      matchedTemplate = HeuristicTemplates.ecommerce;
    } else if (msg.includes('hospital') || msg.includes('doctor') || msg.includes('patient') || msg.includes('medical') || msg.includes('clinic') || msg.includes('health') || msg.includes('healthcare')) {
      matchedTemplate = HeuristicTemplates.hospital;
    } else if (msg.includes('school') || msg.includes('student') || msg.includes('teacher') || msg.includes('class') || msg.includes('education') || msg.includes('grade')) {
      matchedTemplate = HeuristicTemplates.school;
    } else if (msg.includes('gym') || msg.includes('fitness') || msg.includes('workout') || msg.includes('exercise') || msg.includes('health') || msg.includes('train')) {
      matchedTemplate = HeuristicTemplates.fitness;
    } else if (msg.includes('social') || msg.includes('instagram') || msg.includes('facebook') || msg.includes('profile') || msg.includes('friend') || msg.includes('post') || msg.includes('feed')) {
      matchedTemplate = HeuristicTemplates.social_media;
    } else if (msg.includes('inventory') || msg.includes('warehouse') || msg.includes('stock') || msg.includes('product inventory')) {
      matchedTemplate = HeuristicTemplates.inventory;
    } else if (msg.includes('estate') || msg.includes('property') || msg.includes('rent') || msg.includes('house') || msg.includes('agent')) {
      matchedTemplate = HeuristicTemplates.real_estate;
    } else if (msg.includes('portfolio') || msg.includes('resume') || msg.includes('cv') || msg.includes('showcase')) {
      matchedTemplate = HeuristicTemplates.portfolio;
    } else if (msg.includes('travel') || msg.includes('tourism') || msg.includes('trip') || msg.includes('hotel') || msg.includes('flight')) {
      matchedTemplate = HeuristicTemplates.travel;
    } else if (msg.includes('event') || msg.includes('ticket') || msg.includes('concert') || msg.includes('meetup') || msg.includes('booking')) {
      matchedTemplate = HeuristicTemplates.event_management;
    } else if (msg.includes('saas') || msg.includes('dashboard') || msg.includes('analytics') || msg.includes('billing saas') || msg.includes('chart')) {
      matchedTemplate = HeuristicTemplates.saas_dashboard;
    }

    if (!matchedTemplate) {
      const matchName = message.match(/(?:create|build|make)\s+(?:a\s+)?([\w\s]+?)(?:app|application|portal|website)?$/i);
      const domainName = matchName ? `${matchName[1].trim()} App` : (currentBlueprint?.domain || 'Custom Portal');
      matchedTemplate = {
        ...DefaultTemplate,
        domain: domainName
      };
    }

    if (currentBlueprint) {
      // Merge with project memory
      const existingFeatures = currentBlueprint.features || [];
      const mergedFeatures = Array.from(new Set([...existingFeatures, ...matchedTemplate.features]));
      
      const existingTables = currentBlueprint.databaseTables || currentBlueprint.database?.tables || [];
      const mergedTables = [...existingTables];
      matchedTemplate.databaseTables.forEach((t: any) => {
        if (!mergedTables.some((mt: any) => mt.name.toLowerCase() === t.name.toLowerCase())) {
          mergedTables.push(t);
        }
      });

      const existingApis = currentBlueprint.apiEndpoints || currentBlueprint.api?.endpoints || [];
      const mergedApis = [...existingApis];
      matchedTemplate.apiEndpoints.forEach((api: any) => {
        if (!mergedApis.some((ma: any) => ma.path.toLowerCase() === api.path.toLowerCase())) {
          mergedApis.push(api);
        }
      });

      const existingLogic = currentBlueprint.businessLogic || [];
      const mergedLogic = Array.from(new Set([...existingLogic, ...matchedTemplate.businessLogic]));

      return {
        domain: currentBlueprint.domain || matchedTemplate.domain,
        theme: currentBlueprint.theme || matchedTemplate.theme,
        users: Array.from(new Set([...(currentBlueprint.users || []), ...(matchedTemplate.users || [])])),
        features: mergedFeatures,
        databaseTables: mergedTables,
        apiEndpoints: mergedApis,
        businessLogic: mergedLogic
      };
    }

    return { ...matchedTemplate };
  }

  private static async queryGemini(prompt: string, apiKey: string): Promise<string> {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini');
    return rawText;
  }

  private static async queryOpenAI(prompt: string, apiKey: string): Promise<string> {
    const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Empty response from OpenAI');
    return rawText;
  }

  private static async analyzeWithGemini(message: string, currentBlueprint: any, apiKey: string): Promise<AnalysisResult> {
    try {
      // Step 1: Understand Project Classification
      const prompt1 = `You are AppForge App Classification Agent.
Analyze the user's request: "${message}"
The current project state context is: ${JSON.stringify(currentBlueprint || {})}

Update the project classification. You MUST retain the existing domain, theme, and user roles unless the user explicitly requests changes to them.
Respond with a JSON object conforming exactly to this structure:
{
  "domain": "Detailed Industry or App Domain Name (e.g. Gym Management Portal)",
  "theme": "Dark | Light | Glassmorphic",
  "users": ["Role 1", "Role 2", ...]
}`;
      const res1Text = await this.queryGemini(prompt1, apiKey);
      const step1 = JSON.parse(res1Text);

      // Step 2: Extract Feature Recommendations
      const prompt2 = `You are AppForge Feature Recommendation Planner.
Given the request: "${message}"
The existing project features are: ${JSON.stringify(currentBlueprint?.features || [])}
The App Domain is: "${step1.domain || 'Custom Portal'}" and Target Users: [${(step1.users || []).join(', ')}].

Recommend the updated list of feature modules (e.g. Workout Tracker, Booking, Billing, Coupons, Live Tracking, Reviews, Analytics).
You MUST retain all existing features unless requested to remove them, and append new features.
Respond with a JSON object conforming exactly to this structure:
{
  "features": ["Feature Module 1", "Feature Module 2", ...]
}`;
      const res2Text = await this.queryGemini(prompt2, apiKey);
      const step2 = JSON.parse(res2Text);

      // Step 3: Database & API Planner
      const prompt3 = `You are AppForge Database and API Architect.
Given the request: "${message}"
The existing database tables are: ${JSON.stringify(currentBlueprint?.databaseTables || currentBlueprint?.database?.tables || [])}
The existing API endpoints are: ${JSON.stringify(currentBlueprint?.apiEndpoints || currentBlueprint?.api?.endpoints || [])}
The App Domain is: "${step1.domain || 'Custom Portal'}", Target Users: [${(step1.users || []).join(', ')}], and Features: [${(step2.features || []).join(', ')}].

Plan the SQLite database tables (columns with PK/FK constraints) and API endpoint contracts (method, path, description).
You MUST retain existing tables and API endpoints unless requested to modify/delete them, and add new tables or endpoints.
Respond with a JSON object conforming exactly to this structure:
{
  "databaseTables": [
    {
      "name": "table_name",
      "columns": ["col_name (type, PK/FK/constraint)", ...]
    }
  ],
  "apiEndpoints": [
    {
      "method": "GET | POST | PUT | DELETE",
      "path": "/api/path",
      "description": "API action description"
    }
  ]
}`;
      const res3Text = await this.queryGemini(prompt3, apiKey);
      const step3 = JSON.parse(res3Text);

      // Step 4: Business Logic Generator
      const prompt4 = `You are AppForge Business Logic Generator.
Given the request: "${message}"
The existing business logic is: ${JSON.stringify(currentBlueprint?.businessLogic || [])}
The App Domain is: "${step1.domain || 'Custom Portal'}", Features: [${(step2.features || []).join(', ')}], and Target Users: [${(step1.users || []).join(', ')}].

Draft the step-by-step business logic workflow (e.g. Driver accepts -> Ride starts -> complete -> pay -> rate).
Retain core workflows and append new logical steps.
Respond with a JSON object conforming exactly to this structure:
{
  "businessLogic": ["Workflow step 1", "Workflow step 2", ...]
}`;
      const res4Text = await this.queryGemini(prompt4, apiKey);
      const step4 = JSON.parse(res4Text);

      // Combine results
      return {
        domain: step1.domain || 'Custom App',
        theme: step1.theme || 'Dark',
        users: step1.users || ['User', 'Admin'],
        features: step2.features || [],
        databaseTables: step3.databaseTables || [],
        apiEndpoints: step3.apiEndpoints || [],
        businessLogic: step4.businessLogic || []
      };

    } catch (e) {
      console.warn('Gemini prompt pipeline failed, using heuristics fallback:', e);
      return this.analyzeWithHeuristics(message, currentBlueprint);
    }
  }

  private static async analyzeWithOpenAI(message: string, currentBlueprint: any, apiKey: string): Promise<AnalysisResult> {
    try {
      // Step 1: Understand Project Classification
      const prompt1 = `You are AppForge App Classification Agent.
Analyze the user's request: "${message}"
The current project state context is: ${JSON.stringify(currentBlueprint || {})}

Update the project classification. You MUST retain the existing domain, theme, and user roles unless the user explicitly requests changes to them.
Respond with a JSON object conforming exactly to this structure:
{
  "domain": "Detailed Industry or App Domain Name (e.g. Gym Management Portal)",
  "theme": "Dark | Light | Glassmorphic",
  "users": ["Role 1", "Role 2", ...]
}`;
      const res1Text = await this.queryOpenAI(prompt1, apiKey);
      const step1 = JSON.parse(res1Text);

      // Step 2: Extract Feature Recommendations
      const prompt2 = `You are AppForge Feature Recommendation Planner.
Given the request: "${message}"
The existing project features are: ${JSON.stringify(currentBlueprint?.features || [])}
The App Domain is: "${step1.domain || 'Custom Portal'}" and Target Users: [${(step1.users || []).join(', ')}].

Recommend a detailed list of feature modules (e.g. Workout Tracker, Booking, Billing, Coupons, Live Tracking, Reviews, Analytics).
You MUST retain all existing features unless requested to remove them, and append new features.
Respond with a JSON object conforming exactly to this structure:
{
  "features": ["Feature Module 1", "Feature Module 2", ...]
}`;
      const res2Text = await this.queryOpenAI(prompt2, apiKey);
      const step2 = JSON.parse(res2Text);

      // Step 3: Database & API Planner
      const prompt3 = `You are AppForge Database and API Architect.
Given the request: "${message}"
The existing database tables are: ${JSON.stringify(currentBlueprint?.databaseTables || currentBlueprint?.database?.tables || [])}
The existing API endpoints are: ${JSON.stringify(currentBlueprint?.apiEndpoints || currentBlueprint?.api?.endpoints || [])}
The App Domain is: "${step1.domain || 'Custom Portal'}", Target Users: [${(step1.users || []).join(', ')}], and Features: [${(step2.features || []).join(', ')}].

Plan the SQLite database tables (columns with PK/FK constraints) and API endpoint contracts (method, path, description).
You MUST retain existing tables and API endpoints unless requested to modify/delete them, and add new tables or endpoints.
Respond with a JSON object conforming exactly to this structure:
{
  "databaseTables": [
    {
      "name": "table_name",
      "columns": ["col_name (type, PK/FK/constraint)", ...]
    }
  ],
  "apiEndpoints": [
    {
      "method": "GET | POST | PUT | DELETE",
      "path": "/api/path",
      "description": "API action description"
    }
  ]
}`;
      const res3Text = await this.queryOpenAI(prompt3, apiKey);
      const step3 = JSON.parse(res3Text);

      // Step 4: Business Logic Generator
      const prompt4 = `You are AppForge Business Logic Generator.
Given the request: "${message}"
The existing business logic is: ${JSON.stringify(currentBlueprint?.businessLogic || [])}
The App Domain is: "${step1.domain || 'Custom Portal'}", Features: [${(step2.features || []).join(', ')}], and Target Users: [${(step1.users || []).join(', ')}].

Draft the step-by-step business logic workflow (e.g. Driver accepts -> Ride starts -> complete -> pay -> rate).
Retain core workflows and append new logical steps.
Respond with a JSON object conforming exactly to this structure:
{
  "businessLogic": ["Workflow step 1", "Workflow step 2", ...]
}`;
      const res4Text = await this.queryOpenAI(prompt4, apiKey);
      const step4 = JSON.parse(res4Text);

      // Combine results
      return {
        domain: step1.domain || 'Custom App',
        theme: step1.theme || 'Dark',
        users: step1.users || ['User', 'Admin'],
        features: step2.features || [],
        databaseTables: step3.databaseTables || [],
        apiEndpoints: step3.apiEndpoints || [],
        businessLogic: step4.businessLogic || []
      };

    } catch (e) {
      console.warn('OpenAI prompt pipeline failed, using heuristics fallback:', e);
      return this.analyzeWithHeuristics(message, currentBlueprint);
    }
  }

  // 3. Requirement Validator Engine
  static validateRequirements(blueprintObj: any): RequirementWarning[] {
    const warnings: RequirementWarning[] = [];
    if (!blueprintObj) return warnings;

    const tables = (blueprintObj.database?.tables || []).map((t: any) => t.name.toLowerCase());
    const endpoints = (blueprintObj.api?.endpoints || []).map((e: any) => e.path.toLowerCase());
    const screens = (blueprintObj.screens || []).map((s: any) => s.name.toLowerCase());
    const features = (blueprintObj.features || []).map((f: string) => f.toLowerCase());

    // Check 1: Missing Login / User Authentication
    const needsAuth = features.some((f: string) => f.includes('login') || f.includes('auth') || f.includes('account') || f.includes('profile')) ||
                      screens.some((s: string) => s.includes('login') || s.includes('signup') || s.includes('profile'));
                      
    if (needsAuth) {
      if (!tables.includes('users')) {
        warnings.push({
          severity: 'error',
          category: 'Authentication',
          message: 'Warning: Missing "users" database table to store credentials.'
        });
      }
      if (!endpoints.some((p: string) => p.includes('login') || p.includes('auth') || p.includes('register'))) {
        warnings.push({
          severity: 'warning',
          category: 'Authentication',
          message: 'Warning: No authentication API endpoints (e.g. /api/auth/login) defined.'
        });
      }
    }

    // Check 2: Missing Payments Database / Gateway Integration
    const needsPayment = features.some((f: string) => f.includes('pay') || f.includes('checkout') || f.includes('cart') || f.includes('wallet') || f.includes('stripe')) ||
                         screens.some((s: string) => s.includes('payment') || s.includes('cart') || s.includes('checkout'));
                         
    if (needsPayment) {
      if (!tables.includes('orders') && !tables.includes('transactions') && !tables.includes('billing')) {
        warnings.push({
          severity: 'error',
          category: 'Commerce',
          message: 'Warning: Commerce screens are active, but no database tables exist to track "orders" or "billing".'
        });
      }
      if (!endpoints.some((p: string) => p.includes('checkout') || p.includes('pay') || p.includes('charge'))) {
        warnings.push({
          severity: 'warning',
          category: 'Commerce',
          message: 'Warning: Shopping cart details found, but payment checkout endpoints (e.g. /api/checkout/pay) are missing.'
        });
      }
    }

    // Check 3: Missing GPS tracking database coordinates
    const needsGps = features.some((f: string) => f.includes('gps') || f.includes('track') || f.includes('map') || f.includes('location')) ||
                     screens.some((s: string) => s.includes('track') || s.includes('map'));
                     
    if (needsGps) {
      if (!tables.includes('coordinates') && !tables.includes('locations') && !tables.includes('delivery_tracking')) {
        warnings.push({
          severity: 'warning',
          category: 'Geolocation',
          message: 'Warning: Live map screens are active, but no database table (e.g. "coordinates") is configured to track locations.'
        });
      }
    }

    // --- Industry Business-Rule Validations ---
    const nameLower = (blueprintObj.name || '').toLowerCase();
    const domainLower = (blueprintObj.domain || '').toLowerCase();
    const descLower = (blueprintObj.description || '').toLowerCase();
    const bpUsers = (blueprintObj.users || []).map((u: string) => u.toLowerCase());
    const compTypes = (blueprintObj.screens || []).flatMap((s: any) => (s.components || []).map((c: any) => c.type));

    const isHospital = nameLower.includes('hospital') || domainLower.includes('hospital') || descLower.includes('health') || descLower.includes('hospital') || domainLower.includes('healthcare');
    const isDelivery = nameLower.includes('delivery') || domainLower.includes('delivery') || nameLower.includes('food') || descLower.includes('delivery') || nameLower.includes('restaurant') || nameLower.includes('pizza');
    const isEcom = nameLower.includes('shop') || nameLower.includes('commerce') || domainLower.includes('store') || descLower.includes('commerce') || nameLower.includes('store') || nameLower.includes('e-commerce');
    const isTaxi = nameLower.includes('taxi') || nameLower.includes('cab') || nameLower.includes('uber') || domainLower.includes('ride') || descLower.includes('ride');
    const isSchool = nameLower.includes('school') || domainLower.includes('school') || nameLower.includes('student') || descLower.includes('school') || descLower.includes('education');

    if (isHospital) {
      if (!bpUsers.some(u => u.includes('doctor'))) {
        warnings.push({ severity: 'error', category: 'Hospital', message: 'Missing Industry Role: Hospital apps must define a "Doctor" user portal.' });
      }
      if (!bpUsers.some(u => u.includes('patient'))) {
        warnings.push({ severity: 'error', category: 'Hospital', message: 'Missing Industry Role: Hospital apps must define a "Patient" user portal.' });
      }
      if (!tables.includes('appointments')) {
        warnings.push({ severity: 'error', category: 'Hospital', message: 'Missing Module: Hospital apps require an "appointments" database table for doctor scheduling.' });
      }
      if (!tables.includes('prescriptions') && !tables.includes('medicine')) {
        warnings.push({ severity: 'error', category: 'Hospital', message: 'Missing Module: Hospital apps require a "prescriptions" table for medical treatments.' });
      }
      if (!tables.includes('billing') && !tables.includes('invoices')) {
        warnings.push({ severity: 'warning', category: 'Hospital', message: 'Missing Module: Hospital apps require a "billing" table for patient invoices.' });
      }
      if (!tables.includes('lab_reports') && !tables.includes('reports')) {
        warnings.push({ severity: 'warning', category: 'Hospital', message: 'Missing Module: Hospital apps require a "lab_reports" table for diagnostics.' });
      }
      if (!compTypes.includes('Calendar') && !compTypes.includes('AppointmentCard')) {
        warnings.push({ severity: 'warning', category: 'Hospital', message: 'Missing Component: Hospital screens require a "Calendar" or "AppointmentCard" widget for booking slots.' });
      }
    }

    if (isDelivery) {
      if (!bpUsers.some(u => u.includes('driver')) && !bpUsers.some(u => u.includes('delivery'))) {
        warnings.push({ severity: 'error', category: 'Food Delivery', message: 'Missing Industry Role: Food Delivery apps must define a "Driver" role.' });
      }
      if (!bpUsers.some(u => u.includes('restaurant')) && !bpUsers.some(u => u.includes('owner'))) {
        warnings.push({ severity: 'error', category: 'Food Delivery', message: 'Missing Industry Role: Food Delivery apps must define a "Restaurant Owner" dashboard.' });
      }
      if (!tables.includes('orders')) {
        warnings.push({ severity: 'error', category: 'Food Delivery', message: 'Missing Module: Food Delivery apps require an "orders" database table.' });
      }
      if (!tables.includes('delivery_tracking') && !tables.includes('coordinates')) {
        warnings.push({ severity: 'error', category: 'Food Delivery', message: 'Missing Module: Food Delivery apps require a "delivery_tracking" table for live GPS monitoring.' });
      }
      if (!features.includes('wallet') && !features.includes('payment')) {
        warnings.push({ severity: 'warning', category: 'Food Delivery', message: 'Missing Module: Food Delivery apps require a payment "wallet" or cards payment flow.' });
      }
      if (!features.includes('coupons') && !features.includes('discounts')) {
        warnings.push({ severity: 'warning', category: 'Food Delivery', message: 'Missing Module: Food Delivery apps should support "coupons" discount codes.' });
      }
    }

    if (isEcom) {
      if (!bpUsers.some(u => u.includes('buyer')) && !bpUsers.some(u => u.includes('customer'))) {
        warnings.push({ severity: 'error', category: 'E-Commerce', message: 'Missing Industry Role: E-Commerce apps must define a "Buyer" portal.' });
      }
      if (!bpUsers.some(u => u.includes('seller')) && !bpUsers.some(u => u.includes('vendor'))) {
        warnings.push({ severity: 'error', category: 'E-Commerce', message: 'Missing Industry Role: E-Commerce apps must define a "Seller" portal.' });
      }
      if (!tables.includes('products')) {
        warnings.push({ severity: 'error', category: 'E-Commerce', message: 'Missing Module: E-Commerce apps require a "products" database catalog.' });
      }
      if (!tables.includes('orders') && !tables.includes('cart')) {
        warnings.push({ severity: 'error', category: 'E-Commerce', message: 'Missing Module: E-Commerce apps require an "orders" database table.' });
      }
      if (!compTypes.includes('CartItem') && !compTypes.includes('ProductCard')) {
        warnings.push({ severity: 'warning', category: 'E-Commerce', message: 'Missing Component: E-Commerce screens require a "CartItem" or "ProductCard" grid widget.' });
      }
    }

    if (isTaxi) {
      if (!bpUsers.some(u => u.includes('driver'))) {
        warnings.push({ severity: 'error', category: 'Taxi Booking', message: 'Missing Industry Role: Taxi/Ride apps must define a "Driver" portal.' });
      }
      if (!bpUsers.some(u => u.includes('passenger'))) {
        warnings.push({ severity: 'error', category: 'Taxi Booking', message: 'Missing Industry Role: Taxi/Ride apps must define a "Passenger" portal.' });
      }
      if (!tables.includes('rides')) {
        warnings.push({ severity: 'error', category: 'Taxi Booking', message: 'Missing Module: Taxi/Ride apps require a "rides" database tracker.' });
      }
      if (!tables.includes('coordinates') && !tables.includes('locations')) {
        warnings.push({ severity: 'error', category: 'Taxi Booking', message: 'Missing Module: Taxi/Ride apps require a "coordinates" table for live travel tracking.' });
      }
    }

    if (isSchool) {
      if (!bpUsers.some(u => u.includes('student'))) {
        warnings.push({ severity: 'error', category: 'School', message: 'Missing Industry Role: School apps must define a "Student" portal.' });
      }
      if (!bpUsers.some(u => u.includes('teacher'))) {
        warnings.push({ severity: 'error', category: 'School', message: 'Missing Industry Role: School apps must define a "Teacher" portal.' });
      }
      if (!tables.includes('attendance')) {
        warnings.push({ severity: 'error', category: 'School', message: 'Missing Module: School apps require an "attendance" database log.' });
      }
      if (!tables.includes('grades') && !tables.includes('exams')) {
        warnings.push({ severity: 'error', category: 'School', message: 'Missing Module: School apps require a "grades" database log.' });
      }
    }

    return warnings;
  }
}
