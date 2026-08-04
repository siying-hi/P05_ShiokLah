function validateVendorCleaningSubmission(req, res, next) {
    const {
        cleaningType,
        cleaningDate,
        cleaningTime,
        cleaningDescription,
        submissionReason,
        photos,
        watermarkConfirmed
    } = req.body;

    const errors = [];

    if (!cleaningType) errors.push("Cleaning type is required.");
    if (!cleaningDate) errors.push("Cleaning date is required.");
    if (!cleaningDescription) errors.push("Cleaning description is required.");
    if (!submissionReason || !String(submissionReason).trim()) errors.push("Reason for submission is required.");
    if (watermarkConfirmed !== true) errors.push("You must confirm every photo has a visible watermark.");

    if (!Array.isArray(photos) || photos.length === 0) {
        errors.push("At least one watermarked photo is required.");
    }
    if (Array.isArray(photos) && photos.length > 6) errors.push("A maximum of 6 photos is allowed.");

    if (cleaningTime && !/^\d{2}:\d{2}$/.test(cleaningTime)) {
        errors.push("Cleaning time must use HH:MM format.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
}

module.exports = {
    validateVendorCleaningSubmission
};
