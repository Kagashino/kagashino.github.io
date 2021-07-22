export default'众所周知，Vue.js是单向数据流不建议子组件直接修改父组件的数据，官方理由是：子组件修改父组件的值会让你的数据流变得难以理解。\n那么为什么总是有文章去介绍“Vue双向绑定”呢，原因是通过类比angular的`ng-model`，得出了“vue也有自己的model语法，所以vue也存在双向绑定”的结论。\n事实上这个`v-model`本质还是语法糖，在 Vue 编译 template 时，碰到 `v-model` 就将它拆解成 **属性值** `:value`与**变更事件**`@input`：\n```\n<input v-model="myName" />\n\x3c!-- 等价于 --\x3e\n<input :value="myName" @input="myName = $event.target.value" />\n```\n当然，不同的html输入框，更改数据的事件也不同，比如checkbox/select的事件为`@change`\n### 论证\n为了验证上面说法的正确性，我们写下这段代码：\n```\n<input v-model="myName" v-whatever="\'with-model\'" />\n\x3c!-- 等价于 --\x3e\n<input :value="myName" @input="myName = $event.target.value" v-whatever="\'no-model\'" />\n```\nvue的指令可以获取当前元素更新前/后的`虚拟节点`。我们通过`whatever`指令(whatever表示随便什么名字都行)，打印这两个输入框`虚拟节点`，看看这两个输入框配置了什么东西：\n```\nVue.directive(\'whatever\', function (el, data, afterNode ) {\n  console.log(data.value, afterNode)\n})\n```\n![no-model.PNG](https://upload-images.jianshu.io/upload_images/3132311-471820cfd5bc23b1.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)\n\n![with-model.PNG](https://upload-images.jianshu.io/upload_images/3132311-fb6e03ee75469a39.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)\n\n重点是涂标记的地方，可以清楚地看到，v-model和传统写法，都有value的绑定值和input事件回调，基本验证了我们的想法\n\n### 灵活运用\n如果你对v-model还停留在输入框/单选/复选表单的阶段，不妨看一下下面的例子：\n##### 代理数据\n> Evan You 给了你 v-model ，你却还在使用 watch 处理副作用\n\n假如有一个需求：服务器将一个数字以16进制存储，但是要求前端以10进制展示和输入，提交的时候将10进制转化为16进制发送回服务端，我们通过v-model做一层代理：\n```\n<template>\n    <div>\n        你输入的数字：<input type="number" v-model="decimal">\n        <h3>16进制为：{{hex}}</h3>\n    </div>\n</template>\n<script>\nexport default {\n    data () {\n        return {\n            hex: \'ff\' // 10进制表示255\n        }\n    },\n    computed: {\n        decimal: {\n            get () {\n                return Number.parseInt(this.hex, 16)\n            },\n            set (value) {\n                const dec = Number(value) || 0; \n                this.hex = dec.toString(16)\n            }\n        }\n    }\n}\n<\/script>\n```\n通过这层代理，服务端无需关心10进制，用户也无需关心16进制，前端也不需要在别的地方写多余的转换方法，一举三得啊有木有！\n\n##### 组件封装\n以最简单的计数器为例，结合2.2.0+版本的`model`选项，我们可以自定义组件的`model`属性值和变更事件名（之所以命名为count和set_count是为了说明字段名称可以起任意合法名字）\n```\n<template>\n  <div>\n     <h3>点击次数{{ count }}</h3>\n     <button @click="$emit(\'set_count\', count + 1)">增加</button>\n     <button @click="$emit(\'set_count\', count - 1)">减少</button>\n     <button @click="$emit(\'set_count\', 0)">归零</button>\n  </div>\n</template>\n<script type="text/javascript">\n  export default {\n    model: {\n      prop: \'count\',\n      event: \'set_count\'\n    },\n    props: {\n      count: Number,\n    }\n  }\n<\/script>\n```\n引用这个组件的时候，只需要这么写(假设将上面的组件import为`myCounter`)\n```\n<my-counter v-model="countValue" />\n```\n对比不使用v-model的写法，简洁多了：\n```\n<my-counter :count="countValue" @set_count"count=> countValue = count" />\n```\n\n##### 简化Vuex\n我们知道，同步修改Vuex中store的数据必须通过`commit`完成，如果想要使用`v-model`绑定vuex，可以结合`computed`（`watch`也可以，因为都是`watcher`）实现：\n```\n<template>\n  <input v-model="myName" />\n</template>\n<script>\nexport default {\n  computed: {\n    myName: {\n      get() {\n        return this.$store.state.name;\n      },\n      set(value) {\n         this.$store.commit(\'SET_NAME\', name)\n      }\n   }\n  }\n}\n<\/script>\n```\n\n稍微封装一下(不考虑state的命名空间，如果需要命名空间，可以考虑把state换成getters)： \n```\n/**\n* 传入一个对象，键名作为state名，值作为Mutation字符串\n*/\nfunction mapModels (models) {\n   const mapped= {}\n   Object.keys(models).forEach(prop=> {\n      const stateName = prop\n      const mutationName = models[prop]\n      mapped[stateName] = {\n        get () { return this.$store.state[stateName] },\n        set (value) { this.$store.commit(mutationName, value) }\n      }\n   })\n  return mapped;\n}\n```\n用法：\n```\n<template>\n  <form>\n    姓名：<input v-model="myName" />\n    年龄：<input v-model="myAge" type="number" />\n    是否单身： <input v-model="singleDog" type="checkbox" />\n   </form>\n</template>\n<script>\nimport { mapModels } from \'/path/to/method\'\nexport default {\n  computed: {\n    ...mapModels ({\n      myName: \'SET_NAME\',\n      myAge: \'SET_AGE\',\n      singleDog: \'TOGGLE_SINGLE\',\n    })\n  }\n}\n<\/script>\n```\n是不是很简洁啊？\n另外提一句：上面运用的代码都是我边写文章边顺手敲的，还没来得及测试（有空会验证的：-）\n### 小结\n- `v-model`本质是`value`属性和`变更事件`事件的语法糖\n- 不同的html输入框，`v-model`的事件名略有不同如`@input`、`@change`等\n- 配置`model`选项可以让你的自定义组件使用`v-model`语法\n- 结合`computed`，可以实现`v-model`绑定`vuex`的`store`\n';
