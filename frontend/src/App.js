import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import MonthAndSearch from "./Components/MonthAndSearch";
import TransactionTable from "./Components/TransactionTable";
import Statistics from "./Components/Statistics";
import BarChart from "./Components/BarChart";

const App = () => {
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedPerPage, setSelectedPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch transactions based on selected month and search text
  const fetchTransactions = async () => {
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
      const response = await axios.get(
        `http://localhost:7500/product/products`,
        {
          params: {
            month,
            search: searchText,
            page: currentPage,
            perPage: selectedPerPage,
          },
        }
      );

      console.log(response.data.data)

      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handlePerPageChange = (e) => {
    setSelectedPerPage(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchText("");
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, searchText, currentPage, selectedPerPage]);

  return (
    <div className="bg-[#edf6f6]">
      <div className="flex items-center justify-center p-5">
        <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
          <p className="text-[#464646] font-bold text-xl">
            Transaction
            <br />
            Dashboard
          </p>
        </div>
      </div>

      <MonthAndSearch
        value={searchText}
        onSearchChange={handleSearchChange}
        onClear={handleSearchClear}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />
      <TransactionTable
        transactions={transactions}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        selectedPerPage={selectedPerPage}
        onChange={handlePerPageChange}
        page={currentPage}
      />
      <hr className="border border-b-green-500"></hr>
      <Statistics selectedMonth={selectedMonth} />
      <hr className="border border-b-green-500"></hr>
      <BarChart selectedMonth={selectedMonth} />
    </div>
  );
};

export default App;
