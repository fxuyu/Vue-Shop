<template>
    <div>
       <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 el-table 添加border 会有边框线-->
    <el-card>
        <el-table :data="rightsList" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="authName" label="权限名称" align="center"></el-table-column>
            <el-table-column prop="path" label="路径"></el-table-column>
            <el-table-column prop="level" label="权限等级">
                <!-- 以scope作用域插槽的形式 输出 elemnt的标签 -->
                <template v-slot:default="scope">
                    <el-tag v-if="scope.row.level==='0'">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.level==='1'">二级</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.level==='2'">三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    </div>
</template>

<script>
export default {
    data(){
        return {
            //权限列表
            rightsList:[]
        }
    },
    created(){
        //获取所有的权限
        this.getRightsList()
    },
    methods:{
        //获取权限
        async getRightsList(){
            const {data:result}=await this.$http.get('rights/list')
            if(result.meta.status!==200) return this.$message.error('获取权限列表失败')
            this.rightsList = result.data
            //console.log(result)
        }
    }

}
</script>

<style lang="less" scoped>

</style>