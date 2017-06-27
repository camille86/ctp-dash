## ----setup, include=FALSE------------------------------------------------
knitr::opts_chunk$set(
	echo = TRUE,
	message = FALSE,
	warning = FALSE
)

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
series <- paste0("LAU", codes$area_code, "03")

## ------------------------------------------------------------------------
fetch <- bls_api(series, startyear = "2003", endyear = "2017", 
                 # registrationKey = "",
                 annualaverage = T)

## ------------------------------------------------------------------------
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

## ------------------------------------------------------------------------
# write_csv(df, "../output/unemployment_rate_by_year.csv")

