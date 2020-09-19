# vue_shop
Project based on Vue
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

The interface is used by others<br>
So it may be inconsistent with the actual effect

```
------------------------
弹幕提示：
没有router.js的看看你的router文件夹，里面有个index.js，一样的（视频有router.js）
提示:现在router文件已经变成router/index.js了
在vue页面中的 style 里面的scoped 是表示在单页面的CSS效果 不会和其他什么的css页面起冲突 
这是css3的内容，box-size:border-box(以边框为界限调整边距),content-box(以内容为边界调整边距)
axios挂载到原型上方便使用啊
一个函数的返回值是promise(peding),可以使用aysnc+await形式进行改造
jsp淘汰了兄弟，做前后端分离用Restful风格的API，不做前后端分离Springboot官方推荐用Thymeleaf来做渲染模板
如果两个变量同时指向同一个对象，他们指向的是对象在内存中的地址而已，如果通过变量x改变了对象，那么变量y因为指向的是对象的地址，通过地址查找到这个对象，所以变量y也会改变
扩展运算符，展开数组用的，比如 a=[1,2,3]， b = [...a] 就对等 [1,2,3]，并且是深拷贝而非浅拷贝(这个知识自己查)
...这个是解析数组  也可以解析对象
(插槽)更精简的#变量='scope'
el-form-item el-input 里面的校验规则的时候prop和v-model属性名要一致，不然校验会不通过的
如果是get请求，就必须写成{params:请求体}
javascript  字符串slice indexOf  数组findIndex filter
var obj = Json.parse(Json.stringfy(origin)); 经典面试题：实现深拷贝有两种常用方法，一是递归，二是JSON.stringify
JSON.parse(JSON.stringify(this.addForm))，可以深拷贝吧
在vue.config.js 修改路径"/"为"./" 就可以让文件打包的更加好


ssr指的是服务器端的 spa指的是客户端的

在params.vue页面中遇到的result的 undefine问题 是因为我把判断result的语句放在外面了 以至于undefine


:props="{ expandTrigger: 'hover' , value: 'cat_id',  label: 'cat_name',  children: 'children'}"
在全局样式里设置固定高度可解决. .el-cascader-menu {     height: 450px; }

./表示当前目录
../表示父级目录
/表示根目录


------------------------

在控制台 输入vue ui 可以进入网页控制台 看看有没有什么安装了
vscode的格式化 快捷键 alt+shift+f


npm install axios --save

npm install element-ui --save
cnpm i element-ui -S

npm install less-loader --save-dev 
cnpm install less-loader --save-dev

npm install less --save-dev
npm install less less-loader --save-dev 用这个命令安装


启动服务
npm run serve

卸载校验格式的
npm rm eslint

在email规则中，加入一条新规则{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"],}
```

![截图1](https://github.com/fxuyu/Vue-Shop/blob/master/image/1.PNG)
<br>
![截图2](https://github.com/fxuyu/Vue-Shop/blob/master/image/2.PNG)
<br>
![截图3](https://github.com/fxuyu/Vue-Shop/blob/master/image/3.PNG)
<br>
![截图4](https://github.com/fxuyu/Vue-Shop/blob/master/image/4.PNG)
<br>
![截图5](https://github.com/fxuyu/Vue-Shop/blob/master/image/5.PNG)
<br>
![截图6](https://github.com/fxuyu/Vue-Shop/blob/master/image/6.PNG)





