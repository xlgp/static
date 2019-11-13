/**
 * from http://image.nmc.cn/static2/site/nmc/themes/basic/js/ac.js?v=20180325
 */
(function (root, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory):
        (root.xlgp = root.xlgp || {},
            root.xlgp.util = root.xlgp.util || {},
            root.xlgp.util.sunrise = factory());
})(this, function () {
    function hrsmin(hours) {
        var hrs, h, m, dum;
        hrs = Math.floor(hours * 60 + 0.5) / 60.0;
        h = Math.floor(hrs);
        m = Math.floor(60 * (hrs - h) + 0.5);
        if (h < 10)
            h = "0" + h;
        if (m < 10)
            m = "0" + m;
        dum = h + ":" + m;

        if (dum < 1000)
            dum = "0" + dum;
        if (dum < 100)
            dum = "0" + dum;
        if (dum < 10)
            dum = "0" + dum;
        return dum;
    }

    function ipart(x) {
        var a;
        if (x > 0) {
            a = Math.floor(x);
        } else {
            a = Math.ceil(x);
        }
        return a;
    }

    function frac(x) {
        var a;
        a = x - Math.floor(x);
        if (a < 0)
            a += 1;
        return a;
    }

    function round(num, dp) {
        return Math.round(num * Math.pow(10, dp)) / Math.pow(10, dp);
    }

    function range(x) {
        var a, b;
        b = x / 360;
        a = 360 * (b - ipart(b));
        if (a < 0) {
            a = a + 360
        }
        return a
    }

    function mjd(day, month, year, hour) {
        var a, b;
        if (month <= 2) {
            month = month + 12;
            year = year - 1;
        }
        a = 10000.0 * year + 100.0 * month + day;
        if (a <= 15821004.1) {
            b = -2 * Math.floor((year + 4716) / 4) - 1179;
        } else {
            b = Math.floor(year / 400) - Math.floor(year / 100) + Math.floor(year / 4);
        }
        a = 365.0 * year - 679004.0;
        return (a + b + Math.floor(30.6001 * (month + 1)) + day + hour / 24.0);
    }

    function quad(ym, yz, yp) {
        var nz, a, b, c, dis, dx, xe, ye, z1, z2, nz;
        var quadout = new Array;

        nz = 0;
        a = 0.5 * (ym + yp) - yz;
        b = 0.5 * (yp - ym);
        c = yz;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + c;
        dis = b * b - 4.0 * a * c;
        if (dis > 0) {
            dx = 0.5 * Math.sqrt(dis) / Math.abs(a);
            z1 = xe - dx;
            z2 = xe + dx;
            if (Math.abs(z1) <= 1.0)
                nz += 1;
            if (Math.abs(z2) <= 1.0)
                nz += 1;
            if (z1 < -1.0)
                z1 = z2;
        }
        quadout[0] = nz;
        quadout[1] = z1;
        quadout[2] = z2;
        quadout[3] = xe;
        quadout[4] = ye;
        return quadout;
    }

    function lmst(mjday, glong) {
        var lst, t, d;
        d = mjday - 51544.5
        t = d / 36525.0;
        lst = range(280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - t * t * t / 38710000);
        return (lst / 15.0 + glong / 15);
    }

    function minisun(t) {
        var p2 = 6.283185307,
            coseps = 0.91748,
            sineps = 0.39778;
        var L, M, DL, SL, X, Y, Z, RHO, ra, dec;
        var suneq = new Array;

        M = p2 * frac(0.993133 + 99.997361 * t);
        DL = 6893.0 * Math.sin(M) + 72.0 * Math.sin(2 * M);
        L = p2 * frac(0.7859453 + M / p2 + (6191.2 * t + DL) / 1296000);
        SL = Math.sin(L);
        X = Math.cos(L);
        Y = coseps * SL;
        Z = sineps * SL;
        RHO = Math.sqrt(1 - Z * Z);
        dec = (360.0 / p2) * Math.atan(Z / RHO);
        ra = (48.0 / p2) * Math.atan(Y / (X + RHO));
        if (ra < 0)
            ra += 24;
        suneq[1] = dec;
        suneq[2] = ra;
        return suneq;
    }

    function sin_alt(iobj, mjd0, hour, glong, cglat, sglat) {
        var mjday, t, ra, dec, tau, salt, rads = 0.0174532925;
        var objpos = new Array;
        mjday = mjd0 + hour / 24.0;
        t = (mjday - 51544.5) / 36525.0;
        if (iobj == 1) {
            objpos = minimoon(t);
        } else {
            objpos = minisun(t);
        }
        ra = objpos[2];
        dec = objpos[1];
        tau = 15.0 * (lmst(mjday, glong) - ra);
        salt = sglat * Math.sin(rads * dec) + cglat * Math.cos(rads * dec) * Math.cos(rads * tau);
        return salt;
    }

    function getzttime(mjday, tz, glong) {
        var sglong, sglat, date, ym, yz, utrise, utset, j;
        var yp, nz, hour, z1, z2, iobj, rads = 0.0174532925;
        var quadout = new Array;

        sinho = Math.sin(rads * -0.833);
        date = mjday - tz / 24;
        hour = 1.0;
        ym = sin_alt(2, date, hour - 1.0, glong, 1, 0) - sinho;

        while (hour < 25) {
            yz = sin_alt(2, date, hour, glong, 1, 0) - sinho;
            yp = sin_alt(2, date, hour + 1.0, glong, 1, 0) - sinho;
            quadout = quad(ym, yz, yp);
            nz = quadout[0];
            z1 = quadout[1];
            z2 = quadout[2];
            xe = quadout[3];
            ye = quadout[4];

            if (nz == 1) {
                if (ym < 0.0)
                    utrise = hour + z1;
                else
                    utset = hour + z1;

            }
            if (nz == 2) {
                if (ye < 0.0) {
                    utrise = hour + z2;
                    utset = hour + z1;
                } else {
                    utrise = hour + z1;
                    utset = hour + z2;
                }
            }
            ym = yp;
            hour += 2.0;
        }
        var zt = (utrise + utset) / 2;
        if (zt < utrise)
            zt = (zt + 12) % 24;
        return zt;
    }

    function Cal(mjday, tz, glong, glat) {

        var sglong, sglat, date, ym, yz, above, utrise, utset, j;
        var yp, nz, rise, sett, hour, z1, z2, iobj, rads = 0.0174532925;
        var quadout = new Array;
        var always_up = "日不落";
        var always_down = "日不出";
        var resobj = {};

        sinho = Math.sin(rads * -0.833);
        sglat = Math.sin(rads * glat);
        cglat = Math.cos(rads * glat);
        date = mjday - tz / 24;

        rise = false;
        sett = false;
        above = false;
        hour = 1.0;
        ym = sin_alt(2, date, hour - 1.0, glong, cglat, sglat) - sinho;
        if (ym > 0.0)
            above = true;
        while (hour < 25 && (sett == false || rise == false)) {
            yz = sin_alt(2, date, hour, glong, cglat, sglat) - sinho;
            yp = sin_alt(2, date, hour + 1.0, glong, cglat, sglat) - sinho;
            quadout = quad(ym, yz, yp);
            nz = quadout[0];
            z1 = quadout[1];
            z2 = quadout[2];
            xe = quadout[3];
            ye = quadout[4];

            if (nz == 1) {
                if (ym < 0.0) {
                    utrise = hour + z1;
                    rise = true;
                } else {
                    utset = hour + z1;
                    sett = true;
                }
            }

            if (nz == 2) {
                if (ye < 0.0) {
                    utrise = hour + z2;
                    utset = hour + z1;
                } else {
                    utrise = hour + z1;
                    utset = hour + z2;
                }
            }

            ym = yp;
            hour += 2.0;

        }

        if (rise == true || sett == true) {
            if (rise == true) {
                resobj["rise"] = hrsmin(utrise);
            } else {
                resobj["pole"] = "日不出或日不落";
            }
            var zt = getzttime(mjday, tz, glong);
            resobj["center"] = hrsmin(zt);
            if (sett == true) {
                resobj["set"] = hrsmin(utset);
            } else {
                resobj["pole"] = "日不出或日不落";
            }
        } else {
            if (above == true) {
                var zt = getzttime(mjday, tz, glong);
                resobj["center"] = hrsmin(zt);
                resobj["pole"] = "极昼";
            } else {
                resobj["pole"] = "极夜";
            }
        }
        return resobj;
    }
    return function sunrise(lo, la) {
        var now = new Date();
        var d = now.getDate(),
            m = now.getMonth() + 1,
            y = now.getFullYear(),
            z = 8;

        var obj = Cal(mjd(d, m, y, 0.0), z, lo, la);
        return obj;
    }
})