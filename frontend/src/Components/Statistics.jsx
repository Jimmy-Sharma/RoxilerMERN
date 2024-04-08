import React, { useEffect, useState } from "react";

const Statistics = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        let month = 3;

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
          `https://roxilermern.onrender.com/product/statistics?month=${month}`
        );
        const data = await response.json();
        console.log(data)
        setStatistics(data);
        console.log(statistics)
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, [selectedMonth]);

  return (
    <div className="pb-5">
      <div className=" font-bold text-black text-4xl text-center m-5">
        Statistics - {selectedMonth}
      </div>
      <div className="flex justify-center m-5">
        <div className=" container max-w-max p-4 bg-[#f8df8c] rounded-xl">
          <div className="flex flex-row flex-wrap gap-5">
            <div>
              <h3>Total Sale Amount</h3>
              <h3>Total Sold Items</h3>
              <h3>Total Not Sold Items</h3>
            </div>
            <div>
              <h3>{statistics.totalSaleAmtOfMth}</h3>
              <h3>{statistics.totalSoldPerMonth}</h3>
              <h3>{statistics.totalNotSoldPerMonth}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;