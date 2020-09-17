<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索于添加区域  :gutter是间隔20像素 点击事件加@-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <!--prop对应goodsList的中的具体字段 渲染 绑定  -->
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="180px">
          <!-- 这里应该scope.row.add_time * 1000 | dateFormat  这个 | 是什么建议看看官方文档的filter | 那是Vue的过滤语法，表示数据传递给过滤器中函数处理并返回-->
          <template v-slot:default="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="145px">
          <template v-slot:default="scope">
            <!-- 修改按钮 通过scope.row.id获取该行的id值 进而通过这个id进行对用户的修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!--修改区域  -->
    <el-dialog title="修改商品" :visible.sync="editVisible" width="50%">
      <el-form :model="goodsSerachList" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="goodsSerachList.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="goodsSerachList.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="goodsSerachList.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="goodsSerachList.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="putEditGoods(goodsSerachList.goods_id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      //商品列表
      goodsList: [],
      //总数据条数
      total: 0,
      //查询到的商品列表
      goodsSerachList: [],
      editVisible: false,
      editFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入价格", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入数量", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入重量", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //根据分页获取对应的商品列表 使用get方法获取 必须使用params请球体来请求
    async getGoodsList() {
      const { data: result } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (result.meta.status !== 200) {
        return this.$message.error("失败");
      }
      //console.log(result)
      this.goodsList = result.data.goods;
      this.total = result.data.total;
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    //根据ID删除用户信息
    async removeUserById(id) {
      const confirmresult = await this.$confirm(
        "此操作将永久删除,是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => {
        return err;
      });
      if (confirmresult !== "confirm") {
        return this.$message.info("已取消了删除");
      }
      const { data: result } = await this.$http.delete(`goods/${id}`);

      if (result.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getGoodsList();
    },
    //使用路由 展现页面
    goAddpage() {
      this.$router.push("/goods/add");
    },
    //根据ID查询目标商品
    async showEditDialog(id) {
      const { data: result } = await this.$http.get(`goods/${id}`);
      console.log(result);
      if (result.meta.status !== 200) {
        return this.$message.error("查询失败");
      }
      this.goodsSerachList = result.data;
      this.editVisible = true;
    },
    //提交修改
    putEditGoods(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const result = await this.$http.put(`goods/${id}`, {
          goods_name: this.goodsSerachList.goods_name,
          goods_price: this.goodsSerachList.goods_price,
          goods_number: this.goodsSerachList.goods_number,
          goods_weight: this.goodsSerachList.goods_weight
        });
        this.editVisible = false;
        console.log(result);
      });
    }
  }
};
</script>

<style lang="less" scoped>
</style>