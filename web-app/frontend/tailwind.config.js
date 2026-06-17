export default {
    darkMode: "class",
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            "colors": {
                "background": "var(--color-background)",
                "on-background": "var(--color-on-background)",
                "surface": "var(--color-surface)",
                "on-surface": "var(--color-on-surface)",
                "surface-variant": "var(--color-surface-variant)",
                "on-surface-variant": "var(--color-on-surface-variant)",
                "surface-container-lowest": "var(--color-surface-container-lowest)",
                "surface-container-low": "var(--color-surface-container-low)",
                "surface-container": "var(--color-surface-container)",
                "surface-container-high": "var(--color-surface-container-high)",
                "surface-container-highest": "var(--color-surface-container-highest)",
                "surface-bright": "var(--color-surface-bright)",
                "surface-dim": "var(--color-surface-dim)",
                "surface-tint": "var(--color-surface-tint)",
                
                "primary": "var(--color-primary)",
                "on-primary": "var(--color-on-primary)",
                "primary-container": "var(--color-primary-container)",
                "on-primary-container": "var(--color-on-primary-container)",
                "primary-fixed": "var(--color-primary-fixed)",
                "on-primary-fixed": "var(--color-on-primary-fixed)",
                "primary-fixed-dim": "var(--color-primary-fixed-dim)",
                "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
                "inverse-primary": "var(--color-inverse-primary)",
                
                "secondary": "var(--color-secondary)",
                "on-secondary": "var(--color-on-secondary)",
                "secondary-container": "var(--color-secondary-container)",
                "on-secondary-container": "var(--color-on-secondary-container)",
                "secondary-fixed": "var(--color-secondary-fixed)",
                "on-secondary-fixed": "var(--color-on-secondary-fixed)",
                "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
                "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
                
                "tertiary": "var(--color-tertiary)",
                "on-tertiary": "var(--color-on-tertiary)",
                "tertiary-container": "var(--color-tertiary-container)",
                "on-tertiary-container": "var(--color-on-tertiary-container)",
                "tertiary-fixed": "var(--color-tertiary-fixed)",
                "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
                "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
                "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
                
                "error": "var(--color-error)",
                "on-error": "var(--color-on-error)",
                "error-container": "var(--color-error-container)",
                "on-error-container": "var(--color-on-error-container)",
                
                "outline": "var(--color-outline)",
                "outline-variant": "var(--color-outline-variant)",
                
                "inverse-surface": "var(--color-inverse-surface)",
                "inverse-on-surface": "var(--color-inverse-on-surface)"
            },
            "borderRadius": {
                "DEFAULT": "0.375rem",
                "md": "0.5rem",
                "lg": "0.75rem",
                "xl": "1rem",
                "full": "9999px"
            },
            "spacing": {
                "sidebar-width": "260px",
                "xl": "2.5rem",
                "gutter": "24px",
                "container-max": "1440px",
                "xs": "0.25rem",
                "sm": "0.5rem",
                "lg": "1.5rem",
                "md": "1rem",
                "base": "4px"
            },
            "fontFamily": {
                "headline-lg": ["Inter", "sans-serif"],
                "body-md": ["Inter", "sans-serif"],
                "label-mono": ["JetBrains Mono", "monospace"],
                "headline-lg-mobile": ["Inter", "sans-serif"],
                "body-sm": ["Inter", "sans-serif"],
                "display-lg": ["Inter", "sans-serif"],
                "body-lg": ["Inter", "sans-serif"],
                "headline-md": ["Inter", "sans-serif"]
            },
            "fontSize": {
                "headline-lg": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                "label-mono": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
                "headline-lg-mobile": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
                "display-lg": ["36px", {"lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}]
            }
        }
    }
}
