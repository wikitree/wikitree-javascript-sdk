/* ======================================================================
 *
 *
 *
 *
 * ======================================================================
 */


window.wikitree = window.wikitree || {};
wikitree.API_URL = '/api.php';


/* ======================================================================
 *
 * Session
 *
/* ======================================================================
 */


// Create functional object "class" 
wikitree.Session = function(opts) {
	this.user_id    = (opts && opts.user_id) ? opts.user_id : $.cookie('wikitree_wtb_UserID');
	this.user_name  = (opts && opts.user_name) ? opts.user_name : $.cookie('wikitree_wtb_UserName');
	this.loggedIn  = false;
};
	
// Define new method for Session objects to check the current login.
// Return a promise object (from our .ajax() call) so we can do things when this resolves.
wikitree.Session.prototype.checkLogin = function (opts){

	var self = this;

	if (opts && opts.user_id) { self.user_id = opts.user_id; }
	if (opts && opts.user_name) { self.user_name = opts.user_name; }

	var request = $.ajax({
		url: wikitree.API_URL,
		crossDomain: true,
		xhrFields: { withCredentials: true },
		type: 'POST',
		dataType: 'json',
		data: { 'action': 'login', 'user_id': self.user_id },

		// Local success handling to set our cookies.
		success: function(data) { 
			if (data.login.result == self.user_id) { 
				$.cookie('wikitree_wtb_UserID', self.user_id);
				$.cookie('wikitree_wtb_UserName', self.user_name);
				self.loggedIn = true;
			} else { 
				$.cookie('wikitree_wtb_UserID', '');
				$.cookie('wikitree_wtb_UserName', '');
				self.loggedIn = false;
			}
		}, 
		error: function(xhr, status) { 
			$.cookie('wikitree_wtb_UserID', '');
			$.cookie('wikitree_wtb_UserName', '');
			self.loggedIn = false;
		}
	});

	return request.promise();

}
	

// Do an actual login through the server API with an Ajax call. 
wikitree.Session.prototype.login = function(opts) {
	var self = this;

	var email    = (opts && opts.email) ? opts.email : '';
	var password = (opts && opts.password) ? opts.password : '';

	var request = $.ajax({
		url: wikitree.API_URL,
		crossDomain: true,
		xhrFields: { withCredentials: true },
		type: 'POST',
		dataType: 'json',
		data: { 'action': 'login', 'email': email, 'password': password },

		// On successful POST return, check our data. Note from that data whether the login itself was
		// successful (setting session cookies if so). Call the user callback function when done.
		success: function(data) { 
			if (data.login.result == 'Success') { 
				self.user_id   = data.login.userid;
				self.user_name = data.login.username;
				self.loggedIn = true;
				$.cookie('wikitree_wtb_UserID', self.user_id);
				$.cookie('wikitree_wtb_UserName', self.user_name);
			} else { 
				this.loggedIn = false;
				$.cookie('wikitree_wtb_UserID', self.user_id);
				$.cookie('wikitree_wtb_UserName', self.user_name);
			}
		}, 

		// On failed POST/server error, act like a failed login.
		error: function(xhr, status) { 
			this.user_id = 0;
			this.user_name = '';
			this.loggedin = false;
			$.cookie('wikitree_wtb_UserID', self.user_id);
			$.cookie('wikitree_wtb_UserName', self.user_name);
		}
	});

	return request.promise();
	
}

wikitree.Session.prototype.logout = function(opts) {
	this.loggedIn = false;
	this.user_id = 0;
	this.user_name = '';
	$.removeCookie('wikitree_wtb_UserID');
	$.removeCookie('wikitree_wtb_UserName');
}


wikitree.init = function(opts) { 
	wikitree.session = new wikitree.Session();
}



/*
 * Person
 *
 *
 */


// wikitree.Person( opts )
wikitree.Person = function(opts){
	this.user_id = (opts && opts.user_id) ? opts.user_id : 0;
	this.loaded = false;
	this.loading = false;
};

// wikitree.Person.load(callback, [fields])
// 	The API on the server is called with $.ajax/$.post functions from jQuery. Those calls are *asynchronous*. 
wikitree.Person.prototype.load = function(opts){
	var self = this;

	// If we have a fields passed in, use those. If not, use a default set.
	var fields = 'Id,Name,FirstName,MiddleName,LastNameAtBirth,LastNameCurrent,BirthDate,DeathDate,Father,Mother'; 
	if (opts && opts.fields) { fields = opts.fields; }


	// If this Person is already loaded, we're all done. If not, we (may) have work to do.
	if (!self.loaded) {
		// Javascript will run right through the .ajax() call below and it's possible this Person.load() function will get called 
		// again before loaded = true and before the first .ajax() call has returned. We don't want to post to the server more than once.
		// If we're loading already, we don't have anything new to do.
		if (!self.loading) { 
			// Start loading our content from the server API.
			self.loading = true;

			// Post our content to the server API, passing along the requested fields.
			// Use crossDomain=true in case we end up hosting this on something like apps.wikitree.com but configured
			// to query the live database/API at www.wikitree.com. 
			var request = $.ajax({
				url: wikitree.API_URL,
				crossDomain: true,
				xhrFields: { withCredentials: true }, 
				type: "POST",
				dataType: 'json',
				data: { 'action': 'getPerson', 'key': self.user_id, 'fields': fields, 'format': 'json' },
	
				// On success, we note that we're done loading. If we got data back, we store it in self and set loaded=true.
				success: function(data) { 
					self.loading = false;
					self.status = data[0].status;
					if (!self.status) { 
						for (var x in data[0].person) { 
							self[x] = data[0].person[x];
						}
					}
					self.loaded = true;
				},
	
				// On error, report the "status" we got back.
				error: function(xhr, status) { 
					self.loading = false;
					self.loaded  = false;
					self.status = 'Error in API query';
				}
			});

			return request.promise();
		}
	} 

};
