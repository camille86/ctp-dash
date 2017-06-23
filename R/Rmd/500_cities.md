500 Cities data
================

``` r
library(tidyverse)
library(stringr)

indicators <- c("current asthma", "dental visit")
indicator_names <- str_replace_all(indicators, " ", "_") %>% str_c(collapse = "_")
```

This script filters out relevant data from the 500 Cities Project file, available at <https://www.cdc.gov/500cities/> or in filtered for New Haven in `input/500_cities.csv`.

``` r
df <- read_csv("../input/500_cities.csv") %>%
  filter(GeographicLevel == "Census Tract") %>%
  select(TractFIPS, Short_Question_Text, Year, Data_Value) %>%
  setNames(c("name", "indicator", "year", "value")) %>%
  mutate(indicator = str_to_lower(indicator), value = value / 100)

filtered <- df %>% filter(indicator %in% indicators)
```

``` r
write_csv(df, "../output/500_cities_tract.csv")
write_csv(df, sprintf("../output/500_cities_tract_%s.csv", indicator_names))
```
