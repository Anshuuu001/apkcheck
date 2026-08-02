/**
 * AppForge-AI — Requirement Engine (Stage 2)
 * 
 * Takes an IntentResult and generates smart, industry-specific interview questions.
 * These questions fill the gaps in the blueprint before generation starts.
 */

import type { IntentResult, IndustryType } from '../../blueprint/schema';
import type { InterviewQuestion } from '../../store/engineStore';
import { INDUSTRY_ROLES } from '../intentAnalyzer/localClassifier';

// ─── Question Templates by Industry ──────────────────────────────────────────

const BASE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'auth',
    question: 'Does your app require user login & accounts?',
    subtext: 'This adds authentication screens and JWT/session management',
    type: 'toggle',
    required: true,
    field: 'authRequired',
  },
  {
    id: 'notifications',
    question: 'Do you need push notifications?',
    subtext: 'Alerts for orders, appointments, messages, etc.',
    type: 'toggle',
    required: true,
    field: 'notificationsRequired',
  },
  {
    id: 'offline',
    question: 'Should the app work offline?',
    subtext: 'Local data storage with sync when back online',
    type: 'toggle',
    required: false,
    field: 'offlineSupport',
  },
];

const INDUSTRY_QUESTIONS: Record<IndustryType, InterviewQuestion[]> = {
  'Healthcare': [
    {
      id: 'roles_healthcare',
      question: 'Which portals and dashboards do you need in your hospital app?',
      type: 'multi-select',
      required: true,
      field: 'userRoles',
      options: [
        { label: 'Doctor Portal', value: 'Doctor', icon: '👨‍⚕️', description: 'Schedule slots, write prescriptions, view reports' },
        { label: 'Patient Portal', value: 'Patient', icon: '🤒', description: 'Book appointments, view prescriptions, pay bills' },
        { label: 'Reception Dashboard', value: 'Receptionist', icon: '💼', description: 'Manage schedules and general patient check-ins' },
        { label: 'Pharmacy Dashboard', value: 'Pharmacist', icon: '💊', description: 'Track inventories and dispense prescribed medicines' },
        { label: 'Nurse Portal', value: 'Nurse', icon: '👩‍⚕️', description: 'Log vitals and daily treatment updates' },
        { label: 'System Admin Panel', value: 'Admin', icon: '🏥', description: 'Register doctors, audit logs, and settings config' },
      ],
    },
    {
      id: 'features_healthcare',
      question: 'Which healthcare modules should be enabled?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Appointment Booking', value: 'appointments', icon: '📅', description: 'Online slot booking with calendar' },
        { label: 'Prescription Management', value: 'prescriptions', icon: '💊', description: 'Digital prescriptions and medicine tracking' },
        { label: 'Lab Reports Module', value: 'lab_reports', icon: '🔬', description: 'Upload and view diagnostic test reports' },
        { label: 'Pharmacy & Medicine Inventory', value: 'pharmacy', icon: '🏥', description: 'Track and manage medicine stock' },
        { label: 'Telehealth Video Consultation', value: 'teleconsult', icon: '📹', description: 'Real-time video/chat with doctors' },
        { label: 'Patient Records (EHR)', value: 'ehr', icon: '📋', description: 'Digital health records history logs' },
        { label: 'Analytics & Reports Dashboard', value: 'analytics', icon: '📊', description: 'Hospital performance metric logs' },
      ],
    },
    {
      id: 'payment',
      question: 'Do you need billing & online payments?',
      subtext: 'Invoice generation, Stripe payment gateway integration',
      type: 'toggle',
      required: true,
      field: 'paymentRequired',
    },
    {
      id: 'location_hc',
      question: 'Do you need GPS tracking for ambulances / emergency contacts?',
      subtext: 'Tracks live coordinates on map visual widgets',
      type: 'toggle',
      required: false,
      field: 'locationRequired',
    },
    {
      id: 'multi_language',
      question: 'Enable Multi-Language support?',
      subtext: 'Translates layouts, input fields, and alerts for diverse patients',
      type: 'toggle',
      required: false,
      field: 'multi_language',
    },
    {
      id: 'offlineSupport',
      question: 'Should the app support Offline Mode?',
      subtext: 'Local SQLite data storage with sync when back online',
      type: 'toggle',
      required: false,
      field: 'offlineSupport',
    },
  ],

  'Education': [
    {
      id: 'features_education',
      question: 'Which learning features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Live Classes', value: 'live_classes', icon: '📺', description: 'Real-time video lectures' },
        { label: 'Recorded Videos', value: 'video_library', icon: '🎬', description: 'Pre-recorded course content' },
        { label: 'Quizzes & Exams', value: 'quizzes', icon: '📝', description: 'Auto-graded assessments' },
        { label: 'Assignments', value: 'assignments', icon: '📚', description: 'Submit and grade work' },
        { label: 'Attendance Tracking', value: 'attendance', icon: '✅', description: 'Mark and view attendance' },
        { label: 'Grade Book', value: 'grades', icon: '🎓', description: 'View and manage student grades' },
        { label: 'Fee Management', value: 'fees', icon: '💳', description: 'Fee collection and receipts' },
        { label: 'Parent Portal', value: 'parent_portal', icon: '👨‍👧', description: 'Parents monitor progress' },
      ],
    },
    {
      id: 'payment_edu',
      question: 'Does your app need fee/payment collection?',
      type: 'toggle',
      required: true,
      field: 'paymentRequired',
    },
    {
      id: 'roles_education',
      question: 'Who will use this app?',
      type: 'multi-select',
      required: true,
      field: 'userRoles',
      options: [
        { label: 'Student', value: 'Student', icon: '🧑‍🎓' },
        { label: 'Teacher', value: 'Teacher', icon: '👩‍🏫' },
        { label: 'Admin', value: 'Admin', icon: '🏫' },
        { label: 'Parent', value: 'Parent', icon: '👨‍👧' },
        { label: 'Principal', value: 'Principal', icon: '🎓' },
      ],
    },
  ],

  'E-Commerce': [
    {
      id: 'features_ecommerce',
      question: 'Which store features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Product Catalog', value: 'catalog', icon: '🛍️', description: 'Browse and filter products' },
        { label: 'Shopping Cart', value: 'cart', icon: '🛒', description: 'Add to cart and checkout' },
        { label: 'Order Tracking', value: 'order_tracking', icon: '📦', description: 'Real-time order status' },
        { label: 'Wishlist', value: 'wishlist', icon: '❤️', description: 'Save favourite items' },
        { label: 'Reviews & Ratings', value: 'reviews', icon: '⭐', description: 'Product review system' },
        { label: 'Coupons & Discounts', value: 'coupons', icon: '🏷️', description: 'Promo codes and offers' },
        { label: 'Seller Dashboard', value: 'seller', icon: '🏪', description: 'For marketplace sellers' },
        { label: 'Analytics', value: 'analytics', icon: '📊', description: 'Sales and traffic reports' },
      ],
    },
    {
      id: 'payment_ecommerce',
      question: 'Which payment methods do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Credit/Debit Card', value: 'card_payment', icon: '💳' },
        { label: 'UPI / Digital Wallet', value: 'upi', icon: '📱' },
        { label: 'Cash on Delivery', value: 'cod', icon: '💵' },
        { label: 'Net Banking', value: 'net_banking', icon: '🏦' },
        { label: 'Buy Now Pay Later', value: 'bnpl', icon: '🔄' },
      ],
    },
  ],

  'Food & Delivery': [
    {
      id: 'features_food',
      question: 'Which delivery features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Restaurant Listing', value: 'restaurants', icon: '🍽️' },
        { label: 'Menu Management', value: 'menu', icon: '📋' },
        { label: 'Cart & Checkout', value: 'cart', icon: '🛒' },
        { label: 'Live Order Tracking', value: 'gps_tracking', icon: '📍' },
        { label: 'Driver App', value: 'driver', icon: '🚗' },
        { label: 'Reviews & Ratings', value: 'reviews', icon: '⭐' },
        { label: 'Loyalty Points', value: 'loyalty', icon: '🎁' },
        { label: 'Scheduled Orders', value: 'scheduled', icon: '📅' },
      ],
    },
    {
      id: 'location_food',
      question: 'Does this app need GPS / real-time location?',
      type: 'toggle',
      required: true,
      field: 'locationRequired',
    },
  ],

  'Transportation': [
    {
      id: 'features_transport',
      question: 'What type of ride/transport service is this?',
      type: 'single-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Taxi / Ride Hailing', value: 'taxi', icon: '🚕', description: 'Like Uber/Ola' },
        { label: 'Bike Sharing', value: 'bike_share', icon: '🚲', description: 'Dock or dockless bikes' },
        { label: 'Bus / Shuttle', value: 'shuttle', icon: '🚌', description: 'Fixed route services' },
        { label: 'Logistics / Delivery', value: 'logistics', icon: '🚚', description: 'Goods transportation' },
        { label: 'Carpooling', value: 'carpool', icon: '👥', description: 'Shared rides' },
      ],
    },
    {
      id: 'location_transport',
      question: 'Real-time GPS tracking required?',
      type: 'toggle',
      required: true,
      field: 'locationRequired',
    },
  ],

  'Finance & Banking': [
    {
      id: 'features_finance',
      question: 'Which financial features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Account Dashboard', value: 'dashboard', icon: '📊' },
        { label: 'Fund Transfer', value: 'transfer', icon: '💸' },
        { label: 'Bill Payments', value: 'bill_pay', icon: '📝' },
        { label: 'Investment Portfolio', value: 'investments', icon: '📈' },
        { label: 'Expense Tracker', value: 'expense', icon: '💰' },
        { label: 'Loan Management', value: 'loans', icon: '🏦' },
        { label: 'KYC Verification', value: 'kyc', icon: '🪪' },
        { label: 'Biometric Login', value: 'biometric', icon: '👆' },
      ],
    },
  ],

  'Real Estate': [
    {
      id: 'features_realestate',
      question: 'Which real estate features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Property Listings', value: 'listings', icon: '🏠' },
        { label: 'Map View', value: 'map', icon: '🗺️' },
        { label: 'Virtual Tours', value: 'virtual_tour', icon: '🏡' },
        { label: 'Agent Profiles', value: 'agents', icon: '👔' },
        { label: 'EMI Calculator', value: 'emi', icon: '🧮' },
        { label: 'Favorites / Shortlist', value: 'favorites', icon: '❤️' },
        { label: 'Document Upload', value: 'documents', icon: '📄' },
      ],
    },
    {
      id: 'location_realestate',
      question: 'Does your app need map/location search?',
      type: 'toggle',
      required: true,
      field: 'locationRequired',
    },
  ],

  'Social Media': [
    {
      id: 'features_social',
      question: 'Which social features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Feed / Timeline', value: 'feed', icon: '📰' },
        { label: 'Stories', value: 'stories', icon: '⭕' },
        { label: 'Reels / Short Videos', value: 'reels', icon: '🎬' },
        { label: 'Direct Messages', value: 'dm', icon: '💬' },
        { label: 'Groups / Communities', value: 'groups', icon: '👥' },
        { label: 'Live Streaming', value: 'live', icon: '🔴' },
        { label: 'Marketplace', value: 'marketplace', icon: '🛒' },
        { label: 'Content Monetization', value: 'monetization', icon: '💰' },
      ],
    },
  ],

  'Fitness & Health': [
    {
      id: 'features_fitness',
      question: 'Which fitness features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Workout Plans', value: 'workouts', icon: '💪' },
        { label: 'Progress Tracking', value: 'progress', icon: '📈' },
        { label: 'Diet & Nutrition', value: 'nutrition', icon: '🥗' },
        { label: 'Step Counter', value: 'steps', icon: '👟' },
        { label: 'Personal Trainer Chat', value: 'trainer_chat', icon: '💬' },
        { label: 'Wearable Integration', value: 'wearable', icon: '⌚' },
        { label: 'Meditation & Sleep', value: 'meditation', icon: '🧘' },
        { label: 'Class Booking', value: 'class_booking', icon: '📅' },
      ],
    },
    {
      id: 'payment_fitness',
      question: 'Do you need subscription/membership payments?',
      type: 'toggle',
      required: true,
      field: 'paymentRequired',
    },
  ],

  'Entertainment': [
    {
      id: 'features_entertainment',
      question: 'What type of entertainment platform?',
      type: 'single-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Video Streaming', value: 'video_streaming', icon: '📺' },
        { label: 'Music Streaming', value: 'music_streaming', icon: '🎵' },
        { label: 'Podcast Platform', value: 'podcasts', icon: '🎙️' },
        { label: 'Gaming Platform', value: 'gaming', icon: '🎮' },
        { label: 'Event Ticketing', value: 'tickets', icon: '🎫' },
        { label: 'Book Reading', value: 'ebooks', icon: '📚' },
      ],
    },
  ],

  'CRM & Business': [
    {
      id: 'features_crm',
      question: 'Which business features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Lead Management', value: 'leads', icon: '🎯' },
        { label: 'Contact Database', value: 'contacts', icon: '📇' },
        { label: 'Sales Pipeline', value: 'pipeline', icon: '📊' },
        { label: 'Task Management', value: 'tasks', icon: '✅' },
        { label: 'Invoice & Billing', value: 'invoicing', icon: '🧾' },
        { label: 'Reports & Analytics', value: 'reports', icon: '📈' },
        { label: 'Email Integration', value: 'email', icon: '📧' },
        { label: 'Team Collaboration', value: 'collaboration', icon: '👥' },
      ],
    },
  ],

  'Chat & Communication': [
    {
      id: 'features_chat',
      question: 'Which communication features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Text Messaging', value: 'text_chat', icon: '💬' },
        { label: 'Group Chats', value: 'group_chat', icon: '👥' },
        { label: 'Voice Calls', value: 'voice', icon: '📞' },
        { label: 'Video Calls', value: 'video', icon: '📹' },
        { label: 'File Sharing', value: 'files', icon: '📎' },
        { label: 'End-to-end Encryption', value: 'e2e', icon: '🔒' },
        { label: 'Channels / Broadcast', value: 'channels', icon: '📢' },
        { label: 'Bots / Automation', value: 'bots', icon: '🤖' },
      ],
    },
  ],

  'Travel & Tourism': [
    {
      id: 'features_travel',
      question: 'Which travel features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Hotel Booking', value: 'hotels', icon: '🏨' },
        { label: 'Flight Search', value: 'flights', icon: '✈️' },
        { label: 'Tour Packages', value: 'packages', icon: '🗺️' },
        { label: 'Itinerary Planner', value: 'itinerary', icon: '📅' },
        { label: 'Local Experiences', value: 'experiences', icon: '🎭' },
        { label: 'Reviews & Ratings', value: 'reviews', icon: '⭐' },
        { label: 'Currency Converter', value: 'currency', icon: '💱' },
      ],
    },
  ],

  'Agriculture': [
    {
      id: 'features_agri',
      question: 'Which agriculture features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Crop Management', value: 'crops', icon: '🌾' },
        { label: 'Weather Updates', value: 'weather', icon: '🌤️' },
        { label: 'Market Price Alerts', value: 'prices', icon: '📈' },
        { label: 'Expert Consultation', value: 'experts', icon: '👨‍🌾' },
        { label: 'Soil & Irrigation', value: 'soil', icon: '💧' },
        { label: 'Sell Produce', value: 'marketplace', icon: '🏪' },
      ],
    },
  ],

  'Manufacturing': [
    {
      id: 'features_manufacturing',
      question: 'Which manufacturing features do you need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'Production Orders', value: 'production', icon: '🏭' },
        { label: 'Quality Control', value: 'quality', icon: '✅' },
        { label: 'Inventory Management', value: 'inventory', icon: '📦' },
        { label: 'Equipment Maintenance', value: 'maintenance', icon: '🔧' },
        { label: 'Worker Attendance', value: 'attendance', icon: '👷' },
        { label: 'Shipment Tracking', value: 'shipment', icon: '🚚' },
      ],
    },
  ],

  'Custom': [
    {
      id: 'features_custom',
      question: 'Which core features does your app need?',
      type: 'multi-select',
      required: true,
      field: 'features',
      options: [
        { label: 'User Dashboard', value: 'dashboard', icon: '📊' },
        { label: 'User Profiles', value: 'profiles', icon: '👤' },
        { label: 'Search & Filter', value: 'search', icon: '🔍' },
        { label: 'In-app Messaging', value: 'chat', icon: '💬' },
        { label: 'Payments', value: 'payments', icon: '💳' },
        { label: 'File Uploads', value: 'files', icon: '📎' },
        { label: 'Maps & Location', value: 'maps', icon: '🗺️' },
        { label: 'Reports & Analytics', value: 'analytics', icon: '📈' },
      ],
    },
  ],
};

// ─── Generate Questions ───────────────────────────────────────────────────────

export function generateInterviewQuestions(intent: IntentResult): InterviewQuestion[] {
  const industryQuestions = INDUSTRY_QUESTIONS[intent.industry] || INDUSTRY_QUESTIONS['Custom'];

  // Always start with the roles question if not in industry-specific ones
  const hasRolesQuestion = industryQuestions.some(q => q.field === 'userRoles');
  const rolesQuestion: InterviewQuestion = {
    id: 'roles_general',
    question: 'Which user types will use your app?',
    subtext: 'We detected these roles — select all that apply',
    type: 'multi-select',
    required: true,
    field: 'userRoles',
    options: INDUSTRY_ROLES[intent.industry].map((role) => ({
      label: role,
      value: role,
      icon: '👤',
    })),
  };

  const questions: InterviewQuestion[] = [
    ...(!hasRolesQuestion ? [rolesQuestion] : []),
    ...industryQuestions,
    ...BASE_QUESTIONS,
  ];

  return questions;
}

// ─── AI-Enhanced Question Generation ─────────────────────────────────────────

export async function generateSmartQuestions(intent: IntentResult): Promise<InterviewQuestion[]> {
  // Local question generation is already industry-aware
  // In a future version this can call AI to generate even more specific questions
  return generateInterviewQuestions(intent);
}
