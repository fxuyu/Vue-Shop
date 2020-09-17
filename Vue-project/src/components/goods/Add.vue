<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 :space="200" 删掉就居中 字符串+任何都是字符串  - /  % 都可以隐式转换nuber类型 所以 -0 让他字符串转换成number 也可以这样:active="parseInt(activeIndex)"-->
      <el-steps
        :active="activeIndex - 0"
        finish-status="success"
        align-center
        process-status="process"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <!-- type="number"只能输入数值 -->
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item labei="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name' ,children:'children' }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <!-- <el-input v-for="(cb, i) in item.attr_vals" :key="i" v-model="item.attr_vals[i]"> -->
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--action表示图片要上传到的后台API地址  也可以在下面定义 uploadURL : this.$http.defaults.baseURL + "/upload"-->
            <!--on-preview是点击图片或者文字 触发什么效果  -->
            <!-- on-remove是点击图片的X按钮的时候 触发效果 -->
            <!-- list-type 是文件上传到缓存中的展现效果 这里展现的是 缩略图效果 -->
            <!-- on-success只要上传成功就会调用事件 -->
            <el-upload
              action="http://www.ysqorz.top:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="add_goods" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog
  title="图片预览"
  :visible.sync="previewVisible"
  width="50%"
  >
  <img :src="previewPath" alt="" class="previewImg"> 
  <!-- npm install vue-quill-editor --save -->
  
</el-dialog>


  </div>
</template>

<script>
export default {
  data() {
    return {
      //他们说不用加单引号 因为js会自己隐式转换 将字符串转为数字
      activeIndex: 0,
      //添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        //图片的数组
        pics:[],
        //商品的具体描述 
        goods_introduce:'',
        attrs:[]
      },
      //校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      //商品分类列表
      cateList: [],
      //动态参数列表数据
      manyTableData: [],
      //静态属性列表数据
      onlyTableData: [],
      //图片上传组件的headers请求头对象
      //给上传组件添加token值,这样服务器才接受上传
      headerObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
      //保存图片的服务器路径 给予预览效果
      previewPath:'',
      previewVisible:false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取所有商品分类数据
    async getCateList() {
      const { data: result } = await this.$http.get("categories");
      if (result.meta.status !== 200) {
        return this.$message.error("获取失败");
      }
      this.cateList = result.data;
      console.log(this.cateList);
    },
    //级联选择器选中项变化触发函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) this.addForm.goods_cat = [];
    },
    //如果用户没有选择三级级联选择器 那么不会给他切换
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(`即将离开的标签页的名字是:${oldActiveName}`)
      // console.log(`即将进入的标签页的名字是:${activeName}`)
      // return false
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    //我发现把判断result语句放在if里面就不会出现result的undefine错误
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: result } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (result.meta.status !== 200) {
          return this.$message.error("获取动态参数失败");
        }
        result.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = result.data;
        //console.log(this.manyTableData)
      } else if (this.activeIndex === "2") {
        const { data: result } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (result.meta.status !== 200) {
          return this.$message.error("获取静态属性失败");
        }
        this.onlyTableData = result.data;
      }
    },
    //处理图片预览效果
    handlePreview(file){
      // console.log(file)
      // this.previewPath=file.response.data.url.slice(22)
      // console.log(this.previewPath)
      this.previewPath = this.$http.defaults.baseURL + file.response.data.tmp_path
      console.log(this.previewPath)
      this.previewVisible = true 
    },
    //处理移除图片的操作
    handleRemove(file){
      //console.log(file)
      //1获取将要删除的图片的临时路径
      const filePath=file.response.data.tmp_path
      //2从pics树中中,找到这个图片对应的索引值
      const i=this.addForm.pics.findIndex(x => x.pic === filePath)
      //3调用数组中的solice方法,把图片信息对象 从pics数组中移除
      this.addForm.pics.splice(i,1)
      console.log(this.addForm)
    },
    //监听图片上传成功的事件
    handleSuccess(response){
      console.log(response)
      //1 拼接得到一个图片信息对象
      const picInfo={pic:response.data.tmp_path}
      //2将图片信息对象 push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    add(){
      //console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if(!valid){return this.$message.error('请填写必要的表单项')}
        //执行添加的业务逻辑
        //this.addForm.goods_cat=this.addForm.goods_cat.join(',') 会报错 因为el-cascader的v-model 绑定的是数组 这里变为字符串后报错
        //视频里是采用 添加npm install lodash  里面的cloneDeep(obj) 方法完成
        var form = JSON.parse(JSON.stringify(this.addForm))
        //处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
          this.addForm.attrs.push(newInfo)
        })
        //处理静态属性
        this.onlyTableData.forEach(item=>{
          const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo) 
        })
        form.attrs=this.addForm.attrs
        let dd=form.goods_cat.toString()
        form.goods_cat=dd
        console.log(form)

        //发起请求添加商品 商品的名称必须是唯一的  这里如果商品的静态属性和动态参数都是空的话会报错在赋值的时候做一下判断attr_value: item.attr_vals === [] ? "" : item.attr_vals.join(" ")
        const {data:result} = await this.$http.post('goods',form)
        console.log(result)
        if(result.meta.status!==201){
          return this.$message.error('添加商品失败')
        }
        this.$message.success('成功')
        //编程时导航 跳转到指定的路径
        this.$router.push('/goods')
      })

    }
  },
  //计算属性
  computed: {
    cateId() {
      //return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg{
  width: 100%
}
.add_goods{
  margin-top: 10px;
}
</style>