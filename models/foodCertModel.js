const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function ensureCertificateImageColumn(connection) {
    await connection.request().query(`
        IF COL_LENGTH('FoodHandlerCertificate', 'certificate_image_path') IS NULL
        BEGIN
            ALTER TABLE FoodHandlerCertificate
            ADD certificate_image_path VARCHAR(500) NULL;
        END
    `);
}

//Retrieves all food handler certificate of that vendor
exports.getFoodHandlerCertByVendorId = async (vendorId) => {

    let connection;
    try {
        if (!vendorId) {
            throw new Error("Invalid vendor ID.");
        }
        connection = await sql.connect(dbConfig);
        await ensureCertificateImageColumn(connection);
        const result = await connection.request()
            .input("vendorId", sql.Int, vendorId)
            .query(`
                SELECT
                    certificate_id,
                    certificate_name,
                    issue_date,
                    expiry_date,
                    validity_period,
                    issuing_authority,
                    approval_status,
                    certificate_image_path
                FROM FoodHandlerCertificate
                WHERE vendor_id = @vendorId
                ORDER BY expiry_date ASC;
            `);
        return result.recordset;
    } catch (error) {
        console.error(
            "Error retrieving food handler certificates:",
            error
        );
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};



//Get certificate by id
exports.getCertificateById = async (id, vendorId) => {
    let connection;

    try {

        if (!id || !vendorId) {
            throw new Error("Invalid certificate ID or vendor ID.");
        }

        connection = await sql.connect(dbConfig);
        await ensureCertificateImageColumn(connection);

        const result = await connection.request()
            .input("id", sql.Int, id)
            .input("vendorId", sql.Int, vendorId)
            .query(`
                SELECT *
                FROM FoodHandlerCertificate
                WHERE certificate_id = @id 
                AND vendor_id = @vendorId
            `);

        return result.recordset[0] || null;

    } catch (error) {

        console.error(
            "Error retrieving certificate:",
            error
        );

        throw error;

    } finally {

        if (connection) {
            await connection.close();
        }

    }
};

//Create food handler certificate
exports.createFoodHandlerCertificate = async (certificate) => {
    let connection;
    try {

        if (!certificate) {
            throw new Error("Certificate data is required.");
        }

        connection = await sql.connect(dbConfig);
        await ensureCertificateImageColumn(connection);
        const result = await connection.request()
            .input("certificate_name",sql.VarChar,certificate.certificate_name)
            .input("vendor_id",sql.Int,certificate.vendor_id)
            .input("issue_date",sql.Date,certificate.issue_date)
            .input("expiry_date",sql.Date,certificate.expiry_date)
            .input("issuing_authority",sql.VarChar,certificate.issuing_authority)
            .input("certificate_image_path",sql.VarChar,certificate.certificate_image_path)
            .query(`
                INSERT INTO FoodHandlerCertificate
                (
                    certificate_name,
                    vendor_id,
                    issue_date,
                    expiry_date,
                    issuing_authority,
                    approval_status,
                    certificate_image_path
                )
                VALUES
                (
                    @certificate_name,
                    @vendor_id,
                    @issue_date,
                    @expiry_date,
                    @issuing_authority,
                    'Pending',
                    @certificate_image_path
                );

                SELECT SCOPE_IDENTITY() AS certificate_id;
            `);
        return result.recordset[0];

    } catch (error) {

        console.error(
            "Error creating food handler certificate:",
            error
        );
        throw error;

    } finally {

        if (connection) {
            await connection.close();
        }
    }
};

//Update certificate
exports.updateCertificate = async (id, vendorId, data) => {
    let connection;

    try {
        if (!id || !vendorId || !data) {
            throw new Error("Invalid certificate ID, vendor ID or data.");
        }

        connection = await sql.connect(dbConfig);
        await ensureCertificateImageColumn(connection);

        //Checks that certificate belongs to vendor and has a pending status before allowing update
        const certCheck = await connection.request()
            .input("id",sql.Int,id)
            .input("vendorId",sql.Int,vendorId)
            .query(`
                SELECT approval_status
                FROM FoodHandlerCertificate
                WHERE certificate_id = @id
                AND vendor_id = @vendorId
            `);

        if (certCheck.recordset.length === 0) {
            return null;
        }

        if (certCheck.recordset[0].approval_status !== "Pending") {
            throw new Error(
                "Only pending certificates can be updated."
            );
        }

        const result = await connection.request()
            .input("id",sql.Int,id)
            .input("vendorId",sql.Int,vendorId)
            .input("certificate_name",sql.VarChar,data.certificate_name)
            .input("issue_date",sql.Date,data.issue_date)
            .input("expiry_date",sql.Date,data.expiry_date)
            .input("issuing_authority",sql.VarChar,data.issuing_authority)
            .input("certificate_image_path",sql.VarChar,data.certificate_image_path)
            .query(`
                UPDATE FoodHandlerCertificate
                SET
                    certificate_name = @certificate_name,
                    issue_date = @issue_date,
                    expiry_date = @expiry_date,
                    issuing_authority = @issuing_authority,
                    certificate_image_path =
                        COALESCE(@certificate_image_path, certificate_image_path)
                WHERE certificate_id = @id
                AND vendor_id = @vendorId
            `);

        if (result.rowsAffected[0] === 0) {
            return null;
        }

        return await exports.getCertificateById(id,vendorId);

    } catch (error) {
        console.error(
            "Error updating certificate:",
            error
        );
        throw error;

    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

//Delete food handler certificate
exports.deleteCertificate = async (id, vendorId) => {
    let connection;

    try {
        if (!id || !vendorId) {
            throw new Error("Invalid certificate ID or vendor ID.");
        }

        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input(
                "id",
                sql.Int,
                id
            )
            .input(
                "vendorId",
                sql.Int,
                vendorId
            )
            .query(`
                DELETE FROM FoodHandlerCertificate
                WHERE certificate_id = @id
                AND vendor_id = @vendorId
            `);

        return result.rowsAffected[0] > 0;

    } catch (error) {

        console.error(
            "Error deleting certificate:",
            error
        );

        throw error;

    } finally {

        if (connection) {
            await connection.close();
        }

    }
};
