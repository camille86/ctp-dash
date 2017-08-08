# GCC grads by sex, residency, race over time

library(tidyverse)
library(stringr)
library(forcats)

# graduates by residency, school years 2010-11 - 2015-16
res <- read_csv("../input/gcc_by_sex.csv")

res %>%
  gather(key = year, value = value, -Gender, -Residency) %>%
  spread(key = Residency, value = value) %>%
  mutate(`Other towns` = All - `New Haven`) %>%
  select(-All) %>%
  gather(key = type, value = value, -Gender, -year) %>%
  spread(key = Gender, value = value) %>%
  rename(name = year) %>%
  mutate(value = Male + Female, 
         indicator = "gateway graduates by residency") %>%
  select(name, indicator, type, value) %>%
  write_csv("../output/gcc_grads_by_residency_trend.csv")

# graduates by race, school year 2015-16
race <- read_csv("../input/gcc_by_race.csv")

race %>%
  gather(key = name, value = raw, -race) %>%
  spread(key = race, value = raw) %>%
  rowwise() %>%
  mutate(`Other/Unknown` = sum(Asian, Multiple, Native, `Pacific Islander`, Unknown, na.rm = T)) %>%
  select(name, Black, Latino, White, `Other/Unknown`) %>%
  gather(key = type, value = raw, -name) %>%
  group_by(name) %>%
  mutate(value = raw / sum(raw)) %>%
  mutate(indicator = "gateway grads by residency and race", year = 2016) %>%
  select(name, indicator, year, type, value, raw) %>%
  write_csv("../output/gcc_grads_by_race.csv")
 