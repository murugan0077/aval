// =============================================================================
// In-Memory Data Store — uses Maps, Sets & indexed collections for O(1) lookup
// Replace with Prisma/PostgreSQL for production: see prisma/schema.prisma
// =============================================================================

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

// --- Generic Collection ---
class Collection<T extends { id: string }> {
  protected map = new Map<string, T>();
  protected indexes = new Map<string, Map<string, T>>();

  constructor(private name: string) {}

  get all(): T[] {
    return Array.from(this.map.values());
  }

  byId(id: string): T | undefined {
    return this.map.get(id);
  }

  // Index a field for O(1) lookup — e.g., index('phone', user)
  index(field: string, value: string, item: T): void {
    if (!this.indexes.has(field)) this.indexes.set(field, new Map());
    this.indexes.get(field)!.set(value, item);
  }

  unindex(field: string, value: string): void {
    this.indexes.get(field)?.delete(value);
  }

  find(field: string, value: string): T | undefined {
    return this.indexes.get(field)?.get(value);
  }

  insert(item: T): T {
    this.map.set(item.id, item);
    return item;
  }

  update(id: string, data: DeepPartial<T>): T | undefined {
    const existing = this.map.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id } as T;
    this.map.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.map.delete(id);
  }

  filter(predicate: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (const item of this.map.values()) {
      if (predicate(item)) result.push(item);
    }
    return result;
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    for (const item of this.map.values()) {
      if (predicate(item)) return item;
    }
    return undefined;
  }

  sort(compare: (a: T, b: T) => number): T[] {
    return this.all.sort(compare);
  }

  clear(): void {
    this.map.clear();
    this.indexes.clear();
  }

  get size(): number {
    return this.map.size;
  }
}

// --- Indexed Collections for O(1) category/status/role lookups ---
class CategoryIndex {
  private map = new Map<string, Set<string>>(); // category -> Set<professionalId>

  add(category: string, professionalId: string): void {
    if (!this.map.has(category)) this.map.set(category, new Set());
    this.map.get(category)!.add(professionalId);
  }

  remove(category: string, professionalId: string): void {
    this.map.get(category)?.delete(professionalId);
  }

  get(category: string): string[] {
    return Array.from(this.map.get(category) || []);
  }

  clear(): void {
    this.map.clear();
  }
}

// --- Main In-Memory Store ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class InMemoryStore {
  // Core collections — O(1) by id
  users = new Collection<any>('users');
  professionals = new Collection<any>('professionals');
  serviceCategories = new Collection<any>('serviceCategories');
  serviceSubCategories = new Collection<any>('serviceSubCategories');
  serviceListings = new Collection<any>('serviceListings');
  bookings = new Collection<any>('bookings');
  reviews = new Collection<any>('reviews');
  payments = new Collection<any>('payments');
  payouts = new Collection<any>('payouts');
  disputes = new Collection<any>('disputes');
  availability = new Collection<any>('availability');
  bookingReminders = new Collection<any>('bookingReminders');
  waitlistEntries = new Collection<any>('waitlistEntries');
  messages = new Collection<any>('messages');

  // --- Indexes for O(1) lookup on non-PK fields ---
  // Users by phone
  private userByPhone = new Map<string, any>();
  // Professionals by userId
  private profByUserId = new Map<string, any>();
  // Bookings by bookingId
  private bookingByBookingId = new Map<string, any>();
  // Payments by bookingId
  private payByBookingId = new Map<string, any>();
  // Reviews by bookingId
  private reviewByBookingId = new Map<string, any>();
  // Category-based professional index for fast search
  private profsByCategory = new CategoryIndex();
  // Premium tier index for sorting
  private premiumTierOrder = new Map<string, number>([['FEATURED', 0], ['PRO', 1], ['NONE', 2]]);

  // --- User Methods ---
  createUser(data: any) {
    const user = { id: this.genId(), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.users.insert(user);
    this.userByPhone.set(user.phone, user);
    return user;
  }

  findUserById(id: string) { return this.users.byId(id); }

  findUserByPhone(phone: string) { return this.userByPhone.get(phone); }

  updateUser(id: string, data: any) {
    const updated = this.users.update(id, data);
    if (updated) this.userByPhone.set(updated.phone, updated);
    return updated;
  }

  // --- Professional Methods ---
  createProfessional(data: any) {
    const prof = { id: this.genId(), averageRating: 0, totalReviews: 0, completionRate: 100, premiumTier: 'NONE', isVerified: false, isProfileComplete: false, subSkills: [], portfolioUrls: [], ...data, createdAt: new Date(), updatedAt: new Date() };
    this.professionals.insert(prof);
    this.profByUserId.set(prof.userId, prof);
    if (prof.skillCategory) this.profsByCategory.add(prof.skillCategory, prof.id);
    return prof;
  }

  findProfessionalById(id: string) { return this.professionals.byId(id); }

  findProfessionalByUserId(userId: string) { return this.profByUserId.get(userId); }

  updateProfessional(id: string, data: any) {
    const old = this.professionals.byId(id);
    const updated = this.professionals.update(id, data);
    if (updated && data.skillCategory && old?.skillCategory !== data.skillCategory) {
      if (old?.skillCategory) this.profsByCategory.remove(old.skillCategory, id);
      this.profsByCategory.add(data.skillCategory, id);
    }
    if (updated) {
      const uid = data.userId || old?.userId;
      if (uid) this.profByUserId.set(uid, updated);
    }
    return updated;
  }

  searchProfessionals(opts: { category?: string; city?: string; minRating?: number; sort?: string } = {}) {
    let results = this.professionals.filter((p: any) => p.isVerified && p.isProfileComplete);
    if (opts.category) {
      const ids = this.profsByCategory.get(opts.category);
      const idSet = new Set(ids);
      results = results.filter((p: any) => idSet.has(p.id));
    }
    if (opts.city) {
      results = results.filter((p: any) => {
        const u = this.users.byId(p.userId);
        return u?.city?.toLowerCase() === opts.city!.toLowerCase();
      });
    }
    if (opts.minRating) results = results.filter((p: any) => p.averageRating >= opts.minRating!);

    // Sort: premium first, then by requested sort
    results.sort((a: any, b: any) => {
      const ta = this.premiumTierOrder.get(a.premiumTier) ?? 2;
      const tb = this.premiumTierOrder.get(b.premiumTier) ?? 2;
      if (ta !== tb) return ta - tb;
      if (opts.sort === 'price_asc') return 0; // handled after
      if (opts.sort === 'rating') return b.averageRating - a.averageRating;
      return b.averageRating - a.averageRating;
    });
    return results;
  }

  // --- Booking Methods ---
  createBooking(data: any) {
    const booking = { id: this.genId(), rescheduleCount: 0, ...data, createdAt: new Date(), updatedAt: new Date() };
    this.bookings.insert(booking);
    if (data.bookingId) this.bookingByBookingId.set(data.bookingId, booking);
    return booking;
  }

  findBookingById(id: string) { return this.bookings.byId(id); }

  findBookingByBookingId(bid: string) { return this.bookingByBookingId.get(bid); }

  updateBooking(id: string, data: any) {
    const updated = this.bookings.update(id, data);
    if (updated) {
      if (data.bookingId) this.bookingByBookingId.set(data.bookingId, updated);
      if (data.status === 'CANCELLED' && updated.bookingId) this.bookingByBookingId.set(updated.bookingId, updated);
    }
    return updated;
  }

  findBookingsByCustomer(customerId: string) {
    return this.bookings.filter((b: any) => b.customerId === customerId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findBookingsByProfessional(professionalId: string) {
    return this.bookings.filter((b: any) => b.professionalId === professionalId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Payment Methods ---
  createPayment(data: any) {
    const payment = { id: this.genId(), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.payments.insert(payment);
    if (data.bookingId) this.payByBookingId.set(data.bookingId, payment);
    return payment;
  }

  findPaymentById(id: string) { return this.payments.byId(id); }

  findPaymentByBookingId(bookingId: string) { return this.payByBookingId.get(bookingId); }

  upsertPayment(bookingId: string, create: any, update: any) {
    const existing = this.payByBookingId.get(bookingId);
    if (existing) {
      const updated = { ...existing, ...update, id: existing.id };
      this.payments.update(existing.id, update);
      this.payByBookingId.set(bookingId, updated);
      return updated;
    }
    return this.createPayment(create);
  }

  // --- Review Methods ---
  createReview(data: any) {
    const review = { id: this.genId(), ...data, createdAt: new Date() };
    this.reviews.insert(review);
    if (data.bookingId) this.reviewByBookingId.set(data.bookingId, review);
    return review;
  }

  findReviewByBookingId(bookingId: string) { return this.reviewByBookingId.get(bookingId); }

  findReviewsByProfessional(professionalId: string) {
    return this.reviews.filter((r: any) => r.professionalId === professionalId && r.isPublished && !r.isFlagged)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  aggregateReviews(professionalId: string) {
    const reviews = this.reviews.filter((r: any) => r.professionalId === professionalId && r.isPublished && !r.isFlagged);
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((s: number, r: any) => s + r.rating, 0);
    return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  }

  // --- Service Category Methods ---
  createCategory(data: any) {
    const cat = { id: this.genId(), isActive: true, ...data, createdAt: new Date() };
    this.serviceCategories.insert(cat);
    return cat;
  }

  createSubCategory(data: any) {
    const sub = { id: this.genId(), isActive: true, ...data, createdAt: new Date() };
    this.serviceSubCategories.insert(sub);
    return sub;
  }

  findCategories() {
    return this.serviceCategories.filter((c: any) => c.isActive)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  findCategoryById(id: string) { return this.serviceCategories.byId(id); }

  findSubCategoriesByCategory(categoryId: string) {
    return this.serviceSubCategories.filter((s: any) => s.categoryId === categoryId && s.isActive);
  }

  // --- Availability Methods ---
  setAvailability(professionalId: string, slots: any[]) {
    // Remove old
    const old = this.availability.filter((a: any) => a.professionalId === professionalId);
    old.forEach((a: any) => this.availability.delete(a.id));
    // Add new
    slots.forEach((slot: any) => {
      this.availability.insert({
        id: this.genId(), professionalId, dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime, endTime: slot.endTime, isAvailable: true,
      });
    });
  }

  findAvailability(professionalId: string) {
    return this.availability.filter((a: any) => a.professionalId === professionalId);
  }

  // --- Payout ---
  createPayout(data: any) {
    return this.payouts.insert({ id: this.genId(), ...data, createdAt: new Date() });
  }

  // --- Dispute ---
  createDispute(data: any) {
    return this.disputes.insert({ id: this.genId(), ...data, status: 'OPEN', createdAt: new Date(), updatedAt: new Date() });
  }

  findDisputesByUser(userId: string) {
    return this.disputes.filter((d: any) => d.raisedById === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Waitlist ---
  createWaitlistEntry(data: any) {
    return this.waitlistEntries.insert({ id: this.genId(), isNotified: false, ...data, createdAt: new Date() });
  }

  // --- Service Listing ---
  createServiceListing(data: any) {
    return this.serviceListings.insert({ id: this.genId(), isActive: true, ...data, createdAt: new Date(), updatedAt: new Date() });
  }

  updateServiceListing(id: string, data: any) {
    return this.serviceListings.update(id, { ...data, updatedAt: new Date() });
  }

  deleteServiceListing(id: string) {
    return this.serviceListings.update(id, { isActive: false, updatedAt: new Date() });
  }

  findListingsByProfessional(professionalId: string) {
    return this.serviceListings.filter((l: any) => l.professionalId === professionalId && l.isActive);
  }

  // --- Utility ---
  private idCounter = 0;
  genId(): string {
    this.idCounter++;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let suffix = '';
    for (let i = 0; i < 8; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    return `id_${this.idCounter}_${suffix}`;
  }

  // Seed demo data
  seed() {
    // Create admin
    const admin = this.createUser({ name: 'Admin', phone: '9999999999', passwordHash: '$2a$12$o2pdSPcnQ0QThF/2qQ.ar.hBptuEeI13fZcwz0G395DG7fg3LICxe', role: 'ADMIN', preferredLang: 'en' });

    // Create categories & subcategories
    const cats = [
      { name: 'Plumbing', nameHi: 'प्लंबिंग', icon: '🔧', description: 'Tap repair, pipe installation, drainage',
        subs: [{ name: 'Tap Repair', fixedPrice: 199, priceUnit: 'per tap' }, { name: 'Pipe Installation', fixedPrice: 499, priceUnit: 'per connection' }, { name: 'Drainage Cleaning', fixedPrice: 299, priceUnit: 'per visit' }, { name: 'Water Heater Installation', isCustomQuote: true }, { name: 'Bathroom Fitting', isCustomQuote: true }] },
      { name: 'Electrical', nameHi: 'इलेक्ट्रिकल', icon: '⚡', description: 'Switchboard repair, wiring, fan installation',
        subs: [{ name: 'Switchboard Repair', fixedPrice: 149, priceUnit: 'per switch' }, { name: 'Fan Installation', fixedPrice: 249, priceUnit: 'per fan' }, { name: 'Wiring', fixedPrice: 399, priceUnit: 'per point' }, { name: 'Inverter Installation', isCustomQuote: true }, { name: 'Home Automation', isCustomQuote: true }] },
      { name: 'Carpentry', nameHi: 'बढ़ईगीरी', icon: '🪚', description: 'Furniture repair, custom woodwork',
        subs: [{ name: 'Furniture Assembly', fixedPrice: 349, priceUnit: 'per item' }, { name: 'Door Repair', fixedPrice: 249, priceUnit: 'per door' }, { name: 'Cabinet Installation', isCustomQuote: true }, { name: 'Custom Furniture', isCustomQuote: true }] },
      { name: 'Tutoring', nameHi: 'ट्यूशन', icon: '📚', description: 'Home tuition for all subjects',
        subs: [{ name: 'Mathematics', fixedPrice: 499, priceUnit: 'per hour' }, { name: 'Science', fixedPrice: 499, priceUnit: 'per hour' }, { name: 'English', fixedPrice: 449, priceUnit: 'per hour' }, { name: 'Computer Science', fixedPrice: 599, priceUnit: 'per hour' }] },
      { name: 'Appliance Repair', nameHi: 'उपकरण की मरम्मत', icon: '🔧', description: 'AC, fridge, washing machine repair',
        subs: [{ name: 'AC Service', fixedPrice: 399, priceUnit: 'per visit' }, { name: 'AC Repair', fixedPrice: 299, priceUnit: 'per visit + parts' }, { name: 'Refrigerator Repair', fixedPrice: 349, priceUnit: 'per visit' }, { name: 'Washing Machine Repair', fixedPrice: 349, priceUnit: 'per visit' }, { name: 'Microwave Repair', fixedPrice: 249, priceUnit: 'per visit' }] },
      { name: 'Painting', nameHi: 'पेंटिंग', icon: '🖌️', description: 'Interior and exterior painting',
        subs: [{ name: 'Interior Painting', fixedPrice: 7999, priceUnit: 'per room' }, { name: 'Exterior Painting', isCustomQuote: true }, { name: 'Texture Painting', isCustomQuote: true }, { name: 'Waterproofing', isCustomQuote: true }] },
      { name: 'Cleaning', nameHi: 'सफाई', icon: '🧹', description: 'Home deep cleaning, office cleaning',
        subs: [{ name: 'Home Deep Cleaning', fixedPrice: 1499, priceUnit: 'per 2 BHK' }, { name: 'Sofa Cleaning', fixedPrice: 499, priceUnit: 'per seat' }, { name: 'Office Cleaning', isCustomQuote: true }, { name: 'Kitchen Deep Cleaning', fixedPrice: 999, priceUnit: 'per kitchen' }] },
      { name: 'Local Artisans', nameHi: 'स्थानीय कारीगर', icon: '🎨', description: 'Pottery, tailoring, handicrafts',
        subs: [{ name: 'Tailoring', isCustomQuote: true }, { name: 'Pottery Classes', fixedPrice: 999, priceUnit: 'per month' }, { name: 'Jewelry Making', isCustomQuote: true }, { name: 'Home Decor', isCustomQuote: true }] },
    ];

    for (const c of cats) {
      const cat = this.createCategory({ name: c.name, nameHi: c.nameHi, icon: c.icon, description: c.description });
      for (const s of c.subs) {
        this.createSubCategory({ categoryId: cat.id, ...s });
      }
    }

    // Create demo professionals with users
    const profs = [
      { name: 'Rajesh Kumar', phone: '9111111111', skillCategory: 'Plumbing', subSkills: ['Pipe repair', 'Tap installation'], yrs: 8, radius: 15, rating: 4.5, reviews: 24, premium: 'FEATURED', desc: 'Expert plumber with 8 years of experience in residential and commercial plumbing.', city: 'Mumbai' },
      { name: 'Suresh Patel', phone: '9111111112', skillCategory: 'Plumbing', subSkills: ['Drainage', 'Water heater'], yrs: 5, radius: 10, rating: 4.2, reviews: 15, premium: 'PRO', desc: 'Reliable plumbing services at affordable rates.', city: 'Mumbai' },
      { name: 'Amit Sharma', phone: '9111111113', skillCategory: 'Electrical', subSkills: ['Wiring', 'Fan installation'], yrs: 10, radius: 20, rating: 4.8, reviews: 42, premium: 'FEATURED', desc: 'Master electrician, specializing in home automation and safety inspections.', city: 'Delhi' },
      { name: 'Vikram Singh', phone: '9111111114', skillCategory: 'Electrical', subSkills: ['Inverter', 'Switchboard'], yrs: 6, radius: 12, rating: 4.0, reviews: 18, premium: 'NONE', desc: 'Certified electrician with 6 years of experience.', city: 'Delhi' },
      { name: 'Dinesh Rao', phone: '9111111115', skillCategory: 'Carpentry', subSkills: ['Furniture', 'Cabinets'], yrs: 12, radius: 25, rating: 4.6, reviews: 35, premium: 'PRO', desc: 'Master carpenter creating custom furniture and home solutions.', city: 'Bengaluru' },
      { name: 'Priya Nair', phone: '9111111116', skillCategory: 'Tutoring', subSkills: ['Mathematics', 'Science'], yrs: 7, radius: 10, rating: 4.9, reviews: 31, premium: 'FEATURED', desc: 'Experienced tutor for Class 6-12, making complex topics simple.', city: 'Bengaluru' },
      { name: 'Ravi Deshmukh', phone: '9111111117', skillCategory: 'Appliance Repair', subSkills: ['AC', 'Refrigerator'], yrs: 9, radius: 15, rating: 4.3, reviews: 27, premium: 'PRO', desc: 'AC and refrigerator repair specialist with quick turnaround.', city: 'Pune' },
      { name: 'Sunita Verma', phone: '9111111118', skillCategory: 'Cleaning', subSkills: ['Deep cleaning', 'Sofa cleaning'], yrs: 4, radius: 8, rating: 4.1, reviews: 12, premium: 'NONE', desc: 'Thorough and reliable home cleaning services.', city: 'Pune' },
      { name: 'Arun Joshi', phone: '9111111119', skillCategory: 'Painting', subSkills: ['Interior', 'Texture'], yrs: 15, radius: 20, rating: 4.7, reviews: 53, premium: 'FEATURED', desc: 'Professional painter with 15 years of experience in residential and commercial projects.', city: 'Chennai' },
      { name: 'Kavita Iyer', phone: '9111111120', skillCategory: 'Local Artisans', subSkills: ['Pottery', 'Jewelry'], yrs: 6, radius: 10, rating: 4.4, reviews: 19, premium: 'NONE', desc: 'Traditional artisan specializing in handmade pottery and custom jewelry.', city: 'Chennai' },
    ];

    for (const p of profs) {
      // Create user with a known password hash for "password123"
      const user = this.createUser({
        name: p.name, phone: p.phone,
        passwordHash: '$2a$12$o2pdSPcnQ0QThF/2qQ.ar.hBptuEeI13fZcwz0G395DG7fg3LICxe',
        role: 'PROFESSIONAL', preferredLang: 'en', city: p.city,
      });

      const prof = this.createProfessional({
        userId: user.id, skillCategory: p.skillCategory, subSkills: p.subSkills,
        yearsOfExperience: p.yrs, serviceRadiusKm: p.radius, description: p.desc,
        idProofType: 'Aadhaar', verificationStatus: 'VERIFIED', isVerified: true,
        isProfileComplete: true, averageRating: p.rating, totalReviews: p.reviews,
        availabilityNow: true, premiumTier: p.premium,
        verificationBadge: `Verified · ID Checked · ${p.yrs} yrs Experience`,
      });
      this.profByUserId.set(user.id, prof);
      this.profsByCategory.add(p.skillCategory, prof.id);

      // Create service listing
      const cat = this.findCategories().find((c: any) => c.name === p.skillCategory);
      if (cat) {
        this.createServiceListing({
          professionalId: prof.id, categoryId: cat.id,
          price: cat.subCategories?.[0]?.fixedPrice || 499, priceUnit: 'per visit',
        });
      }

      // Add availability (Mon-Fri)
      for (let d = 0; d < 5; d++) {
        this.availability.insert({
          id: this.genId(), professionalId: prof.id,
          dayOfWeek: d, startTime: '09:00', endTime: '18:00', isAvailable: true,
        });
      }
    }

    // Create demo customer
    this.createUser({ name: 'Test Customer', phone: '9000000000', passwordHash: '$2a$12$o2pdSPcnQ0QThF/2qQ.ar.hBptuEeI13fZcwz0G395DG7fg3LICxe', role: 'CUSTOMER', preferredLang: 'en', city: 'Bengaluru' });

    console.log(`  ✓ Seeded: ${this.users.size} users, ${this.professionals.size} professionals, ${this.serviceCategories.size} categories`);
  }

  // Get professional with included relations (mimics Prisma include)
  getProfessionalWithRelations(id: string) {
    const prof = this.professionals.byId(id);
    if (!prof) return null;
    const user = this.users.byId(prof.userId);
    const listings = this.findListingsByProfessional(id);
    const avail = this.findAvailability(id);
    const reviews = this.findReviewsByProfessional(id);
    const count = this.aggregateReviews(id);
    return {
      ...prof,
      user: user ? { id: user.id, name: user.name, phone: user.phone } : null,
      serviceListings: listings.map((l: any) => ({ ...l, category: this.serviceCategories.byId(l.categoryId) || null, subCategory: l.subCategoryId ? this.serviceSubCategories.byId(l.subCategoryId) : null })),
      availability: avail,
      reviews: reviews.slice(0, 10),
      _count: { reviews: count.count, bookings: this.bookings.filter((b: any) => b.professionalId === id).length },
    };
  }

  // Get booking with included relations
  getBookingWithRelations(id: string) {
    const booking = this.bookings.byId(id);
    if (!booking) return null;
    const customer = this.users.byId(booking.customerId);
    const prof = this.professionals.byId(booking.professionalId);
    const payment = this.findPaymentByBookingId(id);
    const review = this.findReviewByBookingId(id);
    const dispute = this.disputes.findOne((d: any) => d.bookingId === id);
    return {
      ...booking,
      customer: customer ? { name: customer.name, phone: customer.phone } : null,
      professional: prof ? { ...prof, user: prof ? { id: prof.userId, name: this.users.byId(prof.userId)?.name || '' } : null } : null,
      payment: payment || null,
      review: review || null,
      dispute: dispute || null,
    };
  }
}

// --- Singleton ---
export const store = new InMemoryStore();

// Seed on import
store.seed();

export default store;
