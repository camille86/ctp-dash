Unemployment rates
================

``` r
library(tidyverse)
library(blscrapeR)
library(stringr)
```

Unemployment rates from Bureau of Labor Statistics
--------------------------------------------------

This script uses the BLS API via the `blscrapeR` package to download the unemployment BLS series for Connecticut and New Haven. This requires knowing the LAUS series codes, available in tab-delimited format at <https://download.bls.gov/pub/time.series/la/la.area>, or comma-delimited `input/laus_codes.csv`.

``` r
# area type A = state, G = large town
# unemployment rate series end in 03
codes <- read_csv("../input/laus_codes.csv") %>%
  filter(str_detect(area_code, "^\\D{2}09")) %>%
  filter(area_type_code %in% c("A", "G")) %>%
  filter(area_text == "Connecticut" | str_detect(area_text, "^New Haven"))
series <- paste0("LAU", codes$area_code, "03")
```

Including a BLS API key gives access to larger API calls and annual averages. Data comes back nested in list-columns. Annual rates are given with the period code M13.

``` r
fetch <- bls_api(series, startyear = "2003", endyear = "2017", 
                 # registrationKey = "",
                 annualaverage = T)
```

``` r
df <- fetch %>%
  tbl_df() %>%
  unnest() %>%
  select(year, period, value, seriesID) %>%
  mutate(value = value / 100) %>%
  filter(period == "M13") %>%
  mutate(name = ifelse(str_detect(seriesID, "LAUST"), "CT", "New Haven")) %>%
  mutate(indicator = "unemployment") %>%
  select(name, indicator, year, value) %>%
  arrange(year, name)
```

``` r
# write_csv(df, "../output/unemployment_rate_by_year.csv")
```
