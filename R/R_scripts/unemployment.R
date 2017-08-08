## ------------------------------------------------------------------------
library(tidyverse)
library(blscrapeR)
library(stringr)

## ------------------------------------------------------------------------
# area type A = state, G = large town
# unemployment rate series end in 03
codes <- read_csv("../input/laus_codes.csv") %>%
  filter(str_detect(area_code, "^\\D{2}09")) %>%
  filter(area_type_code %in% c("A", "G")) %>%
  filter(area_text == "Connecticut" | str_detect(area_text, "^New Haven"))
series <- c("03", "05") %>% map(~paste0("LAU", codes$area_code, .)) %>% reduce(c)

## ------------------------------------------------------------------------
fetch <- bls_api(series, startyear = "2002", endyear = "2017", 
                 registrationKey = "bfb8685e11d0498199bf744dfea0f1f4",
                 annualaverage = T)

## ------------------------------------------------------------------------
df <- fetch %>%
  tbl_df() %>%
  unnest() %>%
  select(year, period, value, seriesID) %>%
  filter(period == "M13") %>%
  mutate(name = ifelse(str_detect(seriesID, "LAUST"), "CT", "New Haven"))

unemp <- df %>%
  filter(str_detect(seriesID, "03$")) %>%
  mutate(value = value / 100) %>%
  mutate(indicator = "unemployment") %>%
  select(name, indicator, year, value) %>%
  arrange(year, name)

emp <- df %>%
  filter(str_detect(seriesID, "05$")) %>%
  mutate(indicator = "employees") %>%
  select(name, indicator, year, value) %>%
  arrange(year, name)


## ------------------------------------------------------------------------
write_csv(unemp, "../output/unemployment_rate_by_year.csv")
write_csv(emp, "../output/total_employment_by_year.csv")

