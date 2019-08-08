
export  function fontSize( $dom, H, minh, maxh ){
    let ratio = H/minh;

    return function set(){
        let H = $dom.getBoundingClientRect().height;
        let h = H / ratio ;
        h = Math.min(h, maxh);
        h = Math.max(h, minh);
        $dom.style.fontSize = h+ 'px';

    }

}