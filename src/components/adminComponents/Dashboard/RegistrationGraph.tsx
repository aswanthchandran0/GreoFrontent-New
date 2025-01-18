import React, { useState, useEffect } from "react";
import ReactApexCharts from "react-apexcharts";

const UserRegistractionGraph = ({ users }) => {
  const [registrationData, setRegistrationData] = useState({
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: Array(12).fill(0), // Initialize with 0 for each month
  });

  useEffect(() => {
    // Calculate registrations per month based on users' createdAt field
    const newRegistrationData = Array(12).fill(0); // Initialize an empty array for each month

    users.forEach((user) => {
      const createdAt = new Date(user.createdAt);
      const month = createdAt.getMonth(); // Get the month (0-11)
      newRegistrationData[month] += 1; // Increment count for that month
    });

    setRegistrationData((prevData) => ({
      ...prevData,
      series: newRegistrationData,
    }));
  }, [users]);

  const options = {
    series: [
      {
        name: "Registrations",
        data: registrationData.series,
      },
    ],
    chart: {
      height: 350,
      type: "bar",
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + " users";
      },
      offsetY: -20,
      style: {
        fontSize: "10px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: registrationData.categories,
      position: "top",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        formatter: function (val) {
          return val + " users";
        },
      },
    },
    title: {
      text: "Monthly User Registrations",
      floating: true,
      offsetY: 330,
      align: "center",
      style: {
        color: "#444",
      },
    },
  };

  return (
    <div className="flex-col relative items-center justify-center rounded shadow shadow-blue-100 w-full md:w-[120vh] h-80">
      <div className="items-center justify-center w-full h-full">
        <p className="text-blue-600 font-golos">User Registration Graph</p>
        <ReactApexCharts
          options={options}
          series={[{ name: "Registrations", data: registrationData.series }]}
          type="bar"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};

export default UserRegistractionGraph;
