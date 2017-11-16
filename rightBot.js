console.log('The unfollower chmayti bot is starting');

var Twit = require('twit');

var config = require('./config');
var T = new Twit(config);
var stream = T.stream('user');

followTarget('Cr7');

// Anytime someone follows me
function followTarget(username){
   T.get('followers/list', { screen_name: username },  function (err, data, response) {
     for (item in data) {
     	for (subItem in data[item]) {
     	//follow that target follower 
   		T.post('friendships/create', { id: data[item][subItem].id }, function(err, data, response) {
     			if(err) console.log('not working');
     			else   console.log('it works ');
   		});
     	}
     }   
     
    });

   setInterval(unfollowAll,1000*60);
}


 function unfollowAll(){
  	T.get('followers/ids', function(err, reply) {
      if(err) return callback(err);
      
      var followers = reply.ids;
      
      T.get('friends/ids', function(err, reply) {
          if(err) return callback(err);          
          var friends = reply.ids
            , pruned = false;
          
          while(!pruned) {
            //var target = randIndex(friends);
            for (item in friends) {
	            if(!~followers.indexOf(item)) {
	              pruned = true;
	              T.post('friendships/destroy', { id: friends[item] }, function(err, reply) {
	      				if(err) return handleError(err);
	 
	      				var name = reply.screen_name
	      				console.log("\nPrune: unfollowed @"+ name);
	    				});         
	            }
            }
         }
      });
  });
 }
  


