## ----setup, message = F--------------------------------------------------
knitr::opts_chunk$set(
	echo = TRUE,
	message = FALSE,
	warning = FALSE
)

## ------------------------------------------------------------------------
library(acsprofiles)
library(tidyverse)

year <- 2015

## ------------------------------------------------------------------------
nhv_geo <- geo.make(state = 09, county = 09, county.subdivision = "New Haven")

sf1 <- c(2000, 2010) %>% map(~acs.fetch(geography = nhv_geo, endyear = ., dataset = "sf1", table.number = "P1", col.names = "pretty"))
acs15 <- acs.fetch(geography = nhv_geo, endyear = 2015, table.number = "B01003", col.names = "pretty")

acs_df <- c(sf1, acs15) %>% map_df(function(df) {
  acs.colnames(df) <- "total_pop"
  data.frame(year = df@endyear, df@estimate)
})

## ------------------------------------------------------------------------
pop80 <- read_csv("../input/NCDB/1980 NCDB CT tracts.csv") %>% 
  filter(X2 == "New Haven") %>%
  mutate(year = 1980) %>%
  select(year, TRCTPOP8) %>%
  setNames(c("year", "pop"))
pop90 <- read_csv("../input/NCDB/1990 NCDB CT tracts.csv") %>%
  filter(X2 == "New Haven") %>%
  mutate(year = 1990) %>%
  select(year, TRCTPOP9) %>%
  setNames(c("year", "pop"))
ncdb_df <- bind_rows(pop80, pop90) %>% group_by(year) %>% summarize(total_pop = sum(pop))

## ------------------------------------------------------------------------
pop_df <- bind_rows(ncdb_df, acs_df) %>%
  setNames(c("year", "value")) %>%
  mutate(name = "New Haven", indicator = "total population", year = as.character(year)) %>%
  select(name, indicator, year, value)

write_csv(pop_df, "../output/total_population.csv")

