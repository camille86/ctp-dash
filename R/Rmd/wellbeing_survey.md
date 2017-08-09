Wellbeing survey
================

Data from Community Wellbeing Survey
------------------------------------

``` r
library(tidyverse)
library(stringr)
```

### Neighborhood safety

``` r
safe <- read_csv("../input/feel_unsafe.csv") %>%
  gather(key = name, value = value, -x) %>%
  separate(name, into = c("name", "year")) %>%
  mutate(name = str_to_upper(name) %>% str_replace("NHV", "New Haven")) %>%
  mutate(indicator = "feel unsafe walking at night") %>%
  select(name, indicator, year, value) %>%
  mutate(value = round(value, digits = 3))
  
write_csv(safe, "../output/wellbeing_survey_trend.csv")
```
