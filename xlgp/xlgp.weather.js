(function (root, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(['util','sunrise', 'geolocation'], factory) :
        (root.xlgp = root.xlgp || {},
            root.xlgp.util = root.xlgp.util || {},
            root.xlgp.util.sunrise = factory());
})(this, function (util, sunrise, geolocation) {

    /**
     * 未来2小时内当前地区降雨情况
     */
    let rain2hour = function () {
        let url = 'https://d3.weather.com.cn/webgis_rain_new/webgis/minute?';
        return geolocation().then(data =>
            util.loadJsonpPromise(url + util.parseUrl({
                lat: data.location.lat,
                lon: data.location.lng,
                stationid: data.ad_info.areaid,
                callback: '#callback#',
            }))
        );
    }

    let currentWeather = function () {
        let url = 'https://wis.qq.com/weather/common?';
        return geolocation().then(data => {
            return util.loadJsonpPromise(url + util.parseUrl({
                    source: 'pc',
                    weather_type: 'observe',
                    province: data.ad_info.province,
                    city: data.ad_info.city,
                    county: data.ad_info.district,
                    callback: '#callback#',
                }))
                .then(data => {
                    if (data.status == 200) return data.data.observe;
                    return Promise.reject(data.message);
                });
        })
    }

    return {
        rain2hour,
        currentWeather,
    };
})