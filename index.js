function DropList(options) {
  this.config = {
    parentCls: ".parentCls", // 父元素class
    inputElemCls: '.inputElem', // 当前input标签input的class
    inputWidth: 100, // 目标元素的宽度
    selectCls: ".caret", // 下来小箭头class
    hoverBg: "hoverBg", // 鼠标移上去的背景
    isSelectHide: true, // 点击下拉框 是否隐藏
    timeId: 100, // 默认多少毫秒消失下拉框
    // 数据源返回的格式如下：静态数据 否则的话(如果数组为空的话) 在内部发post请求
    dataSource: [
      { text: "列表项1", value: 1 },
      { text: "列表项2", value: 2 },
      { text: "列表项3", value: 3 },
      { text: "列表项4", value: 4 },
      { text: "列表项5", value: 5 },
      { text: "列表项6", value: 6 },
      { text: "列表项7", value: 7 },
      { text: "列表项8", value: 8 },
      { text: "列表项9", value: 9 },
      { text: "列表项10", value: 10 },
      { text: "列表项11", value: 11 }
    ],
    renderHTMLCallback: null, // keyup时 渲染数据后的回调函数
    callback: null // 点击某一项 提供回调
  };

  this.cache = {
    onlyCreate: true, // 只渲染一次代码
    currentIndex: -1,
    oldIndex: -1,
    timeId: null // setTimeout定时器
  };
  this.init(options);
}
console.log(DropList.prototype);
DropList.prototype = {
  constructor: DropList,
  init: function(options) {
   // this.config = $.extend(this.config, options || {});
    console.log(this.config);
    var self = this,
        flag = true,
      _config = self.config,
      _cache = self.cache;
      console.log(_config.inputWidth);
      console.log(_config.inputElemCls);
   // $(".drop-trigger").css({ marginLeft: _config.inputWidth - 20 + "px" });
    /* 
         * 鼠标点击输入框时 渲染数据
         */
        // document.getElementsByClassName("inputElem")[0].each(function(index,item){
        //     console.log(item);
        // })
        document.getElementsByClassName("inputElem")[0].addEventListener("keyup",function(e){
            var e = e||event;
        })
    $(_config.inputElemCls).each(function(index, item) {
      // 对input定义宽度 其父节点div也是根据input宽度定义的。
      console.log(item);
      $(item).css({ width: _config.inputWidth });
      var tagParent = $(item).closest(_config.parentCls);
      $(tagParent).css({ width: _config.inputWidth });

      $(item).bind("keyup", function(e) {
        e.preventDefault();
        var targetVal = $.trim($(this).val()),
            keyCode = e.keyCode,
            elemHeight = $(this).outerHeight();
            console.log(targetVal);
        var targetParent = $(this).closest(_config.parentCls);
            console.log(targetParent);
        $(targetParent).css({ position: "relative" });

        // 删除标识
        self._removeState(targetParent);

        var curIndex = self._keyCode(keyCode);
        if (curIndex > -1) {
          // 除了列举那些键码不发请求
          self._keyUpAndDown(targetVal, e, targetParent);
        } else {
          // 渲染数据
          self._renderHTML(targetVal, targetParent, elemHeight);
          flag=false;
          // 如果值为空的话 那么下拉列表隐藏掉
          if (targetVal == "") {
              console.log(self);
            self._hide(targetParent);
            _cache.currentIndex = -1;
            _cache.oldIndex = -1;
            console.log(self);
          } else {
            self._show(targetParent);
          }
        }
      });
    //点击三角图标渲染数据
     
      var targetParent = $(item).closest(_config.parentCls);
      $(_config.selectCls, targetParent).unbind("click");
      $(_config.selectCls, targetParent).bind("click", function() {
          if(flag==true){
             var targetVal = $.trim($(item, targetParent).val()),
               elemHeight = $(item, targetParent).outerHeight();
             // 渲染数据
             self._renderHTML(targetVal, targetParent, elemHeight);
             flag=false;
          }else{
              //隐藏下拉列表
              self._hide(targetParent);
              _cache.currentIndex = -1;
              _cache.oldIndex = -1;
              flag=true;
          }
        
      });
    });

    /*
         * 点击document 不包括input输入框时候 隐藏下拉框
         */
    $(document).unbind("click");
    $(document).bind("click", function(e) {
      e.stopPropagation();
      console.log(e.target);
      var target = e.target,
        targetParent = $(target).closest(_config.parentCls);
      var reg = _config.inputElemCls.replace(/^\./, ""),
        selectCls = _config.selectCls.replace(/^\./, "");
      if (
        $(target, targetParent).hasClass(reg) ||
        $(target, targetParent).hasClass(selectCls)
      ) {
        return;
      } else {
        self._hide(targetParent);
      }
      $(_config.inputElemCls).each(function(index, item) {
        if (!$(item).hasClass("state")) {
          $(item).val("");
        }
      });
    });
  },
  // 键码判断
  _keyCode: function(code) {
    var arrs = [
      "17",
      "18",
      "38",
      "40",
      "37",
      "39",
      "33",
      "34",
      "35",
      "46",
      "36",
      "13",
      "45",
      "44",
      "145",
      "19",
      "20",
      "9"
    ];
    for (var i = 0, ilen = arrs.length; i < ilen; i++) {
      if (code == arrs[i]) {
        return i;
      }
    }
    return -1;
  },
  _renderHTML: function(targetVal, targetParent, elemHeight) {
    var self = this,
      _config = self.config,
      _cache = self.cache;

    // 如果已经渲染了 先清空数据
    if ($("ul", targetParent).length > 0) {
      self._show(targetParent);
      $("ul", targetParent).html("");
    }
    if (_cache.onlyCreate) {
      $(targetParent).append($("<ul></ul>"));
      _cache.onlyCreate = false;
    }
    var html = "";
    /*
             * 如果设置了静态数据的话 那么直接使用静态数据 否则的话 发post请求
             * 由于代码没有用 模板 所以直接for循环
             */

    if (_config.dataSource.length > 0) {
      for (var i = 0, ilen = _config.dataSource.length; i < ilen; i += 1) {
        if (_config.dataSource[i].text.indexOf(targetVal) >= 0) {
          html +=
            '<li class="dropmenu-item p-index' +
            i +
            '" data-value="' +
            _config.dataSource[i].value +
            '" data-title="' +
            _config.dataSource[i].text +
            '">' +
            _config.dataSource[i].text +
            "</li>";
        } else {
          $("ul", targetParent).css({ border: "none" });
        }
      }

      $("ul", targetParent).append(html);
    } else {
      // 发post请求
      /**$.ajax({
                    type: 'post'
                });**/

      // 假如返回的数据 如上所示的格式
      var result = [
        { text: "列表项1", value: 1 },
        { text: "列表项2", value: 2 },
        { text: "列表项3", value: 3 },
        { text: "列表项4", value: 4 },
        { text: "列表项5", value: 5 },
        { text: "列表项6", value: 6 },
        { text: "列表项7", value: 7 },
        { text: "列表项8", value: 8 },
        { text: "列表项9", value: 9 },
        { text: "列表项10", value: 10 },
        { text: "列表项11", value: 11 }
      ];
      for (var i = 0, ilen = result.length; i < ilen; i += 1) {
        if (result[i].text.indexOf(targetVal) >= 0) {
          html +=
            '<li class="dropmenu-item p-index' +
            i +
            '" data-value="' +
            result[i].value +
            '" data-title="' +
            result[i].text +
            '">' +
            result[i].text +
            "</li>";
        } else {
          $("ul", targetParent).css({ border: "none" });
        }
      }
      $("ul", targetParent).append(html);
    }
    $("ul", targetParent).css({
      width: _config.inputWidth,
      overflow: "hidden",
      border: "1px solid #ccc",
      "border-top": "none"
    });
    $("ul,li", targetParent).css({ cursor: "pointer" });

    var len = $("li", targetParent).length;
    if (len >= 10) {
      $("ul", targetParent).css({ height: "220px", overflow: "scroll" });
    } else {
      $("ul", targetParent).css({ height: "auto", overflow: "hidden" });
    }
    // hover事件
    self._hover(targetParent);
    // 渲染后回调函数
    _config.renderHTMLCallback &&
      $.isFunction(_config.renderHTMLCallback) &&
      _config.renderHTMLCallback();

    // 点击下来框某一项
    self._clickItem(targetParent);
  },
  /*
     * 键盘上下移操作
     * @method _keyUpAndDown
     * @param  targetVal,e,targetParent
     */
  _keyUpAndDown: function(targetVal, e, targetParent) {
    var self = this,
      _config = self.config,
      _cache = self.cache;

    // 如果请求成功后 返回了数据(根据元素的长度来判断) 执行以下操作
    if ($("li", targetParent) && $("li", targetParent).length > 0) {
      var plen = $("li", targetParent).length,
        keyCode = e.keyCode;
      _cache.oldIndex = _cache.currentIndex;
      // 上移操作
      if (keyCode == 38) {
        if (_cache.currentIndex == -1) {
          _cache.currentIndex = plen - 1;
        } else {
          _cache.currentIndex = _cache.currentIndex - 1;
          if (_cache.currentIndex < 0) {
            _cache.currentIndex = plen - 1;
          }
        }
        if (_cache.currentIndex !== -1) {
          !$($("li", targetParent)[_cache.currentIndex]).hasClass(
            _config.hoverBg
          ) &&
            $($("li", targetParent)[_cache.currentIndex])
              .addClass(_config.hoverBg)
              .siblings()
              .removeClass(_config.hoverBg);
          var curAttr = $($("li", targetParent)[_cache.currentIndex]).attr(
            "data-title"
          );
          $(_config.inputElemCls, targetParent).val(curAttr);

          // 给当前的input元素增加一个标识
          self._state(targetParent);
        }
      } else if (keyCode == 40) {
        //下移操作
        if (_cache.currentIndex == plen - 1) {
          _cache.currentIndex = 0;
        } else {
          _cache.currentIndex++;
          if (_cache.currentIndex > plen - 1) {
            _cache.currentIndex = 0;
          }
        }
        if (_cache.currentIndex !== -1) {
          !$($("li", targetParent)[_cache.currentIndex]).hasClass(
            _config.hoverBg
          ) &&
            $($("li", targetParent)[_cache.currentIndex])
              .addClass(_config.hoverBg)
              .siblings()
              .removeClass(_config.hoverBg);

          var curAttr = $($("li", targetParent)[_cache.currentIndex]).attr(
            "data-title"
          );
          $(_config.inputElemCls, targetParent).val(curAttr);

          // 给当前的input元素增加一个标识
          self._state(targetParent);
        }
      } else if (keyCode == 13) {
        //回车操作
        var curVal = $($("li", targetParent)[_cache.currentIndex]).attr(
          "data-title"
        );
        $(_config.inputElemCls, targetParent).val(curVal);

        // 给当前的input元素增加一个标识
        self._state(targetParent);

        // 点击下拉框某一项是否隐藏 下拉框 默认为true
        if (_config.isSelectHide) {
          self._hide(targetParent);
        }
        _cache.currentIndex = -1;
        _cache.oldIndex = -1;

        // 点击某一项后回调
        _config.callback &&
          $.isFunction(_config.callback) &&
          _config.callback();

        // 按enter键 阻止form表单默认提交
        return false;
      }
    }
  },
  // 给当前的input元素增加一个标识 目的是判断输入值是否合法
  _state: function(targetParent) {
    var self = this,
      _config = self.config;
    !$(_config.inputElemCls, targetParent).hasClass("state") &&
      $(_config.inputElemCls, targetParent).addClass("state");
  },
  // 删除input标识
  _removeState: function(targetParent) {
    var self = this,
      _config = self.config;
    $(_config.inputElemCls, targetParent).hasClass("state") &&
      $(_config.inputElemCls, targetParent).removeClass("state");
  },
  /*
     * hover 下拉框
     */
  _hover: function(targetParent) {
    var self = this,
      _config = self.config;

    $(".dropmenu-item", targetParent).each(function(index, item) {
      $(item).hover(
        function() {
          !$(item).hasClass(_config.hoverBg) &&
            $(item).addClass(_config.hoverBg);
        },
        function() {
          $(item).hasClass(_config.hoverBg) &&
            $(item).removeClass(_config.hoverBg);
        }
      );
    });
  },
  /*
     * 点击下拉框某一项
     * @method _clickItem
     */
  _clickItem: function(targetParent) {
    var self = this,
      _config = self.config;
    $(".dropmenu-item", targetParent).each(function(index, item) {
      $(item).unbind("click");
      $(item).bind("click", function(e) {
        var target = e.target,
          title = $(target).attr("data-title");
        $(_config.inputElemCls, targetParent).val(title);

        // 给当前的input元素增加一个标识 目的是判断输入值是否合法
        !$(_config.inputElemCls, targetParent).hasClass("state") &&
          $(_config.inputElemCls, targetParent).addClass("state");

        // 点击某一项后回调
        _config.callback &&
          $.isFunction(_config.callback) &&
          _config.callback();

        // 点击下拉框某一项是否隐藏 下拉框 默认为true
        if (_config.isSelectHide) {
          self._hide(targetParent);
        }
      });
    });
  },
  /*
     * 显示方法
     * @mrthod _show {private}
     */
  _show: function(targetParent) {
    var self = this,
      _config = self.config,
      _cache = self.cache;
    _cache.timeId && clearTimeout(_cache.timeId);
    if ($("ul", targetParent).hasClass("hidden")) {
      $("ul", targetParent).removeClass("hidden");
    }
  },
  /*
     * 隐藏方法
     * @method _hide {private}
     */
  _hide: function(targetParent) {
    var self = this,
      _config = self.config,
      _cache = self.cache;
    _cache.timeId = setTimeout(function() {
      if ($(targetParent).length > 0) {
        !$("ul", targetParent).hasClass("hidden") &&
          $("ul", targetParent).addClass("hidden");
      } else {
        !$("ul").hasClass("hidden") && $("ul").addClass("hidden");
      }
    }, _config.timeId);
  },
  /*
     * 给输入框设置默认值
     * @param {Object}
     * @method setValue {public}
     */
  setValue: function(obj) {
    /** 对象格式如下
        // 设置初始化选择项。
        selectedItem: {
            value: "4",
            text: "列表项4"
        }**/
    var self = this,
      _config = self.config;
    $(_config.inputElemCls).val(obj.text);
  },
  /*
     * 获取输入框的值
     * @return value
     */
  getValue: function() {
    var self = this,
      _config = self.config;
    return $(_config.inputElemCls).val();
  }
};
// 初始化
$(function() {
  var a = new DropList({
    dataSource: []
  });
  var selectedItem = {
    value: "4",
    text: "列表项4"
  };
  a.setValue(selectedItem);
});
