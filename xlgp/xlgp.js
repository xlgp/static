require.config({
    paths:{
        geolocation:'./xlgp.geolocation',
        util:'./xlgp.util',
        vue:'../libs/vue',
        // vue:'../libs/vue.min',
        search:'./xlgp.search',
        sunrise:'./xlgp.sunrise',
        weather:'./xlgp.weather',
    }
});

require(['vue']);

require(['search'], function(search){    
    search({el:'#search-box'});
})

// require(['weather', 'vue'], function(weather, Vue){

//     weather.currentWeather().then(data => {
//         console.log(data);
//     });
//     weather.rain2hour().then(data => {
//         console.log(data);
//     });
// })
