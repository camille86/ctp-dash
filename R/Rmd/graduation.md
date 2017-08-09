High school graduation
================

``` r
library(tidyverse)
library(stringr)
```

High school graduation rates
----------------------------

Comes from state Dept. of Education data site, downloaded & pieced together.

### Trends: NHPS vs CT by race

``` r
grad1 <- read_csv("../input/graduation_trend.csv")

grad_by_race <- grad1 %>% filter(name == "NHPS") %>% mutate(indicator = "nhps graduation by race")
grad_by_dist <- grad1 %>% filter(race == "All") %>% mutate(indicator = "total graduation by location")
grad_trend <- bind_rows(grad_by_dist, grad_by_race) %>%
  select(name, indicator, year, type = race, value = rate)

write_csv(grad_trend, "../output/graduation_rate_trends.csv")
```

### By school

``` r
grad2 <- read_csv("../input/grad_rate_by_school.csv", skip = 4, na = c("*")) %>%
  select(1, 4, 5) %>%
  na.omit() %>%
  setNames(c("name", "raw", "value")) %>%
  mutate(value = value / 100, indicator = "graduation by nhps school", year = 2016) %>%
  select(name, indicator, year, value, raw)

write_csv(grad2, "../output/graduation_rate_by_school.csv")
```
