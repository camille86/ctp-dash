Chronic absenteeism
================

Chronic absenteeism data from CTSDE via ctdata
----------------------------------------------

This data is available from the Department of Education's portal, but has to be downloaded from a form. The copy available on ctdata.org is up to date and in a single file. This script fetches that data from the CKAN API using the package `ckanr`.

``` r
library(tidyverse)
library(ckanr)
library(stringr)
```

``` r
ckanr_setup("http://data.ctdata.org")
res <- resource_show(id = "8d960146-ef3b-449d-920f-e4b7a8ea97d7", as = "table")
absent <- fetch(res$url) %>% 
  tbl_df() %>%
  filter(District == "Connecticut" | str_detect(District, "New Haven")) %>%
  filter(Grade %in% c("Kindergarten", "Grade 1", "Grade 2", "Grade 3")) %>%
  mutate(indicator = "chronic absenteeism", Value = Value / 100) %>%
  select(Grade, indicator, Year, District, Value) %>%
  setNames(c("name", "indicator", "year", "type", "value")) %>%
  mutate(type = ifelse(type == "Connecticut", "CT", "NHPS"))

write_csv(absent, "../output/chronic_absenteeism.csv")
```
