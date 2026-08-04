/**
 * AppForge-AI — Master Blueprint Schema
 * 
 * This is the single source of truth for every project.
 * ALL engines read from and write to this schema.
 * NO generator ever touches user prompts directly.
 * 
 * Pipeline: IntentAnalyzer → BlueprintEngine → [Preview | Editor | Generator | Builder]
 */

// ─── Design Tokens ──────────────────────────────────────────────────────────

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  divider: string;
  shadow: string;
}

export interface Typography {
  fontFamily: string;
  fontFamilyMono: string;
  scale: {
    h1: { size: number; weight: string; lineHeight: number };
    h2: { size: number; weight: string; lineHeight: number };
    h3: { size: number; weight: string; lineHeight: number };
    h4: { size: number; weight: string; lineHeight: number };
    body1: { size: number; weight: string; lineHeight: number };
    body2: { size: number; weight: string; lineHeight: number };
    caption: { size: number; weight: string; lineHeight: number };
    button: { size: number; weight: string; lineHeight: number };
    overline: { size: number; weight: string; lineHeight: number };
  };
}

export interface Spacing {
  xs: number;   // 4
  sm: number;   // 8
  md: number;   // 16
  lg: number;   // 24
  xl: number;   // 32
  xxl: number;  // 48
}

export interface BorderRadius {
  none: number;
  xs: number;   // 2
  sm: number;   // 4
  md: number;   // 8
  lg: number;   // 12
  xl: number;   // 16
  xxl: number;  // 24
  full: number; // 9999
}

export interface Elevation {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeTokens {
  mode: 'light' | 'dark';
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  elevation: Elevation;
  iconSet: 'material' | 'ionicons' | 'feather' | 'lucide';
}

// ─── Component Blueprint ─────────────────────────────────────────────────────

export type ComponentCategory =
  | 'layout'
  | 'input'
  | 'display'
  | 'navigation'
  | 'feedback'
  | 'media'
  | 'data'
  | 'commerce'
  | 'auth'
  | 'map'
  | 'chart'
  | 'calendar'
  | 'communication';

export type ComponentType =
  // Layout (13 components)
  | 'Container' | 'Row' | 'Column' | 'Stack' | 'Grid' | 'Spacer' | 'Divider' | 'ScrollView'
  | 'SwipeableRow' | 'CollapsibleHeader' | 'StepIndicator' | 'Accordion' | 'Carousel'
  // Input (22 components)
  | 'Button' | 'IconButton' | 'FAB' | 'TextField' | 'PasswordField' | 'SearchBar'
  | 'Checkbox' | 'Radio' | 'Switch' | 'Slider' | 'Dropdown' | 'DatePicker' | 'TimePicker'
  | 'OTPInput' | 'PhoneInput' | 'FileUpload' | 'ImagePicker' | 'RangeSlider' | 'ColorPicker'
  | 'AutoComplete' | 'TagInput' | 'RatingInput'
  // Display (26 components)
  | 'Text' | 'Heading' | 'Label' | 'Badge' | 'Tag' | 'Chip' | 'Avatar' | 'Image'
  | 'Icon' | 'Card' | 'ListItem' | 'ListTile' | 'EmptyState' | 'Skeleton'
  | 'ProgressBar' | 'Rating' | 'Price' | 'Countdown' | 'Timeline' | 'TimelineItem'
  | 'MarkdownView' | 'RichTextView' | 'BadgeIcon' | 'QrCodeImage'
  // Navigation (12 components)
  | 'BottomNav' | 'TopBar' | 'Drawer' | 'TabBar' | 'Breadcrumb' | 'BackButton'
  | 'FABMenu' | 'ContextMenu' | 'DropdownMenu' | 'DrawerItem' | 'SideMenu' | 'StepNavigation'
  // Feedback (12 components)
  | 'Toast' | 'SnackBar' | 'Dialog' | 'AlertDialog' | 'BottomSheet' | 'Tooltip'
  | 'LoadingSpinner' | 'RefreshIndicator' | 'ErrorBoundary' | 'InlineAlert' | 'Banner' | 'ProgressCircle'
  // Media (11 components)
  | 'VideoPlayer' | 'AudioPlayer' | 'Camera' | 'Gallery' | 'MapView' | 'QRScanner'
  | 'PDFViewer' | 'LottiePlayer' | 'VoiceRecorder' | 'LiveStreamPlayer' | 'VideoCamera'
  // Data (14 components)
  | 'Table' | 'DataGrid' | 'Chart' | 'LineChart' | 'BarChart' | 'PieChart'
  | 'StatCard' | 'KPICard' | 'ReportCard' | 'HeatMap' | 'RadarChart' | 'FunnelChart'
  | 'ScatterPlot' | 'StockChart'
  // Commerce (15 components)
  | 'ProductCard' | 'CartItem' | 'OrderSummary' | 'PaymentForm' | 'PriceTag'
  | 'DiscountBadge' | 'StockIndicator' | 'ReviewCard' | 'RatingStars' | 'ShippingForm'
  | 'PromoBanner' | 'ProductCarousel' | 'CheckoutSummary' | 'InvoiceReceipt'
  // Auth (9 components)
  | 'LoginForm' | 'SignupForm' | 'OTPVerification' | 'SocialAuthButton' | 'BiometricButton'
  | 'RegisterForm' | 'ForgotPassForm' | 'ResetPassForm' | 'MfaVerification'
  // Map (4 components)
  | 'MapMarker' | 'RouteOverlay' | 'LocationPicker' | 'AddressSearch'
  // Calendar (6 components)
  | 'Calendar' | 'EventCard' | 'TimeSlot' | 'AppointmentCard' | 'AgendaView' | 'WeeklyCalendar'
  // Communication (9 components)
  | 'ChatBubble' | 'ChatInput' | 'MessageList' | 'TypingIndicator' | 'NotificationCard'
  | 'DirectMessageItem' | 'GroupChatTile' | 'ReactionPicker' | 'FileAttachmentTile';

export interface ComponentProps {
  [key: string]: string | number | boolean | string[] | null | undefined;
}

export interface ComponentBlueprint {
  id: string;
  type: ComponentType;
  category?: ComponentCategory;
  label?: string;
  props: ComponentProps;
  style?: {
    width?: string | number;
    height?: string | number;
    margin?: string | number;
    padding?: string | number;
    flex?: number;
    alignSelf?: string;
    backgroundColor?: string;
    [key: string]: any;
  };
  children?: ComponentBlueprint[];
  dataBinding?: string;      // e.g., "state.products" or "props.user.name"
  eventHandlers?: {
    onPress?: string;        // action name e.g., "navigateTo:ProductDetail"
    onChange?: string;
    onSubmit?: string;
    [key: string]: string | undefined;
  };
}

// ─── Screen Blueprint ────────────────────────────────────────────────────────

export type ScreenType =
  | 'splash' | 'onboarding' | 'auth'
  | 'home' | 'dashboard' | 'list' | 'detail'
  | 'form' | 'profile' | 'settings'
  | 'search' | 'chat' | 'notification'
  | 'checkout' | 'map' | 'report' | 'custom';

export interface ScreenBlueprint {
  id: string;
  name: string;
  route: string;               // e.g., "/dashboard", "/product/:id"
  type: ScreenType;
  layout?: string;             // Layout template (DashboardLayout, ListDetailLayout, etc.)
  title: string;               // Display title in header
  description: string;
  userRoles: string[];         // Which user roles can see this screen
  components: ComponentBlueprint[];
  stateVariables?: {
    name: string;
    type: string;
    initialValue: any;
    source?: 'api' | 'local' | 'prop';
  }[];
  apiCalls?: string[];         // API endpoint IDs called from this screen
  guards?: string[];           // Auth guards e.g., ["isAuthenticated", "isDoctor"]
  params?: { name: string; type: string }[];  // Route params
  layout_data?: string;        // Visual element position offsets JSON string
}

// ─── Navigation Blueprint ────────────────────────────────────────────────────

export type NavigationType =
  | 'stack' | 'tab' | 'drawer' | 'material-top-tab' | 'modal';

export interface NavigationRoute {
  name: string;
  screenId: string;
  icon?: string;
  label?: string;
  badge?: string;
}

export interface NavigationGroup {
  id: string;
  type: NavigationType;
  position?: 'bottom' | 'top' | 'left';
  label?: string;
  userRoles: string[];
  routes: NavigationRoute[];
  initialRoute?: string;
}

export interface NavigationPlan {
  type: 'bottom-tabs' | 'drawer' | 'stack-only' | 'hybrid';
  groups: NavigationGroup[];
  deepLinks?: { pattern: string; screenId: string }[];
  authFlow?: {
    unauthenticatedEntry: string;  // screen id
    authenticatedEntry: string;    // screen id
    postLoginRedirect: string;     // screen id
  };
}

// ─── Database Blueprint ──────────────────────────────────────────────────────

export type FieldType =
  | 'INTEGER' | 'BIGINT' | 'VARCHAR' | 'TEXT' | 'BOOLEAN'
  | 'DECIMAL' | 'FLOAT' | 'DATE' | 'DATETIME' | 'TIMESTAMP'
  | 'JSON' | 'UUID' | 'ENUM';

export interface TableField {
  name: string;
  type: FieldType;
  length?: number;
  nullable: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  defaultValue?: string;
  enumValues?: string[];
  comment?: string;
}

export interface TableIndex {
  name: string;
  fields: string[];
  unique?: boolean;
}

export interface ForeignKey {
  field: string;
  referencesTable: string;
  referencesField: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface DatabaseTable {
  id: string;
  name: string;
  comment: string;
  fields: TableField[];
  indexes?: TableIndex[];
  foreignKeys?: ForeignKey[];
}

export type RelationshipType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';

export interface TableRelationship {
  from: string;   // table name
  to: string;     // table name
  type: RelationshipType;
  through?: string;  // join table for many-to-many
  label?: string;
}

export interface DatabasePlan {
  dbType: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';
  tables: DatabaseTable[];
  relationships: TableRelationship[];
  seedData?: {
    table: string;
    rows: Record<string, any>[];
  }[];
}

// ─── API Blueprint ───────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  tag: string;                  // Grouping e.g. "Auth", "Products"
  summary: string;
  description?: string;
  auth: 'public' | 'user' | 'admin' | 'role';
  role?: string;
  requestBody?: ApiField[];
  queryParams?: ApiField[];
  pathParams?: ApiField[];
  responseFields?: ApiField[];
  responseCode: number;
  linkedTable?: string;         // DB table this endpoint touches
  linkedScreen?: string;        // Screen that calls this endpoint
}

export interface ApiPlan {
  baseUrl: string;
  version: string;
  authScheme: 'jwt' | 'session' | 'api-key' | 'oauth2';
  endpoints: ApiEndpoint[];
}

// ─── Business Logic ──────────────────────────────────────────────────────────

export interface BusinessStep {
  id: string;
  label: string;
  actor: string;       // Which user role performs this step
  action: string;      // What they do
  screen?: string;     // Which screen is involved
  apiCall?: string;    // Which API is called
  outcome: string;     // Result of this step
  nextStep?: string;   // ID of the next step (for linear flows)
  branches?: { condition: string; nextStep: string }[];  // conditional flows
}

export interface BusinessFlow {
  id: string;
  name: string;
  description: string;
  trigger: string;     // e.g., "User clicks Book Appointment"
  steps: BusinessStep[];
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export interface AppPermission {
  name: string;
  platform: 'android' | 'ios' | 'both';
  reason: string;
  required: boolean;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationChannel = 'push' | 'in-app' | 'email' | 'sms';

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  trigger: string;   // e.g., "on_appointment_created", "on_order_shipped"
  roles: string[];   // Which roles receive this notification
  data?: Record<string, string>; // extra payload fields
}

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  provider: 'firebase' | 'onesignal' | 'aws-sns' | 'none';
  templates: NotificationTemplate[];
}

// ─── Validations ─────────────────────────────────────────────────────────────

export type ValidationType =
  | 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email'
  | 'phone' | 'url' | 'min' | 'max' | 'custom';

export interface ValidationRule {
  id: string;
  screen: string;     // Screen name this rule applies to
  field: string;      // Field name inside the form/component
  type: ValidationType;
  value?: string | number;    // e.g., minLength: 8
  message: string;    // User-facing error message
  condition?: string; // Optional: only validate if this condition is true
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export type AssetType = 'icon' | 'font' | 'image' | 'lottie' | 'splash' | 'logo';

export interface AssetDeclaration {
  id: string;
  name: string;
  type: AssetType;
  source: 'bundled' | 'url' | 'generated';
  path?: string;     // local path inside assets/
  url?: string;      // remote URL
  description?: string;
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  defaultLanguage: string;        // e.g., "en", "hi", "ar"
  supportedLanguages: string[];
  darkModeSupport: boolean;
  defaultThemeMode: 'light' | 'dark' | 'system';
  cacheTtlSeconds: number;        // Default API response cache duration
  sessionTimeoutMinutes: number;
  allowGuestMode: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  forceUpdateEnabled: boolean;
}

// ─── Build Pipeline ──────────────────────────────────────────────────────────

export type BuildStage =
  | 'generate' | 'npm-install' | 'typescript' | 'lint' | 'gradle' | 'sign' | 'apk';

export interface BuildStageConfig {
  stage: BuildStage;
  enabled: boolean;
  failOnError: boolean;
  retryCount: number;       // How many times to retry on failure
  timeoutMs: number;
}

export interface BuildPipeline {
  outputDir: string;        // e.g., "output/hospital-app"
  stages: BuildStageConfig[];
  signingConfig?: {
    keyAlias: string;
    storeFile: string;
    keyPassword?: string;
    storePassword?: string;
  };
  gradleConfig?: {
    minSdkVersion: number;
    targetSdkVersion: number;
    compileSdkVersion: number;
    versionCode: number;
    versionName: string;
  };
}

// ─── Project Metadata ────────────────────────────────────────────────────────

export interface ProjectMetadata {
  generatedAt: string;         // ISO timestamp of generation
  lastEditedAt?: string;
  generationDurationMs?: number;
  aiConfidence: number;        // Overall AI confidence 0-100
  reviewScore?: number;        // Score from AI Project Reviewer 0-100
  userRating?: number;         // User satisfaction 1-5
  buildCount: number;          // How many times this project was built
  lastBuildStatus?: 'success' | 'failed' | 'never';
  tags: string[];              // e.g., ["healthcare", "react-native", "offline"]
}

// ─── Project Review Report ───────────────────────────────────────────────────

export interface ReviewIssue {
  severity: 'high' | 'medium' | 'low';
  description: string;
  location?: string;   // e.g., "LoginScreen", "User table", "POST /auth/login"
  suggestion: string;
}

export interface ReviewCategory {
  score: number;       // 0-100
  issues: ReviewIssue[];
}

export interface ReviewSuggestion {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  module: string;
  impact: string;
}

export interface ProjectReviewReport {
  overall: number;
  security: ReviewCategory;
  performance: ReviewCategory;
  architecture: ReviewCategory;
  database: ReviewCategory;
  ui: ReviewCategory;
  accessibility: ReviewCategory;
  suggestions: ReviewSuggestion[];
  generatedAt: string;
}

// ─── Requirement Answers ─────────────────────────────────────────────────────

export interface RequirementAnswers {
  features: string[];         // Selected feature flags
  userRoles: string[];        // Confirmed user roles
  authRequired: boolean;
  paymentRequired: boolean;
  locationRequired: boolean;
  notificationsRequired: boolean;
  offlineSupport: boolean;
  additionalContext: string;  // Free-text extra info
}

// ─── Intent Analysis Result ──────────────────────────────────────────────────

export type IndustryType =
  | 'Healthcare' | 'Education' | 'E-Commerce' | 'Food & Delivery'
  | 'Transportation' | 'Finance & Banking' | 'Real Estate'
  | 'Social Media' | 'Fitness & Health' | 'Entertainment'
  | 'CRM & Business' | 'Chat & Communication' | 'Travel & Tourism'
  | 'Agriculture' | 'Manufacturing' | 'Custom';

export interface IntentResult {
  industry: IndustryType;
  appType: string;             // e.g., "Hospital Management System"
  targetUsers: string[];       // e.g., ["Doctor", "Patient", "Admin"]
  primaryGoal: string;         // e.g., "Appointment scheduling and billing"
  suggestedFeatures: string[]; // Recommended feature flags
  confidence: number;          // 0-1 confidence score
  rawIdea: string;             // Original user input
}

export interface RequirementDocument {
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  userRoles: string[];
  modules: string[];
  constraints: string[];
  businessRules: string[];
}

export interface ArchitectureDecision {
  frontendFramework: string;      // e.g., "React Native", "React (Web)"
  stateManagement: string;        // e.g., "Redux", "Zustand"
  navigationLibrary: string;      // e.g., "React Navigation", "Expo Router"
  httpClient: string;             // e.g., "Axios", "Fetch"
  backendFramework: string;       // e.g., "Spring Boot", "Node Express"
  authScheme: string;             // e.g., "JWT", "OAuth2"
  databaseType: string;           // e.g., "MySQL", "PostgreSQL"
}

// ─── Master AppBlueprint ─────────────────────────────────────────────────────

export interface AppBlueprint {
  // Identity
  id: string;
  version: string;             // e.g., "1.0.0"
  schemaVersion: string;       // Blueprint schema version for migrations
  createdAt: string;
  updatedAt: string;

  // App Metadata
  name: string;
  packageName: string;         // e.g., "com.appforge.hospital"
  description: string;
  industry: IndustryType;
  appType: string;
  icon?: string;               // Base64 or asset path

  // User Management
  users: string[];             // User role names
  authRequired: boolean;

  // Design System
  theme: ThemeTokens;

  // Architecture
  screens: ScreenBlueprint[];
  navigation: NavigationPlan;
  database: DatabasePlan;
  api: ApiPlan;
  businessLogic: BusinessFlow[];
  permissions: AppPermission[];

  // Source tracking
  intentResult?: IntentResult;
  requirementAnswers?: RequirementAnswers;
  requirementDocument?: RequirementDocument;
  architecture?: ArchitectureDecision;

  // Extended Blueprint Sections (V1)
  notifications?: NotificationConfig;
  validations?: ValidationRule[];
  assets?: AssetDeclaration[];
  settings?: AppSettings;
  buildPipeline?: BuildPipeline;
  metadata?: ProjectMetadata;
}


// ─── Pipeline Stage ──────────────────────────────────────────────────────────

export type PipelineStage =
  | 'idle'
  | 'intent-analysis'
  | 'requirement-intelligence'
  | 'architecture-generation'
  | 'reasoning'
  | 'requirement-interview'
  | 'ui-planning'
  | 'blueprint-generation'
  | 'component-planning'
  | 'theme-planning'
  | 'navigation-planning'
  | 'database-planning'
  | 'api-planning'
  | 'validation'
  | 'preview'
  | 'react-native-generation'
  | 'springboot-generation'
  | 'verification-checks'
  | 'documentation'
  | 'testing'
  | 'apk-build'
  | 'complete'
  | 'error';

export interface PipelineState {
  stage: PipelineStage;
  progress: number;          // 0-100
  stageName: string;
  stageDescription: string;
  error?: string;
  result?: Partial<AppBlueprint>;
}

// ─── Template Package ────────────────────────────────────────────────────────

export interface TemplatePackage {
  id: string;
  name: string;
  industry: IndustryType;
  description: string;
  tags: string[];
  icon: string;
  preview?: string;
  screenCount: number;
  tableCount: number;
  endpointCount: number;
  popularity: 'trending' | 'popular' | 'new' | 'featured';
  blueprint: AppBlueprint;
}
