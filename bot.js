console.log('The followerbot of  is starting');

var Twit = require('twit');
var config = require('./config');
var T = new Twit(config);
var stream = T.stream('user');
var cursor=-1;

var forEach = require('async-foreach').forEach;
var schedule = require('node-schedule');
var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
  // Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;
var arrayFollowers=[];
var arrayUnfollowers=[];
var followBackArray=[];
var TargetList=['TakaoAsayama','RaphaelNadal','RogerFederer','DonaldTrump'];
var StateFollow=new Array();
var usernameAccount=""
var followCount=0;
var unfollowCount=0;
var followBackCount=0;

//GetValue(TargetList);
initialSettings();

/**
  *@author Aymanov
  *override console.log to write into log.txt 
  */
console.log = function () {
  logFile.write(getDateTime() + '-' + util.format.apply(null, arguments) + '\n');
  logStdout.write(getDateTime() + '-' + util.format.apply(null, arguments) + '\n');
}

stream.on('follow', followed);
var indexx=0;
/**
  *@author Aymanov
  *function to unfollow every 5 days
  */
schedule.scheduleJob('* 5,10,15,20,25,28 * *', function(){
	unfollowFromList(arrayUnfollowers);  
});
/**
  *@author Aymanov
  *function to follow an account's followers every 3 hours randomly
  */
var j = schedule.scheduleJob('5 0,3,6,9,12,15,18,21 * * *', function(){
  indexx=GetValue(TargetList);
  followTarget(StateFollow[indexx][0].toString(),parseInt(StateFollow[indexx][1]));
});

/**
  *@author Aymanov
  *function to follow an account's followers
  */
function followTarget(username,nextCursor){
console.log('follow starting: target '+ username);
  var smallarray=[];
  var quotaPerDay=[];

  T.get('followers/list', { screen_name: username, count:50 , cursor: nextCursor},  function (err, data, response) {
  if(!err){  
     console.log('success case '+Array.isArray(data)); 
 
forEach(data.users, function(item, index, arr) {
   console.log('item '+item.screen_name); 
     
  if(typeof item.screen_name !== "undefined")
            smallarray.push(item.screen_name); 
             console.log('message list'+index);  
            if(arr.length===index+1) {
              console.log('fin list'+index);
              followPerList(username,smallarray);
            }
    });

    
  }else console.log('error myfollowers'+err);
  
  arrayFollowers=arrayFollowers.concat(smallarray);       

  followPerList(username,smallarray);
 
  StateFollow[indexx][1]=data.next_cursor;
  
});
}

function getMyFollowers(username,nextCursor)
{
  console.log('follow starting: target '+ username);
  console.log(nextCursor);
  var smallarray=[];
  var quotaPerDay=[];

  T.get('followers/list', { screen_name: username, count:50 ,cursor:nextCursor},  function (err, data, response) {
  if(!err){  
        forEach(data.users, function(item, index, arr) {   
  		if(typeof item.screen_name !== "undefined")
            arrayFollowers.push(item.screen_name);             
            if(arr.length===index+1) {
              console.log('fin list'+index);
             
            }
    });
  pausecomp(Math.floor(Math.random() * 5)*60*1000 + 60*1012);    
  }   
  pausecomp(Math.floor(Math.random() * 3)*60*1000 + 60*1012);
  
  if(data.next_cursor!=="undefined")
    getMyFollowers(username,data.next_cursor);
  else 
    {
      console.log('this is final smallarray'+arrayFollowers);
      return false;
    }
});
  
}


  
function followPerList(username, arrayFollowers){
 
    var quotaPerDay = arrayFollowers.splice(0,20);
               console.log('working on following the target '+username);    
              for(item in quotaPerDay){
                pausecomp(20*1000);
                followAccount(quotaPerDay[item]);
              }
              forEach(quotaPerDay, function(item, index, arr) {
                followAccount(item);
                console.log('follow per list '+index);   
                if(arr.length===index+1) {
                  console.log('now pause '+arr.length);   
                  console.log('now pause '+index);  
                     pausecomp(60*1000);
                 }
              });

}  


function unfollowFromList(arrayFollowers){
        console.log('unfollow is going to start');
        console.log('unfollow starting');
        quotaPerDay = arrayFollowers.splice(0,10);
      for(item in quotaPerDay){         
            UnFollowList(quotaPerDay[item]);
            console.log('unfollow  '+quotaPerDay[item]);
          } 
          console.log('unfollow completed');
          console.log('follow rate is  ' +followRate());

}  

function filterTarget(username,nextCursor){
  var smallarray=[];
  var quotaPerDay=[];
  T.get('followers/list', { screen_name: username, count:50 , cursor: nextCursor},  function (err, data, response) {
    for (item in data) {
      for (subItem in data[item]) {       
      //follow that target follower 
        if(typeof data[item][subItem].screen_name !== "undefined")
            smallarray.push(data[item][subItem].screen_name);    
      }
    }       
    try {        
        while (smallarray.length > 0) {
           pausecomp(60*1000*3);
          //devide the list per range to avoid the block
           quotaPerDay = smallarray.splice(0,10);
           //console.log('hedha small array \n '+smallarray);    
          for(item in quotaPerDay){  
            pausecomp(60*1000*2);       
            UnFollowList(quotaPerDay[item]);
            
          }
         
        }   
      } catch (err) {
      // Handle the error here.
       pausecomp(Math.floor(Math.random() * 5)*60*1000 + 60*1012);
    }finally{
      pausecomp(Math.floor(Math.random() * 10)*60*1000 + 60*1012);
      filterTarget(username,data.next_cursor);
    }
  });
}

/**
  *@author Aymanov
  *function to unfollow the account if his owner didn't follow me back
  */
function UnFollowList(username){
var smallarray=[];
  T.get('friendships/show', {  target_screen_name: username },  function (err, data, response) {
    for (item in data) {
      for (subItem in data[item]) {        
      //get that target follower didn't follow me back
      if(typeof data[item][subItem].screen_name !== "undefined" 
        && data[item][subItem].following == false 
        && data[item][subItem].screen_name != usernameAccount)
        {pausecomp(5*1000);
          
          arrayUnfollowers.push(data[item][subItem].screen_name);
         try {  
          T.post('friendships/destroy', { id: data[item][subItem].id }, function(err, reply) {
            if(err) return console.log('error unfollow '+err);
            else{
                var name = data[item][subItem].screen_name
                console.log("Prune: unfollowed @"+ name);
              }
              }); 
           unfollowCount++;
        }catch(err){
          if (err.message.code === 'ETIMEDOUT')
            { console.log('waiting to unfollow ETIMEDOUT' );
              pausecomp(60*1000*5); }
          else if (err.message.code === 'ESOCKETTIMEDOUT')
              { console.log('waiting to unfollow :ESOCKETTIMEDOUT' ); 
                pausecomp(60*1000*5);   
                } 
         
          UnFollowList(username);
          }    
           
        }
      }
    }
    console.log('arrayUnfollowers '+arrayUnfollowers);   
  });
}


/**
  *@author Aymanov
  *@param idAccount
  *function to follow an account
  */
function followAccount(nameAccount, callback){
 
    try{
     T.post('friendships/create', { screen_name: nameAccount }, function(err, data, response) {
          if(err) console.log('following  error'+ err);
            else {console.log('following '+ nameAccount);
              
          }
      });
      followCount++;
     }catch(err){
          if (err.message.code === 'ETIMEDOUT')
            { console.log('waiting to follow ETIMEDOUT' );
              pausecomp(60*1000*5); }
          else if (err.message.code === 'ESOCKETTIMEDOUT')
              { console.log('waiting to follow :ESOCKETTIMEDOUT' ); 
                pausecomp(60*1000*5);  followAccount(nameAccount); } 
         
          followAccount(nameAccount)
          }
}

/**
  *@author Aymanov
  *function to un-follow all account that didn't follow my account back
  */
 function unfollowAll(){
    T.get('followers/ids', function(err, reply) {
      if(err) return callback(err);
      
      var followers = reply.ids;
      console.log('followers'+followers);
      T.get('friends/ids', function(err, reply) {
        console.log('friends'+friends);
          if(err) return callback(err);          
          var friends = reply.ids
            , pruned = false;
           
          while(!pruned) {
           
            for (item in friends) {
              if(!~followers.indexOf(item)) {
                pruned = true;
                arrayFollowers.push(item);
                T.post('friendships/destroy', { id: friends[item] }, function(err, reply) {
                if(err) return console.log(err);
   
                var name = reply.screen_name
                console.log("\nPrune: unfollowed @"+ name);
                pausecomp(Math.floor(Math.random() * 30)*60*1000 + 60*1012);
              });       
              }
            }
            
         }
         console.log(' arrayFollowers'+ arrayFollowers);
      });
  });
  //  tweetIt('it looks better now!!');
 }
  



/**
  *@author Aymanov
  *function to get system date 
  */
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

/**
  *@author Aymanov
  *function to get Followed State
  */
function followed(eventMsg) {
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;
  if(screenName!=usernameAccount)
    checkAndAdd(screenName,followBackArray); 
  
}

/**
  *@author Aymanov
  *function to check the followback identity
  */
function checkAndAdd(name,arr) {
  var id = arr.length + 1;
  var found = arr.some(function (el) {
    return el.username === name;
  });
  if (!found) { arr.push( name ); 
      followBackCount++;
      console.log('.@' + name + ' thanks  a lot '+followBackCount);
      console.log('followBackArray '+arr);
    }
      
}

/**
  *@author Aymanov
  *function to make thread sleep
  */
function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

/**
  *@author Aymanov
  *function to remove duplicates fields from an array
  */
function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

/**
  *@author Aymanov
  *function to get Follow Rate
  */
function followRate(){
  if (followCount!=0)
    return (followCount-unfollowCount)/followCount;
  else return -1;
}
/**
  *@author Aymanov
  *function to get random value 
  */
function GetValue(myarray)
{   
    var random = myarray[Math.floor(Math.random() * myarray.length)];
    //alert(random);
    console.log('random '+Math.floor(Math.random() * myarray.length));
    return Math.floor(Math.random() * myarray.length);
}
/**
  *@author Aymanov
  *function to initialize settings of the bot
  */
function initialSettings(){
 StateFollow = Create2DArray(TargetList.length);
  
    for(var i=0; i<TargetList.length; i++){
      StateFollow[i][0]=TargetList[i];
      StateFollow[i][1]=-1;
        }
  
}
/**
  *@author Aymanov
  *function to create a 2D array
  */
function Create2DArray(rows) {
  var arr = [];
  for (var i=0;i<rows;i++) {
     arr[i] = [];
  }
  return arr;
}
