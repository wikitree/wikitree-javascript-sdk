wikitree-javascript-sdk
=======================

Javascript library for interacting with the WikiTree API functions

## Prerequisites
* jQuery 1.10 or higher (may work with lower versions)
* jQuery Cookie Plugin 1.3.1 or later (https://github.com/carhartl/jquery-cookie)

## Usage

````javascript

// Load scripts
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script src="jquery.cookie.js"></script>
<script src="wikitree.js"></script>

<script type="text/javascript">

	wikitree.init({});
	wikitree.session.checkLogin().then(function(data){ ... });

	wikitree.session.log( { email: 'xxx', password: 'yyyy' }).then(function(data) {
	});

	var p = new wikitree.Person( { user_id: #### } );
	p.load({}).then(function(data){ 
	});

</script>
````

## Example

The documentation here is incomplete as the SDK (and the API itself) are all in early development.
The index.html file has a decent example of usage. 
