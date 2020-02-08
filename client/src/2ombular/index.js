'use strict';
// 2OMBULAR ed. 0, ML

import * as cito from './cito.js';

function val(f, ...args) {
    return (typeof f === 'function') ? f(...args) : f;
}

/*
    Usage: z.Node(document.body, func)

    func(ctx: {update, ...}, old: cito struct) -> cito struct
    z(spec: str | dict, ...children: [str | num | bool | func]) -> func
    
    update() => schedule an update
    update(fn: callable) => schedule an update, queue fn call after it finishes
    update(true) => update immediately
    
    Calls to update(false, ctx), update(true, ctx) and update(fn, ctx) change
    the initial context by updating it from ctx parameter.
    
    Calls to update during the update phase (i.e. directly from func's, 
    childern of z) have no effect. Function update() must be called 
    from callbacks.
*/

function Node(dom, func) {
    let updating = false, vnode, resolve, handle;
    let promise = new Promise(ok => resolve = ok);
    function update() {
        if (handle === undefined) {
            handle = setTimeout(updateNow, 0);
        }
        return promise;
    }
    function updateNow() {
        if (updating) return;
        updating = true;
        if (handle !== undefined) {
            clearTimeout(handle);
            handle = undefined;
        }
        let _resolve = resolve;
        promise = new Promise(ok => resolve = ok);
        if (vnode) cito.vdom.update(vnode, func());
        else vnode = cito.vdom.append(dom, func());        
        updating = false;
        _resolve();
    }
    updateNow();    
    return {
      update, 
      updateNow,
      set(f) { func = f; },
      get promise() { return promise; },
    };
};

function flatten(array, func) {
    return [].concat(...array.map(func));
}

function toStringList(v) {
    if (v !== 0 && !v) return [];
    else if (typeof v === 'string') return [v];
    else if (typeof v === 'function') return toStringList(v());
    else if (typeof v === 'object') {
        if (Array.isArray(v)) {
            return flatten(v, toStringList);
        } else {
            var result = [];
            for (var k in v) if (v.hasOwnProperty(k)) {
                if (val(v[k])) result.push(k);                    
            }
            return result;
        }
    } 
    else return [String(v)];
}

function parseSpec(spec) {
    spec = val(spec);
    if (typeof spec === 'string') {
        if (spec === '<' || spec === '!') { return {tag: spec}; } 
        else if (spec === '') { return {}; } 
        else { spec = {is: spec}; }
    }
    // spec -> tag, id, classes
    if (typeof spec !== 'object') return {};
    spec.is = val(spec.is);
    var result = {tag: 'div', attrs: {}, events: {}}, 
        classes = [];
    var specre = /(^([0-9a-z\-_]+)|[<!])|([#\.]?[0-9a-z\-_]+)/gi;
    if (spec.is) {
        (spec.is.match(specre) || []).forEach(function (m) {
            if (m.charAt(0) == '.') classes.push(m.substr(1));
            else if (m.charAt(0) == '#') result.attrs.id = m.substr(1);
            else result.tag = m;
        });
    }
    // key, class, on*, * -> attrs.key, attrs.class, events.*, attrs.*
    for (var key in spec) if (spec.hasOwnProperty(key) && (key !== 'is')) {
        if (key.substr(0, 2) === 'on' && spec[key]) {
            result.events[key.substr(2)] = spec[key];
        } else {
            var nval = val(spec[key]);
            if (nval === undefined) continue;
            if (key === 'key') {
                result.key = nval;
            } else if (key === 'class') {
                classes = classes.concat(toStringList(nval));
            } else {
                result.attrs[key] = nval;
            }
        }
    }
    if (classes.length > 0) result.attrs['class'] = classes.join(' ');
    return result;
}

export const SKIP = Symbol('SKIP');

function normChild(c) {
    if (c === SKIP) return undefined;
    else if (c === undefined || c === null) return '';
    else if (typeof c === 'number') { return String(c); }
    else if (typeof c === 'function') { return normChild(c()); }
    else if (Array.isArray(c)) { return flatten(c, normChild); }
    else { return c; }
}

function zz(spec, ...children) {
    function z() {
        var result = parseSpec(spec);
        result.children = normChild(children);
        return result;
    }
    z.ZZ = 'z';
    return z;
}

function extendSpecString(prefix='', spec='') {    
    if (prefix === '') return spec;
    if (spec.startsWith('.')) return prefix + spec;
    return spec + '.' + prefix;
}

function extendSpec(prefix='', spec) {
    let is = spec.is, is_ = is;
    if (typeof is === 'string') {
        is_ = extendSpecString(prefix, is);
    } else if (typeof is === 'function') {
        is_ = () => extendSpecString(prefix, is());
    } else if (is === undefined) {
        is_ = prefix;
    }
    spec.is = is_;
    return spec;
}

/*
const SPECIAL = {};
'arguments caller length name prototype apply bind call constructor'
  .split(' ')
  .forEach(n => SPECIAL[n] = true);
*/

function withPrefix(prefix) {
    return new Proxy(()=>{}, {
        get(self, prop) {
            /*
            if (!(prop in SPECIAL)) {
                if (prop in self) return self[prop];
                if (prop in zz) return zz[prop];
            }
            */
            let newPrefix;
            if (prefix == undefined) {
                if (prop.startsWith('_')) {
                    newPrefix = prop.slice(1);
                    // if (newPrefix === '') newPrefix = 'div';
                } else if (prop.match(/^[A-Z]/)) {
                    newPrefix = prop.toLowerCase();
                } else {
                    newPrefix = '.' + prop;
                }
            } else {
                newPrefix = prefix + '.' + prop;
            }            
            return withPrefix(newPrefix);
        },
        apply(self, handler, args) {
            let spec = args[0];
            if (typeof spec === 'object' && !Array.isArray(spec)) {
                args[0] = extendSpec(prefix, spec);
            } else if (prefix != undefined) {
                args.unshift(prefix);
            }
            return zz(...args);
        },
    });
}

export let z = withPrefix();

/*
export function Val(v) {
    var result = (...args) => args.length > 0 ? v = args[0] : v;
    result.get = result;
    result.set = vv => v = vv;
    return result;
}

export function Ref(env, name) {
    var result = () => env[name];
    result.get = result;
    result.set = vv => env[name] = vv;
    return result;
}
*/

export let Val = (v) => (...args) => args.length > 0 ? v = args[0] : v;
export let Ref = (o, p) => (...args) => args.length > 0 ? o[p] = args[0] : o[p]; 

export function each(list, func, between) {
    if (between === undefined && typeof func !== 'function') {
        between = func;
        func = x => x;
    }
    var result = [];
    for (var i = 0; i < list.length; i++) {
        var item = func(list[i], i, list);
        if (item != null) {
            result.push(item);
            if (between != undefined) result.push(between);
        }
    }
    if (between != undefined) result.pop();
    return result;
}

let body = Node(document.body, zz(''));

export let page = {
    route: '',
    args: {},
    link(newRoute, newArgs) {
        let args, route;
        if (newRoute === null) { 
            args = Object.assign({}, page.args, newArgs);
            route = page.route;
        } else {
            args = newArgs;
            route = newRoute;
        }
        var result = [route];
        Object.entries(args).forEach(([k, v]) => {
            if (v !== undefined)
              result.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        });
        return '#' + result.join(';');
    },
    async update() {
        await body.update();
    },
    updateNow() {
        body.updateNow();
    },
    get afterUpdate() { return body.promise; },
    setBody(v) {
        body.set(v);
        body.updateNow();
    },
};

let prevRoute, prevPairs;

function updateRoute() {
    var hash = window.location.hash.slice(1);
    var pairs;
    [page.route, ...pairs] = hash.split(';');
    
    page.routeIsNew = (page.route === prevRoute);
    page.argsHaveChanged = (pairs.join(';') === prevPairs);

    prevRoute = page.route;
    prevPairs = pairs.join(';');
    
    page.args = {};
    pairs.forEach(p => {
        var [key, ...values] = p.split('=');
        page.args[decodeURIComponent(key)] = decodeURIComponent(values.join('='));
    });    
}

updateRoute();

window.addEventListener('hashchange', () => { 
    updateRoute(); 
    page.update(); 
});


