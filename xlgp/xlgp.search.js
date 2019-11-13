(function (root, factory) {    
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(['vue', 'util'], factory) :
        (root.xlgp = root.xlgp || {},
            root.xlgp.search = root.xlgp.search || factory());
})(this, function (Vue, util) {
    
    let loadSuggestion = util.loadJsonp;

    let searchUrls = {
        'bing': {
            'title': 'Bing',
            'img_url': '',
            'checked': true,
            'sug_url': 'https://api.bing.com/qsonhs.aspx?type=cb&q=#keyword#&cb=#callback#',
            'search_url': 'https://cn.bing.com/search?q=#keyword#',
        },
        'google': {
            'title': 'Google',
            'img_url': '',
            'checked': '',
            'sug_url': 'http://suggestqueries.google.com/complete/search?client=youtube&jsonp=#callback#&q=#keyword#',
            'search_url': 'https://www.google.com.hk/search?q=#keyword#',
        },
        'baidu': {
            'title': '百度',
            'img_url': '',
            'checked': false,
            'search_url': 'https://www.baidu.com/s?wd=#keyword#',
            'sug_url': 'http://suggestion.baidu.com?wd=#keyword#&cb=#callback#',
        },
    };

    /**
     * 搜索类型
     * 存或取searchType
     */
    function getSearchType(type) {
        let searchType = 'searchType';

        if (typeof type === 'undefined') {
            if (localStorage.getItem(searchType) && searchUrls.hasOwnProperty(localStorage.getItem(searchType)))
                return localStorage.getItem(searchType);
            for (const key in searchUrls) {
                if (searchUrls.hasOwnProperty(key)) {
                    const element = searchUrls[key];
                    if (element.checked) {
                        localStorage.setItem(searchType, key);
                        break;
                    }
                }
            }
        } else if (searchUrls.hasOwnProperty(type)) {
            localStorage.setItem(searchType, type);
        }
        return localStorage.getItem(searchType);
    }

    function getTemplate() {
        return `
		<div class="search-box">
		<div class="search-type">
		<span v-for="(key, index) in searchTypeList" >
        <input type="radio" :id="key" :value="key" v-model="searchType"/>
		<label :for="key" :class="{active:key==searchType}">{{searchUrls[key].title}}</label>
		</span>
		</div>
        <form :action="searchUrl(keyword)" method="get" 
        @keyup.up="onKeyUp" @keyup.down="onKeyUp" @keyup.esc="onKeyUp" data-index="-1" v-on:submit.prevent="onSubmit" >
        <input class="search-input" :value="keyword" :data-url="searchUrl(keyword)" data-keyword="" @input="setKeyWord" placeholder="搜索" 
        autofocus @focus="onFocus" @blur="onBlur"/>
        </form>
        <ul v-show="keylistshow" class="keylist"><li v-for="(item, index) in keyList" :key="index" :class="{selected:item.selected}" class="search-item">
        <a :href="searchUrl(item.keyword)">{{item.keyword}}</a>
        </li></ul>
		</div>
		`;
    }

    //返回一个search对象
    let searchVm = new Vue({
        data: function () {
            return {
                keyword: '',
                keyList: [],
                keylistshow: false,
                searchType: getSearchType(),
                searchUrls: searchUrls,
            }
        },
        template: getTemplate(),
        methods: {
            setKeyWord: function ($event) {
                this.keylistshow || (this.keylistshow = true);
                $event.target.form && ($event.target.form.dataset.index = -1);
                this.keyword = $event.target.value;
                $event.target.dataset.keyword = $event.target.value;
                let that = this;
                this.keyword && loadSuggestion(this.searchUrl(this.keyword, 'sug_url'), function(data){
                    that.setKeyList(data);
                }) || (this.keyList = []);
            },
            setKeyList: function (data) {

                switch (this.searchType) {
                    case 'bing':
                        this.setBingList(data);
                        break;
                    case 'google':
                        this.setGoogleList(data);
                        break;
                    case 'baidu':
                        this.setBaiduList(data);
                        break;
                    default:
                        break;
                }
            },
            setBaiduList: function (data) {
                this.keyList = data.s.map(item => {
                    return {
                        keyword: item,
                        href: this.searchUrl(item),
                        selected: false,
                    };
                });
            },
            setBingList: function (data) {
                this.keyList = data.AS.Results[0].Suggests.map(item => {
                    return {
                        keyword: item.Txt,
                        href: this.searchUrl(item.Txt),
                        selected: false,
                    };
                })
            },
            setGoogleList: function (data) {
                this.keyList = data[1].map((value) => {
                    return {
                        keyword: value[0],
                        href: this.searchUrl(value[0]),
                        selected: false,
                    };
                });
            },
            searchUrl: function (keyword, type = 'search_url') {
                return this.searchUrls[this.searchType][type].replace('#keyword#', encodeURIComponent(keyword));
            },
            onSubmit: function ($event) {
                window.location.href = $event.target.action;
            },
            onFocus: function ($event) {
                this.keylistshow = true;
            },
            onBlur: function ($event) {
                setTimeout(function (root) {
                    root.keylistshow = false;
                }, 100, this);
            },
            //监听方向上下键,
            //index:提示列表的索引,
            //其中 -1 表示当前选中的是input中的值
            onKeyUp: function ($event) {
                let index = $event.currentTarget.dataset.index;
                index >= 0 && index < this.keyList.length && (this.keyList[index].selected = false);
                //根据按键(滚动式移动)设置index值,
                switch ($event.key) {
                    case 'ArrowUp': //上键
                        if (index <= -1) {
                            index = this.keyList.length - 1;
                        } else {
                            index = parseInt(index) - 1;
                        }
                        this.keylistshow = true;
                        break;
                    case 'ArrowDown': //下键
                        if (index >= this.keyList.length - 1) {
                            index = -1;
                        } else {
                            index = parseInt(index) + 1;
                        }
                        this.keylistshow = true;
                        break;
                    case 'Escape':
                    case 'Esc':
                        this.keylistshow = false;
                        break;
                }
                $event.currentTarget.dataset.index = index;
                if (index == -1) {
                    $event.currentTarget.action = $event.target.dataset.url;
                    this.keyword = $event.target.dataset.keyword;
                } else {
                    this.keyList[index].selected = true;
                    this.keyword = this.keyList[index].keyword;
                    $event.currentTarget.action = this.keyList[index].href;
                }

            }
        },
        computed: {
            searchTypeList: function () {
                return Object.keys(this.searchUrls);
            },
        },
        watch: {
            searchType: function () {
                getSearchType(this.searchType);
            },
            keyList: function () {

            }
        },

    });
   
    return function(option){
        let config = Object.assign({},option);
        searchVm.$mount(config.el).$el.id = config.el.slice(1);
    }
})