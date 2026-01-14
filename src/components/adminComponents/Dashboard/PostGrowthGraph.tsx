import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getAllRollsAndPostsApi } from "../../../services/admin/adminApi";

interface ChartData {
  postsData: number[];
  rollsData: number[];
  months: string[];
}

interface IPost {
  id: string;
  userId: string;
  content?: string;
  mediaUrls?: string[];
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IRoll {
  id: string;
  userId: string;
  mediaUrl: string;
  thumbnail: string;
  content?: string;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostGrowthGraph = () => {
  const [chartData, setChartData] = useState<ChartData>({
    postsData: [],
    rollsData: [],
    months: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching posts and rolls data for chart...');
        const response = await getAllRollsAndPostsApi();
        console.log('✅ Data received:', response.data);
        
        const { posts, rolls } = response.data.data;
        
        if (posts.length > 0 || rolls.length > 0) {
          const processChartData = (data: (IPost | IRoll)[]) => {
            const monthlyCounts: { [key: string]: number } = {};

            data.forEach((item) => {
              if (item.createdAt) {
                const date = new Date(item.createdAt);
                const month = date.toLocaleString("default", { month: "short" });
                monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
              }
            });
            return monthlyCounts;
          };

          const postsCounts = processChartData(posts);
          const rollsCounts = processChartData(rolls);

          const monthMap: { [key: string]: number } = {
            Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
            Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
          };
          
          const allMonths = Array.from(
            new Set([
              ...Object.keys(postsCounts),
              ...Object.keys(rollsCounts),
            ])
          ).sort((a, b) => monthMap[a] - monthMap[b]);

          const postsData = allMonths.map((month) => postsCounts[month] || 0);
          const rollsData = allMonths.map((month) => rollsCounts[month] || 0);

          setChartData({ postsData, rollsData, months: allMonths });
        }
        
      } catch (err: any) {
        console.error('❌ Error fetching chart data:', err);
        setError(err.response?.data?.message || 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fixed options with correct TypeScript types
  const options = {
    chart: {
      height: 350,
      type: "line" as const,
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    title: {
      text: "Post & Roll Growth Over Time",
      align: "left" as const,
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333'
      },
    },
    colors: ['#3B82F6', '#10B981'], // Blue for posts, Green for rolls
    grid: {
      row: {
        colors: ["#f8fafc", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: chartData.months,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Posts/Rolls',
        style: {
          color: '#6B7280',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '11px'
        }
      }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      fontSize: '14px',
      markers: {
        size: 6, // ✅ Correct property name
        strokeWidth: 0,
        fillColors: ['#3B82F6', '#10B981']
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function(val: number) {
          return val + " posts/rolls";
        }
      }
    }
  };

  const series = [
    {
      name: "Posts",
      data: chartData.postsData,
    },
    {
      name: "Rolls",
      data: chartData.rollsData,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-80 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-red-700">Failed to load chart data</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (chartData.postsData.length === 0 && chartData.rollsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-600">No data available for chart</p>
          <p className="text-gray-500 text-sm mt-1">No posts or rolls found to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col relative items-center justify-center rounded-lg shadow-lg border border-gray-200 w-full md:w-[80vh] h-80 bg-white">
      <div id="chart">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="line" 
          height={350} 
        />
      </div>
    </div>
  );
};

export default PostGrowthGraph;