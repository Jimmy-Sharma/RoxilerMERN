import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
Chart.register(CategoryScale);

const BarChart = ({ selectedMonth }) => {
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [
      {
        label:
          "Number of Items Sold on the basis of Price Range for a given month",
        backgroundColor: "rgb(108,229,232)",
        borderWidth: 1,
        hoverBackgroundColor: "rgb(108,229,10)",
        data: [],
      },
    ],
  });

  useEffect(() => {
    const fetchBarChartData = async () => {
      console.log(selectedMonth)
      try {
        let month = 4;

        if (selectedMonth == "January") {
          month = 1;
        } else if (selectedMonth == "February") {
          month = 2;
        } else if (selectedMonth == "March") {
          month = 3;
        } else if (selectedMonth == "April") {
          month = 4;
        } else if (selectedMonth == "May") {
          month = 5;
        } else if (selectedMonth == "June") {
          month = 6;
        } else if (selectedMonth == "July") {
          month = 7;
        } else if (selectedMonth == "August") {
          month = 8;
        } else if (selectedMonth == "September") {
          month = 9;
        } else if (selectedMonth == "October") {
          month = 10;
        } else if (selectedMonth == "November") {
          month = 11;
        } else if (selectedMonth == "December") {
          month = 12;
        }
        const response = await fetch(
          `https://roxilermern.onrender.com/product/barchart?month=${month}`
        );
        const data = await response.json();
        console.log('data:-', data)

        // Assuming data is an array of objects with 'range' and 'count' properties
        const labels = data.map((item) => item.range);
        const counts = data.map((item) => item.count);

        setBarChartData({
          labels,
          datasets: [
            {
              ...barChartData.datasets[0],
              data: counts,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };

    fetchBarChartData();
  }, [selectedMonth]);

  return (
    <div className="m-5">
      <div className=" font-bold text-black text-4xl text-center m-5">
        Bar Chart Stats - {selectedMonth}
      </div>
      <div className="m-5">
        {barChartData ? (
          <Bar
            data={barChartData}
            options={{
              legend: {
                display: true,
                position: "right",
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Price Range",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Number of Items",
                  },
                },
              },
            }}
          />
        ) : (
          <div>Loading chart data</div>
        )}
      </div>
    </div>
  );
};

export default BarChart;