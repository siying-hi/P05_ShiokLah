const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getFirstStallByVendorId(vendorId) {
    const connection = await sql.connect(dbConfig);
    const result = await connection.request()
        .input("vendorId", sql.Int, vendorId)
        .query(`
            SELECT TOP 1 stall_id, stall_name
            FROM Stalls
            WHERE vendor_id = @vendorId
            ORDER BY stall_id
        `);

    return result.recordset[0] || null;
}

async function createCleaningSubmission(submission) {
    const connection = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(connection);

    await transaction.begin();

    try {
        const submissionResult = await new sql.Request(transaction)
            .input("stallId", sql.Int, submission.stallId)
            .input("cleaningDate", sql.Date, submission.cleaningDate)
            .input("cleaningTime", sql.VarChar, submission.cleaningTime || null)
            .input("submittedBy", sql.VarChar, submission.submittedBy)
            .input("cleaningType", sql.VarChar, submission.cleaningType)
            .input("cleaningDescription", sql.VarChar, `${submission.cleaningDescription}\n\nReason for submission: ${submission.submissionReason}`)
            .query(`
                INSERT INTO vendor_cleaning_submissions
                    (stall_id, cleaning_date, cleaning_time, submitted_by, cleaning_type, cleaning_description, status)
                OUTPUT INSERTED.submission_id
                VALUES
                    (@stallId, @cleaningDate, @cleaningTime, @submittedBy, @cleaningType, @cleaningDescription, 'Pending')
            `);

        const submissionId = submissionResult.recordset[0].submission_id;

        for (let index = 0; index < submission.photos.length; index += 1) {
            const photo = submission.photos[index];

            await new sql.Request(transaction)
                .input("submissionId", sql.Int, submissionId)
                .input("stallId", sql.Int, submission.stallId)
                .input("imagePath", sql.VarChar, photo.imagePath)
                .input("imageFilename", sql.VarChar, photo.filename)
                .input("imageFileSize", sql.BigInt, photo.fileSize)
                .input("imageMimeType", sql.VarChar, photo.mimeType)
                .input("isPrimary", sql.Bit, index === 0 ? 1 : 0)
                .input("uploadOrder", sql.Int, index)
                .input("uploadedBy", sql.VarChar, submission.submittedBy)
                .query(`
                    INSERT INTO submission_images
                        (submission_id, stall_id, image_path, image_filename, image_file_size, image_mime_type, is_primary, upload_order, uploaded_by)
                    VALUES
                        (@submissionId, @stallId, @imagePath, @imageFilename, @imageFileSize, @imageMimeType, @isPrimary, @uploadOrder, @uploadedBy)
                `);
        }

        await transaction.commit();
        return submissionId;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function getCleaningSubmissionsByVendorId(vendorId) {
    const connection = await sql.connect(dbConfig);
    const result = await connection.request()
        .input("vendorId", sql.Int, vendorId)
        .query(`
            SELECT
                vcs.submission_id,
                s.stall_id,
                s.stall_name,
                CONVERT(varchar(10), vcs.cleaning_date, 23) AS cleaning_date,
                vcs.cleaning_type,
                CASE WHEN CHARINDEX('Reason for submission:', vcs.cleaning_description) > 0
                  THEN RTRIM(LEFT(vcs.cleaning_description, CHARINDEX('Reason for submission:', vcs.cleaning_description) - 1))
                  ELSE vcs.cleaning_description END AS cleaning_description,
                CASE WHEN CHARINDEX('Reason for submission:', vcs.cleaning_description) > 0
                  THEN LTRIM(SUBSTRING(vcs.cleaning_description, CHARINDEX('Reason for submission:', vcs.cleaning_description) + LEN('Reason for submission:'), 8000))
                  ELSE NULL END AS submission_reason,
                CONVERT(varchar(5), vcs.cleaning_time, 108) AS cleaning_time,
                photos.photo_urls,
                vcs.status,
                vcs.review_remarks,
                vcs.reviewed_by,
                CONVERT(varchar(19), vcs.review_date, 120) AS review_date
            FROM vendor_cleaning_submissions vcs
            INNER JOIN Stalls s ON s.stall_id = vcs.stall_id
            OUTER APPLY (
                SELECT STRING_AGG(CAST(image_path AS varchar(max)), '|') WITHIN GROUP (ORDER BY upload_order, submission_image_id) AS photo_urls
                FROM submission_images
                WHERE submission_images.submission_id = vcs.submission_id
            ) photos
            WHERE s.vendor_id = @vendorId
            ORDER BY vcs.submission_datetime DESC, vcs.submission_id DESC
        `);

    return result.recordset.map((row) => ({
        ...row,
        photo_urls: row.photo_urls ? row.photo_urls.split("|") : []
    }));
}

module.exports = {
    getFirstStallByVendorId,
    createCleaningSubmission,
    getCleaningSubmissionsByVendorId
};
