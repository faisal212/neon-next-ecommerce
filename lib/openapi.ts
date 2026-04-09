export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'PK E-Commerce API',
    description: 'Pakistan-specific e-commerce platform API — COD, PKR currency, Urdu support',
    version: '1.0.0',
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  tags: [
    { name: 'Auth', description: 'Authentication & registration' },
    { name: 'Users', description: 'User profile & addresses' },
    { name: 'Categories', description: 'Product categories (public)' },
    { name: 'Products', description: 'Product catalog (public)' },
    { name: 'Cart', description: 'Shopping cart' },
    { name: 'Orders', description: 'Order placement & tracking' },
    { name: 'Checkout', description: 'Checkout utilities' },
    { name: 'Wishlist', description: 'Saved products' },
    { name: 'Loyalty', description: 'Points & rewards' },
    { name: 'Support', description: 'Tickets & returns' },
    { name: 'OTP', description: 'Phone verification' },
    { name: 'Analytics', description: 'Event tracking' },
    { name: 'Uploads', description: 'File upload (R2)' },
    { name: 'Admin: Catalog', description: 'Admin catalog management' },
    { name: 'Admin: Orders', description: 'Admin order management' },
    { name: 'Admin: SEO', description: 'Admin SEO management' },
    { name: 'Admin: Settings', description: 'Admin app settings' },
  ],
  paths: {
    // ── Auth ─────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user profile after Neon Auth sign-up',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
        responses: { 201: { description: 'User created' }, 409: { description: 'Conflict — email or auth_user_id exists' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User profile' }, 401: { description: 'Not authenticated' } },
      },
    },

    // ── Users ────────────────────────────────────────
    '/users/{id}': {
      get: {
        tags: ['Users'], summary: 'Get user profile', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'User profile' }, 403: { description: 'Cannot view other users' } },
      },
      patch: {
        tags: ['Users'], summary: 'Update own profile', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileInput' } } } },
        responses: { 200: { description: 'Updated profile' } },
      },
    },
    '/users/{id}/addresses': {
      get: {
        tags: ['Users'], summary: 'List user addresses', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Address list' } },
      },
      post: {
        tags: ['Users'], summary: 'Add address', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AddressInput' } } } },
        responses: { 201: { description: 'Address created' } },
      },
    },
    '/users/{id}/addresses/{addressId}': {
      patch: {
        tags: ['Users'], summary: 'Update address', security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'addressId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 200: { description: 'Updated address' } },
      },
      delete: {
        tags: ['Users'], summary: 'Delete address', security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'addressId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 204: { description: 'Deleted' } },
      },
    },

    // ── Categories (public) ──────────────────────────
    '/categories': {
      get: { tags: ['Categories'], summary: 'Get category tree', responses: { 200: { description: 'Category tree' } } },
    },
    '/categories/{slug}': {
      get: {
        tags: ['Categories'], summary: 'Get category by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category' }, 404: { description: 'Not found' } },
      },
    },

    // ── Products (public) ────────────────────────────
    '/products': {
      get: {
        tags: ['Products'], summary: 'List/search products',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category slug' },
          { name: 'minPrice', in: 'query', schema: { type: 'string' }, description: 'Min price PKR' },
          { name: 'maxPrice', in: 'query', schema: { type: 'string' }, description: 'Max price PKR' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
          { name: 'featured', in: 'query', schema: { type: 'string', enum: ['true'] }, description: 'Featured only' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated product list' } },
      },
    },
    '/products/featured': {
      get: { tags: ['Products'], summary: 'Get featured products', responses: { 200: { description: 'Featured products' } } },
    },
    '/products/{slug}': {
      get: {
        tags: ['Products'], summary: 'Get product detail with variants, images, stock',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product with variants' }, 404: { description: 'Not found' } },
      },
    },
    '/products/{slug}/reviews': {
      get: {
        tags: ['Products'], summary: 'List product reviews (paginated)',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated reviews' } },
      },
      post: {
        tags: ['Products'], summary: 'Submit product review (verified purchase)', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReviewInput' } } } },
        responses: { 201: { description: 'Review created' }, 409: { description: 'Already reviewed' } },
      },
    },

    // ── Cart ─────────────────────────────────────────
    '/cart': {
      get: { tags: ['Cart'], summary: 'Get cart with items', description: 'Uses x-session-token header for guests, or auth for logged-in users', responses: { 200: { description: 'Cart with items' } } },
    },
    '/cart/items': {
      post: {
        tags: ['Cart'], summary: 'Add item to cart',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AddCartItemInput' } } } },
        responses: { 201: { description: 'Item added' }, 409: { description: 'Insufficient stock' } },
      },
    },
    '/cart/items/{itemId}': {
      patch: {
        tags: ['Cart'], summary: 'Update item quantity',
        parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCartItemInput' } } } },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Cart'], summary: 'Remove item from cart',
        parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 204: { description: 'Removed' } },
      },
    },
    '/cart/merge': {
      post: {
        tags: ['Cart'], summary: 'Merge guest cart into user cart on login', security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/MergeCartInput' } } } },
        responses: { 200: { description: 'Merge result' } },
      },
    },

    // ── Checkout ─────────────────────────────────────
    '/checkout/delivery-zones': {
      get: {
        tags: ['Checkout'], summary: 'List delivery zones',
        parameters: [{ name: 'city', in: 'query', schema: { type: 'string' }, description: 'Filter by city name' }],
        responses: { 200: { description: 'Delivery zones with charges' } },
      },
    },
    '/coupons/validate': {
      post: {
        tags: ['Checkout'], summary: 'Validate coupon code',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidateCouponInput' } } } },
        responses: { 200: { description: 'Coupon valid — discount calculated' }, 400: { description: 'Invalid coupon' } },
      },
    },

    // ── Orders ───────────────────────────────────────
    '/orders': {
      get: {
        tags: ['Orders'], summary: 'List my orders (paginated)', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Paginated orders' } },
      },
      post: {
        tags: ['Orders'], summary: 'Place order from cart',
        description: 'Atomic: validates stock → reserves inventory → creates order → applies coupon → converts cart. Supports guest checkout with guestPhone.',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/PlaceOrderInput' } } } },
        responses: { 201: { description: 'Order placed' }, 409: { description: 'Insufficient stock' } },
      },
    },
    '/orders/{orderNumber}': {
      get: {
        tags: ['Orders'], summary: 'Get order detail',
        parameters: [{ name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' }, description: 'ORD-YYYYMMDD-XXXXXX' }],
        responses: { 200: { description: 'Order with items, status history, courier, COD' } },
      },
    },

    // ── Wishlist ──────────────────────────────────────
    '/wishlist': {
      get: { tags: ['Wishlist'], summary: 'Get wishlist with items', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Wishlist' } } },
      post: {
        tags: ['Wishlist'], summary: 'Add item to wishlist (idempotent)', security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { variantId: { type: 'string', format: 'uuid' } }, required: ['variantId'] } } } },
        responses: { 201: { description: 'Added' } },
      },
    },
    '/wishlist/{itemId}': {
      delete: {
        tags: ['Wishlist'], summary: 'Remove from wishlist', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 204: { description: 'Removed' } },
      },
    },

    // ── Loyalty ──────────────────────────────────────
    '/loyalty': {
      get: { tags: ['Loyalty'], summary: 'Get points balance', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Balance' } } },
    },
    '/loyalty/history': {
      get: {
        tags: ['Loyalty'], summary: 'Points transaction history', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Paginated history' } },
      },
    },

    // ── Support ──────────────────────────────────────
    '/support/tickets': {
      get: { tags: ['Support'], summary: 'List my tickets', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Paginated tickets' } } },
      post: {
        tags: ['Support'], summary: 'Create support ticket', security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['category', 'subject', 'message'], properties: { orderId: { type: 'string', format: 'uuid' }, category: { type: 'string', enum: ['order_issue', 'payment', 'return', 'product', 'other'] }, subject: { type: 'string' }, message: { type: 'string' }, priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] } } } } } },
        responses: { 201: { description: 'Ticket created' } },
      },
    },
    '/support/tickets/{id}/messages': {
      get: {
        tags: ['Support'], summary: 'Get ticket with messages', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Ticket with messages' } },
      },
      post: {
        tags: ['Support'], summary: 'Add message to ticket', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['message'], properties: { message: { type: 'string' } } } } } },
        responses: { 201: { description: 'Message added' } },
      },
    },
    '/returns': {
      get: { tags: ['Support'], summary: 'List my return requests', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Paginated returns' } } },
      post: {
        tags: ['Support'], summary: 'Request return (delivered orders only)', security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ReturnRequestInput' } } } },
        responses: { 201: { description: 'Return request created' }, 400: { description: 'Order not delivered' } },
      },
    },

    // ── OTP ──────────────────────────────────────────
    '/otp/send': {
      post: {
        tags: ['OTP'], summary: 'Send OTP to phone',
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['phonePk', 'purpose'], properties: { phonePk: { type: 'string', pattern: '^03\\d{2}-?\\d{7}$' }, purpose: { type: 'string', enum: ['guest_checkout', 'phone_verify'] } } } } } },
        responses: { 200: { description: 'OTP sent' } },
      },
    },
    '/otp/verify': {
      post: {
        tags: ['OTP'], summary: 'Verify OTP code',
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['phonePk', 'otp', 'purpose'], properties: { phonePk: { type: 'string' }, otp: { type: 'string', minLength: 6, maxLength: 6 }, purpose: { type: 'string' } } } } } },
        responses: { 200: { description: 'Verified' }, 400: { description: 'Invalid/expired OTP' } },
      },
    },

    // ── Analytics ────────────────────────────────────
    '/analytics/track': {
      post: {
        tags: ['Analytics'], summary: 'Track event (page view, product view, cart, search)',
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['sessionToken', 'type', 'data'], properties: { sessionToken: { type: 'string' }, type: { type: 'string', enum: ['page_view', 'product_view', 'cart_event', 'search'] }, data: { type: 'object' } } } } } },
        responses: { 200: { description: 'Tracked' } },
      },
    },

    // ── Uploads ──────────────────────────────────────
    '/uploads/presign': {
      post: {
        tags: ['Uploads'], summary: 'Get R2 pre-signed upload URL', security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/PresignInput' } } } },
        responses: { 200: { description: 'Upload URL + public URL' } },
      },
    },

    // ── Admin: Catalog ───────────────────────────────
    '/admin/categories': {
      get: { tags: ['Admin: Catalog'], summary: 'List all categories', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Categories' } } },
      post: { tags: ['Admin: Catalog'], summary: 'Create category', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCategoryInput' } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/categories/{id}': {
      get: { tags: ['Admin: Catalog'], summary: 'Get category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Category' } } },
      patch: { tags: ['Admin: Catalog'], summary: 'Update category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Updated' } } },
    },
    '/admin/products': {
      get: { tags: ['Admin: Catalog'], summary: 'List all products (paginated)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Products' } } },
      post: { tags: ['Admin: Catalog'], summary: 'Create product', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductInput' } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/products/{id}': {
      get: { tags: ['Admin: Catalog'], summary: 'Get product', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Product' } } },
      patch: { tags: ['Admin: Catalog'], summary: 'Update product', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Updated' } } },
    },
    '/admin/products/{id}/variants': {
      get: { tags: ['Admin: Catalog'], summary: 'List variants', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Variants' } } },
      post: { tags: ['Admin: Catalog'], summary: 'Create variant (auto-creates inventory)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateVariantInput' } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/products/{id}/inventory': {
      get: { tags: ['Admin: Catalog'], summary: 'Get inventory', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Inventory with available count' } } },
      patch: { tags: ['Admin: Catalog'], summary: 'Update stock', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateInventoryInput' } } } }, responses: { 200: { description: 'Updated' } } },
    },

    // ── Admin: Orders ────────────────────────────────
    '/admin/orders': {
      get: {
        tags: ['Admin: Orders'], summary: 'List all orders', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] } }],
        responses: { 200: { description: 'Paginated orders' } },
      },
    },
    '/admin/orders/{id}': {
      get: { tags: ['Admin: Orders'], summary: 'Get order detail', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Full order detail' } } },
    },
    '/admin/orders/{id}/status': {
      patch: {
        tags: ['Admin: Orders'], summary: 'Update order status (FSM enforced)', security: [{ bearerAuth: [] }],
        description: 'Valid transitions: pending→confirmed/cancelled, confirmed→packed/cancelled, packed→shipped, shipped→delivered/returned',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateOrderStatusInput' } } } },
        responses: { 200: { description: 'Status updated' }, 400: { description: 'Invalid transition' } },
      },
    },
    '/admin/orders/{id}/courier': {
      post: {
        tags: ['Admin: Orders'], summary: 'Assign courier', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignCourierInput' } } } },
        responses: { 201: { description: 'Courier assigned' } },
      },
    },
    '/admin/orders/{id}/cod': {
      post: {
        tags: ['Admin: Orders'], summary: 'Record COD collection', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RecordCodInput' } } } },
        responses: { 200: { description: 'COD recorded (collected or short_paid)' } },
      },
    },

    // ── Admin: SEO ───────────────────────────────────
    '/admin/seo/sitemap': {
      get: { tags: ['Admin: SEO'], summary: 'Generate XML sitemap', responses: { 200: { description: 'XML sitemap', content: { 'application/xml': {} } } } },
    },

    // ── Admin: Settings ──────────────────────────────
    '/admin/settings': {
      get: { tags: ['Admin: Settings'], summary: 'List all settings', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Settings' } } },
      put: {
        tags: ['Admin: Settings'], summary: 'Upsert setting (super_admin only)', security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['key', 'value'], properties: { key: { type: 'string' }, value: {}, description: { type: 'string' } } } } } },
        responses: { 200: { description: 'Setting saved' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', description: 'Neon Auth JWT — passed as x-auth-user-id header after verification' },
    },
    schemas: {
      RegisterInput: {
        type: 'object', required: ['name', 'email'],
        properties: { name: { type: 'string', maxLength: 120 }, email: { type: 'string', format: 'email' }, phonePk: { type: 'string', pattern: '^03\\d{2}-?\\d{7}$', description: 'Pakistan phone: 03XX-XXXXXXX' } },
      },
      UpdateProfileInput: {
        type: 'object',
        properties: { name: { type: 'string', maxLength: 120 }, phonePk: { type: 'string', pattern: '^03\\d{2}-?\\d{7}$' } },
      },
      AddressInput: {
        type: 'object', required: ['firstName', 'lastName', 'phonePk', 'addressLine1', 'city', 'province'],
        properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, phonePk: { type: 'string' }, addressLine1: { type: 'string' }, addressLine2: { type: 'string' }, city: { type: 'string' }, province: { type: 'string', enum: ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'ICT', 'GB', 'AJK'] }, postalCode: { type: 'string' }, isDefault: { type: 'boolean' } },
      },
      CreateCategoryInput: {
        type: 'object', required: ['nameEn'],
        properties: { nameEn: { type: 'string' }, nameUr: { type: 'string' }, parentId: { type: 'string', format: 'uuid' }, imageUrl: { type: 'string', format: 'uri' }, isActive: { type: 'boolean' }, sortOrder: { type: 'integer' } },
      },
      CreateProductInput: {
        type: 'object', required: ['categoryId', 'nameEn', 'basePricePkr'],
        properties: { categoryId: { type: 'string', format: 'uuid' }, nameEn: { type: 'string' }, nameUr: { type: 'string' }, descriptionEn: { type: 'string' }, descriptionUr: { type: 'string' }, basePricePkr: { type: 'string', description: 'PKR amount e.g. "2500.00"' }, isActive: { type: 'boolean' }, isFeatured: { type: 'boolean' }, tags: { type: 'array', items: { type: 'string' } } },
      },
      CreateVariantInput: {
        type: 'object', required: ['sku'],
        properties: { sku: { type: 'string' }, color: { type: 'string' }, size: { type: 'string' }, extraPricePkr: { type: 'string' }, isActive: { type: 'boolean' } },
      },
      UpdateInventoryInput: {
        type: 'object', required: ['quantityOnHand'],
        properties: { quantityOnHand: { type: 'integer', minimum: 0 }, lowStockThreshold: { type: 'integer', minimum: 0 } },
      },
      CreateReviewInput: {
        type: 'object', required: ['orderItemId', 'rating'],
        properties: { orderItemId: { type: 'string', format: 'uuid' }, rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } },
      },
      AddCartItemInput: {
        type: 'object', required: ['variantId', 'quantity'],
        properties: { variantId: { type: 'string', format: 'uuid' }, quantity: { type: 'integer', minimum: 1 } },
      },
      UpdateCartItemInput: {
        type: 'object', required: ['quantity'],
        properties: { quantity: { type: 'integer', minimum: 1 } },
      },
      MergeCartInput: {
        type: 'object', required: ['guestSessionToken'],
        properties: { guestSessionToken: { type: 'string' }, strategy: { type: 'string', enum: ['keep_higher_qty', 'keep_user_cart', 'merge_all'], default: 'merge_all' } },
      },
      ValidateCouponInput: {
        type: 'object', required: ['code', 'cartTotal'],
        properties: { code: { type: 'string' }, cartTotal: { type: 'string', description: 'PKR amount' } },
      },
      PlaceOrderInput: {
        type: 'object', required: ['addressId'],
        properties: { addressId: { type: 'string', format: 'uuid' }, couponCode: { type: 'string' }, customerNotes: { type: 'string' }, guestPhone: { type: 'string', description: 'Required for guest checkout' }, guestEmail: { type: 'string', format: 'email' } },
      },
      UpdateOrderStatusInput: {
        type: 'object', required: ['status'],
        properties: { status: { type: 'string', enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] }, notes: { type: 'string' } },
      },
      AssignCourierInput: {
        type: 'object', required: ['courierName'],
        properties: { courierName: { type: 'string', enum: ['TCS', 'Leopards', 'BlueEx', 'Trax', 'PostEx'] }, trackingNumber: { type: 'string' }, riderName: { type: 'string' }, riderPhone: { type: 'string' }, estimatedDelivery: { type: 'string', format: 'date' } },
      },
      RecordCodInput: {
        type: 'object', required: ['amountCollectedPkr'],
        properties: { amountCollectedPkr: { type: 'string', description: 'PKR amount collected' }, remarks: { type: 'string' } },
      },
      ReturnRequestInput: {
        type: 'object', required: ['orderId', 'reason', 'items'],
        properties: { orderId: { type: 'string', format: 'uuid' }, reason: { type: 'string', enum: ['wrong_item', 'damaged', 'not_as_described', 'changed_mind'] }, description: { type: 'string' }, items: { type: 'array', items: { type: 'object', required: ['orderItemId', 'quantity', 'condition'], properties: { orderItemId: { type: 'string', format: 'uuid' }, quantity: { type: 'integer', minimum: 1 }, condition: { type: 'string', enum: ['unopened', 'opened', 'damaged'] } } } } },
      },
      PresignInput: {
        type: 'object', required: ['filename', 'contentType', 'context'],
        properties: { filename: { type: 'string' }, contentType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] }, context: { type: 'string', description: 'e.g. products/abc123' } },
      },
    },
  },
};
