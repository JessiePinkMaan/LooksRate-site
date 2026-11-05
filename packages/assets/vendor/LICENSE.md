# Vendor assets — provenance & licenses

Оба файла — **CC0 1.0** (public domain dedication), атрибуция не требуется.
Это **анонимные силуэты**, а не узнаваемые реальные люди. Используются как
плейсхолдеры для сцены «Основатели» (ТЗ §7). Реальные фото основателей — только
с их согласия.

## man-standing-pitr.svg
- Source: https://commons.wikimedia.org/wiki/File:Man_standing_silhouette.svg
- Author: pitr (Openclipart)
- License: CC0 1.0 — https://creativecommons.org/publicdomain/zero/1.0/
- Description: silhouette of a standing man, traced from the author's photo.

## man-standing-madprime.svg
- Source: https://commons.wikimedia.org/wiki/File:Silhouette_of_man_standing_and_facing_forward.svg
- Author: Madeleine Price Ball
- License: CC0 1.0 — https://creativecommons.org/publicdomain/zero/1.0/
- Description: standing man, thin, facing forward.

## Как используются

`pnpm assets:generate` извлекает `<path d="…">` из этих файлов и перекрашивает
в тёмный брендовый градиент → `apps/web/public/assets/founder-a.svg` и
`founder-b.svg`. Так provenance сохраняется, а ассеты воспроизводимы.
