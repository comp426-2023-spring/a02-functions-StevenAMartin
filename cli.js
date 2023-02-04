#!/usr/bin/env node
import minimist from 'minimist';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const args = minimist(process.argv.slice(2));

if (args.h) {
    console.log('Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE \n' +
                '   -h            Show this help message and exit.\n' +
                '   -n, -s        Latitude: N positive; S negative.\n' +
                '   -e, -w        Longitude: E positive; W negative.\n' +
                '   -t            Time zone: uses tz.guess() from moment-timezone by default.\n' +
                '   -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.\n' +
                '   -j            Echo pretty JSON from open-meteo API and exit.');
    process.exit(0);
}
if (args.n && args.s){
    console.log("Cannot specify LATITUDE twice");
    process.exit(1)
} 
const latitude = (args.n ? args.n : -args.s);

if (args.e && args.w){
    console.log("Cannot specify LONGITUDE twice");
    process.exit(1)
} 
const longitude = (args.e ? args.e : -args.w);

if (isNaN(latitude) || isNaN(longitude)) {
    console.log("Must specify both LATITUDE and LONGITUDE");
    process.exit(1)
}

const timezone = (args.t ? args.t : moment.tz.guess());

const parameters = 'latitude=' + latitude + 
                   '&longitude=' + longitude + 
                   '&timezone=' + timezone + 
                   '&daily=precipitation_hours';
const response = await fetch("https://api.open-meteo.com/v1/forecast?"+parameters)
const data  =  await response.json();

let days = 1;
if(args.d >= 0 && args.d <= 0 ) {
    days = args.d;
}

if (args.j) {
    console.log(data);
    process.exit(0);
}

let dayPhrase = "";
if (days == 0) {
    dayPhrase = "today.";
} else if (days > 1) {
    dayPhrase = "in " + days + " days.";
} else {
    dayPhrase = "tomorrow.";
}

if (data.daily.precipitation_hours[days] > 0) {
    console.log("You might need your galoshes " + dayPhrase);
} else {
    console.log("You probably won't need your galoshes " + dayPhrase);
}
