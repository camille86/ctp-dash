## ----setup, include=FALSE------------------------------------------------
knitr::opts_chunk$set(
	echo = TRUE,
	message = FALSE,
	warning = FALSE
)

## ------------------------------------------------------------------------
library(tidyverse)
library(stringr)

indicators <- c("current asthma", "dental visit")
indicator_names <- str_replace_all(indicators, " ", "_") %>% str_c(collapse = "_")

## ------------------------------------------------------------------------
df <- read_csv("../input/500_cities.csv") %>%
  filter(GeographicLevel == "Census Tract") %>%
  select(TractFIPS, Short_Question_Text, Year, Data_Value) %>%
  setNames(c("name", "indicator", "year", "value")) %>%
  mutate(indicator = str_to_lower(indicator), value = value / 100)

filtered <- df %>% filter(indicator %in% indicators)

## ------------------------------------------------------------------------
write_csv(df, "../output/500_cities_tract.csv")
write_csv(df, sprintf("../output/500_cities_tract_%s.csv", indicator_names))

