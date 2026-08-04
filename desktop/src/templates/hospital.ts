/**
 * AppForge-AI — Hospital Management Template
 * Complete pre-built AppBlueprint for healthcare apps.
 */
import type { AppBlueprint } from '../blueprint/schema';
import { generateTheme } from '../ai/planner/ThemePlanner';
import { generateBlueprintId, generateId } from '../blueprint/parser';

const theme = generateTheme('Healthcare', 'dark');
const now = new Date().toISOString();

export const HOSPITAL_TEMPLATE: AppBlueprint = {
  id: generateBlueprintId(), version: '1.0.0', schemaVersion: '1',
  createdAt: now, updatedAt: now,
  name: 'Hospital Management System',
  packageName: 'com.appforge.hospital',
  description: 'Complete hospital management with patient records, appointments, prescriptions, and billing',
  industry: 'Healthcare', appType: 'Hospital Management System',
  users: ['Doctor', 'Patient', 'Admin', 'Nurse', 'Receptionist'],
  authRequired: true, theme,
  screens: [
    {
      id: generateId('s'), name: 'SplashScreen', type: 'splash', title: 'Splash',
      route: '/splash', description: 'Hospital app launch screen', userRoles: ['Doctor', 'Patient', 'Admin'], guards: [],
      components: [{ id: generateId('c'), type: 'Container', label: 'Splash', props: { centered: true }, children: [{ id: generateId('c'), type: 'Image', label: 'Hospital Logo', props: {} }, { id: generateId('c'), type: 'Heading', label: 'MediCare Pro', props: { level: 'h1' } }, { id: generateId('c'), type: 'Text', label: 'Your Health, Our Priority', props: {} }] }]
    },
    {
      id: generateId('s'), name: 'LoginScreen', type: 'auth', title: 'Sign In',
      route: '/login', description: 'Secure role-based login', userRoles: ['Doctor', 'Patient', 'Admin'], guards: [],
      components: [{ id: generateId('c'), type: 'Container', label: 'Login', props: {}, children: [{ id: generateId('c'), type: 'Image', label: 'Logo', props: { size: 70 } }, { id: generateId('c'), type: 'Heading', label: 'Welcome Back', props: { level: 'h2' } }, { id: generateId('c'), type: 'TextField', label: 'Email', props: { placeholder: 'doctor@hospital.com' } }, { id: generateId('c'), type: 'PasswordField', label: 'Password', props: {} }, { id: generateId('c'), type: 'Button', label: 'Sign In', props: { variant: 'primary', fullWidth: true } }] }]
    },
    {
      id: generateId('s'), name: 'DoctorDashboard', type: 'dashboard', title: 'Dashboard',
      route: '/doctor/dashboard', description: 'Doctor overview with today\'s schedule', userRoles: ['Doctor'], guards: ['isAuthenticated', 'isDoctor'],
      components: [
        { id: generateId('c'), type: 'TopBar', label: 'Doctor Dashboard', props: { title: 'Good Morning, Dr. Smith', showNotif: true } },
        { id: generateId('c'), type: 'ScrollView', label: 'Dashboard Content', props: {}, children: [
          { id: generateId('c'), type: 'Row', label: 'KPIs', props: { gap: 10 }, children: [
            { id: generateId('c'), type: 'StatCard', label: 'Today\'s Patients', props: {} },
            { id: generateId('c'), type: 'StatCard', label: 'Appointments', props: {} },
          ]},
          { id: generateId('c'), type: 'Heading', label: 'Today\'s Schedule', props: { level: 'h3' } },
          { id: generateId('c'), type: 'AppointmentCard', label: 'Appointment 1', props: {} },
          { id: generateId('c'), type: 'AppointmentCard', label: 'Appointment 2', props: {} },
          { id: generateId('c'), type: 'Heading', label: 'Recent Prescriptions', props: { level: 'h3' } },
          { id: generateId('c'), type: 'Card', label: 'Prescription Summary', props: {} },
        ]},
        { id: generateId('c'), type: 'BottomNav', label: 'Nav', props: { tabs: ['Dashboard', 'Patients', 'Appointments', 'Profile'] } },
      ]
    },
    {
      id: generateId('s'), name: 'PatientDashboard', type: 'dashboard', title: 'My Health',
      route: '/patient/dashboard', description: 'Patient health overview', userRoles: ['Patient'], guards: ['isAuthenticated'],
      components: [
        { id: generateId('c'), type: 'TopBar', label: 'My Health', props: { title: 'My Health', showNotif: true } },
        { id: generateId('c'), type: 'ScrollView', label: 'Patient Content', props: {}, children: [
          { id: generateId('c'), type: 'Card', label: 'Health Summary Card', props: {} },
          { id: generateId('c'), type: 'Row', label: 'Quick Actions', props: { gap: 8 }, children: [
            { id: generateId('c'), type: 'Button', label: 'Book Appointment', props: { variant: 'primary' } },
            { id: generateId('c'), type: 'Button', label: 'View Records', props: { variant: 'outlined' } },
          ]},
          { id: generateId('c'), type: 'Heading', label: 'Upcoming Appointments', props: { level: 'h3' } },
          { id: generateId('c'), type: 'AppointmentCard', label: 'Upcoming Appointment', props: {} },
          { id: generateId('c'), type: 'Heading', label: 'Active Prescriptions', props: { level: 'h3' } },
          { id: generateId('c'), type: 'Card', label: 'Prescription Card', props: {} },
        ]},
        { id: generateId('c'), type: 'BottomNav', label: 'Nav', props: { tabs: ['Home', 'Appointments', 'Records', 'Profile'] } },
      ]
    },
    {
      id: generateId('s'), name: 'AppointmentsScreen', type: 'list', title: 'Appointments',
      route: '/appointments', description: 'Book and manage appointments', userRoles: ['Doctor', 'Patient', 'Receptionist'], guards: ['isAuthenticated'],
      components: [
        { id: generateId('c'), type: 'TopBar', label: 'Appointments', props: { title: 'Appointments', showSearch: true } },
        { id: generateId('c'), type: 'Calendar', label: 'Appointment Calendar', props: {} },
        { id: generateId('c'), type: 'ScrollView', label: 'Appointment List', props: {}, children: [
          { id: generateId('c'), type: 'AppointmentCard', label: 'Appointment 1', props: {} },
          { id: generateId('c'), type: 'AppointmentCard', label: 'Appointment 2', props: {} },
          { id: generateId('c'), type: 'AppointmentCard', label: 'Appointment 3', props: {} },
        ]},
        { id: generateId('c'), type: 'FAB', label: 'Book Appointment', props: { variant: 'primary' } },
      ], apiCalls: ['getAppointments', 'bookAppointment']
    },
    {
      id: generateId('s'), name: 'PrescriptionsScreen', type: 'list', title: 'Prescriptions',
      route: '/prescriptions', description: 'Digital prescriptions management', userRoles: ['Doctor', 'Patient'], guards: ['isAuthenticated'],
      components: [
        { id: generateId('c'), type: 'TopBar', label: 'Prescriptions', props: { title: 'Prescriptions' } },
        { id: generateId('c'), type: 'SearchBar', label: 'Search Prescriptions', props: {} },
        { id: generateId('c'), type: 'ScrollView', label: 'Prescriptions List', props: {}, children: [
          { id: generateId('c'), type: 'Card', label: 'Prescription 1', props: {} },
          { id: generateId('c'), type: 'Card', label: 'Prescription 2', props: {} },
        ]},
      ], apiCalls: ['getPrescriptions', 'createPrescription']
    },
    {
      id: generateId('s'), name: 'BillingScreen', type: 'list', title: 'Billing',
      route: '/billing', description: 'Invoice and payment management', userRoles: ['Admin', 'Receptionist', 'Patient'], guards: ['isAuthenticated'],
      components: [
        { id: generateId('c'), type: 'TopBar', label: 'Billing', props: { title: 'Billing & Payments' } },
        { id: generateId('c'), type: 'StatCard', label: 'Revenue Summary', props: {} },
        { id: generateId('c'), type: 'Table', label: 'Invoices Table', props: {} },
        { id: generateId('c'), type: 'Button', label: 'Generate Invoice', props: { variant: 'primary', fullWidth: true } },
      ], apiCalls: ['getBills', 'createInvoice', 'processPayment']
    },
    {
      id: generateId('s'), name: 'AnalyticsScreen', type: 'report', title: 'Analytics',
      route: '/analytics', description: 'Hospital performance reports', userRoles: ['Admin'], guards: ['isAuthenticated', 'isAdmin'],
      components: [
        { id: generateId('c'), type: 'TopBar', label: 'Analytics', props: { title: 'Hospital Analytics' } },
        { id: generateId('c'), type: 'Row', label: 'KPI Row', props: { gap: 8 }, children: [
          { id: generateId('c'), type: 'StatCard', label: 'Total Patients', props: {} },
          { id: generateId('c'), type: 'StatCard', label: 'Revenue', props: {} },
        ]},
        { id: generateId('c'), type: 'LineChart', label: 'Patient Trend', props: {} },
        { id: generateId('c'), type: 'BarChart', label: 'Department Revenue', props: {} },
        { id: generateId('c'), type: 'PieChart', label: 'Appointment Types', props: {} },
      ]
    },
    {
      id: generateId('s'), name: 'ProfileScreen', type: 'profile', title: 'Profile',
      route: '/profile', description: 'User profile and settings', userRoles: ['Doctor', 'Patient', 'Admin'], guards: ['isAuthenticated'],
      components: [
        { id: generateId('c'), type: 'TopBar', label: 'Profile', props: { title: 'My Profile' } },
        { id: generateId('c'), type: 'Container', label: 'Profile Content', props: {}, children: [
          { id: generateId('c'), type: 'Avatar', label: 'Profile Photo', props: { size: 80 } },
          { id: generateId('c'), type: 'Heading', label: 'Dr. John Smith', props: { level: 'h3' } },
          { id: generateId('c'), type: 'Badge', label: 'Cardiologist', props: {} },
          { id: generateId('c'), type: 'Divider', label: '', props: {} },
          { id: generateId('c'), type: 'ListTile', label: 'Personal Info', props: {} },
          { id: generateId('c'), type: 'ListTile', label: 'Working Hours', props: {} },
          { id: generateId('c'), type: 'ListTile', label: 'Notifications', props: {} },
          { id: generateId('c'), type: 'Button', label: 'Sign Out', props: { variant: 'ghost', fullWidth: true } },
        ]},
      ]
    },
  ],
  navigation: {
    type: 'bottom-tabs',
    groups: [
      { id: 'auth', type: 'stack', userRoles: ['Doctor', 'Patient', 'Admin'], routes: [{ name: 'LoginScreen', screenId: 'login' }] },
      { id: 'doctor_tabs', type: 'tab', position: 'bottom', userRoles: ['Doctor'], routes: [
        { name: 'DoctorDashboard', screenId: 'dash', icon: 'LayoutDashboard', label: 'Dashboard' },
        { name: 'AppointmentsScreen', screenId: 'appt', icon: 'Calendar', label: 'Appointments' },
        { name: 'PrescriptionsScreen', screenId: 'rx', icon: 'ClipboardList', label: 'Prescriptions' },
        { name: 'ProfileScreen', screenId: 'profile', icon: 'User', label: 'Profile' },
      ]},
      { id: 'patient_tabs', type: 'tab', position: 'bottom', userRoles: ['Patient'], routes: [
        { name: 'PatientDashboard', screenId: 'pdash', icon: 'Home', label: 'Home' },
        { name: 'AppointmentsScreen', screenId: 'appt', icon: 'Calendar', label: 'Appointments' },
        { name: 'PrescriptionsScreen', screenId: 'rx', icon: 'Pill', label: 'Prescriptions' },
        { name: 'ProfileScreen', screenId: 'profile', icon: 'User', label: 'Profile' },
      ]},
    ],
    authFlow: { unauthenticatedEntry: 'login', authenticatedEntry: 'DoctorDashboard', postLoginRedirect: 'DoctorDashboard' },
  },
  database: {
    dbType: 'mysql', relationships: [],
    tables: [
      { id: generateId('t'), name: 'users', comment: 'System users', fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'email', type: 'VARCHAR', length: 255, nullable: false, unique: true },
        { name: 'password_hash', type: 'VARCHAR', length: 255, nullable: false },
        { name: 'full_name', type: 'VARCHAR', length: 100, nullable: false },
        { name: 'role', type: 'ENUM', nullable: false, enumValues: ['Doctor', 'Patient', 'Admin', 'Nurse', 'Receptionist'] },
        { name: 'phone', type: 'VARCHAR', length: 20, nullable: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ]},
      { id: generateId('t'), name: 'doctors', comment: 'Doctor professional profiles', fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'user_id', type: 'BIGINT', nullable: false, unique: true },
        { name: 'specialty', type: 'VARCHAR', length: 100, nullable: false },
        { name: 'license_number', type: 'VARCHAR', length: 50, nullable: false, unique: true },
        { name: 'consultation_fee', type: 'DECIMAL', nullable: false },
        { name: 'availability', type: 'JSON', nullable: true },
      ]},
      { id: generateId('t'), name: 'patients', comment: 'Patient medical profiles', fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'user_id', type: 'BIGINT', nullable: false, unique: true },
        { name: 'date_of_birth', type: 'DATE', nullable: true },
        { name: 'blood_group', type: 'VARCHAR', length: 5, nullable: true },
        { name: 'allergies', type: 'TEXT', nullable: true },
        { name: 'medical_history', type: 'JSON', nullable: true },
      ]},
      { id: generateId('t'), name: 'appointments', comment: 'Appointment bookings', fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'patient_id', type: 'BIGINT', nullable: false },
        { name: 'doctor_id', type: 'BIGINT', nullable: false },
        { name: 'appointment_date', type: 'DATETIME', nullable: false },
        { name: 'duration_minutes', type: 'INTEGER', nullable: false, defaultValue: '30' },
        { name: 'status', type: 'ENUM', nullable: false, enumValues: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
        { name: 'notes', type: 'TEXT', nullable: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ]},
      { id: generateId('t'), name: 'prescriptions', comment: 'Medical prescriptions', fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'patient_id', type: 'BIGINT', nullable: false },
        { name: 'doctor_id', type: 'BIGINT', nullable: false },
        { name: 'appointment_id', type: 'BIGINT', nullable: true },
        { name: 'diagnosis', type: 'TEXT', nullable: true },
        { name: 'medicines', type: 'JSON', nullable: false },
        { name: 'instructions', type: 'TEXT', nullable: true },
        { name: 'issued_date', type: 'DATE', nullable: false },
      ]},
      { id: generateId('t'), name: 'bills', comment: 'Patient billing', fields: [
        { name: 'id', type: 'BIGINT', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'patient_id', type: 'BIGINT', nullable: false },
        { name: 'appointment_id', type: 'BIGINT', nullable: true },
        { name: 'items', type: 'JSON', nullable: false },
        { name: 'total_amount', type: 'DECIMAL', nullable: false },
        { name: 'paid_amount', type: 'DECIMAL', nullable: false, defaultValue: '0.00' },
        { name: 'payment_status', type: 'ENUM', nullable: false, enumValues: ['PENDING', 'PARTIAL', 'PAID'] },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ]},
    ],
  },
  api: {
    baseUrl: '/api/v1', version: 'v1', authScheme: 'jwt',
    endpoints: [
      { id: generateId('e'), path: '/auth/login', method: 'POST', tag: 'Auth', summary: 'User login', auth: 'public', responseCode: 200 },
      { id: generateId('e'), path: '/auth/register', method: 'POST', tag: 'Auth', summary: 'Register user', auth: 'public', responseCode: 201 },
      { id: generateId('e'), path: '/appointments', method: 'GET', tag: 'Appointments', summary: 'List appointments', auth: 'user', responseCode: 200 },
      { id: generateId('e'), path: '/appointments', method: 'POST', tag: 'Appointments', summary: 'Book appointment', auth: 'user', responseCode: 201 },
      { id: generateId('e'), path: '/appointments/{id}/confirm', method: 'POST', tag: 'Appointments', summary: 'Confirm appointment', auth: 'role', role: 'Doctor', responseCode: 200 },
      { id: generateId('e'), path: '/appointments/{id}/cancel', method: 'POST', tag: 'Appointments', summary: 'Cancel appointment', auth: 'user', responseCode: 200 },
      { id: generateId('e'), path: '/prescriptions', method: 'GET', tag: 'Prescriptions', summary: 'List prescriptions', auth: 'user', responseCode: 200 },
      { id: generateId('e'), path: '/prescriptions', method: 'POST', tag: 'Prescriptions', summary: 'Create prescription', auth: 'role', role: 'Doctor', responseCode: 201 },
      { id: generateId('e'), path: '/bills', method: 'GET', tag: 'Billing', summary: 'List bills', auth: 'user', responseCode: 200 },
      { id: generateId('e'), path: '/bills', method: 'POST', tag: 'Billing', summary: 'Create bill', auth: 'role', role: 'Admin', responseCode: 201 },
      { id: generateId('e'), path: '/bills/{id}/pay', method: 'POST', tag: 'Billing', summary: 'Process payment', auth: 'user', responseCode: 200 },
      { id: generateId('e'), path: '/analytics/summary', method: 'GET', tag: 'Analytics', summary: 'Hospital analytics', auth: 'role', role: 'Admin', responseCode: 200 },
      { id: generateId('e'), path: '/doctors', method: 'GET', tag: 'Doctors', summary: 'List doctors', auth: 'public', responseCode: 200 },
      { id: generateId('e'), path: '/doctors/{id}/availability', method: 'GET', tag: 'Doctors', summary: 'Get doctor slots', auth: 'user', responseCode: 200 },
    ],
  },
  businessLogic: [
    {
      id: generateId('flow'), name: 'Appointment Booking Flow',
      description: 'Patient books and doctor confirms appointment',
      trigger: 'Patient taps Book Appointment',
      steps: [
        { id: generateId('step'), label: 'Browse Doctors', actor: 'Patient', action: 'Selects specialty and browses available doctors', outcome: 'Doctor list displayed' },
        { id: generateId('step'), label: 'Pick Time Slot', actor: 'Patient', action: 'Selects available time from calendar', apiCall: 'getAvailableSlots', outcome: 'Slot reserved for 5 minutes' },
        { id: generateId('step'), label: 'Confirm Booking', actor: 'Patient', action: 'Submits appointment request', apiCall: 'bookAppointment', outcome: 'Appointment PENDING created' },
        { id: generateId('step'), label: 'Doctor Review', actor: 'Doctor', action: 'Receives notification and reviews request', outcome: 'Doctor views appointment' },
        { id: generateId('step'), label: 'Confirm', actor: 'Doctor', action: 'Confirms appointment', apiCall: 'confirmAppointment', outcome: 'Status → CONFIRMED, patient notified' },
      ]
    }
  ],
  permissions: [
    { name: 'INTERNET', platform: 'android', reason: 'API calls', required: true },
    { name: 'POST_NOTIFICATIONS', platform: 'android', reason: 'Appointment reminders', required: true },
    { name: 'CAMERA', platform: 'android', reason: 'Video consultation', required: false },
  ],
  buildPipeline: {
    outputDir: 'output/hospital-app',
    stages: [],
    gradleConfig: {
      minSdkVersion: 24,
      targetSdkVersion: 34,
      compileSdkVersion: 34,
      versionCode: 1,
      versionName: '1.0.0'
    }
  },
};
