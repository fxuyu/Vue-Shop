<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登陆表单区域  :model等价于v-bind:model 重置给ref添加引用对象loginFormRef-->
      <el-form ref="loginFormRef" :model="loginForm" label-width="0px" class="login_form" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <!-- v-model双向绑定 -->
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!-- 口令 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //这是登陆表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456"
      },

      //这是表单的验证规则对象
      loginFormRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: "请输入登陆名称", trigger: "blur" },
          { min: 3, max: 10, message: "用户名要在3个字节到十个字节之间", trigger: "blur" }
        ],
        //验证密码是否合法
        password: [
            { required: true, message: "请输入登陆密码", trigger: "blur" },
            { min: 6, max: 15, message: "密码要在6个字节到15个字节之间", trigger: "blur" }
        ]
      }
    };
  },

  methods:{
      //点击后重置对象
      resetLoginForm(){
          //console.log(this) 在这里可以在控制台找到$refs 里面有个loginFormRef 属性 在这个属性里面可以调用resetFields()方法 重置
          //这是一个refs里面的
          this.$refs.loginFormRef.resetFields();
      },
      login(){
          //Lambda 表达式 也叫箭头函数
          this.$refs.loginFormRef.validate(async (valid)=>{
              //console.log(valid);//表单验证成功返回true 失败返回false 
              if(!valid) return ;
              //使用axios发起登陆请求
              //可以解构赋值 得到服务器返回的数据
              //const {data:result}=await this.$http.post('login',this.loginForm);
              const result=await this.$http.post('login',this.loginForm);
              //this.$message 这是elemnt ui的消息提示 
              if(result.data.meta.status!==200) return this.$message.error('登陆失败');
              this.$message.success('登陆成功');
              //console.log(result.data.data.token);
              window.sessionStorage.setItem("token",result.data.data.token);
              this.$router.push("/home");
          });
      }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>