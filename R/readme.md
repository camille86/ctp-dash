Data prep scripts
================

These are scripts in R used to make tables from the ACS and prep indicators for use in the CTP dashboard. Requires use of the DataHaven `acsprofiles` package.

To install the package:

``` r
devtools::install_github("CT-Data-Haven/acsprofiles")
```

Note that the package requires a Census API key, [available from the Census Bureau](http://api.census.gov/data/key_signup.html).

To save your key:

``` r
acs::api.key.install(key)
```
