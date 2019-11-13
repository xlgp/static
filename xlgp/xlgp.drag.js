(function (root, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (root.xlgp = root.xlgp || {},
            root.xlgp.drag = root.xlgp.drag || factory());

})(this, function () {
    let config = {
        el: undefined,
        onStart: function () {},
        onMove: function () {},
        onStop: function () {},
    };

    function pixel(p) {
        return Number(p.replace(/px/, ''));
    }

    

    function mousedown(e) {
        let curr = e.currentTarget;
        let point = curr.point || {};
        point.pageX = e.pageX;
        point.pageY = e.pageY;
        curr.point = point;

        curr.addEventListener('mousemove', this.fnMove);
        
        this.config.onStart();
    };

    function mousemove(e) {
        let curr = e.currentTarget;
        let point = curr.point,
            dx = e.pageX - point.pageX,
            dy = e.pageY - point.pageY;

        curr.style.left = (pixel(curr.style.left) + dx) + 'px';
        curr.style.top = (pixel(curr.style.top) + dy) + 'px';

        point.pageX = e.pageX;
        point.pageY = e.pageY;

        this.config.onMove();
    }


    function mouseup(e) {
        let curr = e.currentTarget;
        curr.removeEventListener('mousemove', this.fnMove);
        this.config.onStop();
    }

    function initEvent(){
        this.fnStart = mousedown.bind(this);
        this.fnMove = mousemove.bind(this);
        this.fnStop = mouseup.bind(this);
    }

    function off(){
        let el = this.config.el;
        el.removeEventListener('mousedown', this.fnStart);
        el.removeEventListener('mousemove', this.fnMove);
        el.removeEventListener('mouseup', this.fnStop);
        el.removeEventListener('mouseout', this.fnStop);
    }
    function on(){
        let el = this.config.el;
        el.addEventListener('mousedown', this.fnStart);
        el.addEventListener('mouseout', this.fnStop);
        el.addEventListener('mouseup', this.fnStop);
    }

    

    function init() {
        initEvent.call(this);
        on.call(this);
        this.isdrag = true;
    }

    function setConfig(option) {
        this.config = Object.assign({}, config);

        for (const key in this.config) {
            option[key] && (this.config[key] = option[key]);
        }

        if (typeof this.config.el === 'string') {
            this.config.el = document.getElementById(this.config.el);
        }
    }

    function drag(option) {
        setConfig.call(this, option);
        init.call(this);

    }
    
    drag.prototype.on = function(){
        on.call(this);
        this.isdrag = true;
    };
    drag.prototype.off = function(){
        off.call(this);
        this.isdrag = false;
    }

    return function (option) {
        return new drag(option);
    }
})