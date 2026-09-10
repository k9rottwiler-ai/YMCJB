BidSheet reference data templates
=================================

1. perdiem-col-template.csv
   Columns: name, abbr, lodging, meals, colIndex
   - lodging / meals = daily $ rates
   - colIndex = cost of living composite (100 = average)

2. wage-rates-template.csv
   Columns: category, wageYr, wageHr, stPrice, otPrice, st5ot, st10ot
   - category = profit tier (MINIMUM, LOW, MILD, MED, HIGH, EXHIGH)
   - wageYr = annual salary band
   - stPrice / otPrice / st5ot / st10ot = hourly bill rates

3. equipment-rates-template.csv
   Columns: class, name, hourlyRate

4. Or export full reference.json from Administration → Templates & import

Import via the Administration page in the webapp, or replace src/data/reference.json and rebuild.
