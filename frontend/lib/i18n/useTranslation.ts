import { useLanguage } from "./language-context";
import { t } from "./translations";

export function useTranslation() {
  const { language } = useLanguage();

  return {
    t: (key: string, replacements?: Record<string, string>) => {
      let text = t(key, language, replacements);

      if (replacements) {
        Object.entries(replacements).forEach(([searchValue, replaceValue]) => {
          text = text.replace(`{{${searchValue}}}`, replaceValue);
        });
      }

      return text;
    },
  };
}
