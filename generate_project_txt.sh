#!/usr/bin/env zsh

# ============================================================
# generate_project_txt.sh – Export Source Code ke .txt
# Dijalankan di Termux (Zsh) | Header output file di atas
# ============================================================

emulate -LR zsh
setopt NULL_GLOB GLOBSTARSHORT

# ─── Warna ANSI ─────────────────────────────────────────────
C_RESET=$'\033[0m'
C_BOLD=$'\033[1m'
C_RED=$'\033[31m'
C_GREEN=$'\033[32m'
C_YELLOW=$'\033[33m'
C_BLUE=$'\033[34m'
C_CYAN=$'\033[36m'
C_WHITE=$'\033[37m'

# ─── Garis ───────────────────────────────────────────────────
SEP_THICK="============================================================"
SEP_THIN="------------------------------------------------------------"

# ─── Simbol ──────────────────────────────────────────────────
ICON_FOLDER="📁"
ICON_FILE="📄"
ICON_CLEAN="🧹"
ICON_SUCCESS="✅"
ICON_ROCKET="🚀"
ICON_STATS="📊"

# ============================================================
# KONFIGURASI
# ============================================================
OUTPUT_DIR="project_export"
MAX_LINES=1000
MAX_LINES_TOLERANCE=100

ROOT_FILES=(
    "package.json"
    "nuxt.config.ts"
    "tsconfig.json"
    "eslint.config.mjs"
    "app/app.vue"
)

BLACKLIST_FOLDERS=(
    ".git"
    ".nuxt"
    "node_modules"
    "project_export"
    "0.0.0.0"
    "public"
)

BLACKLIST_FILES=(
    "package-lock.json"
    "generate_project_txt.sh"
    ".gitignore"
)

KATEGORI=(
    "root|01_project_root|list|${(j: :)ROOT_FILES}|"
    "assets_i18n|02_project_assets_i18n|glob|app/assets/**/* i18n/**/*|"
    "components|03_project_components|glob|app/components/**/*|finance navbar skeleton"
    "components_finance|04_project_components_finance|glob|app/components/finance/**/*|"
    "components_navigation|05_project_components_navigation|glob|app/components/navbar/**/* app/components/skeleton/**/*|"
    "composables|06_project_composables|glob|app/composables/**/*|"
    "pages_main|07_project_pages_main|glob|app/pages/**/*|finance"
    "pages_finance|08_project_pages_finance|glob|app/pages/finance/**/*|"
    "plugins|09_project_plugins|glob|app/plugins/**/*|"
)

typeset -A FILE_LINES
typeset -A CAT_FILES
typeset -A CAT_TOTAL_LINES
typeset -a OUTPUT_SUMMARY

# ============================================================
# FUNGSI PEMBANTU
# ============================================================

get_files_for_category() {
    local name=$1 type=$2 include_str=$3 exclude_str=$4
    local include_patterns=(${=include_str})
    local exclude_substrings=(${=exclude_str})
    local files=()

    if [[ $type == "list" ]]; then
        for f in $include_patterns; do
            [[ -f $f ]] || continue
            local skip=0
            for blf in $BLACKLIST_FILES; do
                [[ $f == $blf ]] && skip=1 && break
            done
            if [[ $skip -eq 0 ]]; then
                for bd in $BLACKLIST_FOLDERS; do
                    if [[ $f == $bd/* || $f == $bd ]]; then
                        skip=1
                        break
                    fi
                done
            fi
            (( skip )) || files+=("$f")
        done
    else
        for pattern in $include_patterns; do
            local matches=(${~pattern}(N))
            for f in $matches; do
                [[ -f $f ]] || continue
                local skip=0
                for bd in $BLACKLIST_FOLDERS; do
                    if [[ $f == $bd/* || $f == $bd ]]; then
                        skip=1
                        break
                    fi
                done
                if [[ $skip -eq 0 ]]; then
                    for blf in $BLACKLIST_FILES; do
                        [[ $f == $blf ]] && skip=1 && break
                    done
                fi
                if [[ $skip -eq 0 && -n $exclude_substrings ]]; then
                    for ex in $exclude_substrings; do
                        if [[ $f == */${ex}/* ]]; then
                            skip=1
                            break
                        fi
                    done
                fi
                (( skip )) || files+=("$f")
            done
        done
    fi

    if (( ${#files} > 0 )); then
        print -l ${(o)files}
    fi
}

count_lines() {
    local f=$1
    if [[ -z ${FILE_LINES[$f]} ]]; then
        FILE_LINES[$f]=$(wc -l < "$f")
    fi
}

partition_files() {
    local files=("$@")
    PARTITIONS=()
    local current_part_files=()
    local current_part_lines=0

    for f in "${files[@]}"; do
        count_lines "$f"
        local fl=${FILE_LINES[$f]}
        if (( current_part_lines + fl > MAX_LINES + MAX_LINES_TOLERANCE && ${#current_part_files} > 0 )); then
            PARTITIONS+=("${(F)current_part_files}")
            current_part_files=()
            current_part_lines=0
        fi
        current_part_files+=("$f")
        current_part_lines=$(( current_part_lines + fl ))
    done
    if (( ${#current_part_files} > 0 )); then
        PARTITIONS+=("${(F)current_part_files}")
    fi
}

write_output_file() {
    local outfile=$1
    shift
    local files=("$@")
    local outpath="${OUTPUT_DIR}/${outfile}"

    exec 3>"$outpath"
    # Header nama file output di paling atas
    print -u3 "============================================================"
    print -u3 "OUTPUT FILE: ${outfile}"
    print -u3 "============================================================"
    print -u3 ""
    for f in "${files[@]}"; do
        print -u3 "============================================================"
        print -u3 "FILE: $f"
        print -u3 "============================================================"
        if [[ ! -s $f ]]; then
            print -u3 "[FILE KOSONG]"
        else
            cat "$f" >&3
        fi
        print -u3 ""
    done
    exec 3>&-
}

# ============================================================
# UI SEDERHANA & RAPI
# ============================================================

print_section_header() {
    local icon="$1" title="$2"
    echo ""
    echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"
    echo -e "${C_BOLD}${C_WHITE}  ${icon}  ${title}${C_RESET}"
    echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"
}

print_property() {
    local label="$1"
    local value="$2"
    printf "  ${C_BOLD}%-20s${C_RESET} : ${C_GREEN}%s${C_RESET}\n" "$label" "$value"
}

print_part_log() {
    local outfile=$1 category_label=$2
    shift 2
    local files=("$@")
    local total_lines=0
    local entries=()

    for f in "${files[@]}"; do
        local lns=${FILE_LINES[$f]}
        total_lines=$(( total_lines + lns ))
        entries+=("$(printf "${C_YELLOW}%6d${C_RESET}  %s" $lns "$f")")
    done

    local sisa=$(( MAX_LINES - total_lines ))

    echo ""
    echo -e "${C_BOLD}${C_BLUE}${SEP_THICK}${C_RESET}"
    echo -e "${C_BOLD}${C_WHITE}  📄 OUTPUT   : ${C_CYAN}${outfile}${C_RESET}"
    echo -e "${C_BOLD}${C_WHITE}  📂 KATEGORI : ${C_CYAN}${category_label}${C_RESET}"
    echo -e "${C_BOLD}${C_BLUE}${SEP_THIN}${C_RESET}"
    printf "  ${C_BOLD}%6s  %-s${C_RESET}\n" "BARIS" "FILE"
    echo -e "${C_BLUE}${SEP_THIN}${C_RESET}"

    for entry in "${entries[@]}"; do
        echo -e "  $entry"
    done

    echo -e "${C_BLUE}${SEP_THIN}${C_RESET}"
    printf "  ${C_BOLD}%6s  ${C_GREEN}%d baris${C_RESET}\n" "TOTAL" "$total_lines"
    printf "  ${C_BOLD}%6s  %d baris${C_RESET}\n" "TARGET" "$MAX_LINES"

    if (( sisa >= 0 )); then
        printf "  ${C_BOLD}%6s  ${C_GREEN}%d baris${C_RESET}\n" "SISA" "$sisa"
    else
        printf "  ${C_BOLD}%6s  ${C_RED}%d baris (melebihi target)${C_RESET}\n" "LEBIH" "$((-sisa))"
    fi
    echo -e "${C_BOLD}${C_BLUE}${SEP_THICK}${C_RESET}"
}

# ============================================================
# TAHAP 1: KUMPULKAN FILE & HITUNG BARIS
# ============================================================
for entry in $KATEGORI; do
    IFS='|' read -r name output_base type include_str exclude_str <<< "$entry"
    files_str=$(get_files_for_category "$name" "$type" "$include_str" "$exclude_str")
    files=()
    if [[ -n $files_str ]]; then
        files=(${(f)files_str})
    fi
    for f in "${files[@]}"; do
        count_lines "$f"
    done
    CAT_FILES[$name]=${(F)files}
    total_lines=0
    for f in "${files[@]}"; do
        total_lines=$(( total_lines + FILE_LINES[$f] ))
    done
    CAT_TOTAL_LINES[$name]=$total_lines
done

# ============================================================
# TAHAP 2: STATISTIK GLOBAL
# ============================================================
total_source_files=${#FILE_LINES}
total_source_lines=0
for lns in ${(v)FILE_LINES}; do
    total_source_lines=$(( total_source_lines + lns ))
done

total_output_files=0
for entry in $KATEGORI; do
    IFS='|' read -r name _ <<< "$entry"
    files_str=$CAT_FILES[$name]
    [[ -z $files_str ]] && continue
    files=(${(f)files_str})
    partition_files "${files[@]}"
    total_output_files=$(( total_output_files + ${#PARTITIONS} ))
done

# ============================================================
# CETAK LAPORAN AWAL
# ============================================================
print_section_header "${ICON_STATS}" "PROJECT EXPORT REPORT"
print_property "Output Folder" "${OUTPUT_DIR}"
print_property "Target/Part" "${MAX_LINES} baris"
print_property "Toleransi (+)" "${MAX_LINES_TOLERANCE} baris"
print_property "Total Source File" "${total_source_files}"
print_property "Total Source Line" "${total_source_lines}"
print_property "Prediksi Output" "${total_output_files} file"
echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"

# ============================================================
# TAHAP 3: PERSIAPKAN FOLDER OUTPUT
# ============================================================
if [[ -d $OUTPUT_DIR ]]; then
    print_section_header "${ICON_CLEAN}" "MEMBERSIHKAN OUTPUT LAMA"
    print_property "Folder Output" "${OUTPUT_DIR}"
    print_property "Status" "Ditemukan"
    count=$(find $OUTPUT_DIR -mindepth 1 | wc -l)
    echo -e "  ${C_YELLOW}Menghapus hasil export sebelumnya...${C_RESET}"
    find $OUTPUT_DIR -mindepth 1 -delete 2>/dev/null
    echo -e "  ${ICON_SUCCESS} ${C_GREEN}${count} file berhasil dihapus${C_RESET}"
    echo -e "  ${ICON_SUCCESS} ${C_GREEN}Folder berhasil dibersihkan${C_RESET}"
    echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"
    echo -e "${C_BOLD}${C_WHITE}  ${ICON_ROCKET} MEMULAI EXPORT BARU${C_RESET}"
    echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"
else
    mkdir -p $OUTPUT_DIR
    print_section_header "${ICON_FOLDER}" "MENYIAPKAN OUTPUT"
    print_property "Folder Output" "${OUTPUT_DIR}"
    print_property "Status" "Belum ditemukan"
    echo -e "  ${ICON_SUCCESS} ${C_GREEN}Membuat folder ${OUTPUT_DIR}${C_RESET}"
    echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"
    echo -e "${C_BOLD}${C_WHITE}  ${ICON_ROCKET} MEMULAI EXPORT${C_RESET}"
    echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"
fi

# ============================================================
# TAHAP 4: PROSES EXPORT
# ============================================================
for entry in $KATEGORI; do
    IFS='|' read -r name output_base type include_str exclude_str <<< "$entry"
    files_str=$CAT_FILES[$name]
    [[ -z $files_str ]] && continue
    files=(${(f)files_str})
    partition_files "${files[@]}"
    part_num=0
    for part_str in "${PARTITIONS[@]}"; do
        part_files=(${(f)part_str})
        part_num=$(( part_num + 1 ))
        if (( ${#PARTITIONS} == 1 )); then
            outfile="${output_base}.txt"
        else
            outfile="$(printf "%s_%02d.txt" "$output_base" $part_num)"
        fi
        write_output_file "$outfile" "${part_files[@]}"
        print_part_log "$outfile" "$name" "${part_files[@]}"
        part_lines=0
        for f in "${part_files[@]}"; do
            part_lines=$(( part_lines + FILE_LINES[$f] ))
        done
        OUTPUT_SUMMARY+=("${outfile}|${part_lines}|${#part_files}")
    done
done

# ============================================================
# TAHAP 5: RINGKASAN AKHIR
# ============================================================
print_section_header "${ICON_STATS}" "RINGKASAN OUTPUT"
printf "  ${C_BOLD}%-40s %6s  %4s${C_RESET}\n" "NAMA FILE" "BARIS" "FILE"
echo -e "${C_BLUE}${SEP_THIN}${C_RESET}"
for sum in "${OUTPUT_SUMMARY[@]}"; do
    IFS='|' read -r fname flines fcount <<< "$sum"
    printf "  %-40s ${C_YELLOW}%6d${C_RESET}  ${C_GREEN}%4d${C_RESET}\n" "$fname" "$flines" "$fcount"
done
echo -e "${C_BLUE}${SEP_THIN}${C_RESET}"
printf "  ${C_BOLD}%-40s ${C_YELLOW}%6d${C_RESET}  ${C_GREEN}%4d${C_RESET}\n" "TOTAL" "$total_source_lines" "$total_source_files"
echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"

echo ""
echo -e "${C_BOLD}${C_WHITE}  ${ICON_SUCCESS} SELESAI${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"
print_property "Folder Output" "${OUTPUT_DIR}"
print_property "Jumlah Output" "${#OUTPUT_SUMMARY} file"
print_property "Total Source" "${total_source_files} file"
print_property "Total Baris" "${total_source_lines} baris"
echo -e "${C_BOLD}${C_CYAN}${SEP_THICK}${C_RESET}"