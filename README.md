# OpenGapps Fetcher

A script automatically fetch OpenGapps from SourceForge

## Structure

.
+-- Platform/Architecture
|   +-- Version
|   |   +-- variant: [aroma, super, stock, full, mini, micro, nano, pico, tvstock]
|   |   +-- downloads
|   |   |   +-- Variant
|   |   |   |   +-- name
|   |   |   |   +-- date
|   |   |   |   +-- size
|   |   |   |   +-- download
|   |   +-- beta: boolean
