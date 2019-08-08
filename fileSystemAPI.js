// var requestedBytes = 1024*1024*10; // 10MB
// window.requestFileSystem(Window.TEMPORARY, requestedBytes, onInitFs,errorHandler);
navigator.webkitTemporaryStorage.queryUsageAndQuota (
	function(usedBytes, grantedBytes) {
		console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
	},
	function(e) { console.log('Error', e);  }
);