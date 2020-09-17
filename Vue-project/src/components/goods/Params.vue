<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告提示框 -->
      <el-alert title="注意:只允许为第三季分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>

      <!-- 选择商品分类区域 span里面放文本-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name' ,children:'children' }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行  组件上绑定的事件需要用native 因为组件底层封装了input标签，使用native（原生事件），可以将事件作用于input框-->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeUserById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行type="expand" 添加了这个就能展开 -->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeUserById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogVisibleClosed"
    >
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsto ">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogVisibleClosed"
    >
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams ">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      //级联选择框的双向绑定的数组
      selectedCateKeys: [],
      //这是被激活的页签的名称 也就是进入页面默认展示什么,这里展示的是动态参数
      activeName: "many",
      //动态参数的数据
      manyTableData: [],
      //静态数据的参数
      onlyTableData: [],
      //控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加参数的表单数据对象
      addForm: {
        attr_name: ""
      },
      //添加表单的验证规则对象
      addFormRules: {
        //格式化的校验
        attr_name: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ]
      },
      //控制修改对话框的显示与否
      editDialogVisible: false,
      //修改表单的数据对象
      editForm: {
        attr_name: ""
      },
      

    };
  },
  created() {
    this.getCateList();
  },

  methods: {
    //获取所有的商品分类列表
    async getCateList() {
      const { data: result } = await this.$http.get("categories");
      if (result.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = result.data;
      //console.log(this.cateList);
    },
    //级联选择框选中项变化 会出发函数
    handleChange() {
      this.getParamsData();
    },
    //tab页签点击事件的处理函数
    handleClick() {
      this.getParamsData();
      //console.log(this.activeName);
    },

    //获取参数的列表数据
    async getParamsData() {
      //只能选择三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        //只要没有选中3级分类标签 让他们清空
        this.manyTableData=[];
        this.onlyTableData=[];
        return;
      }
      //选中了三级分类
      //console.log(this.selectedCateKeys);
      //根据所选分类的ID 和当前所处的面板 获取对应的参数
      const { data: result } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (result.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }
      //(item.attrVals || '').split(' ') 要这样写才不会报错
      //使用foreach分割一个字符串成一个数组  后面的三元表达式意思是 有值就为true 无值为false 无值返回空数组
      result.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //控制文本框的显示与隐藏 在数据列表里面修改值 从而一个一个控制tag标签的添加
        item.inputVisible=false
        //文本框中输入的值 下面这行与上面这行解决了 添加标签上下同时显示输入内容的问题
        item.inputValue=''
      });
      //console.log(result);
      if (this.activeName === "many") {
        this.manyTableData = result.data;
      } else {
        this.onlyTableData = result.data;
      }
    },
    //监听添加对话框的关闭事件
    addDialogVisibleClosed() {
      //关闭了对话框触发refs的校验对象的取消
      this.$refs.addFormRef.resetFields();
    },
    // 点击添加参数的确定按钮 添加参数
    //服务器需要两个值 一个名字 一个你选择的是动态还是静态
    addParamsto() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const { data: result } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (result.meta.status !== 201) {
        return this.$message.error("添加参数失败");
        }
        this.$message.success("成功");
        this.addDialogVisible = false;
        this.getParamsData();

      });
      
    },

    //点击按钮 展示修改的对话框
    async showEditDialog(attr_id) {
      const { data: result } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (result.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }
      this.editForm = result.data;
      this.editDialogVisible = true;
    },
    //清空表单
    editDialogVisibleClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击按钮 修改参数信息 如果不行 将attr_id改成接口文档里面的attrId
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const {
          data: result
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )

        if (result.meta.status !== 200) {
        return this.$message.error("修改参数失败");
      }
      this.$message.success("成功");
      this.editDialogVisible = false;
      this.getParamsData();

      });
      
    },
    //根据ID删除
    async removeUserById(id) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      //categories/:id/attributes/:attrid
      const { data: result } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (result.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getParamsData();
    },
    //文本框失去交点 或者按下了enter都会触发
    async handleInputConfirm(row){
      if(row.inputValue.trim().length === 0){
        row.inputValue=''
        row.inputVisible = false
        return 
      }
      //如果没有return 则证明输入的内容 需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue=''
      row.inputVisible = false
      //需要发起请求 保存这个操作
      this.saveAttrVals(row)
    },
    //将对attr_vals的操作保存到数据库 封装信息
    async saveAttrVals(row){
      //需要发起请求,保存这次操作
      const {data:result}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        //将数组变成字符串 join做一下拼接
        attr_vals:row.attr_vals.join(' ')
      })

      if(result.meta.status!==200){
        return this.$message.error("修改参数失败");
      }
      this.$message.success("修改参数成功");
    },

    //点击按钮 展示文本输入框
    showInput(row){
      row.inputVisible = true
      //让文本框自动获得焦点 $nextTick方法的作用,就是当页面上元素被重新渲染之后,才会执行回调函数的中的代码
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除对应的参数可选项
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)

    }
  },

  //computed是计算属性
  computed: {
    //isBtnDisabled这个方法计算的是用户是否选择了三级标签 选了则是true表示可以使用按钮
    //如果按钮需要被禁用 则返回true 使用则是返回false
    isBtnDisabled() {
      //也可以直接 return this.selectedCateKeys.length!==3
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },

    //当前选中的三级分类的ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    //动态计算标题
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  margin: 10px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag{
  width: 150px;
}
</style>