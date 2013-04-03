Stats and Graphs
================

Ideally the data generated from this can be analyzed and viewed
in a variety of ways. As you can imagine in the driving case,
it could be useful to compare driving times Friday afternoons
in summer vs winter.

The point of this document is to review options for both
data housing and data presentation.  Sites like stathat do both,
but not all sites do.


## Data housing 

### stathat.com

Currently this app uses stathat, which is not perfect for us,
since it only allows granular access to data in the last week or so.

### Librato Metrics

These guys are free for 30 days, then cost $0.02 per 10,000 measurements,
where a measurement is a timestamp and a value.

	How long do you keep my data?
	
	2 days at the native resolution, followed by
	1 week at 1 minute resolution, followed by
	1 month at 15 minute resolution, followed by
	1 year at 1 hour resolution

https://metrics.librato.com/pricing

### Google spreadsheets

Notes [src](https://support.google.com/drive/bin/answer.py?hl=en&answer=37603)

* Limit: 400,000 cells. Ex: 200,000 rows of 2 cols, or in our case, 200,000 is every 10mins for almost 4 years.
* 5GB of data for free per google drive account

Adding data:

adding a row to spreadsheet https://developers.google.com/google-apps/spreadsheets/#adding_a_list_row

## Data presentation

Data presentation means turning numbers into something visually that
allows additional or quicker insight, like charts or graphs.

For example, Think about stock prices - There are many sites that let you see
stock prices over various time periods, various graphs and charts,
and some can layer stocks with other stocks or NASDAQ indexes.

Some of the data housing sites also present data

* stathat.com
* librato.com

### Google Charts

* Overview: https://developers.google.com/chart/
* Example: https://code.google.com/apis/ajax/playground/?type=visualization
* Using Google spreadsheets as data source: https://developers.google.com/chart/interactive/docs/spreadsheets

### Highcharts

http://www.highcharts.com/

Examples

* http://www.highcharts.com/stock/demo/basic-line/gray
* http://www.highcharts.com/demo/line-basic/gray

Code example adding data is just adding js.  
http://api.highcharts.com/highstock#series

Ex: http://jsfiddle.net/ebuTs/16/ from
[api.highcharts.com](http://api.highcharts.com/highstock#Series.setData())

Free for non-profits, $180 for one website, commercial use.
http://shop.highsoft.com/highstock.html

### More 

http://www.hongkiat.com/blog/22-useful-chart-graph-diagram-generators/


