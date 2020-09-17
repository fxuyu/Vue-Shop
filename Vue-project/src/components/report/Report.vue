<template>
  <div>
      <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 曲线图 -->
        <div id="main" style="width:800px; height:500px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
    data(){
        return{
            options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
        }
    },
    //这是渲染前发的请求
    created(){},
    //mounted调用时，此时,页面上的元素 已经被渲染完毕了
    async mounted(){
        var myChart = echarts.init(document.getElementById('main'));
        const {data:result}=await this.$http.get('reports/type/1')
        if(result.meta.status!==200){
            return this.$message.error('失败')
        }
        //console.log(result)
        //结合数据 使用Object.assign方法
        const res=Object.assign(this.options,result.data)

        myChart.setOption(res);
    },
    methods:{}
}
</script>

<style lang="less" scoped>

</style>