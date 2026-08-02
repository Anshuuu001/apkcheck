import type { ApiEndpoint } from '../../blueprint/schema';
import { generateId } from '../../blueprint/parser';

export function buildAPIEndpoints(features: string[], authRequired: boolean): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];

  const addEndpoint = (ep: Omit<ApiEndpoint, 'id'>) => {
    endpoints.push({ id: generateId('ep'), ...ep });
  };

  if (authRequired) {
    addEndpoint({ path: '/auth/register', method: 'POST', tag: 'Auth', summary: 'Register new user', auth: 'public', requestBody: [{ name: 'email', type: 'string', required: true }, { name: 'password', type: 'string', required: true }, { name: 'full_name', type: 'string', required: true }], responseCode: 201 });
    addEndpoint({ path: '/auth/login', method: 'POST', tag: 'Auth', summary: 'User login', auth: 'public', requestBody: [{ name: 'email', type: 'string', required: true }, { name: 'password', type: 'string', required: true }], responseCode: 200 });
    addEndpoint({ path: '/auth/logout', method: 'POST', tag: 'Auth', summary: 'User logout', auth: 'user', responseCode: 200 });
    addEndpoint({ path: '/auth/refresh', method: 'POST', tag: 'Auth', summary: 'Refresh access token', auth: 'public', responseCode: 200 });
    addEndpoint({ path: '/users/me', method: 'GET', tag: 'Users', summary: 'Get current user profile', auth: 'user', responseCode: 200 });
    addEndpoint({ path: '/users/me', method: 'PUT', tag: 'Users', summary: 'Update user profile', auth: 'user', responseCode: 200 });
  }

  const featureEndpointMap: Record<string, Omit<ApiEndpoint, 'id'>[]> = {
    appointments: [
      { path: '/appointments', method: 'GET', tag: 'Appointments', summary: 'List appointments', auth: 'user', responseCode: 200 },
      { path: '/appointments', method: 'POST', tag: 'Appointments', summary: 'Book appointment', auth: 'user', responseCode: 201 },
      { path: '/appointments/{id}', method: 'GET', tag: 'Appointments', summary: 'Get appointment details', auth: 'user', responseCode: 200 },
      { path: '/appointments/{id}', method: 'PUT', tag: 'Appointments', summary: 'Update appointment', auth: 'user', responseCode: 200 },
      { path: '/appointments/{id}/cancel', method: 'POST', tag: 'Appointments', summary: 'Cancel appointment', auth: 'user', responseCode: 200 },
    ],
    catalog: [
      { path: '/products', method: 'GET', tag: 'Products', summary: 'List products', auth: 'public', responseCode: 200 },
      { path: '/products/{id}', method: 'GET', tag: 'Products', summary: 'Get product detail', auth: 'public', responseCode: 200 },
      { path: '/products', method: 'POST', tag: 'Products', summary: 'Create product', auth: 'admin', responseCode: 201 },
      { path: '/products/search', method: 'GET', tag: 'Products', summary: 'Search products', auth: 'public', queryParams: [{ name: 'q', type: 'string', required: true }], responseCode: 200 },
      { path: '/categories', method: 'GET', tag: 'Products', summary: 'List categories', auth: 'public', responseCode: 200 },
    ],
    cart: [
      { path: '/cart', method: 'GET', tag: 'Cart', summary: 'Get cart', auth: 'user', responseCode: 200 },
      { path: '/cart/add', method: 'POST', tag: 'Cart', summary: 'Add item to cart', auth: 'user', responseCode: 200 },
      { path: '/cart/remove/{productId}', method: 'DELETE', tag: 'Cart', summary: 'Remove from cart', auth: 'user', responseCode: 200 },
      { path: '/orders', method: 'POST', tag: 'Orders', summary: 'Place order', auth: 'user', responseCode: 201 },
      { path: '/orders', method: 'GET', tag: 'Orders', summary: 'Get order history', auth: 'user', responseCode: 200 },
      { path: '/orders/{id}', method: 'GET', tag: 'Orders', summary: 'Get order detail', auth: 'user', responseCode: 200 },
    ],
    text_chat: [
      { path: '/conversations', method: 'GET', tag: 'Chat', summary: 'List conversations', auth: 'user', responseCode: 200 },
      { path: '/conversations', method: 'POST', tag: 'Chat', summary: 'Start conversation', auth: 'user', responseCode: 201 },
      { path: '/conversations/{id}/messages', method: 'GET', tag: 'Chat', summary: 'Get messages', auth: 'user', responseCode: 200 },
      { path: '/conversations/{id}/messages', method: 'POST', tag: 'Chat', summary: 'Send message', auth: 'user', responseCode: 201 },
    ],
    notifications: [
      { path: '/notifications', method: 'GET', tag: 'Notifications', summary: 'Get notifications', auth: 'user', responseCode: 200 },
      { path: '/notifications/{id}/read', method: 'POST', tag: 'Notifications', summary: 'Mark as read', auth: 'user', responseCode: 200 },
      { path: '/notifications/read-all', method: 'POST', tag: 'Notifications', summary: 'Mark all as read', auth: 'user', responseCode: 200 },
    ],
    analytics: [
      { path: '/analytics/summary', method: 'GET', tag: 'Analytics', summary: 'Get summary stats', auth: 'admin', responseCode: 200 },
      { path: '/analytics/reports', method: 'GET', tag: 'Analytics', summary: 'Get detailed reports', auth: 'admin', responseCode: 200 },
    ],
  };

  features.forEach(feature => {
    const eps = featureEndpointMap[feature];
    if (eps) eps.forEach(ep => addEndpoint(ep));
  });

  return endpoints;
}
