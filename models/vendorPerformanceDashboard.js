const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getTotalOrders() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request().query(`
            SELECT COUNT(DISTINCT order_id) AS totalOrders
            FROM OrderHistory
        `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function getCustomerFrequency(stallId, filter) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        let query = "";

        switch (filter) {

            case "week":

                query = `
                    WITH Days AS (

                        SELECT 1 AS dayNumber, 'Monday' AS dayName
                        UNION ALL SELECT 2, 'Tuesday'
                        UNION ALL SELECT 3, 'Wednesday'
                        UNION ALL SELECT 4, 'Thursday'
                        UNION ALL SELECT 5, 'Friday'
                        UNION ALL SELECT 6, 'Saturday'
                        UNION ALL SELECT 7, 'Sunday'

                    ),

                    Customers AS (

                        SELECT
                            DATENAME(WEEKDAY, order_date) AS dayName,
                            COUNT(DISTINCT patron_id) AS customerCount

                        FROM OrderHistory

                        WHERE stall_id = @stallId

                        AND order_date >= DATEADD(
                            DAY,
                            -6,
                            CAST(GETDATE() AS DATE)
                        )

                        GROUP BY DATENAME(WEEKDAY, order_date)

                    )

                    SELECT

                        d.dayName AS label,

                        ISNULL(
                            c.customerCount,
                            0
                        ) AS value

                    FROM Days d

                    LEFT JOIN Customers c

                    ON d.dayName = c.dayName

                    ORDER BY d.dayNumber;
                `;

                break;



            case "month":

                query = `
                    WITH Weeks AS (

                        SELECT 1 AS weekNumber
                        UNION ALL SELECT 2
                        UNION ALL SELECT 3
                        UNION ALL SELECT 4
                        UNION ALL SELECT 5

                    ),

                    Customers AS (

                        SELECT

                            DATEDIFF(
                                WEEK,
                                DATEFROMPARTS(
                                    YEAR(order_date),
                                    MONTH(order_date),
                                    1
                                ),
                                order_date
                            ) + 1 AS weekNumber,

                            COUNT(DISTINCT patron_id) AS customerCount


                        FROM OrderHistory


                        WHERE stall_id = @stallId

                        AND MONTH(order_date) = MONTH(GETDATE())

                        AND YEAR(order_date) = YEAR(GETDATE())


                        GROUP BY

                            DATEDIFF(
                                WEEK,
                                DATEFROMPARTS(
                                    YEAR(order_date),
                                    MONTH(order_date),
                                    1
                                ),
                                order_date
                            ) + 1

                    )


                    SELECT

                        CONCAT(
                            'Week ',
                            w.weekNumber
                        ) AS label,

                        ISNULL(
                            c.customerCount,
                            0
                        ) AS value


                    FROM Weeks w


                    LEFT JOIN Customers c


                    ON w.weekNumber = c.weekNumber


                    WHERE w.weekNumber <= 4


                    ORDER BY w.weekNumber;

                `;

                break;



            case "year":

                query = `

                    WITH Months AS (

                        SELECT 1 AS monthNumber

                        UNION ALL

                        SELECT monthNumber + 1

                        FROM Months

                        WHERE monthNumber < 12

                    ),


                    Customers AS (

                        SELECT

                            MONTH(order_date) AS monthNumber,

                            COUNT(DISTINCT patron_id) AS customerCount


                        FROM OrderHistory


                        WHERE stall_id = @stallId

                        AND YEAR(order_date) = YEAR(GETDATE())


                        GROUP BY MONTH(order_date)

                    )


                    SELECT

                        DATENAME(
                            MONTH,
                            DATEFROMPARTS(
                                YEAR(GETDATE()),
                                m.monthNumber,
                                1
                            )
                        ) AS label,


                        ISNULL(
                            c.customerCount,
                            0
                        ) AS value


                    FROM Months m


                    LEFT JOIN Customers c


                    ON m.monthNumber = c.monthNumber


                    ORDER BY m.monthNumber


                    OPTION (MAXRECURSION 12);

                `;

                break;

        }


        const result = await connection.request()

            .input(
                "stallId",
                sql.Int,
                stallId
            )

            .query(query);


        return result.recordset;


    } finally {

        if (connection) {

            await connection.close();

        }

    }

}

async function getMenuPerformance(stallId, startDate, endDate) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()

            .input("stallId", sql.Int, stallId)
            .input("startDate", sql.Date, startDate)
            .input("endDate", sql.Date, endDate)

            .query(`

                SELECT

                    item_name,

                    SUM(quantity) AS total_quantity_ordered


                FROM OrderHistory


                WHERE stall_id = @stallId

                AND order_date BETWEEN @startDate AND @endDate


                GROUP BY item_name


                ORDER BY total_quantity_ordered DESC

            `);


        return result.recordset;


    } catch (error) {

        console.log(error);

        throw error;

    } finally {

        if (connection) {
            await connection.close();
        }

    }

}

async function getAverageRevenue(
    stallId,
    startDate,
    endDate
) {

    let connection;

    try {

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input(
                "stallId",
                sql.Int,
                stallId
            )
            .input(
                "startDate",
                sql.Date,
                startDate
            )
            .input(
                "endDate",
                sql.Date,
                endDate
            )
            .query(`

                WITH Months AS (

                    SELECT
                        DATEFROMPARTS(
                            YEAR(@startDate),
                            MONTH(@startDate),
                            1
                        ) AS monthStart

                    UNION ALL

                    SELECT
                        DATEADD(
                            MONTH,
                            1,
                            monthStart
                        )

                    FROM Months

                    WHERE DATEADD(
                        MONTH,
                        1,
                        monthStart
                    )
                    <= DATEFROMPARTS(
                        YEAR(@endDate),
                        MONTH(@endDate),
                        1
                    )

                ),

                Revenue AS (

                    SELECT
                        DATEFROMPARTS(
                            YEAR(order_date),
                            MONTH(order_date),
                            1
                        ) AS monthStart,

                        AVG(total_amt) AS average_revenue

                    FROM OrderHistory

                    WHERE stall_id = @stallId

                    AND order_date >= @startDate

                    AND order_date < DATEADD(
                        DAY,
                        1,
                        @endDate
                    )

                    GROUP BY
                        DATEFROMPARTS(
                            YEAR(order_date),
                            MONTH(order_date),
                            1
                        )

                )

                SELECT
                    FORMAT(
                        m.monthStart,
                        'MMM'
                    ) AS month,

                    ISNULL(
                        CAST(
                            r.average_revenue
                            AS DECIMAL(10,2)
                        ),
                        0
                    ) AS average_revenue

                FROM Months m

                LEFT JOIN Revenue r

                ON m.monthStart = r.monthStart

                ORDER BY m.monthStart

                OPTION (MAXRECURSION 12);

            `);

        return result.recordset;

    } catch(error) {

        console.log(error);

        throw error;

    } finally {

        if(connection) {
            await connection.close();
        }

    }

}

module.exports = {
    getTotalOrders,
    getCustomerFrequency,
    getMenuPerformance,
    getAverageRevenue
};