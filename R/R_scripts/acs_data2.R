## ----setup, include=FALSE------------------------------------------------
knitr::opts_chunk$set(
	echo = TRUE,
	message = FALSE,
	warning = FALSE
)

## ------------------------------------------------------------------------
library(acsprofiles)
library(tidyverse)
library(stringr)

## ---- eval=FALSE, include=TRUE, echo=TRUE--------------------------------
## devtools::install_github("CT-Data-Haven/acsprofiles")

## ------------------------------------------------------------------------
denom <- function(tbl, cols, agg) {
  apply(X = tbl[, cols], FUN = sum, MARGIN = 2, agg.term = agg)
}

## ------------------------------------------------------------------------
year <- 2015

nhv_geo <- geo.make(state = 09, county = 09, county.subdivision = "New Haven")
ct_geo <- geo.make(state = 09)
gnh_geo <- make_regional_geo(regions$`Greater New Haven`, name = "GNH", get_town_names())
hood_geo <- nhv_neighborhoods %>% map2(names(.), ~make_neighborhood(.x, .y, blocks = T)) %>% reduce(c)
geos <- c(ct_geo, gnh_geo, nhv_geo)

## ------------------------------------------------------------------------
bg_nums <- list(
  edu = "B15002"
)
region_nums <- list(
  edu = "B15002",
  w_edu = "C15002H",
  b_edu = "C15002B",
  h_edu = "C15002I"
)


## ------------------------------------------------------------------------
fetch_bg <- bg_nums %>%
  map(function(num) {
    f <- acs.fetch(geography = hood_geo, endyear = year, table.number = num, col.names = "pretty")
    geography(f)$NAME <- names(nhv_neighborhoods)
    
    downtown_comb <- f["downtown"] + 0.5 * f["dt50_er50"] + 0.41 * f["dt41_er59"]
    east_rock_comb <- f["east_rock"] + 0.5 * f["dt50_er50"] + 0.59 * f["dt41_er59"] +
      0.51 * f["er51_fh49"] + 0.29 * f["er29_fh71"]
    fair_haven_comb <- f["fair_haven"] + 0.49 * f["er51_fh49"] + 0.71 * f["er29_fh71"]
    acs.colnames(downtown_comb) <- acs.colnames(east_rock_comb) <- acs.colnames(fair_haven_comb) <- acs.colnames(f)
    names <- list("downtown_comb", "east_rock_comb", "fair_haven_comb")
    new_geos <- list(downtown_comb, east_rock_comb, fair_haven_comb) %>%
      map2(names, ~{
        geography(.x)$NAME <- .y
        return(.x)
      })
    f <- f %>% append(new_geos) %>% reduce(rbind.acs)
    
    return(f)
  })

## ------------------------------------------------------------------------
# EDUCATIONAL ATTAINMENT: SHARE OF NEIGHBORHOOD WITH LESS THAN HIGH SCHOOL DIPLOMA
edu <- fetch_bg$edu
no_diploma <- cbind(edu[, 1], calc_acs_table(list(no_diploma = c(3:10, 20:27)), edu[, 1], edu))
acs.colnames(no_diploma) <- c("num_ages25plus", "num_no_diploma", "per_no_diploma")

## ------------------------------------------------------------------------
diploma_df <- data.frame(name = no_diploma@geography$NAME, no_diploma@estimate) %>%
  tbl_df() %>%
  mutate(year = year, indicator = "less than high school diploma") %>%
  select(name, indicator, year, per_no_diploma, num_no_diploma) %>%
  setNames(c("name", "indicator", "year", "value", "raw")) %>%
  filter(!name %in% c("downtown", "east_rock", "fair_haven") & !str_detect(name, "\\d")) %>%
  mutate(name = name %>% str_replace("_comb", "") %>% str_replace_all("_", " ") %>% str_to_title()) %>%
  mutate(value = round(value, digits = 3), raw = round(raw))
diploma_df$name[diploma_df$name == "Wooster Square"] <- "Wooster Square/Mill River"

write_csv(diploma_df, "../output/acs_no_high_school_diploma_by_neighborhood.csv")
rm(edu, no_diploma, diploma_df)

## ------------------------------------------------------------------------
fetch_reg <- region_nums %>%
  map(~acs.fetch(geography = geos, endyear = year, table.number = ., col.names = "pretty"))

## ------------------------------------------------------------------------
edu1 <- fetch_reg$edu
no_diploma <- cbind(edu1[, 1], calc_acs_table(list(no_diploma = c(3:10, 20:27)), edu1[, 1], edu1))
acs.colnames(no_diploma) <- c("num_all_25plus", "num_all_no_diploma", "per_all_no_diploma")

w_edu <- fetch_reg$w_edu
white <- cbind(w_edu[, 1], calc_acs_table(list(white_no_diploma = c(3, 8)), w_edu[, 1], w_edu))

b_edu <- fetch_reg$b_edu
black <- cbind(b_edu[, 1], calc_acs_table(list(black_no_diploma = c(3, 8)), b_edu[, 1], b_edu))

h_edu <- fetch_reg$h_edu
hispanic <- cbind(h_edu[, 1], calc_acs_table(list(hispanic_no_diploma = c(3, 8)), h_edu[, 1], h_edu))

acs.colnames(white) <- c("num_white_25plus", "num_white_no_diploma", "per_white_no_diploma")
acs.colnames(black) <- c("num_black_25plus", "num_black_no_diploma", "per_black_no_diploma")
acs.colnames(hispanic) <- c("num_hispanic_25plus", "num_hispanic_no_diploma", "per_hispanic_no_diploma")

by_race <- list(no_diploma, white, black, hispanic) %>% reduce(cbind)

## ------------------------------------------------------------------------
diploma_df <- data.frame(name = by_race@geography$NAME, by_race@estimate) %>%
  tbl_df() %>%
  select(name, 3, 4, 6, 7, 9, 10, 12, 13) %>%
  gather(key = group, value = value, -name) %>%
  separate(group, into = c("meas", "type")) %>%
  spread(key = meas, value = value) %>%
  mutate(name = str_replace(name, " town,.+", ""), per = signif(per, digits = 3)) %>%
  mutate(indicator = "adults without high school diploma", year = year) %>%
  select(name, indicator, year, type, value = per, raw = num)

diploma_df %>% 
  filter(type == "all") %>% 
  write_csv("../output/acs_no_high_school_diploma_by_location.csv")
diploma_df %>% 
  filter(name == "New Haven") %>% 
  write_csv("../output/acs_no_high_school_diploma_by_race.csv")

## ------------------------------------------------------------------------
fetch00 <- acs.fetch(geography = c(nhv_geo, ct_geo), endyear = 2000, dataset = "sf3", table.number = "P37", col.names = "pretty")
fetch10 <- acs.fetch(geography = c(nhv_geo, ct_geo), endyear = 2010, table.number = "B15002", col.names = "pretty") 
fetch15 <- acs.fetch(geography = c(nhv_geo, ct_geo), endyear = 2015, table.number = "B15002", col.names = "pretty") 

## ------------------------------------------------------------------------
edu_time <- list(fetch00, fetch10, fetch15) %>%
  map(~calc_acs_table(list(no_diploma = c(3:10, 20:27)), .[, 1], .))

edu_time_df <- edu_time %>%
  map2_df(c(2000, 2010, 2015), function(tbl, yr) {
    acs.colnames(tbl) <- c("num_adults without high school diploma", "per_adults without high school diploma")
    df <- data.frame(name = tbl@geography$NAME, tbl@estimate, year = yr) %>% tbl_df()
  }) %>%
  gather(key = measure, value = value, -name, -year) %>%
  separate(measure, into = c("measure", "indicator"), sep = "_") %>%
  spread(key = measure, value = value) %>%
  mutate(indicator = str_replace_all(indicator, fixed("."), " ")) %>%
  mutate(name = str_replace(name, " town.*", "")) %>%
  select(name, indicator, year, value = per, raw = num)

write_csv(edu_time_df, "../output/acs_no_high_school_diploma_trend.csv")

