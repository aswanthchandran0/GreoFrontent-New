import { FaUser } from "react-icons/fa";
import ReactApexCharts from "react-apexcharts";
import { ApexOptions } from "apexcharts"; // Only importing ApexOptions

interface UserAnalyticsProps {
  totalUsers: number;
  suspendedUsers: number;
  activeUsers: number;
}

const UserAnalytics = ({
  totalUsers,
  suspendedUsers,
  activeUsers,
}: UserAnalyticsProps) => {
  // Calculate inactive users
  const inactiveUsers = totalUsers - activeUsers - suspendedUsers;

  // Properly type the options object
  const options: ApexOptions = {
    series: [activeUsers, inactiveUsers, suspendedUsers],
    chart: {
      width: 380,
      type: "donut" as const,
      animations: { // Changed from 'animation' to 'animations'
        enabled: true,
        speed: 800, // Duration of the animation in milliseconds
        animateGradually: {
          enabled: true,
          delay: 300, // Delay between animations for each data point
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350, // Animation speed for dynamic updates
        },
      },
    },
    colors: ["#28a745", "#007bff", "#dc3545"], // Green, Blue, Red
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number): string {
        return val.toFixed(0); // Showing the count instead of percentage
      },
    },
    title: {
      text: "Users",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    legend: {
      show: true,
      position: "bottom", // Shows the legend at the bottom
      markers: {
       size:10,
       shape: "circle",
      },
      itemMargin: {
        horizontal: 5,
        vertical: 5,
      },
      formatter: (_: string, opts: { seriesIndex: number;w: { globals: { series: number[] } } }) => {
        // Customizing the series names for the legend
        const seriesLabels = ["Active", "Inactive", "Suspended"];
        return `${seriesLabels[opts.seriesIndex]}: ${opts.w.globals.series[opts.seriesIndex]}`;
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full rounded shadow shadow-blue-100 md:w-72 h-80">
      {/* Apex chart inside a wrapper component */}
      <div className="relative flex items-center justify-center w-full h-full">
        <ReactApexCharts
          options={options}
          series={options.series}
          type="donut"
          height="100%"
        />
        {/* Icon on top of the chart */}
        <div
          className="absolute z-10 flex items-center justify-center md:bg-white rounded-full  md:top-[95px] top-[60px]"
          style={{
            width: "120px", // Fixed size for the icon circle
            height: "120px", // Fixed size for the icon circle
            fontSize: "40px", // Size of the icon
          }}
        >
          <FaUser className="text-6xl text-blue-500" />
          <div className="absolute text-xs font-semibold text-center text-gray-800 top-[100px]">
            {/* Displaying the total active users count */}
            <span className="text-blue-500">Total {totalUsers}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
