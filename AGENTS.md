# Rout – AI Agent Guide

Rout is an Android manga reader (min SDK 31, target SDK 36, JVM 17 / Kotlin) forked from **Mihon** + **TachiyomiSY**. Stack: Jetpack Compose + Material3, Voyager navigation, SQLDelight, Injekt DI. `applicationId`: `app.komikku`.

---

## Mandatory rules for AI agents

**Read this section before every change.** These rules override shortcuts (e.g. copying nearby `MR` imports or only running `compileDebugKotlin`).

### Language

| Rule | Required behavior |
|------|-------------------|
| Response | Always use **Bahasa Indonesia** when answering questions or explaining things to the user. |
| Commit Message | Always use **Bahasa Indonesia** when creating and proposing commit messages (*git commit message*). |

### Git

> **Mandatory Workflow:** AI executes tasks on a **local working branch** (`/`) and **must create a commit on that working branch** as a safety checkpoint against bugs. AI is **STRICTLY FORBIDDEN from performing `git push` on either the working branch or `main`**. When the user confirms completion/satisfaction, AI moves the changes to `main` (as *uncommitted*) and then **deletes the working branch** to keep the branch list clean. All code changes will accumulate under the **Source Control / Changes** tab on local `main`. AI provides a commit message recommendation in Indonesian. The user manually performs the commit on `main` and `push` to GitHub.

| Rule | Required behavior |
|------|-------------------|
| Branching & Coding | AI creates a **working branch** for the task (`git checkout -b /`) and writes code in it. Types: `feature`, `fix`, `hotfix`, `refactor`, `chore`, `docs`, `perf`, `test`, etc. |
| Safety Commit (Local Only) | AI **must commit on the working branch** once the feature/fix is completed to serve as a recovery point (*safety checkpoint*). **AI is forbidden from performing `git push` on the working branch.** |
| Branch Cleanup | When the user confirms the work is satisfactory (e.g., *"looks good"*, *"done"*), AI switches to `main`, uncommits/soft-resets the changes so they land under **Source Control / Changes** on `main`, and **deletes the working branch** (`git branch -D `). |
| Code Status on Main | All changes from the working branch automatically aggregate in the **Source Control / Changes** tab on the local `main` branch as *uncommitted*. |
| Commit Message | AI provides a recommended **commit message in Indonesian** that is clear and descriptive of the implemented changes. |
| AI Constraints (Full Manual User) | **AI is strictly forbidden from committing on main, auto-merging to main, or running `git push` on any branch.** AI's job stops right after deleting the working branch and providing the commit message. User manually types the commit message, clicks **Commit**, and performs **Push**. |

### Internationalization (strings & resource reuse)

Reusable strings are distributed across dedicated i18n modules depending on their scope. **Reuse Upstream Resources:** Always check if a suitable string already exists in upstream modules (`MR` in `i18n/`) before creating new ROut-specific strings, to avoid duplication and leverage existing multi-language translations.

| String scope / origin | Module | Resource class | Base folder / Locales |
|-----------------------|--------|----------------|----------------------|
| Shared Mihon / upstream behavior | `i18n/` | **`MR`** | `base/` |
| Komikku-only features & UI | `i18n-kmk/` | **`KMR`** | `base/` |
| TachiyomiSY-only features & UI | `i18n-sy/` | **`SYMR`** | `base/` |
| ROut-only features, UI, etc. | `i18n-rout/` | **`ROT`** | `base/`, `in/`, `ko/` (selalu sinkron) |

**Hard rules:**

- **Never** add ROut-specific strings to `i18n/`, `i18n-kmk/`, or `i18n-sy/`.
- **Never** add Komikku-specific strings to `i18n/` or `i18n-sy/`.
- **Never** edit non-`base` locale `strings.xml` or `plurals.xml` files in `i18n-kmk/`, `i18n/`, or `i18n-sy/` (Weblate owns translations).
- Import: `import tachiyomi.i18n.rout.ROT` for ROut strings, or `import tachiyomi.i18n.kmk.KMR` for Komikku strings.
- If a change is inside `// KMK -->` … `// KMK <--` or adds Komikku-only behavior, default to **`KMR` + `i18n-kmk`**.
- If a change is inside `// Rout -->` … `// Rout <-` or adds ROut-only behavior, default to **`ROT` + `i18n-rout`**.

**Self-check before finishing:** `git diff` must not add new `<string name="…">` or `<plurals name="…">` entries under non-`base` locales in `i18n-kmk/src/`, `i18n/src/`, or `i18n-sy/src/`.

---

## String Management & Internationalization (i18n-rout)

🔹 The dedicated module for ROut strings and internationalization is `i18n-rout/`.

🔹 Use the **`ROT` Resource Class** to access ROut string resources.

🔹 Import `ROT` using:

```kotlin
import tachiyomi.i18n.rout.ROT
```

🔹 Main resource folder:

```text
i18n-rout/src/commonMain/moko-resources/base/
```

### Supported Locales

🔹 For `i18n-rout`, **all three locales must always be kept in sync simultaneously**:

```text
base/  → English
in/    → Indonesian
ko/    → Korean
```

🔹 Whenever adding, modifying, or removing ROut strings, **these changes must be applied to all three locales**.

🔹 Do not leave new strings in only one or two locales.

🔹 Ensure each resource has a corresponding entry in:

```text
i18n-rout/src/commonMain/moko-resources/base/
i18n-rout/src/commonMain/moko-resources/in/
i18n-rout/src/commonMain/moko-resources/ko/
```

### Other i18n Module Restrictions

🔹 **Do not add ROut-specific strings** to the following modules:

```text
i18n/
i18n-kmk/
i18n-sy/
```

🔹 All strings created specifically for ROut features or UI **must reside in `i18n-rout/`**.

🔹 The `i18n/`, `i18n-kmk/`, and `i18n-sy/` modules should only be used for resources originating from or belonging to those respective modules.


### Usage Rules

🔹 For ROut strings in source code, use `ROT` from `i18n-rout`:

```kotlin
import tachiyomi.i18n.rout.ROT
```

🔹 Do not hardcode ROut strings if they should be translatable.

🔹 Do not move ROut strings to other i18n modules simply because those modules have a similar structure or file.

### Core Rules

🔹 **ROut strings → `i18n-rout/` → `ROT` → `base/`, `in/`, and `ko/` always in sync.**

🔹 **Do not add ROut-specific strings to `i18n/`, `i18n-kmk/`, or `i18n-sy/`.**

### Formatting & build verification

**“Build passes” is not enough.** After Kotlin/XML edits, run **in this order** before marking work complete:

```bash
./gradlew spotlessApply    # fix formatting
./gradlew spotlessCheck    # must pass (same as CI)
./gradlew assembleDebug    # or :app:compileDebugKotlin for a faster compile-only check
```

- **Do not** skip `spotlessCheck` when verifying changes.
- If `spotlessCheck` fails, run `spotlessApply` and re-run `spotlessCheck`.
- On Cloud VM, export `ANDROID_HOME` and `JAVA_HOME` first (see [Cursor Cloud](#cursor-cloud-specific-instructions)).
- **Markdown files (`.md`):** If edits are restricted to Markdown (`.md`) documentation files (e.g., `README.md`, `AGENTS.md`), **never run Gradle build or verification commands** (`assembleDebug`, `spotlessCheck`, `spotlessApply`, etc.) as they are not related to source code.

---

## Module layout

| Module | Purpose |
|--------|---------|
| `app/` | UI (`eu.kanade.*`, `exh/`, `mihon/`), DI, workers, build variants |
| `domain/` | Use cases in `…/interactor/` (e.g. `GetManga`), models, repo interfaces |
| `data/` | SQLDelight DB, `*RepositoryImpl` (`tachiyomi.data.*`) |
| `core:common/` | Network (OkHttp), security, storage, shared utils |
| `core:archive/` | CBZ/archive reading with optional encryption |
| `core-metadata/` | Comic-info metadata parsing |
| `source-api/` / `source-local/` | Extension `Source` API + local source |
| `presentation-core/` | Shared Compose components |
| `presentation-widget/` | Home-screen Glance widget |
| `i18n/` | Mihon strings → `MR` (moko-resources) |
| `i18n-kmk/` | Komikku strings → `KMR` |
| `i18n-sy/` | TachiyomiSY strings → `SYMR` |
| `flagkit/` | Country-flag drawables |
| `telemetry/` | Firebase/Crashlytics (noop unless `-Pinclude-telemetry`) |
| `macrobenchmark/` | Macrobenchmark tests |

Dependency flow: `app` → `domain` → `source-api`; `data` implements `domain` repos.

Version catalogs: `gradle/libs.versions.toml`, `kotlinx.versions.toml`, `androidx.versions.toml`, `compose.versions.toml`, `sy.versions.toml`.

---

## Architecture

**DI** – `uy.kohesive.injekt` (not Hilt). Register in `AppModule.kt`, `DomainModule.kt`, `KMKDomainModule.kt`, `SYDomainModule.kt` via `addSingleton` / `addSingletonFactory`. Resolve with `Injekt.get<T>()` or `injectLazy<T>()`.

**UI & navigation** – [Voyager](https://voyager.adriel.cafe/): `Screen` in `eu.kanade.tachiyomi.ui.*`, composables in `eu.kanade.presentation.*`. Base type: `eu.kanade.presentation.util.Screen`. State via `rememberScreenModel { … }`; most models extend `StateScreenModel<State>` or bases like `SearchScreenModel`; some use plain `ScreenModel`. Prefer `screenModelScope` and `ioCoroutineScope`; use `launchIO` / `withIOContext` from `tachiyomi.core.common.util.lang`. `rememberCoroutineScope()` is fine in Compose; long-lived services may use their own `CoroutineScope`.

**Activities (not Voyager)** – `MainActivity` (shell), `ReaderActivity` + `ReaderViewModel`, `WebViewActivity`, `UnlockActivity`, OAuth login activities, `DeepLinkActivity`. Reader: `ReaderActivity.newIntent(context, mangaId, chapterId)`. Web: both `WebViewScreen` (Voyager) and `WebViewActivity.newIntent(...)`.

Example: `DeepLinkScreen` + `DeepLinkScreenModel` in `app/src/main/java/eu/kanade/tachiyomi/ui/deeplink/`.

**Domain / data** – One class per operation under `domain/…/interactor/` (verb names, not `*Interactor` suffix). Also `app/src/main/java/eu/kanade/domain/…/interactor/` for app-specific cases. Wire repos in `eu.kanade.domain.DomainModule.kt` (+ `KMKDomainModule`, `SYDomainModule`).

**Database** – SQLDelight in `data/src/main/sqldelight/tachiyomi/` (`.sq` queries, `migrations/*.sqm`). After schema changes add a new `.sqm` and often `// KMK` blocks in `.sq` / mappers. Regenerate: `./gradlew :data:generateSqlDelightInterface` (or any compile that touches `:data`).

**App preference migrations** – `app/src/main/java/mihon/core/migration/migrations/` (`mihon.core.migration.Migration`).

**Images** – Coil 3 (`coil3.*`, `context.imageLoader`). No Glide/Picasso.

---

## Komikku-specific work

- **Strings:** see [Mandatory rules – Internationalization](#mandatory-rules-for-ai-agents). Summary: Komikku → **`KMR`** / `i18n-kmk/…/base/` only.
- Do not edit locale `strings.xml` in `i18n/` or `i18n-sy/` except when syncing upstream; translations via [Weblate](https://hosted.weblate.org/engage/komikku-app/).
- Komikku code/DI: search `// KMK` (e.g. `KMKDomainModule`, `HideCategory`, library-update errors).
- Prefs: `eu.kanade.domain.*.service.*Preferences` (e.g. `SourcePreferences.relatedMangas()`).

**Examples (Komikku → `i18n-kmk`, not `i18n`):** library update error UI, sync-before-update messages, WebDAV/Discord settings, updater notifications, `mihon/feature/*` Komikku screens.

---

## Extensions & sources

- Catalog sources: installable APK extensions (not in this repo).
- In-repo: delegated sources and metadata in `exh/` (E-Hentai, NHentai, MangaDex, `exh/recs/`).
- `source-api`: `eu.kanade.tachiyomi.source.*` — avoid breaking extension ABI.

---

## Build & CI

Build types: `debug` (`.dev`), `release`, `releaseTest` (`.rt`), `foss` (`.foss`), `preview` (`.beta`, CI default), `benchmark`.

Gradle `-P` flags (`buildSrc/.../BuildConfig.kt`):

| Flag | Effect |
|------|--------|
| `include-telemetry` | Firebase Analytics + Crashlytics |
| `enable-updater` | In-app update checker |
| `disable-code-shrink` | Skip R8 minification |
| `include-dependency-info` | Dependency metadata in APK |

```bash
./gradlew spotlessApply              # format (run before spotlessCheck)
./gradlew spotlessCheck              # REQUIRED before considering work done (CI gate)
./gradlew assemblePreview            # main CI/dev APK
./gradlew assemblePreview -Pinclude-telemetry -Penable-updater  # full upstream CI build
./gradlew testReleaseUnitTest        # CI unit tests (or ./gradlew test for all modules)
./gradlew installDebug               # device install
./gradlew :data:generateSqlDelightInterface  # after .sq / .sqm changes
```

**Agent verification checklist (minimum):** `spotlessApply` → `spotlessCheck` → `assembleDebug` (or `compileDebugKotlin` only if the user asked for a quick compile check—but still run Spotless).

JDK **17**.

---

## Fork-origin markers

🔹 Preserve and maintain inline origin and modification markers when editing source code.

```kotlin
// KMK -->  … // KMK <--   Komikku
// SY -->   … // SY <--    TachiyomiSY
// EXH -->  … // EXH <--   E-Hentai / exh
// Rout --> <penjelasan perubahan ROut>
// Rout <-
```

### Origin markers

🔹 `// KMK --> … // KMK <--` identifies code originating from Komikku.
🔹 `// SY --> … // SY <--` identifies code originating from TachiyomiSY.
🔹 `// EXH --> … // EXH <--` identifies existing code originating from E-Hentai / exh.
🔹 Do not modify the existing format, names, or meaning of these upstream markers.

### ROut modification marker

🔹 `// Rout -->` identifies code that was **added or modified by ROut**.
🔹 Every `// Rout -->` marker **must contain a short explanation in Bahasa Indonesia on the same line** describing what ROut changed.
🔹 `// Rout <-` is only the closing marker and does not need an explanation.

🔹 Use this exact structure:

```kotlin
// Rout --> <penjelasan perubahan ROut dalam Bahasa Indonesia>
// ... kode yang ditambahkan atau diubah ...
// Rout <-
```

### What must be marked with `// Rout`

🔹 Mark **every change made by ROut**, not only completely new ROut features.

🔹 This includes:

* new ROut-specific code;
* modifications to existing upstream code;
* additions inside existing upstream code;
* changes to existing logic;
* replacements of existing logic;
* changes to conditions or behavior;
* ROut-specific bug fixes;
* ROut-specific UI changes;
* ROut-specific optimizations;
* ROut-specific integrations;
* any other modification introduced by ROut.

### Preserve upstream origin markers

🔹 If ROut modifies code that originally came from Komikku, TachiyomiSY, or E-Hentai / exh, **keep the original upstream marker**.

🔹 Do **not** replace `// KMK`, `// SY`, or `// EXH` with `// Rout`.

🔹 A piece of code can legitimately have both an upstream origin marker and a ROut modification marker.

🔹 The markers represent different information:

```text
KMK / SY / EXH
    ↓
Original source of the code

Rout
    ↓
Change made by ROut
```

### Example: ROut adds code to upstream code

🔹 If only part of an existing Komikku block is changed, mark only the ROut addition or modification.

```kotlin
// KMK -->
fun loadChapter() {
    loadData()

    // Rout --> Ditambahkan oleh ROut: sinkronisasi progres membaca
    syncProgress()
    // Rout <-
}
// KMK <--
```

🔹 Do **not** wrap the entire function in `// Rout` when most of the function remains unchanged upstream code.

### Example: ROut modifies existing upstream logic

```kotlin
// KMK -->

// Rout --> Dimodifikasi oleh ROut: gunakan pemilihan chapter khusus ROut
val selected = selectRoutChapter(chapter)
// Rout <-

process(selected)

// KMK <--
```

🔹 The `KMK` marker remains because the original code came from Komikku, while the `Rout` marker records the modification made by ROut.

### Example: ROut replaces an upstream implementation

🔹 If ROut completely replaces an existing upstream implementation, keep the original upstream marker and mark the replacement as a ROut modification.

```kotlin
// KMK -->

// Rout --> Menggantikan kode upstream: gunakan penanganan chapter khusus ROut
fun loadChapter() {
    routChapterHandler()
}
// Rout <-

// KMK <--
```

### Marker placement

🔹 Keep the `// Rout --> <penjelasan>` marker as close as practical to the actual ROut change.

🔹 Do not wrap large amounts of unchanged upstream code.

❌ Bad:

```kotlin
// Rout --> Dimodifikasi oleh ROut: mengubah bagian kecil
// entire unchanged upstream function
// Rout <-
```

✅ Preferred:

```kotlin
// KMK -->

existingUpstreamCode()

// Rout --> Ditambahkan oleh ROut: tambahkan validasi khusus ROut
routSpecificValidation()
// Rout <-

moreExistingUpstreamCode()

// KMK <--
```

### Marker explanation

🔹 Every `// Rout -->` marker must explain the ROut change in **Bahasa Indonesia** on the **same line**.

🔹 Prefer:

```kotlin
// Rout --> Ditambahkan oleh ROut: sinkronisasi progres saat keluar dari reader
syncProgress()
// Rout <-
```

🔹 Or:

```kotlin
// Rout --> Dimodifikasi oleh ROut: gunakan progres chapter gabungan
val progress = mergedProgress
// Rout <-
```

🔹 Do not use an unexplained opening marker:

```kotlin
// Rout -->
```

### Marker integrity

🔹 Existing markers are part of the project's source-origin and modification history.

🔹 When editing code:

* Never remove an existing `// KMK` marker unless the corresponding upstream code is intentionally removed.
* Never remove an existing `// SY` marker unless the corresponding upstream code is intentionally removed.
* Never remove an existing `// EXH` marker unless the corresponding upstream code is intentionally removed.
* Never remove an existing `// Rout` marker unless the corresponding ROut modification is intentionally removed.
* Never rename existing markers.
* Never replace an upstream marker with a ROut marker.
* Never merge unrelated origin markers.
* Never place unchanged upstream code inside a ROut marker.
* Never remove a marker merely because the surrounding code is refactored.
* If refactoring moves code, preserve the marker's meaning and keep it associated with the correct code.

### New code

🔹 New code specifically created by ROut must use:

```kotlin
// Rout --> Added by ROut: <explanation>
// ...
// Rout <-
```

🔹 Do not use `// KMK`, `// SY`, or `// EXH` for newly created ROut code unless the code genuinely originates from that project.

### Core rule

🔹 The purpose of the markers is to preserve **both source origin and ROut modification history**.

```text
KMK / SW / SY / EXH
    = where the original code came from

Rout
    = what ROut added or modified
```

🔹 Therefore, when ROut modifies upstream code, **both markers must be preserved**.

🔹 The final source should make it possible to determine:

1. where the original code came from;
2. which part was changed by ROut;
3. what ROut changed;
4. where the ROut modification begins and ends.

🔹 **Never sacrifice the original source marker just to mark a ROut modification.**

🔹 **Every `// Rout -->` must contain its explanation on the same line, while `// Rout <-` remains only the closing marker.**

Package roots: `eu.kanade.tachiyomi.*` (legacy UI), `tachiyomi.*` (domain/data), `mihon.*` (Mihon upstream), `exh.*` (enhanced sources).

---

## Tests

- Unit tests: `domain/src/test/`; app: `app/src/test/.../MigratorTest.kt`. On broad UI test suite.

---

## Conventions

- **Logging** – Prefer `xLogE()` / `xLog()` helpers from `exh.log` for Komikku code, Mihon uses `logcat { }` from `tachiyomi.core.common.util.system`. Avoid raw `android.util.Log`.
- **Formatting** – Spotless + ktlint (`buildSrc/.../mihon.code.lint.gradle.kts`). Agents **must** run `spotlessApply` and `spotlessCheck` (see [Mandatory rules](#mandatory-rules-for-ai-agents)).
- **Fork edits** – New Komikku features inside `// KMK` islands; keep `// SY` / `// EXH` blocks intact when merging upstream.

---

## Key files

- `App.kt` – Injekt bootstrap, logging setup
- `MainActivity.kt` – Voyager host
- `app/src/main/java/eu/kanade/tachiyomi/di/AppModule.kt` – core DI
- `app/src/main/java/eu/kanade/domain/DomainModule.kt` – domain interactors
- `buildSrc/.../BuildConfig.kt`, `AndroidConfig.kt` – flags, SDK versions
- `app/build.gradle.kts`, `settings.gradle.kts`

---

## Cursor Cloud specific instructions

### Environment

The VM update script installs the Android SDK (platform 36, build-tools 35.0.1, platform-tools, cmdline-tools) into `/opt/android-sdk` and writes `local.properties` with `sdk.dir`. JDK 21 is pre-installed and works fine for compiling to JVM target 17. `ANDROID_HOME`, `JAVA_HOME`, and `PATH` are set in `~/.bashrc`.

### Running key commands

All Gradle commands require the environment variables set above. Export them before invoking `./gradlew` if running in a fresh shell:

```bash
export ANDROID_HOME=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

| Task | Command |
|------|---------|
| **Required format fix** | `./gradlew spotlessApply` (run first after work edits) |
| **Required format label** | `./gradlew spotlessCheck` (must pass before task is done) |
| Debug APK build | `./gradlew assembleDebug` |
| Preview APK build (CI) | `./gradlew assemblePreview` |
| Unit tests (CI) | `./gradlew testReleaseUnitTest` |
| All module tests | `./gradlew test` |
| SQLDelight codegen | `./gradlew :data:generateSqlDelightInterface` |

### Gotchas

- First updated gradle dependencies, etc.
