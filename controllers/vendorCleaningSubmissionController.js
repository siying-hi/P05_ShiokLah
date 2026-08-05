const vendorCleaningSubmissionModel = require("../models/vendorCleaningSubmissionModel");
const seedCleaningFallback = require("../models/seedCleaningFallback");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

function isDatabaseUnavailable(error) {
    return ["ELOGIN", "ESOCKET", "ETIMEOUT"].includes(error.code);
}

function mapSeedSubmission(submission) {
    return {
        submission_id: submission.id,
        stall_name: submission.stall,
        cleaning_date: submission.cleaningDate,
        cleaning_type: submission.schedule,
        cleaning_description: submission.cleaningDescription || "Cleaning evidence submitted for review.",
        cleaning_time: submission.cleaningTime || null,
        submission_reason: submission.submissionReason || "Cleaning evidence submission",
        photo_urls: submission.photoUrl ? [submission.photoUrl] : [],
        status: submission.status,
        review_remarks: submission.reviewRemarks,
        reviewed_by: submission.reviewedBy,
        review_date: submission.reviewDate
    };
}

async function saveUploadedPhotos(photos) {
    const batchId = crypto.randomUUID();
    const relativeDirectory = path.posix.join("uploads", "cleaning-submissions", batchId);
    const absoluteDirectory = path.join(__dirname, "..", "public", relativeDirectory);
    await fs.mkdir(absoluteDirectory, { recursive: true });

    return Promise.all(photos.map(async (photo, index) => {
        const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/.exec(photo.data || "");
        if (!match) throw new Error("Only JPG, PNG, WEBP, and GIF photos are accepted.");
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length > 8 * 1024 * 1024) throw new Error("Each photo must be 8 MB or smaller.");
        const safeName = path.basename(photo.name || `photo-${index + 1}.jpg`).replace(/[^a-zA-Z0-9._-]/g, "_");
        const storedName = `${index + 1}-${safeName}`;
        await fs.writeFile(path.join(absoluteDirectory, storedName), buffer);
        return {
            filename: safeName,
            imagePath: `/${relativeDirectory}/${encodeURIComponent(storedName)}`,
            mimeType: match[1],
            fileSize: buffer.length
        };
    }));
}

async function submitCleaningSubmission(req, res) {
    let savedPhotos = [];
    try {
        const vendorId = req.user.id;
        const stall = await vendorCleaningSubmissionModel.getFirstStallByVendorId(vendorId);

        if (!stall) {
            return res.status(404).json({
                message: "No stall is linked to this vendor account."
            });
        }

        savedPhotos = await saveUploadedPhotos(req.body.photos);
        const submissionId = await vendorCleaningSubmissionModel.createCleaningSubmission({
            stallId: stall.stall_id,
            cleaningType: req.body.cleaningType,
            cleaningDate: req.body.cleaningDate,
            cleaningTime: req.body.cleaningTime || null,
            cleaningDescription: req.body.cleaningDescription,
            submissionReason: req.body.submissionReason,
            photos: savedPhotos,
            submittedBy: `Vendor ${vendorId}`
        });

        res.status(201).json({
            message: "Cleaning submission sent for NEA review.",
            submissionId,
            stallName: stall.stall_name
        });
    } catch (error) {
        if (isDatabaseUnavailable(error)) {
            if (savedPhotos.length === 0) {
                savedPhotos = await saveUploadedPhotos(req.body.photos);
            }
            const created = seedCleaningFallback.createVendorSubmission(req.user.id, {
                ...req.body,
                savedPhotos
            });
            if (!created) return res.status(404).json({ message: "No stall is linked to this vendor account." });
            return res.status(201).json({
                message: "Cleaning submission sent for NEA review.",
                submissionId: created.id,
                stallName: created.stall
            });
        }

        res.status(500).json({
            message: "Failed to submit cleaning evidence.",
            error: error.message
        });
    }
}

async function getCleaningSubmissions(req, res) {
    try {
        const vendorId = req.user.id;
        const stall = await vendorCleaningSubmissionModel.getFirstStallByVendorId(vendorId);
        const submissions = await vendorCleaningSubmissionModel.getCleaningSubmissionsByVendorId(vendorId);

        res.json({ stall, submissions });
    } catch (error) {
        if (isDatabaseUnavailable(error)) {
            const vendorKey = `V-${Number(req.user.id)}`;
            const vendorSubmissions = seedCleaningFallback.getCleaningSubmissions()
                .filter((submission) => submission.vendorId === vendorKey);
            const first = vendorSubmissions[0];
            if (!first) return res.status(404).json({ message: "No stall is linked to this vendor account." });
            return res.json({
                stall: { stall_id: Number(req.user.id), stall_name: first.stall },
                submissions: vendorSubmissions.map(mapSeedSubmission)
            });
        }

        res.status(500).json({
            message: "Failed to load your cleaning submissions.",
            error: error.message
        });
    }
}

module.exports = {
    submitCleaningSubmission,
    getCleaningSubmissions
};
