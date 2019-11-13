requirejs.config({
    paths:{
        paths: {
            util: 'https://gitee.com/xlgp/static/raw/master/xlgp/xlgp.util',
            clipboard: 'https://cdn.jsdelivr.net/npm/clipboard@2/dist/clipboard.min',
            Vue: 'https://cdn.jsdelivr.net/npm/vue/dist/vue',
            XCVue: 'https://gitee.com/xlgp/static/raw/master/xlgp/xc-search-comp',
        }
    }
})

require(['XCVue', 'util'], function(XCVue, util){
    let Vm = new XCVue({
        data: {
            id: 'xc-car-app',
            title: '车牌号查询',
            itemDict: {
                'carNo': '车牌号',
                'StatusMessage': '有无结果'
            },
            btns: [{
                text: 'carNo查询',
                id: 'carno'
            }],
        },
        methods: {
            xcInputHandler: function (type) {
                this.resultList = [];
                for (let index = 0; index < this.areaList.length; index++) {
                    getreinfo(this.areaList[index], this.updateResultList);
                }
            },
        }
    });
    Vm.$mount(util.el(Vm.id, XCVue.$parentId));
});
