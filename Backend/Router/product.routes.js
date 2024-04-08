const express = require('express')
require('dotenv').config()
const ProductModel = require('../Model/product.model')
const { default: axios } = require('axios')

const productRoute = express.Router()

productRoute.get('/initialize-database', async (req, res) => {
    try {
        let response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        let data = await response.json();
        await ProductModel.deleteMany();
        await ProductModel.insertMany(data);
        res.json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

productRoute.get('/products', async (req, res) => {
    let { month } = req.query

    let { search, page = 1, per_page = 10 } = req.query;

    if (month < 10) {
        month = `0${month}`
    }

    let query = {
        dateOfSale: { $regex: `.*-${month}-.*` },
    };

    if (search == "") {
        query = query
    } else if (!isNaN(search)) {
        query.$or = [
            { 'price': parseFloat(search) }
        ];
    } else {
        query.$or = [
            { 'title': { $regex: search, $options: 'i' } },
            { 'description': { $regex: search, $options: 'i' } },
        ];
    }

    try {
        let skip = (page - 1) * per_page;

        let record = await ProductModel.find(query)

        let result = await ProductModel.find(query)
            .skip(skip)
            .limit(per_page)
        res.status(200).send({ data: result, totalRecords: record.length })
    } catch (err) {
        res.status(400).send({ err: err.message })
    }

})

productRoute.get("/statistics", async (req, res) => {

    let { month } = req.query


    try {
        if (month < 10) {
            month = `0${month}`
        }

        let query = {
            dateOfSale: {
                $regex: `.*-${month}-.*`,
            }
        }

        let numOfSold = await ProductModel.find({ ...query, sold: true })
            .count()

        let numNotSold = await ProductModel.find({ ...query, sold: false })
            .count()

        let resultSold = await ProductModel.aggregate([
            {
                $match: {
                    dateOfSale: {
                        $regex: `.*-${month}-.*`,
                    },
                    sold: true,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$price',
                    },
                },
            },
        ])

        let resultNotSold = await ProductModel.aggregate([
            {
                $match: {
                    dateOfSale: {
                        $regex: `.*-${month}-.*`,
                    },
                    sold: false,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$price',
                    },
                },
            },
        ])

        res.status(200).send({ totalSaleAmtOfMth: (+resultSold[0].total.toFixed(2)) + (+resultNotSold[0].total.toFixed(2)), totalSoldPerMonth: numOfSold, totalNotSoldPerMonth: numNotSold })

    } catch (err) {
        res.status(400).send({ err: err.message })

    }
})


productRoute.get("/barchart", async (req, res) => {
    let { month } = req.query;

    try {
        // Pad month with leading zero if it's a single digit
        if (month < 10) {
            month = `0${month}`;
        }

        // Regular expression to match any year-month combination
        let query = {
            dateOfSale: { $regex: `.*-${month}-.*` }
        };

        // Initialize an array containing all price ranges with counts set to zero
        let priceRanges = [
            { range: '0 - 100', count: 0 },
            { range: '101 - 200', count: 0 },
            { range: '201 - 300', count: 0 },
            { range: '301 - 400', count: 0 },
            { range: '401 - 500', count: 0 },
            { range: '501 - 600', count: 0 },
            { range: '601 - 700', count: 0 },
            { range: '701 - 800', count: 0 },
            { range: '801 - 900', count: 0 },
            { range: '901 - above', count: 0 }
        ];

        // Aggregate query to group products by price range
        let result = await ProductModel.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: null,
                    counts: {
                        $push: {
                            $switch: {
                                branches: [
                                    { case: { $lte: ['$price', 100] }, then: '0 - 100' },
                                    { case: { $lte: ['$price', 200] }, then: '101 - 200' },
                                    { case: { $lte: ['$price', 300] }, then: '201 - 300' },
                                    { case: { $lte: ['$price', 400] }, then: '301 - 400' },
                                    { case: { $lte: ['$price', 500] }, then: '401 - 500' },
                                    { case: { $lte: ['$price', 600] }, then: '501 - 600' },
                                    { case: { $lte: ['$price', 700] }, then: '601 - 700' },
                                    { case: { $lte: ['$price', 800] }, then: '701 - 800' },
                                    { case: { $lte: ['$price', 900] }, then: '801 - 900' },
                                    { case: true, then: '901 - above' }
                                ],
                                default: 'Unknown'
                            }
                        }
                    }
                }
            }
        ]);

        // Update counts based on the actual data retrieved
        result.forEach(({ counts }) => {
            counts.flat().forEach(range => {
                let index = priceRanges.findIndex(item => item.range === range);
                if (index !== -1) {
                    priceRanges[index].count++;
                }
            });
        });

        // Send the modified priceRanges array as the response
        res.status(200).send(priceRanges);
    } catch (err) {
        res.status(400).send({ err: err.message });
    }
});


productRoute.get('/piechart', async (req, res) => {

    let { month } = req.query


    try {

        if (month < 10) {
            month = `0${month}`
        }

        let query = {
            dateOfSale: { $regex: `.*-${month}-.*` },
        };

        let result = await ProductModel.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ])

        let chartData = result.reduce((data, { _id, count }) => {
            data[_id] = count;
            return data;
        }, {});

        res.status(200).send({ total: chartData })
    } catch (err) {
        res.status(400).send({ err: err.message })

    }


})

productRoute.get("/combinedResponse", async (req, res) => {
    let { month } = req.query

    try {
        let statistics = await axios.get(`https://roxilermern.onrender.com/product/statistics?month=${month}`)

        let bar = await axios.get(`https://roxilermern.onrender.com/product/barchart?month=${month}`)

        let pie = await axios.get(`https://roxilermern.onrender.com/product/piechart?month=${month}`)

        let combinedData = {
            statistics: statistics.data,
            bar: bar.data,
            pie: pie.data,
        };
        res.status(200).send(combinedData)
    } catch (err) {
        res.status(400).send({ err: err.message })
    }
})
module.exports = productRoute