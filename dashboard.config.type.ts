type Feature = 'admin' | 'organizations'

export interface Config {
    /**
     * The brand name to be displayed in the dashboard.
     */
    brand: string;
    /**
     * Enabled features in the dashboard.
     */
    features: Feature[];
    /**
     * Custom roles available in addition to the default 'user' and 'admin' roles.
     */
    customRoles?: string[];
}
