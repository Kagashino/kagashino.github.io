export default"2019.2.25 之前写的罗里吧嗦的，容易绕进去，现已更新\n\nthis是JavaScript的【关键字】，它不同于其他语言一样指向当前类的实例，JavaScript 中，函数的调用方式不同，this 指向也跟着变化，大致就4种情况：\n\n### 一、函数挂在哪里调用，this指向哪里：\n 对象引用调用，this指向该对象：\n```\nvar person = {\n  introduce:function(){\n    console.log(this) \n  }\n}\nperson.introduce()// 打印person对象\n```\n### 二、new调用后，this指向实例：\nnew调用，可以理解为'新'开辟了一个作用域（个人理解），this指向实例：\n```\nfunction Person(){\n  console.log(this)\n  this.itself = this;\n}\nvar xm = new Person();// 打印xm，返回xm\nconsole.log(xm.itself === xm) //true\n```\n### 三、函数直接调用，this指向全局（严格模式下为undefined）\n非严格模式下，不挂在任何对象下的函数调用，this指向全局（浏览器的全局为window，amd/cmd等node环境下为global）\n\n```\nfunction outside(){\n  console.log(this)\n}\noutside()// 全局\n```\n用 1 中的例子，原本person.introduce为对象方法，但是脱离了对象，作用域也不再跟对象绑定\n```\nvar person = {\n  name:'xiaoming',\n  introduce:function(){\n    console.log(this) \n  }\n}\nperson.introduce()// person对象\n\nvar foo = person.introduce\nfoo()//window或者global\n```\n\n注意，如果将构造函数直接调用，不但不能派生实例，同时会让this指向全局，影响全局变量：\n```\nfunction Animal(name,age,color){\n  this.name = name;\n  this.age = age;\n  this.color = color;\n}\n//bad\nvar dog = Animal('yaya',2,'white');\nconsole.log(dog);// dog并没有实例化Animal，故作为普通函数调用，然而Animal也没有返回值，故为undefined\n//函数一经调用，全局变量受到了影响\nconsole.log(name);// yaya\nconsole.log(age);// 2\nconsole.log(color);// white\n\n```\n严格模式下，原本指向全局变量的this都会变为undefined\n```\nfunction outside(){\n  'use strict'\n  console.log(this)\n}\noutside()// undefined\n```\nuse strict也是有作用域的，对于不在其作用域链的函数，他管不着\n```\nvar person = {\n  noStrict:function(){\n    var printThis = function(){//非严格模式下\n      console.log(this)\n    }\n    printThis()\n  },\n  introduce:function(){\n    'use strict'\n    var you = function(){//这个函数处于严格模式的作用域内\n        console.log(this)\n    }\n    you()//   1\n    console.log(this)//   2\n  }\n  \n}\nperson.introduce()// 1:undefined 2:person\nperson.noStrict()// window/global\n```\n\n### 四、调用了call/apply/bind的函数，this指向call/apply/bind的第一个参数**(即如何改变this的指向)**：\ncall/apply/bind三者皆为Function.prototype中的方法，且看：\n```\nvar Father = {\n   name:\"nibaba\",\n   callname:function(){\n    console.log(this.name)\n  }\n}\nvar son = {\n  name:\"guai'erzi\",\n}\nFather.callname() //nibaba\nFather.callname.call(son) // guai'erzi\n```\n\n\n对于apply效果完全一样，call和apply的不同在于：call第一个参数（上文中的son）后面跟函数确切的参数，apply后面跟数组作为参数组\n\n**有啥用（举例说明）：**\n在没有拓展运算符 **...** 的ES版本（ES6之前），call/apply，可以让类数组对象使用数组的方法\n```\n//检测数字5作为第几个参数传入的，没有5返回0\nfunction whichIsFive(){\n  return arguments.indexOf(5)+1//-*- tips -*-argument是一个类数组对象，\n//并不是数组，故无法调用数组的indexOf方法\n}\nwhichIsFive(1,1,1,1,1,5,1)//报错\n```\n使用call，就能让arguments调用数组方法：\n```\n//检测数字5作为第几个参数传入的，没有5返回0\nfunction whichIsFive(){\n  return Array.prototype.indexOf.call(arguments,5)+1\n//-*- tips -*-注意indexOf挂在prototype上\n}\nwhichIsFive(1,1,1,1,1,5,1)//6\nwhichIsFive(1,1,5,1,1,3,1)//3\nwhichIsFive(2,2,2,2,2)//0\n```\n或者调用数组的slice方法，根据一个类数组对象（只要有具有length属性）生成一个新的、真正的数组：\n```\nvar arrLike = {\n\t'0':1,\n\t'1':2,\n\t'2':3,\n\t'3':4,\n\t'4':5,\n\tlength:5//-*- tips -*-:length填多少，数组长度就是多少\n}\nvar realArray = Array.prototype.slice.call(arrLike)\n```\n再比如，使用apply输出一数组个中最大/最小值：\n```\nfunction maxElement(list){\n\treturn Math.max.apply(null,list);//最小值方法为Math.min\n}\nmaxElement([1,2,66666,4,5]);//66666\n```\n\n**bind方法**\n同样是一个改变this的方法，这个方法会返回原函数的一个拷贝，原函数不执行：\n```\nvar age = 99//window.age\nfunction getAge(){\n  console.log(this.age);\n}\nvar xiaoming = {\n  age:18\n}\nvar xiaohong = {\n  age:16\n}\n\nvar getXiaomingAge = getAge.bind(xiaoming)\ngetAge()//99\ngetXiaomingAge()//18\ngetAge.call(xiaohong)//16\nconsole.log(getXiaomingAge === getAge) //false\n```\n最后放张图，一图胜千言：\n\n![this指向](https://upload-images.jianshu.io/upload_images/3132311-ad4f14efb03f7bbe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)\n\n\n\n当然，在ES6中，你有更多的方式避免踩入this的陷阱，详见：\n\n[**ES6箭头函数(=>)和拓展运算符(...)**](https://www.jianshu.com/p/1cf9f3592942)\n";
