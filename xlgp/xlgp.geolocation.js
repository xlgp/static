define(['util'], function (util) {
    storage = 'geolocation';
    return function () {
        try {
            let geolocation = JSON.parse(localStorage.getItem(storage));
            if (geolocation && ((new Date).getTime() - geolocation.timestamp) < 1000 * 3600) { //ip更新周期为一小时
                return Promise.resolve(geolocation);
            } console.log(geolocation);
            throw 'geolocation error';
        } catch (error) { console.log(error);
            let url = 'https://apis.map.qq.com/ws/location/v1/ip?';
            let params = {
                key: '3BFBZ-ZKD3X-LW54A-ZT76D-E7AHO-4RBD5',
                output: 'jsonp',
                callback: '#callback#'
            };
            return util.loadJsonpPromise(url + util.parseUrl(params))
                .then(function (data) {
                    if (data && data.status == 0) {
                        data.result.timestamp = (new Date).getTime();
                        localStorage.setItem(storage, JSON.stringify(data.result));
                        return data.result;
                    }
                }).then(data => {
                    let url = 'https://d4.weather.com.cn/geong/v1/api?params=';
                    let params = JSON.stringify({
                        "method": "stationinfo",
                        "lat": data.location.lat,
                        "lng": data.location.lng,
                        "callback": "#callback#"
                    });
                    return util.loadJsonpPromise(url + params);
                }).then(data => {
                    let geo = JSON.parse(localStorage.getItem(storage));
                    geo.ad_info.areaid = data.data.station.areaid;
                    localStorage.setItem(storage, JSON.stringify(geo));
                    return geo;
                });
        }
    }
})