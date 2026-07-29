import { useI18n } from "../i18n";
import type { VisualTheme } from "../theme";

interface Props {
  value: VisualTheme;
  onChange: (value: VisualTheme) => void;
}

export function ThemeSwitch({ value, onChange }: Props) {
  const { t } = useI18n();
  return (
    <div className="theme-switch" aria-label={t("theme.label")}>
      <button type="button" className={value === "dark" ? "active" : ""} onClick={() => onChange("dark")}>
        {t("theme.dark")}
      </button>
      <button type="button" className={value === "light" ? "active" : ""} onClick={() => onChange("light")}>
        {t("theme.light")}
      </button>
    </div>
  );
}
