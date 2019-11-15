requirejs.config({
        paths: {
            util: 'https://gitee.com/xlgp/static/raw/master/xlgp/xlgp.util',
            clipboard: 'https://cdn.jsdelivr.net/npm/clipboard@2/dist/clipboard.min',
            Vue: 'https://cdn.jsdelivr.net/npm/vue/dist/vue',
            XCVue: 'https://gitee.com/xlgp/static/raw/master/xlgp/xc-search-comp',
        },
})

require(['XCVue', 'util'], function(XCVue, util){
    let Vm = new XCVue({
        data: {
            id: 'xc-car-app',
        },
        methods: {
            xcInputHandler: function (type) {
            },
        }
    });
    Vm.$mount(util.el(Vm.id, XCVue.$parentId));
});
