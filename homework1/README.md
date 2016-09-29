# Homework 1: Beatbox
The first homework is implementing a simple beatbox that you can play drum beats. The start-up code is provided so that you can easily work on it. 

## Step #1 
We will use drum samples that you record on your own. Since it is difficult for you to get real drum kits and record the sounds, we will take a much easier way to that: imitate them with your mouth! If you need some help to produce drum sound sets with your mouth, please check out [this link](https://www.youtube.com/watch?v=B6-45rswo0o). For sound recoding, you can use [Audacity](http://www.audacityteam.org/), [Adobe Audition](http://www.adobe.com/kr/products/audition.html) (freely available on campus) or just your smartphone. 

## Step #2
Download the start-up code and fill out the empty part. 
- Load the recorded audio samples and make sure if they are played correctly.  
- Add gain nodes for each sample in the web audio path. Control the gain parameter such that it adjusts the volume in dB scale with the range from -24 to 0 dB. 

## Step #3
Extend the start-up code by 
- Adding more (different types of) drum samples and corresponding pad buttons on the GUI
- (Optional) Decorating the GUI with text or visual components 


### Tips for coding

##### Http-server: simulating web servers on a local computer

Preloading sound samples from the server side (e.g. using XMLHttpRequest()) requires the client-server communication setting. This cannot be run by opening the html file in the local folder. Instead, we can simulate the server on local using a command-line tool called "http-server". For installation, refer to https://www.npmjs.com/package/http-server. Once you successfully install it, you can emulate the http server from your local path by typing this in command line:
```sh
$ http-server [path]
```
and this in the URL of web browser.
```sh
http://127.0.0.1:8080/ 
```
##### Javascript playgrounds 
Another option to run your code in a server is using Javascript playgrounds where you can edit and run the code in the web browser:
- http://jsbin.com/
- https://jsfiddle.net/
- http://codepen.io/
- http://liveweave.com/
