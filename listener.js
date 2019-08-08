export function listenToPassword(password){
    return new Promise((res,rej)=>{
        const len = password.length;
        let string = '';
	    window.addEventListener('keypress', keypresslisstner);
	    top.addEventListener('keypress', keypresslisstner);
        function keypresslisstner(evt) {
            string += evt.key;
            string = string.slice(-1 * len);
            if(string === password){
	            window.removeEventListener('keypress', keypresslisstner);
	            top.removeEventListener('keypress', keypresslisstner);
                res()
            }
        }
    });
}


export function requestIdleCallback(time ){
   return new Promise(function (res, rej) {
	   window.requestIdleCallback ?
		   window.requestIdleCallback(res,{timeout:time}):
           /*no feather callback so immed(iate call  */
		   setTimeout(res,0);
   });
}