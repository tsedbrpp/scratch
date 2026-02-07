export type PackageId = 'starter' | 'standard' | 'pro' | 'enterprise' | 'institution';

export interface CreditPackage {
    id: PackageId;
    price: number; // Price in dollars
    credits: number;
    name: string;
    popular?: boolean;
    savings?: string; // e.g. "Save 10%"
    description?: string;
    promo?: {
        badge: string;
        bannerText?: string;
    };
    features: string[];
}

export const CREDIT_PACKAGES: Record<PackageId, CreditPackage> = {
    starter: {
        id: 'starter',
        credits: 100,
        price: 0,
        name: "First-Time Registrant",
        popular: false,
        description: "One-time offer for new accounts.",
        promo: {
            badge: "New Users Only",
            bannerText: "Get 100 free credits when you sign up!"
        },
        features: [
            "100 Analysis Credits",
            "Document Uploads",
            "Basic Assemblage Map",
            "Access to Community Support"
        ]
    },
    standard: {
        id: 'standard',
        credits: 100,
        price: 10,
        name: "Standard Pack",
        popular: false,
        description: "Perfect for standard research projects.",
        promo: {
            badge: "Limited Time Offer",
            bannerText: "Limited time promotion. Offer may be rescinded at any time."
        },
        features: [
            "100 Analysis Credits",
            "Document Uploads",
            "Deep AI Analysis (GPT-5.1)",
            "Unlimited Projects",
            "High-Res PDF Exports"
        ]
    },
    pro: {
        id: 'pro',
        credits: 500,
        price: 45,
        name: "Pro Pack",
        popular: true,
        savings: "Save 10%",
        description: "For serious researchers.",
        promo: {
            badge: "Limited Time Offer",
            bannerText: "Limited time promotion. Offer may be rescinded at any time."
        },
        features: [
            "500 Analysis Credits",
            "Document Uploads",
            "Deep AI Analysis (GPT-5.1)",
            "Unlimited Projects",
            "High-Res PDF Exports"
        ]
    },
    enterprise: {
        id: 'enterprise',
        credits: 1000,
        price: 80,
        name: "Power User",
        popular: false,
        savings: "Save 20%",
        description: "Maximum power for teams.",
        promo: {
            badge: "Limited Time Offer",
            bannerText: "Limited time promotion. Offer may be rescinded at any time."
        },
        features: [
            "1000 Analysis Credits",
            "Document Uploads",
            "Deep AI Analysis (GPT-5.1)",
            "Unlimited Projects",
            "High-Res PDF Exports"
        ]
    },
    institution: {
        id: 'institution',
        credits: 0, // Contact for details
        price: 0,
        name: "Institution",
        popular: false,
        description: "For labs, departments, and research groups.",
        features: [
            "Volume Discounts",
            "Centralized Billing",
            "Priority Support",
            "Access to all lenses",
            "Export to PDF"
        ]
    }
};
