<template>
  <div class="data-visualization">
    <div class="container">
      <h1 class="page-title">内容数据统计</h1>
      <p class="page-subtitle">电影、电视剧、综艺数量可视化展示</p>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在加载数据...</p>
      </div>

      <!-- 数据卡片 -->
      <template v-else>
      <div class="stats-cards">
        <div class="stat-card movie">
          <div class="stat-icon">🎬</div>
          <div class="stat-content">
            <div class="stat-label">电影数量</div>
            <div class="stat-value">{{ movieCount }}</div>
          </div>
        </div>
        <div class="stat-card tv">
          <div class="stat-icon">📺</div>
          <div class="stat-content">
            <div class="stat-label">电视剧数量</div>
            <div class="stat-value">{{ tvShowCount }}</div>
          </div>
        </div>
        <div class="stat-card variety">
          <div class="stat-icon">🎭</div>
          <div class="stat-content">
            <div class="stat-label">综艺数量</div>
            <div class="stat-value">{{ varietyShowCount }}</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <!-- 饼图 -->
        <div class="chart-container">
          <h2 class="chart-title">内容类型分布（饼图）</h2>
          <v-chart class="chart" :option="pieChartOption" />
        </div>

        <!-- 柱状图 -->
        <div class="chart-container">
          <h2 class="chart-title">内容数量对比（柱状图）</h2>
          <v-chart class="chart" :option="barChartOption" />
        </div>

        <!-- 环形图 -->
        <div class="chart-container">
          <h2 class="chart-title">内容占比（环形图）</h2>
          <v-chart class="chart" :option="doughnutChartOption" />
        </div>

        <!-- 折线图 -->
        <div class="chart-container">
          <h2 class="chart-title">内容趋势（折线图）</h2>
          <v-chart class="chart" :option="lineChartOption" />
        </div>

        <!-- 雷达图 -->
        <div class="chart-container">
          <h2 class="chart-title">内容分布雷达图</h2>
          <v-chart class="chart" :option="radarChartOption" />
        </div>

        <!-- 堆叠柱状图 -->
        <div class="chart-container">
          <h2 class="chart-title">内容分类统计（堆叠柱状图）</h2>
          <v-chart class="chart" :option="stackedBarChartOption" />
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { fetchMoviesList } from '@/api/movies'
import { fetchTvShowsList } from '@/api/tvshows'
import { http } from '@/api/http'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 数据状态
const movieCount = ref(0)
const tvShowCount = ref(0)
const varietyShowCount = ref(0)
const loading = ref(true)

// 计算总数量
const totalCount = computed(() => movieCount.value + tvShowCount.value + varietyShowCount.value)

// 获取数据
onMounted(async () => {
  try {
    loading.value = true
    
    // 并行获取三个接口的数据
    const [moviesData, tvShowsData, varietiesData] = await Promise.all([
      // 获取电影总数
      fetchMoviesList({ page: 1, size: 1 }),
      // 获取电视剧总数
      fetchTvShowsList({ page: 1, size: 1 }),
      // 获取综艺总数 - 使用 /varieties/list 接口
      http<{ code: number; data: any }>('/varieties/list?page=1&size=1')
    ])
    
    // 设置电影数量
    movieCount.value = moviesData.total || 0
    
    // 设置电视剧数量
    tvShowCount.value = tvShowsData.total || 0
    
    // 设置综艺数量
    const varietiesResponse = varietiesData.data
    varietyShowCount.value = varietiesResponse?.total || varietiesResponse?.pagination?.total || 0
    
    console.log('数据加载完成:', {
      movieCount: movieCount.value,
      tvShowCount: tvShowCount.value,
      varietyShowCount: varietyShowCount.value
    })
  } catch (error) {
    console.error('获取数据失败:', error)
    // 如果获取失败，使用默认值 0
    movieCount.value = 0
    tvShowCount.value = 0
    varietyShowCount.value = 0
  } finally {
    loading.value = false
  }
})

// 饼图配置
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'middle'
  },
  series: [
    {
      name: '内容类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c} ({d}%)'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: [
        { value: movieCount.value, name: '电影', itemStyle: { color: '#FF6B6B' } },
        { value: tvShowCount.value, name: '电视剧', itemStyle: { color: '#4ECDC4' } },
        { value: varietyShowCount.value, name: '综艺', itemStyle: { color: '#FFE66D' } }
      ]
    }
  ]
}))

// 柱状图配置
const barChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['电影', '电视剧', '综艺'],
    axisLabel: {
      fontSize: 14
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      fontSize: 14
    }
  },
  series: [
    {
      name: '数量',
      type: 'bar',
      data: [
        { value: movieCount.value, itemStyle: { color: '#FF6B6B' } },
        { value: tvShowCount.value, itemStyle: { color: '#4ECDC4' } },
        { value: varietyShowCount.value, itemStyle: { color: '#FFE66D' } }
      ],
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      },
      barWidth: '60%'
    }
  ]
}))

// 环形图配置
const doughnutChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    bottom: '5%',
    left: 'center'
  },
  series: [
    {
      name: '内容类型',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: movieCount.value, name: '电影', itemStyle: { color: '#FF6B6B' } },
        { value: tvShowCount.value, name: '电视剧', itemStyle: { color: '#4ECDC4' } },
        { value: varietyShowCount.value, name: '综艺', itemStyle: { color: '#FFE66D' } }
      ]
    }
  ]
}))

// 折线图配置
const lineChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['电影', '电视剧', '综艺'],
    axisLabel: {
      fontSize: 14
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      fontSize: 14
    }
  },
  series: [
    {
      name: '数量',
      type: 'line',
      smooth: true,
      data: [movieCount.value, tvShowCount.value, varietyShowCount.value],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
            { offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
          ]
        }
      },
      itemStyle: {
        color: '#FF6B6B'
      },
      lineStyle: {
        width: 3
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      }
    }
  ]
}))

// 雷达图配置
const radarChartOption = computed(() => ({
  tooltip: {},
  radar: {
    indicator: [
      { name: '电影', max: totalCount.value },
      { name: '电视剧', max: totalCount.value },
      { name: '综艺', max: totalCount.value }
    ],
    radius: '70%',
    center: ['50%', '55%']
  },
  series: [
    {
      name: '内容数量',
      type: 'radar',
      data: [
        {
          value: [movieCount.value, tvShowCount.value, varietyShowCount.value],
          name: '内容统计',
          areaStyle: {
            color: 'rgba(255, 107, 107, 0.3)'
          },
          itemStyle: {
            color: '#FF6B6B'
          }
        }
      ]
    }
  ]
}))

// 堆叠柱状图配置
const stackedBarChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['电影', '电视剧', '综艺'],
    bottom: '5%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      fontSize: 14
    }
  },
  yAxis: {
    type: 'category',
    data: ['内容统计'],
    axisLabel: {
      fontSize: 14
    }
  },
  series: [
    {
      name: '电影',
      type: 'bar',
      stack: 'total',
      data: [movieCount.value],
      itemStyle: {
        color: '#FF6B6B'
      },
      label: {
        show: true,
        position: 'inside',
        formatter: '{c}'
      }
    },
    {
      name: '电视剧',
      type: 'bar',
      stack: 'total',
      data: [tvShowCount.value],
      itemStyle: {
        color: '#4ECDC4'
      },
      label: {
        show: true,
        position: 'inside',
        formatter: '{c}'
      }
    },
    {
      name: '综艺',
      type: 'bar',
      stack: 'total',
      data: [varietyShowCount.value],
      itemStyle: {
        color: '#FFE66D'
      },
      label: {
        show: true,
        position: 'inside',
        formatter: '{c}'
      }
    }
  ]
}))
</script>

<style lang="scss" scoped>
.data-visualization {
  min-height: calc(100vh - 70px);
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
    color: #2c3e50;
  }

  .page-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: #7f8c8d;
    margin-bottom: 40px;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #FF6B6B;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      font-size: 1.1rem;
      color: #7f8c8d;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
      }

      .stat-icon {
        font-size: 3rem;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.movie .stat-icon {
        background: linear-gradient(135deg, #FF6B6B 0%, #ee5a6f 100%);
      }

      &.tv .stat-icon {
        background: linear-gradient(135deg, #4ECDC4 0%, #44a08d 100%);
      }

      &.variety .stat-icon {
        background: linear-gradient(135deg, #FFE66D 0%, #f6c23e 100%);
      }

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }
      }
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 30px;

    .chart-container {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
      }

      .chart-title {
        font-size: 1.3rem;
        font-weight: bold;
        margin-bottom: 20px;
        color: #2c3e50;
        text-align: center;
      }

      .chart {
        width: 100%;
        height: 400px;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .charts-grid {
      grid-template-columns: 1fr;

      .chart-container .chart {
        height: 300px;
      }
    }

    .stats-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>
