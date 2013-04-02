driving_time
============

An example of how to run background tasks in heroku using javascript and phatomjs.

Specifically this shows how to use [phantom.js](http://phantomjs.org/)
(headless browswer) to 

1. Fetch a page. For example, google directions between any two addresses
1. Extract data. For example, the driving time including traffic
1. Store that data in stathat. For example,
[view driving times between Chicago Bean and O'Hare](http://chadn.github.com/driving_time/test/ord.html)

## Setup

Before getting started, you must have

* A free stathat account ([create](https://stathat.com/sign_in/))
* A free heroku account ([sign up](http://www.heroku.com/))
* Locally installed heroku toolbelt 
* Locally installed git ([setup git and github](https://help.github.com/articles/set-up-git))
* Locally installed phantomjs ([download and install](http://phantomjs.org/download.html))


### Setup Git 

First, clone this git repository

	$ git clone git://github.com/chadn/driving_time.git

Make sure phantomjs is working.

	$ cd driving_time
	$ phantomjs bin/phantom.hello.js
	Hello, world!

Copy and Edit the config file, using your stathat info and your addresses.

	$ cp conf/commute.ord.js conf/commute.js
	$ open conf/commute.js

Commit those changes to git

	$ git add conf/commute.js
	$ git commit

### Setup Heroku

Now we'll create a heroku app, and set up cron-like tasks to accomplish our gaol.

I use `node-worker` for the heroku app name, you will need to choose your own name.

	$ heroku apps:create node-worker
	Creating node-worker... done, stack is cedar
	http://node-worker.herokuapp.com/ | git@heroku.com:node-worker.git
	Git remote heroku added
	
Test that it works, it should take a few seconds to run.

	$ git push heroku master
	...
	$ heroku run node_modules/phantomjs/bin/phantomjs bin/phantom.commute.js conf/commute.js

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

	$ node_modules/phantomjs/bin/phantomjs bin/phantom.commute.js conf/commute.js

Note that is the same thing we typed after `heroku run` previously. See how easy that is?

### Confirm Setup

Lastly, confirm everything is working.  

First we'll just use heroku to tail the log lines.  

	$ heroku logs -t -n 100

The above statement might not show much if your task has not run yet.
To check when the task runs, look for `Last Run` and `Next Run` in the
[scheduler dashboard](https://heroku-scheduler.herokuapp.com/dashboard).
Once it runs, you should see output in the logs.

Additionally you can check the logs from your browser, too.
Just add the papertrail addon.

	$ heroku addons:add papertrail
	Adding papertrail on node-worker... done, v5 (free)
	Welcome to Papertrail. Questions and ideas are welcome. Happy logging!
	Use `heroku addons:docs papertrail` to view documentation.

You can now access the logs from a browser.  Click on the papertrail addon
from your app's dashboard.  Here's the dashboard for my node-worker
https://dashboard.heroku.com/apps/node-worker/resources

## BONUS

1. Create more conf/*.js files, commit, push to heroku, and add task to scheduler.
1. Publish your code to github - 
[Sign Up](https://help.github.com/articles/set-up-git) or just 
[Create Repository](https://help.github.com/articles/create-a-repo)
1. [Create a html page in github](https://help.github.com/categories/20/articles)

## Notes

Tested on Mac OSX 10.8 and heroku cedar (Ubuntu linux 10.04)



