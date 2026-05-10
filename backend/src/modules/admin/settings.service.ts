import prisma from '../../database/prisma';
import { UpdateSettingsInput } from './settings.validation';

// Default settings structure
const DEFAULT_SETTINGS = {
  store: {
    name: 'Habesha Mini Market',
    email: 'tsionbirhanu08@gmail.com',
    phone: '+49 123 456789',
    address: 'Berlin, Germany',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
  },
  shipping: {
    freeShippingThreshold: 50,
    defaultShippingMethod: 'DHL',
  },
  tax: {
    foodVatRate: 7,
    generalVatRate: 19,
  },
  payment: {
    enabledMethods: ['STRIPE', 'PAYPAL', 'KLARNA'],
  },
  notifications: {
    adminEmail: 'tsionbirhanu08.com',
    lowStockAlert: true,
  },
  seo: {
    defaultMetaTitle: 'Habesha Mini Market - Ethiopian Products',
    defaultMetaDescription: 'Shop authentic Ethiopian products online',
    googleAnalyticsId: '',
  },
  social: {
    whatsappNumber: '',
    telegramHandle: '',
    instagramUrl: '',
    facebookUrl: '',
  },
};

/**
 * Get all system settings
 */
export const getSettings = async () => {
  try {
    // Try to get settings from database
    const allSettings = await prisma.settings.findMany();

    if (allSettings.length === 0) {
      // Initialize with default settings if none exist
      await initializeSettings();
      return DEFAULT_SETTINGS;
    }

    // Merge database settings into object
    const settings: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const setting of allSettings) {
      settings[setting.key] = setting.value;
    }

    return settings;
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update system settings (partial update by category)
 */
export const updateSettings = async (updates: UpdateSettingsInput) => {
  try {
    const updatedSettings: Record<string, any> = {};

    // Process each category update
    for (const [category, values] of Object.entries(updates)) {
      if (values && typeof values === 'object') {
        // Upsert the setting for this category
        const setting = await prisma.settings.upsert({
          where: { key: category },
          update: { value: values },
          create: { key: category, value: values },
        });

        updatedSettings[category] = setting.value;
      }
    }

    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Initialize default settings in database
 */
export const initializeSettings = async () => {
  try {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await prisma.settings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
    throw error;
  }
};

/**
 * Get specific setting by category
 */
export const getSettingsByCategory = async (category: string) => {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: category },
    });

    return setting?.value || DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS];
  } catch (error) {
    console.error(`Error retrieving ${category} settings:`, error);
    return DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS];
  }
};

/**
 * Get store info for public API
 */
export const getPublicStoreInfo = async () => {
  try {
    const storeSettings = await getSettingsByCategory('store');
    const socialSettings = await getSettingsByCategory('social');

    return {
      store: storeSettings,
      social: socialSettings,
    };
  } catch (error) {
    console.error('Error retrieving public store info:', error);
    throw error;
  }
};
