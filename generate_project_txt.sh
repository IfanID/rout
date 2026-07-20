#!/data/data/com.termux/files/usr/bin/zsh

set -e

EXCLUDE=(
  "./.git/*"
  "./node_modules/*"
  "./.nuxt/*"
  "./.output/*"
  "./dist/*"
)

write_file() {
    output="$1"
    title="$2"
    shift 2

    : > "$output"

    {
        echo "============================================================"
        echo "$title"
        echo "============================================================"
        echo
    } >> "$output"

    for target in "$@"; do
        find "$target" -type f 2>/dev/null | sort | while read -r file; do

            skip=0
            for pattern in "${EXCLUDE[@]}"; do
                case "$file" in
                    ${pattern%\*}*) skip=1 ;;
                esac
            done

            [ "$skip" -eq 1 ] && continue

            {
                echo "============================================================"
                echo "FILE: $file"
                echo "============================================================"

                if [ -s "$file" ]; then
                    cat "$file"
                else
                    echo "[FILE KOSONG]"
                fi

                echo
            } >> "$output"

        done
    done

    echo "✔ $output selesai."
}

write_file "01_project_root.txt" "TAHAP 1 - ROOT PROJECT" \
package.json package-lock.json nuxt.config.ts tsconfig.json \
eslint.config.mjs README.md app/app.vue

write_file "02_project_assets_i18n.txt" "TAHAP 2 - ASSETS & I18N" \
app/assets i18n

write_file "03_project_components_core.txt" "TAHAP 3 - COMPONENTS CORE" \
app/components/AppNotification.vue \
app/components/ConfirmDialog.vue \
app/components/QuickAddMenu.vue \
app/components/finance

write_file "04_project_components_navigation.txt" "TAHAP 4 - COMPONENTS NAVIGATION" \
app/components/navbar \
app/components/skeleton

write_file "05_project_composables.txt" "TAHAP 5 - COMPOSABLES" \
app/composables

write_file "06_project_pages_general.txt" "TAHAP 6 - GENERAL PAGES" \
app/pages/index.vue \
app/pages/profile \
app/pages/search \
app/pages/settings \
app/pages/running-man \
app/pages/owner

write_file "07_project_pages_finance.txt" "TAHAP 7 - FINANCE PAGES" \
app/pages/finance

write_file "08_project_plugins.txt" "TAHAP 8 - PLUGINS" \
app/plugins

echo
echo "========================================="
echo "Semua file berhasil dibuat."
echo "========================================="
