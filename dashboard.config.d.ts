type Feature = 'admin' | 'organizations'

interface Config {
    /**
     * The brand name to be displayed in the dashboard.
     */
    brand: string;
    features: Feature[];
}
