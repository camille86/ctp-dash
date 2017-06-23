ACS data for CTP
================

``` r
library(acsprofiles)
library(tidyverse)
library(stringr)
```

ACS data
--------

Lots of ACS data combined in one place. Uses the package `acsprofiles` developed by DataHaven.

To install:

``` r
devtools::install_github("CT-Data-Haven/acsprofiles")
```

Note that this package requires a Census API key.

Files will be split by which page they go with for faster loading times.

``` r
year <- 2015
years <- c(2010, 2015)
tracts <- nhv_tracts %>% map(unlist) %>% unlist()
names(tracts) <- NULL

nhv_geo <- geo.make(state = 09, county = 09, county.subdivision = "New Haven")
ct_geo <- geo.make(state = 09)
gnh_geo <- make_regional_geo(regions$`Greater New Haven`, name = "GNH", get_town_names())
tract_geo <- geo.make(state = 09, county = 09, tract = tracts)
hood_geo <- nhv_neighborhoods %>% map2(names(.), ~make_neighborhood(.x, .y, blocks = T)) %>% reduce(c)

# regional_geos is for comparisons of city, region, state
regional_geos <- c(ct_geo, gnh_geo, nhv_geo)

bg_nums <- list(
  mortgage = "B25091",
  rent = "B25074",
  commute = "B08301"
)
tract_nums <- list(
  income = "B19013"
)
city_nums <- list(
  prek = "B14003",
  tenure_age = "B25007",
  mortgage = "B25091",
  rent = "B25074"
)
year_nums <- list(
  prek = "B14003"
)
```

### By block group (neighborhood)

-   Method of commute
-   Cost burden by neighborhood

Aggregating by neighborhood requires splitting some block groups, weighted for the populations in each neighborhood. Split neighborhoods will be filtered out of the final data frame. This isn't nearly as ugly as it looks.

``` r
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
```

#### Analysis: neighborhood level

``` r
# HOUSING COST BURDEN --- COMES FROM MORTGAGE & RENT
# Need to get severe burden by neighborhood
mortgage <- list(fetch_bg$mortgage[, 1], calc_acs_table(list(mortgage50 = c(11, 22)), fetch_bg$mortgage[, 1], fetch_bg$mortgage)) %>% reduce(cbind)
acs.colnames(mortgage) <- c("num_hh", "num_severe", "dummy")

rent <- list(fetch_bg$rent[, 1], calc_acs_table(list(rent50 = c(9, 18, 27, 36, 45, 54, 63)), fetch_bg$rent[, 1], fetch_bg$rent)) %>% reduce(cbind)
acs.colnames(rent) <- c("num_hh", "num_severe", "dummy")

# can't actually keep percentage column here, but using calc_acs_table made this neater
cost50 <- mortgage[, 1:2] + rent[, 1:2]
cost_df <- data.frame(name = cost50@geography$NAME, cost50@estimate, row.names = NULL, stringsAsFactors = F) %>%
  mutate(per_severe = num_severe / num_hh) %>%
  mutate(year = year, indicator = "severe cost burden") %>%
  select(name, indicator, year, per_severe, num_severe) %>%
  setNames(c("name", "indicator", "year", "value", "raw")) %>%
  filter(!name %in% c("downtown", "east_rock", "fair_haven") & !str_detect(name, "\\d")) %>%
  mutate(name = name %>% str_replace("_comb", "") %>% str_replace_all("_", " ") %>% str_to_title()) %>%
  mutate(value = round(value, digits = 3), raw = round(raw))
cost_df$name[cost_df$name == "Wooster Square"] <- "Wooster Square/Mill River"

write_csv(cost_df, "../output/acs_cost_burden_by_neighborhood.csv")
```

``` r
# MODE OF COMMUTE---FIND WORKERS WHO BIKE, WALK, USE PUBLIC TRANSIT
transit <- calc_acs_table(list(transit = c(10, 18, 19)), fetch_bg$commute[, 1], fetch_bg$commute)
acs.colnames(transit) <- c("num_transit", "per_transit")

transit_df <- data.frame(name = transit@geography$NAME, transit@estimate, row.names = NULL, stringsAsFactors = F) %>%
  mutate(year = year, indicator = "public transit or bike") %>%
  select(name, indicator, year, per_transit, num_transit) %>%
  setNames(c("name", "indicator", "year", "value", "raw")) %>%
  filter(!name %in% c("downtown", "east_rock", "fair_haven") & !str_detect(name, "\\d")) %>%
  mutate(name = name %>% str_replace("_comb", "") %>% str_replace_all("_", " ") %>% str_to_title()) %>%
  mutate(value = round(value, digits = 3), raw = round(raw))
transit_df$name[transit_df$name == "Wooster Square"] <- "Wooster Square/Mill River"

write_csv(transit_df, "../output/acs_public_transit_by_neighborhood.csv")
```

### By tract

-   Median household income

``` r
# nhv_tracts is a list included in acsprofiles package
tracts <- nhv_tracts %>% map(unlist) %>% unlist()
names(tracts) <- NULL

fetch_tract <- tract_nums %>% map(~acs.fetch(geography = tract_geo, endyear = year, table.number = ., col.names = "pretty"))
```

#### Analysis by tract

So far, none needed

``` r
income_df <- data.frame(fetch_tract$income@geography, fetch_tract$income@estimate) %>%
  tbl_df() %>%
  select(-NAME) %>%
  mutate(name = list(str_pad(state, 2, "left", "0"),
                     str_pad(county, 3, "left", "0"),
                     tract) %>% reduce(paste0)) %>%
  mutate(indicator = "median household income", year = year) %>%
  select(name, indicator, year, 4) %>%
  setNames(c("name", "indicator", "year", "value"))

write_csv(income_df, "../output/acs_median_income_by_tract.csv")
```

### By year

-   Pre-K enrollment

``` r
fetch_year <- years %>%
  map(function(yr) {
    year_nums %>% map(function(num) {
      acs.fetch(geography = regional_geos, endyear = yr, table.number = num, col.names = "pretty")
    })
  })
```

#### Analysis

``` r
# PRE-K ENROLLMENT 
# map over years
prek_trend_df <- fetch_year %>%
  map2_df(years, function(fetch, yr) {
    pop_age3_4 <- apply(X = fetch$prek[, c(4, 13, 22, 32, 41, 50)], FUN = sum, MARGIN = 2, agg.term = "age3_4")
    prek <- calc_acs_table(list(prek = c(4, 13, 32, 41)), pop_age3_4, fetch$prek)
    acs.colnames(prek) <- c("num_prek", "per_prek")
    df <- data.frame(name = prek@geography$NAME, year = yr, prek@estimate)
  }) %>%
  mutate(indicator = "pre-k enrollment", per_prek = round(per_prek, digits = 3)) %>%
  setNames(c("name", "year", "raw", "value", "indicator")) %>%
  select(name, indicator, year, value, raw) %>%
  mutate(name = str_replace(name, " town,.+", "") %>% str_replace("Connecticut", "CT"))

write_csv(prek_trend_df, "../output/acs_prek_enrollment_trend.csv")
```

### Other---use regional geographies

-   Tenure by age group
-   Cost burden by tenure
-   Pre-K enrollment by type of school

``` r
fetch_city <- city_nums %>% map(~acs.fetch(geography = regional_geos, endyear = year, table.number = ., col.names = "pretty"))
```

#### Analysis

``` r
# PRE-K ENROLLMENT BY TYPE
pop_age3_4 <- apply(fetch_city$prek[, c(4, 13, 22, 32, 41, 50)], FUN = sum, MARGIN = 2, agg.term = "age3_4")
edus <- list(
  pub = c(4, 32),
  priv = c(13, 41))
prek_type <- calc_acs_table(edus, pop_age3_4, fetch_city$prek)
acs.colnames(prek_type) <- c("raw_Public", "value_Public", "raw_Private", "value_Private")
prek_type_df <- data.frame(name = prek_type@geography$NAME, prek_type@estimate, row.names = NULL) %>%
  gather(key = type, value = val, -name) %>%
  separate(type, into = c("measure", "type")) %>%
  spread(key = measure, value = val) %>%
  mutate(name = str_replace(name, "Connecticut", "CT") %>% str_replace(" town,.+", "")) %>%
  mutate(indicator = "pre-k type", year = year) %>%
  select(name, indicator, year, type, value, raw) %>%
  mutate(value = round(value, digits = 3), raw = round(raw))
  
write_csv(prek_type_df, "../output/acs_prek_enrollment_by_type.csv")
```

``` r
# COST BURDEN BY TENURE
# comes from two tables: mortgage & rent
mortgage <- calc_acs_table(list(own50 = c(11, 22)), fetch_city$mortgage[, 1], fetch_city$mortgage)
acs.colnames(mortgage) <- c("raw_Owned", "value_Owned")

rent <- calc_acs_table(list(rent50 = c(9, 18, 27, 36, 45, 54, 63)), fetch_city$rent[, 1], fetch_city$rent)
acs.colnames(rent) <- c("raw_Rented", "value_Rented")

cost_type <- cbind(mortgage, rent)
cost_type_df <- data.frame(name = cost_type@geography$NAME, cost_type@estimate, row.names = NULL) %>%
  gather(key = type, value = val, -name) %>%
  separate(type, into = c("measure", "type")) %>%
  spread(key = measure, value = val) %>%
  mutate(name = str_replace(name, "Connecticut", "CT") %>% str_replace(" town,.+", "")) %>%
  mutate(indicator = "cost burden by tenure", year = year) %>%
  select(name, indicator, year, type, value, raw) %>%
  mutate(value = round(value, digits = 3), raw = round(raw))

write_csv(cost_type_df, "../output/acs_cost_burden_by_tenure.csv")
```

``` r
# TENURE BY AGE
ten <- fetch_city$tenure_age
young <- apply(ten[, c(3:4, 13:14)], FUN = sum, MARGIN = 2, agg.term = "num_young")
young_rate <- calc_acs_table(list(young_owners = 3:4), young, ten)

middle <- apply(ten[, c(5:8, 15:18)], FUN = sum, MARGIN = 2, agg.term = "num_middle")
middle_rate <- calc_acs_table(list(middle_owners = 5:8), middle, ten)

senior <- apply(ten[, c(9:11, 19:21)], FUN = sum, MARGIN = 2, agg.term = "num_senior")
senior_rate <- calc_acs_table(list(senior_owners = 9:11), senior, ten)

ten_age <- list(young_rate, middle_rate, senior_rate) %>% reduce(cbind)
acs.colnames(ten_age) <- c("raw__Ages_15_34", "value__Ages_15_34", "raw__Ages_35_64", "value__Ages_35_64", "raw__Ages_65plus", "value__Ages_65plus")

ten_age_df <- data.frame(name = ten_age@geography$NAME, ten_age@estimate) %>%
  gather(key = type, value = val, -name) %>%
  separate(type, into = c("measure", "type"), sep = "__") %>%
  spread(key = measure, value = val) %>%
  mutate(type = str_replace(type, "_", " ") %>% str_replace("_", "-") %>% str_replace("plus", "+")) %>%
  mutate(name = str_replace(name, "Connecticut", "CT") %>% str_replace(" town,.+", "")) %>%
  mutate(indicator = "tenure by age", year = year) %>%
  select(name, indicator, year, type, value, raw) %>%
  mutate(value = round(value, digits = 3), raw = round(raw))

write_csv(ten_age_df, "../output/acs_tenure_by_age.csv")
```
