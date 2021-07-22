export default"\n\n## 前言\nVue.js 的 API 比 React 稍多，某些 API 的功能有重叠的部分，在实际使用的时候，多少会令人造成困惑。遗憾的是，各种文章、博客理对这些 API 的介绍，都是单独挑出或者泛泛而谈（点名吐槽什么 Vue 传参的 X 种方式）。本文将从对比的角度出发，分析这些功能相似的 API 各自适合那些特定场景。  \n如果觉得文章太长，可以直接跳到【小结】部分。\n\n## props vs $attrs\n\n同样是父组件传入的属性，区别在于： props 中声明的属性会被子组件捕获，并代理到组件实例上，未被捕获的属性会被放入 $attrs 中\n\n```javascript\nexport default {\n\tprops: {\n\t\tuid： Number,\n\t\tname: {\n\t\t\ttype: String,\n\t\t\tdefault: 'Zhangsan'\t\n\t\t},\n\t}\n}\n```\n\n```javascript\n<personal-info :uid=\"1\" name=\"Xiaoming\" mobile=\"123456789\" />\n```\n\nprops 捕获了 `uid` `name` ，所以组件内可以通过 `this.uid` `this.name` 访问。而 `mobile` 没有被翻牌，只好乖乖地排进 `this.$attrs` 里了。\n\n在某些场景下，需要声明一个高阶组件，可以使用 `v-bind=\"$attrs\"` 将当前组件未捕获的属性透传，比如定义一个 button 组件：\n```javascript\n<template>\n\t<button v-bind=\"$attrs\" :disabled=\"loading\">\n\t\t<slot><slot>\n\t</button>\n</template>\n<script type=\"text/javascript\">\n\texport default {\n\t\tprops: {\n\t\t\tloading: Boolean // 除了 loading 其余的属性都被打入 $attrs 中了\n\t\t}\n\t}\n<\/script>\n```\n这样，我们就完成了一个除了 `loading` 以外其他属性和原生 button 一样的组件：\n```javascript\n<my-button \n\tid=\"foo\" \n    class=\"btn normal\" \n    :style=\"buttonStyle\"\n    :loading=\"loading\"\n    @click=\"$alert('你在想🍑')\">点击获得 100 块</my-button>\n```\n\n## data vs computed\n\n`data` 直接意思是数据，确切地说是组件自身的**状态**，可以在组件内进行修改。而 `computed` 起到一个**“归纳”** 的作用，用来合并多个响应式数据，或者对响应式数据做一些逻辑计算，减少模板表达式的长度。\n```javascript\n{\n\tprops: {\n\t\tgradeAverage: Number, // 年级平均成绩\n\t},\n\tdata () {\n\t\treturn {\n\t\t\tstudents: [\n\t\t\t\t{ name: 'xiaoming', score: 93 },\n\t\t\t\t{ name: 'xiaohong', score: 96 },\n\t\t\t\t{ name: 'zhang3', score: 77 },\n\t\t\t\t{ name: 'li4', score: 89 },\n\t\t\t\t{ name: 'wang5', score: 91 }\n\t\t\t]\n\t\t}\n\t},\n\tcomputed: {\n\t\t// 计算平均分\n\t\taverage() {\n\t\t\tconst headCount = this.students.length;\n\t\t\tif (!headCount) {\n\t\t\t\treturn 0;\n\t\t\t}\n\t\t\tconst total = this.students.reduce((acc, student) => acc.score + student.score, 0);\n\t\t\treturn (total / headCount).toFixed(4)\n\t\t},\n\t\t// 计算与年级平均分差值\n\t\tcompareToGrade() {\n\t\t\tconst delta = this.average - this.gradeAverage;\n\t\t\tconst result = delta > 0 ? '高于' : '低于'\n\t\t\treturn `${result} 年级平均 ${Math.abs(delta) 分}`\n\t\t}\n\t}\n}\n```\n\n如果 `computed` 属性同时提供 `get / set` 方法，这个属性也能被赋值:\n```javascript\n{\n\tdata () {\n\t\treturn {\n\t\t\tcash: 50\n\t\t}\t\n\t},\n\tcomputed: {\n\t\tyuan: {\n\t\t\tget() {\n\t\t\t\treturn `${this.cash} 元`\n\t\t\t},\n\t\t\t// v 参数就是等号右边的值\n\t\t\tset(v) {\n\t\t\t\tthis.cash = v\n\t\t\t}\n\t\t}\n\t}\n}\n```\n有了 `set` 方法，我们直接对 `yuan` 进行赋值操作，如 `yuan = 168` ，就能触发 `yuan` 的 `set` 方法，`168` 会作为参数传入。\n\n## watch 与 computed\n\n告诉你们一个秘密：之所以放在一起说，是因为这两个 API 是兄弟关系，它们在源码中有相同的老爹 —— `Watcher`，且看：\n```javascript\nexport default {\n\tdata() {\n\t\treturn {\n\t\t\tparams: {\n\t\t\t\tname: ''\n\t\t\t}\n\t\t}\n\t},\n\twatch: {\n\t\t'params.name' (newVal) {\n\t\t\tif (newVal.length > 20) {\n\t\t\t\talert('名称不得超过 20 个字');\n\t\t\t\tthis.params.name = newVal.slice(20);\n\t\t\t}\n\t\t}\n\t},\n\tcomputed: {\n\t\tinputName: {\n\t\t\tget() {\n\t\t\t\treturn this.params.name;\n\t\t\t},\n\t\t\tset(newVal) {\n\t\t\t\tif (newVal.length > 20) {\n\t\t\t\t\talert('名称不得超过 20 个字');\n\t\t\t\t}\n\t\t\t\tthis.params.name = newVal.slice(0, 20);\n\t\t\t}\n\t\t}\n\t}\n}\n```\n当 vue 实例中的 `params.name` 改变，就会触发这个 watch 函数执行，当对inputName 进行赋值操作，如 `this.inputName = 'xxx'`，就会触发 set 函数执行。\n从语义上来说： watch 强调过程，当你的数据变更时可以用 watcher 处理的副作用。computed 强调的是结果，不管你用什么方法，只要返回值符合你的预期即可。\n\n## methods vs computed\n(三英战 computed)  \n\ncomputed 与 method 不同的是，computed 会把计算结果缓存起来，当内部依赖改变并且**直到下一次访问**时，才会重新执行 get 函数。\n来看例子：一个个人信息表单组件，初始化时从服务端获取数据，现在需要判断 params 的内容比较初始数据是否改过，使用 `method` 和 `computed` 两种方法实现：\n```javascript\n{\n\tdata() {\n\t\treturn {\n\t\t\toldParams: null,\n\t\t\tparams: {\n\t\t\t\tname: '',\n\t\t\t\tage: '',\n\t\t\t}\n\t\t}\n\t},\n\tasync created () {\n\t\tconst info = await fetch('/user/info');\n\t\tObject.assign(this.params, info);\n\t\t// 原版数据因为不需要响应式，所以将它冻结起来\n\t\toldParams = Object.freeze(info);\n\t},\n\tmethods: {\n\t\thasChanged() {\n\t\t\tif (!this.oldParams) {\n\t\t\t\treturn false;\n\t\t\t}\n\t\t\treturn (\n\t\t\t\toldParams.name === params.name \n\t\t\t\t&& oldParams.age === params.age\n\t\t\t)\n\t\t},\n\t},\n\tcomputed: {\n\t\tcomputeChanged () {\n\t\t\tif (!this.oldParams) {\n\t\t\t\treturn false;\n\t\t\t}\n\t\t\treturn (\n\t\t\t\toldParams.name === params.name \n\t\t\t\t&& oldParams.age === params.age\n\t\t\t)\n\t\t}\n\t}\n}\n```\n\n两种方式的代码一模一样，区别在于执行时机： 每次进行 `hasChanged()` 调用时 method 方法都会执行，这点没有疑问。而对于 `computeChanged`：当 `oldParams` 、 `oldParams.name` 、`oldParams.age` 、`oldParams` 、`oldParams` 其中任何一项改变，`computeChanged` 会被标记为 `dirty` ，再次访问 `computeChanged`，才会重新调用这个求值函数，写段代码：\n```\nexport default {\n\tcreated() {\n\t\tthis.computeChanged // computed 第一次调用\n\t\tfor (let i = 0; i < 100; i++) {\n\t\t\tthis.computedChanged // 依赖项没有改变，computed 不会再次调用\n\t\t}\n\n\t\tthis.params.name = 'xxxx' // 依赖项改变， computed 标记为 dirty\n\n\t\tthis.computedChanged // 依赖项改变以后的求值， computed 更新调用\n\t}\n}\n```\n\n不得不说 computed 实乃响应式 API 的精髓，如果希望你的 template 代码变薄，请务必利用好 computed 。\n\n## methods vs filters\n\n相对于 methods， filter 有以下几个特点：\n- filters 只能在 template 中使用\n- filters 相当于管道操作符（熟悉 shell 的程序员非常容易理解），可以将输入数据从左往右传递\n- filters 是上下文无关的，无法在内部访问 this\n- filters 支持全局注入，注入以后无需 import 代码就能在每个实例引用\n\n当你的 value 需要多个函数转换时，可能会出现嵌套现象：\n```javascript\n<span>价格 {{ method1(method2(value || 0)) }}</span>\n```\n\nfilters 可以避免这个问题：\n```javascript\n<span>年龄： {{ value | filter1 | filter2 }}</span>\n```\n\n## watch 与 $watch\n\n上文中的 `watch` 监听是声明式的选项，跟随组件创建和销毁。如果你需要随时撤销监听操作，可以调用组件实例上的 `$watch` ，它的返回值是一个撤销函数，调用即撤销：\n\n```javascript\nexport default {\n\tdata() {\n\t\treturn: {\n\t\t\tparams: {\n\t\t\t\tname: '',\n\t\t\t},\n\t\t\tcancel: null\n\t\t}\n\t},\n\tmethods: {\n\t\tstartWatching() {\n\t\t\t// 将取消函数赋给 data\n\t\t\tthis.cancel = this.$watch('params.name', ()=>{\n\t\t\t\t// do sth\n\t\t\t})\n\t\t},\n\t\tstopWatching() {\n\t\t\tif (!this.cancel) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tthis.cancel();\n\t\t}\n\t}\n}\n```\n\n另外，`$watch` 的第一个参数支持传入函数，以便实现更复杂的触发条件，比如：\n```javascript\nthis.$watch(\n\t// 触发条件\n\t()=> {\n    \tconst { name } = this.params;\n        if (!name) {\n        \treturn '名称不能为空'\n        }\n        if (name.length > 20) {\n        \treturn '名称不能超过 20 个字'\n        }\n    },\n    // 触发回调\n    (message) => {\n    \tif (message) {\n        \talert(message)\n        }\n    },\n    // 延迟执行\n    {\n    \timmediate: false\n    }\n)\n```\n\n## v-model vs .sync\n\n二者都是模板的语法糖，其中 v-model 就是各路文章鼓吹的“双向绑定”，其实没那么玄乎，vue 在模板编译期会把这个指令拆成 value 和 change（或者 input） 事件罢了。由于单向数据流的关系，子组件不能直接修改 props ，需要通过发送事件实现，而 v-model / .sync 在模板层面帮你做了这层封装：\n\n### v-model\n\nv-model 一般用于原生的 input 、 checkbox 、 select 表单作为“双向绑定”指令，当普通组件引用中出现 v-model 指令，会自动推导为 `:value` 和 `@change`。利用这个特性，如果在组件内部拼凑出 `value` 属性和 `change` 事件，也可以完成“双向绑定”效果：\n\n```javascript\n<template>\n\t<div>\n\t\t\x3c!-- 拼凑 value --\x3e\n\t\t<span>{{value}}</span>\n\t\t\x3c!-- 拼凑 @change --\x3e\n\t\t<button @click=\"$emit('change', value + 1)\">+</button>\n\t\t<button @click=\"$emit('change', value - 1)\">-</button>\n\t</div>\n</template>\n\n<script type=\"text/javascript\">\nexport default {\n\tprops: {\n\t\tvalue: Number\n\t}\n}\n<\/script>\n```\n\n外层引用组件时，传入 v-model ，就可以像普通输入框一样使用了！\n```javascript\n<my-counter v-model=\"myCount\" />\n```\n等价于：\n```javascript\n<my-counter :value=\"myCount\" @change=\"v => myCount = v\" />\n```\n\n在 2.2.0+ 版本，vue 支持指定 model 选项，自定义字段名和 event 事件名：\n\n```javascript\n<template>\n\t<div>\n\t\t\x3c!-- 自定义属性 count --\x3e\n\t\t<span>{{count}}</span>\n\t\t\x3c!-- 自定义事件 setCount --\x3e\n\t\t<button @click=\"$emit('setCount', value + 1)\">+</button>\n\t\t<button @click=\"$emit('setCount', value - 1)\">-</button>\n\t</div>\n</template>\nexport default {\n\tmodel: {\n\t\tprop: 'count',\n\t\tevent: 'setCount'\n\t},\n\tprops: {\n\t\tcount: Number\n\t}\n}\n```\n\n注意，一个组件只能定义一个 model，如果希望定义多个，请看下文的 `.sync` 修饰符：\n\n### .sync\n同步属性属性修饰符，通过约定的事件格式，通知父组件同步更新，原理跟 v-model 相似。不同的是，事件名称要遵循 `update:属性` 格式：\n\n```javascript\n<template>\n\t<div>\n\t\t<span>{{count}}</span>\n\t\t<button @click=\"$emit('update:count', count + 1)\">+</button>\n\t\t<button @click=\"$emit('update:count', count - 1)\">-</button>\n\t</div>\n</template>\n\n<script type=\"text/javascript\">\nexport default {\n\tprops: {\n\t\tcount: Number\n\t}\n}\n<\/script>\n```\n外层使用：\n```javascript\n<my-counter :count.sync=\"myCount\" />\n```\n等价于：\n```javascript\n<my-counter :count=\"myCount\" @update:count=\"c => myCount = c\" />\n```\n与 v-model 不同，.sync 可以修饰多个属性\n\n## render vs template\n\n我们平时编写的 template 并不会马上转化为虚拟 DOM 节点，而是先编译成 render 函数。且看官方文档中 `render` 函数的引子：\n\n> Vue 推荐在绝大多数情况下使用模板来创建你的 HTML。然而在一些场景中，你真的需要 JavaScript 的完全编程的能力。这时你可以用渲染函数，它比模板更接近编译器。\n\n说得再直白一点：render 函数是真正创建虚拟 DOM 的函数：\n```javascript\nexport default {\n\trender (createElement) {\n\t\tconst { msg } = this;\n\t\treturn createElement('h3', { style: { color: '#66ccff' } }, `Hello ${msg}`)\n\t}\n}\n```\n最终生成：\n> ### <font color=\"\">Hello World</font>\n\n举个例子：如果提供这么一个 `template` 模板：\n```javascript\n<div><span>{{ msg }}</span></div>\n```\n经过 Vue 的编译，它将变成：\n```javascript\nfunction () {\n\twith(this){\n\t\treturn createElement(\n\t\t\t'div',\n\t\t\t[\n\t\t\t\tcreateElement('span', [ createTextVNode( toString(msg) ) ])\n\t\t\t]\n\t\t)\n\t}\n}\n```\n如文档所言，模板可以更直观地映射 HTML ，但某些特定场景下，直接使用 `render` 函数会比模板更灵活，官方文档中介绍了一种动态标题的示例，根据 `level` 属性决定渲染 `h1` ~ `h6` 标签，使用 `render` 函数可以这么写：\n```javascript\nexport default {\n\tname: 'my-title'\n\tprops: {\n\t\tlevel: {\n\t\t\ttype: Number\n\t\t},\n\t},\n\trender(createElement) {\n\t\t// 获取传入的属性、和插槽（子模板）\n\t\tconst { $attrs, level, $slot } = this;\n\t\tconst children = $slot.default;\n\t\t// 标签名称 h1 ~ h6\n\t\tconst tag = `h${level}`; \n\t\treturn createElement(tag, $attrs, children)\n\t}\n}\n```\n使用： \n```javascript\n<my-title :level=\"1\" style=\"color:#333\">这是 h1</my-title>\n<my-title :level=\"2\" style=\"color:#666\">这是 h2</my-title>\n<my-title :level=\"3\" style=\"color:#999\">这是 h3</my-title>\n```\n\n试想一下：如果我们使用 `template` 语法来实现的话就要声明6个 `v-if` 模板，非常啰嗦。不过 render 函数也是一把双刃剑：使用 render 函数无法使用 `v-model` 这个模板专属的语法糖，同时也失去了静态模板优化的可能性（有得必有失）。\n\n也许你已经发现： `createElement` 的思路与 `React.createElement` 一脉相承。既然可以通过 JSX 编写 ReactElement ，能否使用 JSX 编写 render 函数呢？答案是肯定的：根据官方文档介绍，通过这个 [Babel 插件](https://github.com/vuejs/jsx)，就能在 Vue 文件中愉快地使用JSX了，详情移步[官方文档](https://cn.vuejs.org/v2/guide/render-function.html#JSX)\n\n## functional vs stateful\n\n\n假如你的组件本身不需要响应式数据，所有的行为都受控父组件的输入，不妨对这个组件添加 `functional` 属性：\n\n```javascript\nexport default {\n\t// 标记为函数式\n\tfunctional: true,\n\tname: 'my-button',\n\tprops: {\n\t\ttype: String,\n\t\tstyle: [Object, String]\n\t},\n\trender (h, context) {\n\n\t\tconsole.log(this); // 函数式组件没有 this，为 undefined\n\t\t// 函数式组件的上下文 context\n\t\t// 注意因为没有 this 所以上下文属性就不能叫做实例属性了，名称开头不带 $\n\t\tconst { props, slot, listeners } = context; \n\t\tconst { type = 'info', style } = props;\n\t\t// 根据 type 决定背景颜色\n\t\tconst backgroundColor = {\n\t\t\tdanger: 'red',\n\t\t\tsuccess: 'green',\n\t\t\tinfo: 'blue',\n\t\t\tdisabled: 'gray'\n\t\t}[type];\n\n\t\treturn h(\n\t\t\t'button', \n\t\t\t{\n\t\t\t\t'class': 'my-btn',\n\t\t\t\tstyle: {\n\t\t\t\t\tcolor: 'white',\n\t\t\t\t\toutline: 'none',\n\t\t\t\t\tbackgroundColor,\n\t\t\t\t\t...style,\n\t\t\t\t},\n\t\t\t\ton: listeners\n\t\t\t},\n\t\t\tslot.default\n\t\t)\n\t}\n\n}\n```\n\n上面的代码是为了实现一个简单的样式 button ， 因为添加了 `functional: true` 属性，这个组件就变成了一个**函数式组件**，与普通的组件（我称之为 **stateful 组件**）不同，它是无状态的，不能访问 this ，需要借助 `context` 对象，同时 `data` 、 `computed` 、 `watch` 等响应式 API 无法使用（只能响应父组件的）。但是它更为轻量，比 stateful 组件创建减少了不必要的开销。\n\n另外，如果需要使用函数式模板，在 template 标签中添加 `functional` 属性即可，这里又偷懒直接用官方示例：\n```javascript\n<template functional>\n\t<button class=\"my-button\" v-bind=\"data.attrs\" v-on=\"listeners\">\n\t\t<slot></slot>\n\t</button>\n</template>\n```\n正常组件 template 被包裹在 `this` 中，而函数式组件就被包裹为 `context` 中，可以直接引用 `context` 上的属性。\n\n## $set vs assignment 赋值\n```javascript\nexport default {\n\tdata () {\n\t\tparams: {\n\t\t\tname: ''\n\t\t}\n\t},\n\tmethods: {\n\t\tsetAge (age) {\n\n\t\t\tif (!age) {\n\t\t\t\tdelete this.params.age;\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tthis.params.age = age;\n\t\t}\n\t}\n}\n```\n\n由于 `Object.defineProperty` 的局限，直接对对象进行添加/删除属性操作是无法被监听的，需要换成 `vm.$set` 和 `vm.$delete`：\n```javascript\nsetAge(age) {\n\tif (!age) {\n\t\tthis.$delete(this.params, 'age');\n\t\treturn;\n\t}\n\tthis.$set(this.params, 'age', age);\n}\n```\n\n## 小结\n\n- `props` 中声明的属性会被捕获并挂在组件实例上，否则会挂进 `$attrs` 中\n- 使用 `v-bind=\"$attrs\"` 可以实现属性透传\n- `data` 可以理解为组件中的响应式状态\n- `watch` 与 `computed` 都是 `Watcher` 的实例。 `watch` 注重过程和副作用，`computed` 注重结果\n- `computed` 具有缓存响应式依赖的效果\n- `filters` 可以理解为模板的管道操作符，与上下文（组件实例）无关\n- `$watch` 是挂在组件实例上的方法，可以随时调用和撤销，支持复杂的触发条件\n- `v-model` 是 `value` 与` @change` 的合体，组件中唯一\n- `.sync` 是约定化的父子组件通信，组件中可以定义多个\n- `render` 是真正生成虚拟 DOM 的方法，`template` 最终会被编译成 `render` 函数。直接使用 `render` 函数可以更灵活地处理组件表现逻辑。\n- `functional` 是无状态的组件\n- 如果需要对响应式数据添加/删除属性，需要借助 `$set/$delete` 方法。\n";
