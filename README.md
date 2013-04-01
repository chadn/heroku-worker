driving_time
============

An example of how to run background tasks in heroku using javascript and phatomjs.

Specifically this shows how to use phantom.js (headless browswer) to 

1. Fetch a page: google directions between any two addresses
1. Extract data out: the driving time including traffic
1. Store that data in stathat so you can see how driving times fluctuate over the day.


## Setup

Before getting started, you must

1. Have a free stathat account ([create](https://stathat.com/sign_in/))
1. Have a free heroku account (create)
1. Installed heroku toolbelt locally
1. Installed git locally

### Setup GIT

First, clone this git repository

	$ git clone git://github.com/chadn/driving_time.git

Make sure phantom is working

	$ phantomjs bin/phantom.hello.js
	Hello, world!


Edit the code to use your stathat info and your commute addresses
(or any 2 addresses you want to measure traffic time between)

	$ cd xx && open bin/xxxx.js
	

Commit those changes to git

	$ git add . 
	$ git commit

### Setup Heroku

Next, create a heroku app which will put the commute times into stathat.
I use `node-worker` for the heroku app name, you need to choose your own name.

	$ heroku apps:create node-worker
	Creating node-worker... done, stack is cedar
	http://node-worker.herokuapp.com/ | git@heroku.com:node-worker.git
	Git remote heroku added
	
Test that it works, it should take a few seconds to run.

	$ git push heroku master
	...
	$ heroku run node_modules/phantomjs/bin/phantomjs bin/phantom.commute.js

Assuming you see 'success' in the output, and no lines with 'error',
everything is working so far!

Now add and configure the heroku scheduler so it can be run every 10 mins

	$ heroku addons:add scheduler:standard
	Adding scheduler:standard on node-worker... done, v4 (free)
	This add-on consumes dyno hours, which could impact your monthly bill. To learn more:
	http://devcenter.heroku.com/addons_with_dyno_hour_usage
	To manage scheduled jobs run:
	heroku addons:open scheduler
	Use `heroku addons:docs scheduler:standard` to view documentation.
	$ heroku addons:open scheduler

That last line should open your browser where you add your job.  In the browser,
click `Add Job...`, choose frequency of every 10 mins, and enter this as the Task:

	$ node_modules/phantomjs/bin/phantomjs bin/phantom.commute.js

Note the above is the same thing we typed after `heroku run` above. See how easy that is?

### Confirm Setup

Lastly, confirm everything is working.  

First we'll just use heroku to tail the log lines.
When you created the scheduler task in the
[browser](https://heroku-scheduler.herokuapp.com/dashboard),
you can see `Last Run` and `Next Run`.
Once it runs, you should see output in the logs 

	$ heroku logs -t -n 100

Additionally you can check the logs from your browser, too.
Just add the papertrail addons

	$ heroku addons:add papertrail
	Adding papertrail on node-worker... done, v5 (free)
	Welcome to Papertrail. Questions and ideas are welcome. Happy logging!
	Use `heroku addons:docs papertrail` to view documentation.

You can now access the logs from a browser.  Click on the papertrail addon
from your app's dashboard.  Here's the dashboard for my node-worker
https://dashboard.heroku.com/apps/node-worker/resources


## Other profilers

If using heroku, newrelic is also one of my favorites.  Definitely try them out for profiling and monitoring.

A list of 




