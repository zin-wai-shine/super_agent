import { useTranslation } from 'react-i18next';

/**
 * useDynamicTranslation
 * 
 * Helper hook to retrieve the correctly translated field from an entity
 * (like Listing, Project, etc.) based on the active language, without
 * requiring any AI processing during rendering.
 * 
 * Usage:
 * const tDynamic = useDynamicTranslation();
 * <h1>{tDynamic(listing, 'title')}</h1>
 */
export const useDynamicTranslation = () => {
    const { i18n } = useTranslation();

    return (item, fieldBase) => {
        if (!item) return '';
        
        const currentLang = i18n.language || 'en';

        if (currentLang === 'mm' && item[`${fieldBase}_my`]) {
            return item[`${fieldBase}_my`];
        }

        if (currentLang === 'zh' && item[`${fieldBase}_zh`]) {
            return item[`${fieldBase}_zh`];
        }

        // Fallback to default English field
        return item[fieldBase] || '';
    };
};
