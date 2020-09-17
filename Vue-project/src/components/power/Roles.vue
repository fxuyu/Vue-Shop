<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 在el-table-colum 添加 type="expand" 就可以展开这列 el-row是行 el-col是列-->
        <el-table-column type="expand">
          <template v-slot:default="scope">
            <!-- ['bdbottom'] 这不是数组，这相当于里面放的是变量  i1相当于索引 index-->
            <el-row
              :class="['bdbottom',i1===0? 'bdtop' : '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 span相当于把表格给栅格化 这边占5 另一边19 是因为5+19=24 一个row里面有24栅格-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!--通过for循环 嵌套渲染二级权限  -->
                <el-row
                  :class="[index2=== 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot:default="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >修改</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户的对话框 @close当用户关闭后触发的事件-->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
      <!-- 内容主体区域  prop是校验规则-->
      <el-form :model="addForm" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 ref是表单的引用 类似id -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="email">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="SetRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件  node-key="id" ID哪里来的？  -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //添加用户的模型
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      //添加用户的状态栏显示与否
      addDialogVisible: false,
      //编辑用户的状态栏显示与否
      editDialogVisible: false,
      editForm: {},
      //这是控制分配权限的对话框的显示与隐藏
      SetRightDialogVisible:false,
      //所有权限的数据
      rightsList:[],
      //树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      //默认选中的节点ID值数组
      defKeys:[],
      //当前即将分配权限的角色的ID
      roleId:''
    };
  },

  created() {
    this.getRolelist();
  },

  methods: {
    //获取所有角色的列表
    async getRolelist() {
      const { data: result } = await this.$http.get("roles");
      if (result.meta.status !== 200)
        return this.$message.error("获取角色列表失败");
      this.rolelist = result.data;
      //console.log(this.rolelist)
    },

    //点击按钮添加角色列表用户
    async addUser() {
      const { data: result } = await this.$http.post("roles", this.addForm);
      if (result.meta.status !== 201) {
        return this.$message.error("添加用户失败或者用户已经存在");
      }
      this.$message.success("添加用户成功");
      //隐藏添加用户的对话框
      this.addDialogVisible = false;
      //重新获取用户列表数据
      this.getRolelist();
    },
    //显示编辑用户的对话框
    async showEditDialog(id) {
      const { data: result } = await this.$http.get("roles/" + id);
      if (result.meta.status !== 200) {
        return this.$message.error("查询用户信息失败");
      }
      this.editForm = result.data;
      this.editDialogVisible = true;
    },

    //删除角色
    async removeUserById(id) {
      //弹框询问用户是否删除数据
      const confirmresult = await this.$confirm(
        "此操作将永久删除该用户,是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => {
        return err;
      });
      //如果用户确认了删除 返回值字符串为confirm 没有删除则是cancel
      if (confirmresult !== "confirm") {
        return this.$message.info("已取消了删除");
      }
      const { data: result } = await this.$http.delete("roles/" + id);
      if (result.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getRolelist();
    },

    //修改用户
    async editUserInfo() {
      const { data: result } = await this.$http.put(
        "roles/" + this.editForm.roleId,
        { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
      );
      if (result.meta.status !== 200) {
        return this.$message.error("更新用户信息失败");
      }
      this.editDialogVisible = false;
      this.$message.success("更新用户成功");
      this.getRolelist();
    },

    //根据ID删除对应的权限
    async removeRightById(role, rightId) {
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
      const { data: result } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (result.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      //this.getRolelist() 用这个的话 会刷新整个页面 用下面这个会修改得到的数值 数据是双向绑定的…
      //原理应该是 role 是对象，是引用类型数据，role反生改变，table 数据就发生改变，vue 会重新渲染
      //你们vue基础学的这么烂的吗，scope是插槽上面所有通过v-bind绑定的属性的集合
      //对象是引用类型，如果是普通数据类型，确实不能这么做
      role.children = result.data;
    },

    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId=role.id
      //获取所有权限的数据
      const {data:result}=await this.$http.get('rights/tree')
      if(result.meta.status!==200){
        return this.$message.error('获取权限数据失败');
      }
      //把获取到的权限数据保存到data中
      this.rightsList=result.data 
      //console.log(this.rightsList)
      //this.defKeys=[] 我用了这个 但是视频用setRightDialogClosed()方法清空数组
      //递归获取三级节点的ID
      this.getLeafKeys(role,this.defKeys)
      this.SetRightDialogVisible=true
    },

    //通过递归的形式 获取角色下的所有三级权限的ID 并保存到数组defKeys中
    getLeafKeys(node,arr){
      //如果当前node节点不包含children属性,那么就是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item=>this.getLeafKeys(item,arr))
    },

    //监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys=[]
    },
    //点击为角色分配权限
    async allotRights(){
      const keys= [
        //展开运算符...
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes()
      ]
      //console.log(keys) 可以拿到已选中的ID
      const idStr=keys.join(',')
      const {data:result}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(result.meta.status!==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.SetRightDialogVisible = false
      this.getRolelist()
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>