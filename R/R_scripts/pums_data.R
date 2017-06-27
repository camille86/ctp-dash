## ----setup, message=FALSE------------------------------------------------
knitr::opts_chunk$set(warning = FALSE, message = FALSE)

## ------------------------------------------------------------------------
library(tidyverse)
library(stringr)
library(survey)
library(forcats)

nhv_puma <- "905"

## ------------------------------------------------------------------------
kids_pums <- read_csv("../input/low_income_kids_by_race_pums.csv") %>%
  mutate(total = "total") %>%
  setNames(str_to_lower(names(.))) %>%
  mutate(race = as.factor(race) %>% fct_lump(2) %>% fct_recode(White = "1", Black = "2") %>% as.character()) %>%
  mutate(hispan = ifelse(hispan == "0", "non-Hispanic", "Hispanic")) %>%
  mutate(race_comb = ifelse(hispan == "Hispanic", "Hispanic", paste(race, hispan))) %>%
  mutate(age_grp1 = ifelse(age < 6, "Ages 0-5", "Ages 6+")) %>%
  mutate(age_grp2 = ifelse(age < 18, "Ages 0-17", "Ages 18+")) %>%
  mutate(age_grp3 = ifelse(age < 18, "Under 18", ifelse(age >= 65, "Ages 65+", "Ages 18-64"))) %>%
  filter(poverty > 0) %>%
  mutate(low_inc = ifelse(poverty < 200, "Low-income", "Not low-income")) %>%
  mutate(pov_rate = ifelse(poverty < 100, "Below poverty line", "At or above poverty line"))

## ------------------------------------------------------------------------
kids_design <- svydesign(ids = ~1, strata = ~puma, weights = ~perwt, data = kids_pums)
nhv_kids <- subset(kids_design, puma == nhv_puma)

## ------------------------------------------------------------------------
all_df <- svyby(~low_inc, ~total, nhv_kids, svymean) %>%
  mutate(age = "All ages", race = "All races") %>%
  select(race, age, `low_incLow-income`) %>%
  setNames(c("name", "type", "value"))

race_df <- svyby(~low_inc, ~race_comb, nhv_kids, svymean) %>%
  mutate(age = "All ages") %>%
  select(1, age, `low_incLow-income`) %>%
  setNames(c("name", "type", "value")) %>%
  filter(name != "Other non-Hispanic")

under6_df <- svyby(~low_inc, ~age_grp1, nhv_kids, svymean) %>%
  filter(age_grp1 == "Ages 0-5") %>%
  mutate(race = "All races") %>%
  select(race, 1, `low_incLow-income`) %>%
  setNames(c("name", "type", "value"))

age_race_df <- svyby(~low_inc, ~age_grp1 + ~race_comb, nhv_kids, svymean) %>%
  filter(age_grp1 == "Ages 0-5" & race_comb != "Other non-Hispanic") %>%
  select(2, 1, `low_incLow-income`) %>%
  setNames(c("name", "type", "value"))

low_inc_df <- bind_rows(all_df, race_df, under6_df, age_race_df)

low_inc_df %>%
  mutate(name = str_replace(name, " non-Hispanic", "")) %>%
  mutate(indicator = "low-income kids", year = 2015, value = signif(value, 2)) %>%
  select(name, indicator, year, type, value) %>%
  write_csv("../output/low_income_kids_by_race.csv")

rm(all_df, race_df, under6_df, age_race_df)

## ------------------------------------------------------------------------
all_df <- svyby(~pov_rate, ~total, nhv_kids, svymean) %>%
  mutate(age = "All ages", race = "All races") %>%
  select(race, age, `pov_rateBelow poverty line`) %>%
  setNames(c("name", "type", "value"))

race_df <- svyby(~pov_rate, ~race_comb, nhv_kids, svymean) %>%
  mutate(age = "All ages") %>%
  select(race_comb, age, `pov_rateBelow poverty line`) %>%
  setNames(c("name", "type", "value"))

age_df <- svyby(~pov_rate, ~age_grp3, nhv_kids, svymean) %>%
  mutate(race = "All races") %>%
  select(race, age_grp3, `pov_rateBelow poverty line`) %>%
  setNames(c("name", "type", "value"))

age_race_df <- svyby(~pov_rate, ~race_comb + ~age_grp3, nhv_kids, svymean) %>%
  select(race_comb, age_grp3, `pov_rateBelow poverty line`) %>%
  setNames(c("name", "type", "value"))

bind_rows(all_df, race_df, age_df, age_race_df) %>%
  filter(name != "Other non-Hispanic") %>%
  mutate(name = str_replace(name, " non-Hispanic", "")) %>%
  mutate(indicator = "poverty by age and race", year = 2015, value = signif(value, 2)) %>%
  select(name, indicator, year, type, value) %>%
  write_csv("../output/poverty_by_age_race.csv")

rm(all_df, race_df, age_df, age_race_df)

## ------------------------------------------------------------------------
tenure_pums <- read_csv("../input/tenure_by_race_pums.csv") %>%
  mutate(total = "total") %>%
  setNames(str_to_lower(names(.))) %>%
  mutate(ownershp = fct_recode(as.factor(ownershp), Owned = "1", Rented = "2")) %>%
  mutate(race = as.factor(race) %>% fct_lump(2) %>% fct_recode(White = "1", Black = "2") %>% as.character()) %>%
  mutate(hispan = ifelse(hispan == "0", "non-Hispanic", "Hispanic")) %>%
  mutate(race_comb = ifelse(hispan == "Hispanic", "Hispanic", paste(race, hispan))) %>%
  mutate(age_grp = case_when(age < 35 ~ "Under 35",
                             between(age, 35, 44) ~ "Ages 35-44",
                             between(age, 45, 54) ~ "Ages 45-54",
                             between(age, 55, 64) ~ "Ages 55-64",
                             age >= 65 ~ "Ages 65+")) %>%
  mutate(ratio = ifelse(ownershp == "Owned", owncost * 12 / hhincome, rentgrs * 12 / hhincome)) %>%
  mutate(ratio = ifelse(hhincome == 0, 0, ratio)) %>%
  mutate(sev_burden = ifelse(ratio >= 0.5, 1, 0))

## ------------------------------------------------------------------------
tenure_design <- svydesign(ids = ~1, strata = ~puma, weights = ~hhwt, data = tenure_pums)
nhv_tenure <- subset(tenure_design, puma == nhv_puma)

## ------------------------------------------------------------------------
all_df <- svyby(~ownershp, ~total, nhv_tenure, svymean) %>%
  mutate(race = "All races", age = "All ages") %>%
  select(race, age, ownershpOwned) %>%
  setNames(c("name", "type", "value"))

race_df <- svyby(~ownershp, ~race_comb, nhv_tenure, svymean) %>%
  mutate(age = "All ages") %>%
  select(race_comb, age, ownershpOwned) %>%
  setNames(c("name", "type", "value"))

age_race_df <- svyby(~ownershp, ~race_comb + ~age_grp, nhv_tenure, svymean) %>%
  select(race_comb, age_grp, ownershpOwned) %>%
  setNames(c("name", "type", "value")) %>%
  filter(name != "Other non-Hispanic")

tenure_df <- bind_rows(all_df, race_df, age_race_df)

tenure_df %>%
  mutate(name = str_replace(name, " non-Hispanic", "")) %>%
  mutate(indicator = "homeownership by age and race", year = 2015, value = signif(value, 2)) %>%
  select(name, indicator, year, type, value) %>%
  write_csv("../output/homeownership_by_race_age.csv")

rm(all_df, race_df, age_race_df)

## ------------------------------------------------------------------------
all_df <- svyby(~sev_burden, ~total, nhv_tenure, svymean) %>%
  mutate(race = "All races") %>%
  select(race, sev_burden) %>%
  setNames(c("name", "value"))

race_df <- svyby(~sev_burden, ~race_comb, nhv_tenure, svymean) %>%
  select(race_comb, sev_burden) %>%
  setNames(c("name", "value"))

burden_df <- bind_rows(all_df, race_df) %>%
  filter(name != "Other non-Hispanic") %>%
  mutate(name = str_replace(name, " non-Hispanic", ""), year = 2015, value = signif(value, 2)) %>%
  mutate(indicator = "severe burden by race") %>%
  select(name, indicator, year, value)

write_csv(burden_df, "../output/severe_burden_by_race.csv")

