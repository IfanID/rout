#!/usr/bin/env zsh

# ============================================================
# generate_project_txt.sh – Export Source Code ke .txt
# Dijalankan di Termux (Zsh)
# ============================================================

emulate -LR zsh
setopt NULL_GLOB GLOBSTARSHORT

# ============================================================
# KONFIGURASI
# ============================================================
OUTPUT_DIR="project_export"
MAX_LINES=1000

# Root files (hardcoded, relative)
ROOT_FILES=(
    "package.json"
    "nuxt.config.ts"
    "tsconfig.json"
    "eslint.config.mjs"
    "app/app.vue"
)

# Blacklist folders (relative, tanpa trailing slash)
BLACKLIST_FOLDERS=(
    ".git"
    ".nuxt"
    "node_modules"
    "project_export"
    "0.0.0.0"
)

# Blacklist files (relative path tepat)
BLACKLIST_FILES=(
    "package-lock.json"
    "generate_project_txt.sh"
    ".gitignore"
)

# ============================================================
# DEFINISI KATEGORI
# format: "nama|output_base|type|include|exclude_substring"
#   type = list / glob
# ============================================================
KATEGORI=(
    "root|01_project_root|list|${(j: :)ROOT_FILES}|"
    "assets_i18n|02_project_assets_i18n|glob|app/assets/**/* i18n/**/*|"
    "components|03_project_components|glob|app/components/**/*|finance navbar skeleton"
    "components_finance|04_project_components_finance|glob|app/components/finance/**/*|"
    "components_navigation|05_project_components_navigation|glob|app/components/navbar/**/* app/components/skeleton/**/*|"
    "composables|06_project_composables|glob|app/composables/**/*|"
    "pages_main|07_project_pages_main|glob|app/pages/**/*|finance"
    "pages_finance|08_project_pages_finance|glob|app/pages/finance/**/*|"
)

# ============================================================
# GLOBAL DATA
# ============================================================
typeset -A FILE_LINES            # key: file path, value: jumlah baris
typeset -A CAT_FILES             # key: nama kategori, value: string newline-separated files
typeset -A CAT_TOTAL_LINES       # total baris per kategori
typeset -a OUTPUT_SUMMARY        # ringkasan: "outfile|baris|jumlah_file"

# ============================================================
# FUNGSI PEMBANTU
# ============================================================

# Mendapatkan daftar file untuk satu kategori
# Hasil dikembalikan sebagai string newline-separated di stdout
get_files_for_category() {
    local name=$1 type=$2 include_str=$3 exclude_str=$4
    local include_patterns=(${=include_str})
    local exclude_substrings=(${=exclude_str})
    local files=()

    if [[ $type == "list" ]]; then
        # include_patterns berisi path file eksplisit
        for f in $include_patterns; do
            [[ -f $f ]] || continue
            # cek blacklist file
            local skip=0
            for blf in $BLACKLIST_FILES; do
                [[ $f == $blf ]] && skip=1 && break
            done
            # cek blacklist folder
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
        # type == glob
        for pattern in $include_patterns; do
            local matches=(${~pattern}(N))
            for f in $matches; do
                [[ -f $f ]] || continue
                local skip=0
                # blacklist folder
                for bd in $BLACKLIST_FOLDERS; do
                    if [[ $f == $bd/* || $f == $bd ]]; then
                        skip=1
                        break
                    fi
                done
                # blacklist file
                if [[ $skip -eq 0 ]]; then
                    for blf in $BLACKLIST_FILES; do
                        [[ $f == $blf ]] && skip=1 && break
                    done
                fi
                # exclude substring (subfolder spesifik)
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

    # Urutkan dan gabung dengan newline
    if (( ${#files} > 0 )); then
        print -l ${(o)files}
    fi
}

# Menghitung baris tiap file (simpan di FILE_LINES global)
count_lines() {
    local f=$1
    if [[ -z ${FILE_LINES[$f]} ]]; then
        FILE_LINES[$f]=$(wc -l < "$f")
    fi
}

# Partisi array file menjadi beberapa part berdasarkan MAX_LINES
# Simpan hasil di array global PARTITIONS (tiap elemen = string newline-separated)
partition_files() {
    local files=("$@")
    PARTITIONS=()
    local current_part_files=()
    local current_part_lines=0

    for f in "${files[@]}"; do
        count_lines "$f"
        local fl=${FILE_LINES[$f]}
        if (( current_part_lines + fl > MAX_LINES && ${#current_part_files} > 0 )); then
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

# Menulis satu file output dengan header dan isi file
write_output_file() {
    local outfile=$1
    shift
    local files=("$@")
    local outpath="${OUTPUT_DIR}/${outfile}"

    exec 3>"$outpath"
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

# Mencetak log per file output
print_part_log() {
    local outfile=$1 category_label=$2
    shift 2
    local files=("$@")
    local total_lines=0
    local entries=()

    for f in "${files[@]}"; do
        local lns=${FILE_LINES[$f]}
        total_lines=$(( total_lines + lns ))
        entries+=("$lns\t$f")
    done

    local sisa=$(( MAX_LINES - total_lines ))

    print "============================================================"
    print "${outfile}"
    print "============================================================"
    print "Kategori      : ${category_label}"
    print "Jumlah File   : ${#files}"
    print "Total Baris   : ${total_lines}"
    print "Target        : ${MAX_LINES}"
    print "Sisa          : ${sisa}"
    print "------------------------------------------------------------"
    for entry in "${entries[@]}"; do
        print "$entry"
    done
    print ""
}

# ============================================================
# TAHAP 1: KUMPULKAN SEMUA FILE, HITUNG BARIS
# ============================================================
for entry in $KATEGORI; do
    IFS='|' read -r name output_base type include_str exclude_str <<< "$entry"

    # Dapatkan daftar file
    files_str=$(get_files_for_category "$name" "$type" "$include_str" "$exclude_str")
    files=()
    if [[ -n $files_str ]]; then
        files=(${(f)files_str})
    fi

    # Hitung baris tiap file
    for f in "${files[@]}"; do
        count_lines "$f"
    done

    # Simpan data kategori
    CAT_FILES[$name]=${(F)files}
    total_lines=0
    for f in "${files[@]}"; do
        total_lines=$(( total_lines + FILE_LINES[$f] ))
    done
    CAT_TOTAL_LINES[$name]=$total_lines
done

# Partisi khusus untuk pages_finance
pages_files_str=$CAT_FILES[pages_finance]
pages_files=()
[[ -n $pages_files_str ]] && pages_files=(${(f)pages_files_str})
partition_files "${pages_files[@]}"
PAGES_FINANCE_PARTS=("${PARTITIONS[@]}")

# ============================================================
# TAHAP 2: HITUNG STATISTIK GLOBAL
# ============================================================
# Total source file (unique)
total_source_files=${#FILE_LINES}
# Total source lines
total_source_lines=0
for lns in ${(v)FILE_LINES}; do
    total_source_lines=$(( total_source_lines + lns ))
done

# Total output file
total_output_files=0
for entry in $KATEGORI; do
    IFS='|' read -r name _ <<< "$entry"
    if [[ $name == "pages_finance" ]]; then
        total_output_files=$(( total_output_files + ${#PAGES_FINANCE_PARTS} ))
    else
        total_output_files=$(( total_output_files + 1 ))
    fi
done

# ============================================================
# CETAK PROJECT EXPORT REPORT
# ============================================================
print "============================================================"
print "PROJECT EXPORT REPORT"
print "============================================================"
print "Output Folder  : ${OUTPUT_DIR}"
print "Target/Part    : ${MAX_LINES} baris"
print "Total Source File : ${total_source_files}"
print "Total Source Line : ${total_source_lines}"
print "Total Output File : ${total_output_files}"
print "============================================================"

# ============================================================
# TAHAP 3: PERSIAPKAN FOLDER OUTPUT (IDEMPOTENT)
# ============================================================
if [[ -d $OUTPUT_DIR ]]; then
    print ""
    print "============================================================"
    print "MEMBERSIHKAN OUTPUT LAMA"
    print "============================================================"
    print "Folder Output : ${OUTPUT_DIR}"
    print "Status         : Ditemukan"
    count=$(find $OUTPUT_DIR -mindepth 1 | wc -l)
    print "Menghapus hasil export sebelumnya..."
    find $OUTPUT_DIR -mindepth 1 -delete 2>/dev/null
    print "✓ ${count} file berhasil dihapus"
    print "✓ Folder berhasil dibersihkan"
    print "============================================================"
    print "MEMULAI EXPORT BARU"
    print "============================================================"
else
    mkdir -p $OUTPUT_DIR
    print ""
    print "============================================================"
    print "MENYIAPKAN OUTPUT"
    print "============================================================"
    print "Folder Output : ${OUTPUT_DIR}"
    print "Status         : Belum ditemukan"
    print "✓ Membuat folder ${OUTPUT_DIR}"
    print "============================================================"
    print "MEMULAI EXPORT"
    print "============================================================"
fi

# ============================================================
# TAHAP 4: PROSES EXPORT PER KATEGORI
# ============================================================
for entry in $KATEGORI; do
    IFS='|' read -r name output_base type include_str exclude_str <<< "$entry"
    files_str=$CAT_FILES[$name]

    if [[ $name == "pages_finance" ]]; then
        # Kategori dengan kemungkinan split
        if [[ -z $files_str ]]; then
            # Tidak ada file, lewati
            continue
        fi
        part_num=0
        for part_str in "${PAGES_FINANCE_PARTS[@]}"; do
            part_files=(${(f)part_str})
            part_num=$(( part_num + 1 ))
            if (( ${#PAGES_FINANCE_PARTS} == 1 )); then
                outfile="${output_base}.txt"
            else
                outfile="$(printf "%s_%02d.txt" "$output_base" $part_num)"
            fi
            # Tulis output
            write_output_file "$outfile" "${part_files[@]}"
            # Log
            print_part_log "$outfile" "$name" "${part_files[@]}"
            # Simpan untuk ringkasan
            part_lines=0
            for f in "${part_files[@]}"; do
                part_lines=$(( part_lines + FILE_LINES[$f] ))
            done
            OUTPUT_SUMMARY+=("${outfile}|${part_lines}|${#part_files}")
        done
    else
        # Kategori biasa, satu file output
        if [[ -z $files_str ]]; then
            continue
        fi
        files=(${(f)files_str})
        outfile="${output_base}.txt"
        write_output_file "$outfile" "${files[@]}"
        print_part_log "$outfile" "$name" "${files[@]}"
        # Ringkasan
        OUTPUT_SUMMARY+=("${outfile}|${CAT_TOTAL_LINES[$name]}|${#files}")
    fi
done

# ============================================================
# TAHAP 5: RINGKASAN AKHIR
# ============================================================
print "============================================================"
print "RINGKASAN"
print "============================================================"
for sum in "${OUTPUT_SUMMARY[@]}"; do
    IFS='|' read -r fname flines fcount <<< "$sum"
    printf "%-40s %6d baris %4d file\n" "$fname" "$flines" "$fcount"
done
print "============================================================"
print "SELESAI"
print "============================================================"
print "Folder Output     : ${OUTPUT_DIR}"
print "Jumlah Output     : ${total_output_files}"
print "Jumlah Source File: ${total_source_files}"
print "Total Baris       : ${total_source_lines}"