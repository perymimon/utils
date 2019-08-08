
function resolved(){
    return new Promise(function (res, rej) {
        res();
    });
}
function rejected(){
    return new Promise(function (res, rej) {
        rej();
    });
}

export function Deferred(){
    let resolve, reject;
    const promise = new Promise(function (res, rej) {
        resolve = res; reject = rej;
    });

    return {
        promise: promise,
        resolve: resolve,
        reject: reject
    }
}


Deferred.Rejected = rejected;
Deferred.Resolved = resolved;