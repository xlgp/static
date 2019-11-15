/**
 * 在引入此文件前,需引入css/xc-search-comp.css
 */
/**
 * [mixin description] Vue mixins
 * @type {Object}
 */

define([
    'clipboard',
    'Vue',
    'util',
], function (ClipboardJS, Vue, util) {
    'use strict';
    //创建search comp外层盒子
    let APP_BOX = 'xc-app-box';
    util.el(APP_BOX);
    util.loadAsync.css('https://hzxcsy.oss-cn-hangzhou.aliyuncs.com/css/xc-search-comp.css');
    /**
     * 按钮组建,
     * @type {Object}
     * 点击按钮事件,$emit('click', btn.id || $event, $event)
     */
    let xcButtonComp = {
        props: {
            btns: Array
        },
        computed: {
            style: function () {
                return {
                    'width': 100 / (this.btns.length) + '%',
                };
            },
        },
        template: `<div class="xc-btn-group">
                    <button class="xc-btn" v-for="btn in btns" @click="$emit('click', btn.id || $event, $event)" :style="style">{{btn.text}}</button>
        </div>`
    };

    /**
     * 输入框组建
     * @type {Object}
     */
    let textAreaComp = {
        props: {
            placeholder: String,
        },
        data: function () {
            return {
                isPlaceHolder: true,
                areaList: [],
            };
        },
        methods: {
            /**
             * 输入事件
             * @param  {[type]} $event [description]
             * @return {[type]}        [description]
             */
            textHandInput: function ($event) {
                let content = $event.target.innerText.trim();
                this.isPlaceHolder = content === "" ? true : false;
                if (content) {
                    this.areaList = content.split('\n');
                    this.isPlaceHolder = false;
                } else {
                    this.areaList = [];
                    this.isPlaceHolder = true;
                    $event.target.innerText = '';
                }
                this.$emit('get-arealist', this.areaList);
            },
        },
        computed: {
            phText: function () {
                return this.placeholder || '请输入...';
            },
        },
        template: `<div class="xc-textarea" :class="{'xc-placeholder' : isPlaceHolder}" spellcheck="false" contenteditable="true" @input="textHandInput"  :placeholder="phText"></div>
            `
    };
    let mixins = {
        data: function () {
            return {
                resultList: [], //table内数据
                itemDict: {}, //表头字典
                paramDict:[], //参数字典,即将arealist格式化成对象的key, 且key的顺序需与arealist字段一致
                title: '标题',
                areaList: [], //输入框内容
                style: {
                    bg: {
                        'background-image': 'url(//img.infinitynewtab.com/wallpaper/' + Math.floor((Math.random() * 3000) + 1) + '.jpg)',
                    }
                },
                btns: [],
                placeholder: '',
            }
        },
        components: {
            'xc-button': xcButtonComp,
            'xc-textarea': textAreaComp,
            'xc-td': {
                props: {
                    obj: Object,
                    item: String,
                },
                template: `<td>{{obj[item] == undefined ? '无' : obj[item]}}</td>`,
            },
        },
        created: function () {
            new ClipboardJS('#' + this.clipboardId);
        },
        methods: {
            clearAreaText: function () {
                this.resultList = [];
            },
            updateResultList: function (data) {
                let obj = {};
                for (let item in this.itemDict) {
                    obj[item] = data[item];
                }
                this.resultList.push(obj);
            },
            xcBtnHandler: function () {
                console.info('xcBtnHandler function in mixin');
            },
            getAreaText: function (areaList) {
                this.areaList = areaList;
            },
        },
        computed: {
            tabHeadList: function () { //表头
                return Object.values(this.itemDict);
            },
            parseList:function(){ //格式化 this.arealist
                let len =  this.areaList.length;
                let list = [];
                for (var i = 0; i < len; i++) {
                    list.push(this.areaList[i].trim().split('\t'));
                }
                return list;
            },
            paramList:function(){ //将arealist数据对象格式化
                if (!this.paramDict || this.paramDict.length == 0) {
                    console.error('paramDict不能为空');
                    return;
                }
                let list = [];
                if (this.paramDict.length != this.parseList[0].length) {
                    console.info('数据与 paramDict key对应不一致');
                }
                for (var i = 0; i < this.parseList.length; i++) {
                    let obj = {};
                    for (var j = 0; j < this.paramDict.length; j++) {
                       obj[this.paramDict[j]] = this.parseList[i][j];
                    }
                    list.push(obj);
                }
                return list;
            },
            itemList: function () { //表中项
                return Object.keys(this.itemDict);
            },
            cpTbodyId: function () {
                return '#' + this.tbodyId;
            },
            tbodyId: function () {
                return this.id + '-tbody';
            },

            clipboardId: function () {
                return this.id + '-clip';
            },
        },
        template: `
        <div :id="id" class="xc-bg" :style="style.bg">
        <div class="xc-wapper">
            <div class="xc-title"><span>{{title}}</span></div>
            <xc-button v-on:click="xcBtnHandler" :btns="btns"></xc-button>
            <xc-textarea :placeholder="placeholder" @get-arealist="getAreaText"></xc-textarea>
            <div class="xc-table">
                <table>
                    <thead><tr>
                        <th v-for="(item, index) in tabHeadList" :key="index">
                        {{item}}
                        <span v-if="index == 0" >
                        <cite @click="clearAreaText">清空</cite>
                        <cite :id="clipboardId" :data-clipboard-target='cpTbodyId'>复制</cite>
                        </span>
                        </th>
                    </tr></thead>
                    <tbody :id="tbodyId">
                        <tr v-for="(resItem, index) in resultList" :key="index">
                            <td is="xc-td" v-for="(item, index) in itemList" :key="index" :item="item" :index="index" :obj="resItem"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </div>
            </div>
        `,
    }

    let XCVue = Vue.extend({
        mixins: [mixins],
    });
    XCVue.$parentId = APP_BOX;
    return XCVue;
})