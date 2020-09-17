<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域  children: 'children' 这是是绑定字段 hasChildren是是否展开项-->
      <el-table
        :data="cateList"
        row-key="cat_id"
        border
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <!-- 在el-table-column这里添加了type=index 就是把这列设置成索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效">
          <template v-slot:default="scope">
            <!-- <el-switch v-model="scope.row.cat_deleted"></el-switch> -->
            <!-- <i :class="'scope.row.cat_deleted' ? 'el-icon-success style=color:lightgreen' : 'el-icon-error'"></i> 这是我写的 但是不能渲染为绿色 -->
            <i
              class="el-icon-success"
              v-if="scope.row.cat_deleted === false"
              style="color:lightgreen;"
            ></i>
            <i class="el-icon-error" v-else style="color:red;"></i>
          </template>
        </el-table-column>
        <el-table-column prop="cat_level" label="排序">
          <template v-slot:default="scope">
            <el-tag size="mini" v-if="scope.row.cat_level == '0'">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level == '1'">二级</el-tag>
            <el-tag size="mini" type="warning" v-else-if="scope.row.cat_level == '2'">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.cat_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="40%" @close="addCateDiaologClosed">
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- :options指定当前级联选择器的数据源 v-model是双向绑定 前端页面修改了也返回js数据中-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name' ,children:'children',checkStrictly:true}"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 取消和确定的按钮框 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

      <!--修改商品分类的对话框  -->
    <el-dialog title="修改商品分类" :visible.sync="editDialogVisible" width="40%">
      <el-form :model="editForm" ref="editFormRef" label-width="70px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      //这是调用接口所需要的参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      //商品分类的数据列表,默认为空
      cateList: [],
      //总数据条数
      total: 0,
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        //将要添加的分类的名称
        cat_name: "",
        //父级分类的id 不能为空
        cat_pid: 0,
        //分类的等级 默认要添加的是1级分类
        cat_level: 0
      },
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类的名称", trigger: "blur" }
        ]
      },
      //父级分类的列表
      parentCateList: [],
      //选中的父级分类的ID数组
      selectedKeys:[],
      //修改商品分类的对话框的显示与否
      editDialogVisible:false,
      //双向绑定修改用户的
      editForm:{}

    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: result } = await this.$http.get("categories", {
        params: this.querInfo
      });
      if (result.meta.status !== 200) {
        return this.$message.error("获取商品失败");
      }
      //console.log(result.data);
      //把数据列表,赋值给cateList
      this.cateList = result.data.result;
      //为总数据条数赋值
      this.total = result.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },

    //点击按钮 战士添加分类的对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },

    //获取父级分类的列表
    async getParentCateList() {
      const { data: result } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (result.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      this.parentCateList = result.data;
    },

    //选择项发生变化触发这个函数
    parentCateChanged(){
      //在:props添加emitPath:false 属性 可以直接获得你点击的那个东西的值value 从而这里可以在this.selectedKeys接收
      //console.log(this.selectedKeys)
      //如果selectedKeys数组中的length大于0 证明选中了父级分类 反之则没有选中
      if(this.selectedKeys.length > 0){
        //由于只有三个等级0 1 2 首先要获取父级分类的id 所以根据你选择的分类获取父级分类id 选2得1 选1得0
        this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length - 1]
        //这个是获取子类的id 最小子类id就是2
        this.addCateForm.cat_level=this.selectedKeys.length
        return 
      }else{
        //如果是父级分类 那么 重置
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
      }
    },
    //点击按钮 添加新的分类
    addCate(){
      //console.log(this.addCateForm)
      //这个是预校验 看看用户有没有输入正确数据  通过ref validate是个方法
      this.$refs.addCateFormRef.validate(async valid=>{
        if(!valid) return 
        //没有return 说明通过了 那么发送请求
        const {data:result}=await this.$http.post('categories',this.addCateForm)
        if(result.meta.status!==201){
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //监听对话框的关闭事件,重置表单数据
    addCateDiaologClosed(){
      //addCateFormRef是ref定义的名字 ref类似html的id 获取dom元素  resetFields是一个方法 作用是 清空数值
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },

    //点击显示商品分类的对话框
    async showEditDialog(id){
      //console.log(id)
      const {data:result} = await this.$http.get("categories/" + id)
      if(result.meta.status!==200){
        return this.$message.error('失败')
      }
      this.editForm = result.data;
      this.editDialogVisible=true
    },
    //修改商品分类
    async editUserInfo(){
      const {data:result} = await this.$http.put('categories/' + this.editForm.cat_id,{cat_name:this.editForm.cat_name})
      if(result.meta.status!==200){
        return this.$message.error('失败')
      }
      this.editDialogVisible=false 
      this.$message.success("更新成功");
      this.getCateList();
    },

    //根据ID删除对应的商品分类
    async removeUserById(id){
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品分类, 是否继续?",
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
      const {data:result}=await this.$http.delete('categories/'+ id)
      if (result.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      this.$message.success("删除成功");
      this.getCateList();
    }

  }
};
</script>

<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>