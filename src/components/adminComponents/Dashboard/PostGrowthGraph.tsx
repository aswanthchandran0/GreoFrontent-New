import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getAllRollsAndPostsApi } from "../../../services/admin/adminApi";

const PostGrowthGraph = () => {
  const [rolls, setRolls] = useState([]);
  const [posts, setPosts] = useState([]);
  const [chartData, setChartData] = useState({
    postsData: [],
    rollsData: [],
    months: [],
  });

  useEffect(() => {
    const fetch = async () => {
      const response = await getAllRollsAndPostsApi();
      setRolls(response.data.rolls || []);
      setPosts(response.data.posts || []);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (posts.length > 0 || rolls.length > 0) {
      const processChartData = (data) => {
        const monthlyCounts = {};
        data.forEach((item) => {
          const date = new Date(item.createdAt);
          const month = date.toLocaleString("default", { month: "short" }); // e.g., 'Jan', 'Feb'
          monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
        });
        return monthlyCounts;
      };

      const postsCounts = processChartData(posts);
      const rollsCounts = processChartData(rolls);

      const allMonths = Array.from(
        new Set([
          ...Object.keys(postsCounts),
          ...Object.keys(rollsCounts),
        ])
      ).sort(
        (a, b) =>
          new Date(`1 ${a} 2000`) - new Date(`1 ${b} 2000`) // Sort months in calendar order
      );

      const postsData = allMonths.map((month) => postsCounts[month] || 0);
      const rollsData = allMonths.map((month) => rollsCounts[month] || 0);

      setChartData({ postsData, rollsData, months: allMonths });
    }
  }, [posts, rolls]);

  const options = {
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      text: "Post & Roll Growth",
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // alternating row colors
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: chartData.months,
    },
  };

  const series = [
    {
      name: "Post",
      data: chartData.postsData,
    },
    {
      name: "Roll",
      data: chartData.rollsData,
    },
  ];

  return (
    <div className="flex-col relative items-center justify-center rounded shadow shadow-blue-100 w-full md:w-[80vh] h-80">
      <div id="chart">
        <ReactApexChart options={options} series={series} type="line" height={350} />
      </div>
    </div>
  );
};

export default PostGrowthGraph;
