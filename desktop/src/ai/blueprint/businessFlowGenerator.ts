import type { BusinessFlow, IndustryType } from '../../blueprint/schema';
import { generateId } from '../../blueprint/parser';

export function buildBusinessFlows(features: string[], _users: string[], _industry: IndustryType): BusinessFlow[] {
  const flows: BusinessFlow[] = [];

  if (features.includes('appointments')) {
    flows.push({
      id: generateId('flow'), name: 'Appointment Booking Flow',
      description: 'Complete flow for booking a medical appointment',
      trigger: 'Patient taps "Book Appointment"',
      steps: [
        { id: generateId('step'), label: 'Search', actor: 'Patient', action: 'Searches for available doctors by specialty', screen: 'AppointmentsScreen', outcome: 'List of available doctors shown' },
        { id: generateId('step'), label: 'Select Slot', actor: 'Patient', action: 'Selects a time slot from calendar', apiCall: 'getAvailableSlots', outcome: 'Slot temporarily reserved for 5 minutes' },
        { id: generateId('step'), label: 'Confirm', actor: 'Patient', action: 'Confirms appointment details and submits', apiCall: 'bookAppointment', outcome: 'Appointment created with PENDING status' },
        { id: generateId('step'), label: 'Notify Doctor', actor: 'System', action: 'Sends push notification to doctor', apiCall: 'sendNotification', outcome: 'Doctor receives notification' },
        { id: generateId('step'), label: 'Doctor Confirms', actor: 'Doctor', action: 'Reviews and confirms appointment', apiCall: 'updateAppointment', outcome: 'Status changes to CONFIRMED; patient notified' },
      ]
    });
  }

  if (features.includes('cart')) {
    flows.push({
      id: generateId('flow'), name: 'Order Placement Flow',
      description: 'Customer places and pays for an order',
      trigger: 'Customer taps "Checkout"',
      steps: [
        { id: generateId('step'), label: 'Review Cart', actor: 'Customer', action: 'Reviews cart items and quantities', screen: 'CartScreen', outcome: 'Cart review confirmed' },
        { id: generateId('step'), label: 'Select Address', actor: 'Customer', action: 'Selects or adds delivery address', outcome: 'Delivery address confirmed' },
        { id: generateId('step'), label: 'Select Payment', actor: 'Customer', action: 'Chooses payment method', outcome: 'Payment method selected' },
        { id: generateId('step'), label: 'Place Order', actor: 'Customer', action: 'Confirms and places the order', apiCall: 'checkout', outcome: 'Order created with PENDING status' },
        { id: generateId('step'), label: 'Payment', actor: 'System', action: 'Processes payment via gateway', outcome: 'Payment confirmed or failed' },
        { id: generateId('step'), label: 'Confirm Order', actor: 'System', action: 'Updates order to CONFIRMED status', apiCall: 'updateOrderStatus', outcome: 'Customer receives order confirmation' },
      ]
    });
  }

  return flows;
}
