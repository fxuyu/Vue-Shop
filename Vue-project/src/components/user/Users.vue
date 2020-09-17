<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域-->
    <el-card>
      <!-- 搜索于添加区域  :gutter是间隔20像素 点击事件加@-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <!-- 在el-table-column这里添加了type=index 就是把这列设置成索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- 插槽slot-scope 也可以写成 <template v-slot:default="slotProps"> {{scope.row}} 可以看到数值-->
          <!-- <template v-slot="slotProps">
             {{slotProps.row.mg_state}}
          </template>-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <!-- 修改按钮 通过scope.row.id获取该行的id值 进而通过这个id进行对用户的修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              round
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              round
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="角色分配" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" round @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 @close当用户关闭后触发的事件-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域  prop是校验规则-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 ref是表单的引用 类似id -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <!-- disabled让这行不能修改 -->
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="30%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>分配新角色
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //cb就是callback()简写，回调函数
    //验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        //合法的邮箱
        return cb();
      }
      //在这里提供一个错误的消息
      cb(new Error("请输入合法的邮箱"));
    };

    //验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      //验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };

    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: "",
        //当前的页面
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 5
      },
      userList: [],
      total: 0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3~10个之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 10,
            message: "密码的长度在3~10个之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          //{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"]}
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          //当用户的鼠标离开输入框后 调用checkMobile方法 这个方法也可以写在methods里面 要用this来调用
          { validator: checkMobile, trigger: "blur" }
        ],
      },

      //控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //这是查询到的用户信息对象
      editForm: {},
      //控制分配角色对话框的显示与隐藏
      setRoleDialogVisible:false,
      //需要被分配的角色的用户信息
      userInfo:{},
      //所有角色的数据列表
      rolesList:[],
      //已选中的角色id值
      selectedRoleId:''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      //返回一个Promise 对象 要用 aynsc 和await接收
      const { data: result } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (result.meta.status !== 200)
        return this.$message.error("获取用户信息失败");
      this.userList = result.data.users;
      this.total = result.data.total;
      //console.log(result);
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      //console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      //console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听swicth开关状态的改变 一般修改数据使用Put请求
    async userStateChanged(userInfo) {
      //console.log(userInfo);
      const { data: result } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (result.meta.status !== 200) {
        //因为switch组件的chang事件一触发就会改变state的状态 所以加入这行
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    //监听添加用户对话框的关闭事件 resetFields() 重置表单的函数
    addDialogClosed() {
      //console.log(this.$refs.addFormRef)
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮添加新用户
    addUser() {
      //当表单输入正确数据后 valid会输出true 否则输出false 这个叫预校验
      this.$refs.addFormRef.validate(async valid => {
        //console.log(valid)
        if (!valid) {
          return;
        }
        //可以发起添加用户的网络请求
        const { data: result } = await this.$http.post("users", this.addForm);
        //console.log(result)
        if (result.meta.status !== 201) {
          return this.$message.error("添加用户失败或者用户已经存在");
        }
        this.$message.success("添加用户成功");
        //隐藏添加用户的对话框
        this.addDialogVisible = false;
        //重新获取用户列表数据
        this.getUserList();
      });
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: result } = await this.$http.get("users/" + id);
      if (result.meta.status !== 200) {
        return this.$message.error("查询用户信息失败");
      }
      this.editForm = result.data;
      this.editDialogVisible = true;
      //console.log(id)
    },
    //监听修改用户对话框的关闭事件 只要没有点击确定 把验证结果给重置回去
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息（点击确定)并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        //发起修改用户信息的数据请求
        const { data: result } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (result.meta.status !== 200) {
          return this.$message.error("更新用户信息失败");
        }
        //隐藏添加用户的对话框
        this.editDialogVisible = false;
        this.$message.success("更新用户成功");
        //重新获取用户列表数据
        this.getUserList();
      });
    },
    //根据ID删除用户信息
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
      //发起删除请求
      const { data: result } = await this.$http.delete("users/" + id);
      if (result.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getUserList();
    },
    //这是展示分配角色的对话框
    async setRole(userInfo){
      this.userInfo=userInfo
      //在展示对话框之前,获取所有角色的列表
      const {data:result}=await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolesList=result.data
      //让对话框显示
      this.setRoleDialogVisible=true
    },
    //点击按钮分配角色
    async saveRoleInfo(){
      //如果用户没有选择角色 就会return 
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色!')
      }
      const {data:result}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      console.log(result)
      if (result.meta.status !== 200) {
        return this.$message.error("更新角色失败");
      }
      this.$message.success("更新用户成功");
      this.setRoleDialogVisible=false;
      this.getUserList();
    },
    //监听分配角色对话框的关闭事件 重置数值
    setRoleDialogClosed(){
      this.selectedRoleId=''
      this.userInfo={}
    }
  }
};
</script>

<style lang="less" scoped>
</style>