const foodCertModel = require("../models/foodCertModel");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const seedCertificateFallback = require("../models/seedCertificateFallback");

const certificateUploadDirectory = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "vendor-certificates"
);

function isDatabaseUnavailable(error) {
    return error.code === "ELOGIN" ||
        error.code === "ESOCKET" ||
        error.code === "ETIMEOUT";
}

async function saveCertificatePicture(dataUrl, originalName) {
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl || "");
    if (!match) throw new Error("Invalid certificate picture.");

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 8 * 1024 * 1024) {
        throw new Error("Certificate picture must be 8 MB or smaller.");
    }

    const extensions = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    };
    const extension = extensions[match[1]];
    const fileName = `${crypto.randomUUID()}${extension.toLowerCase()}`;

    await fs.mkdir(certificateUploadDirectory, { recursive: true });
    await fs.writeFile(path.join(certificateUploadDirectory, fileName), buffer);

    return `/uploads/vendor-certificates/${fileName}`;
}

async function getFoodHandlerCertByVendorId(req, res) {
    try {
        const vendorId = req.user.id;

        const certificates = await foodCertModel.getFoodHandlerCertByVendorId(vendorId);

        res.status(200).json(certificates);

    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailable(error)) {
            return res.status(200).json(
                seedCertificateFallback.getVendorCertificates(req.user.id)
            );
        }

        res.status(500).json({
            message: "Error retrieving food handler certificates."
        });
    }
}

//Create food handler certificate
async function createFoodHandlerCertificate(req, res) {
    try {
        const vendorId = req.user.id;

        if (!req.body.certificate_image) {
            return res.status(400).json({
                error: ["Certificate picture is required."]
            });
        }

        const certificateImagePath = await saveCertificatePicture(
            req.body.certificate_image,
            req.body.certificate_image_name
        );
        req.body.certificate_image_path = certificateImagePath;

        const certificate = {
            ...req.body,
            vendor_id: vendorId,
            certificate_image_path: certificateImagePath
        };
        const result = await foodCertModel.createFoodHandlerCertificate(certificate);
        res.status(201).json({
            message: "Food handler certificate created successfully.",
            certificate: result
        });

    } catch (error) {
        console.error(error);
        if (isDatabaseUnavailable(error)) {
            const certificate = {
                ...req.body,
                vendor_id: req.user.id,
                certificate_image_path: req.body.certificate_image_path
            };
            const result = seedCertificateFallback.createVendorCertificate(certificate);
            return res.status(201).json({
                message: "Food handler certificate submitted successfully for NEA review.",
                certificate: result
            });
        }
        if (error.message === "Vendor not found") {
            return res.status(404).json({
                error: error.message
            });
        }
        if (error.message === "Certificate already exists") {
            return res.status(409).json({
                error: error.message
            });
        }
        res.status(500).json({
            error: "Failed to create food handler certificate."
        });
    }
}

async function updateCertificate(req, res) {
    try {
        const id = req.params.id;
        const vendorId = req.user.id;
        const certificateImagePath = req.body.certificate_image
            ? await saveCertificatePicture(
                req.body.certificate_image,
                req.body.certificate_image_name
            )
            : null;

        const result = await foodCertModel.updateCertificate(
            id,
            vendorId,
            {
                ...req.body,
                certificate_image_path: certificateImagePath
            }
        );

        if (!result) {
            return res.status(404).json({
                message: "Certificate not found."
            });
        }

        res.status(200).json({
            message: "Certificate updated successfully.",
            certificate: result
        });

    } catch (error) {
        console.error("Error updating certificate:", error);

        if (error.message === "Only pending certificates can be updated.") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update certificate."
        });
    }
}

//Delete food handler certificate
async function deleteCertificate(req, res) {

    try {

        const vendorId = req.user.id;
        const id = req.params.id;

        const deleted = await foodCertModel.deleteCertificate(
            id,
            vendorId
        );


        if (!deleted) {

            return res.status(404).json({
                message: "Certificate not found."
            });

        }


        res.status(200).json({
            message: "Certificate deleted successfully."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete certificate."
        });

    }

}

module.exports = {
    getFoodHandlerCertByVendorId,
    createFoodHandlerCertificate,
    updateCertificate,
    deleteCertificate
};
