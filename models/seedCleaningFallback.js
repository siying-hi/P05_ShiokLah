let cleaningSubmissions = [
  {
    id: 9001,
    stall: "Banana Leaf Nasi Lemak",
    stallNo: "Test",
    vendorId: "V-1",
    vendorName: "johnathon goh",
    vendorEmail: "johnathonwong@gmail.com",
    schedule: "Daily every 1 day(s)",
    cleaningDate: "2026-07-15",
    dueDate: "2026-07-16",
    photoUrl: "/images/cleaning-submissions/banana-leaf-cleaning-watermarked-1.svg",
    status: "pending",
    reviewRemarks: "",
    reviewedBy: "",
    reviewDate: null
  },
  {
    id: 9002,
    stall: "Banana Leaf Nasi Lemak",
    stallNo: "Test",
    vendorId: "V-1",
    vendorName: "johnathon goh",
    vendorEmail: "johnathonwong@gmail.com",
    schedule: "Deep Clean every 7 day(s)",
    cleaningDate: "2026-07-12",
    dueDate: "2026-07-19",
    photoUrl: "/images/cleaning-submissions/banana-leaf-before-watermarked.svg",
    status: "approved",
    reviewRemarks: "Watermarked photos are clear. Cleaning standard accepted.",
    reviewedBy: "Jane Tan",
    reviewDate: "2026-07-13 09:15:00"
  },
  {
    id: 9003,
    stall: "Boon Lay Fried Carrot Cake",
    stallNo: "Jurong West Hawker Centre #01-12",
    vendorId: "V-2",
    vendorName: "Mei Lin",
    vendorEmail: "meilin@example.com",
    schedule: "Weekly every 7 day(s)",
    cleaningDate: "2026-07-14",
    dueDate: "2026-07-21",
    photoUrl: "/images/cleaning-submissions/boon-lay-counter-watermarked.svg",
    status: "pending",
    reviewRemarks: "",
    reviewedBy: "",
    reviewDate: null
  },
  {
    id: 9004,
    stall: "I. Mohamed Ismail Food Stall",
    stallNo: "Jurong West Hawker Centre #01-18",
    vendorId: "V-3",
    vendorName: "Rajesh Kumar",
    vendorEmail: "rajesh@example.com",
    schedule: "Daily every 1 day(s)",
    cleaningDate: "2026-07-13",
    dueDate: "2026-07-16",
    photoUrl: "/images/cleaning-submissions/ismail-counter-missing-watermark.svg",
    status: "rejected",
    reviewRemarks: "Watermark is missing from one photo. Vendor must resubmit watermarked evidence.",
    reviewedBy: "Jane Tan",
    reviewDate: "2026-07-14 08:40:00"
  },
  {
    id: 9005,
    stall: "Boon Lay Fried Carrot Cake",
    stallNo: "Jurong West Hawker Centre #01-12",
    vendorId: "V-2",
    vendorName: "Mei Lin",
    vendorEmail: "meilin@example.com",
    schedule: "Deep Clean every 14 day(s)",
    cleaningDate: "2026-07-10",
    dueDate: "2026-07-24",
    photoUrl: "/images/cleaning-submissions/boon-lay-deep-clean-before.svg",
    status: "approved",
    reviewRemarks: "Before and after photos match the stall and watermark requirements.",
    reviewedBy: "Jane Tan",
    reviewDate: "2026-07-11 09:05:00"
  }
];

function getCleaningSubmissions() {
  return cleaningSubmissions.map((submission) => ({ ...submission }));
}

function getCleaningSubmissionById(submissionId) {
  const id = Number(submissionId);
  const submission = cleaningSubmissions.find((item) => item.id === id);
  return submission ? { ...submission } : null;
}

function reviewCleaningSubmission(submissionId, review) {
  const id = Number(submissionId);
  const status = review.status === "approved" ? "approved" : "rejected";
  let updated = null;

  cleaningSubmissions = cleaningSubmissions.map((submission) => {
    if (submission.id !== id) return submission;

    updated = {
      ...submission,
      status,
      reviewedBy: review.reviewedBy,
      reviewDate: new Date().toISOString().slice(0, 19).replace("T", " "),
      reviewRemarks: review.remarks || submission.reviewRemarks || ""
    };

    return updated;
  });

  return updated ? { ...updated } : null;
}

function createVendorSubmission(vendorId, submission) {
  const vendorKey = `V-${Number(vendorId)}`;
  const existing = cleaningSubmissions.find((item) => item.vendorId === vendorKey);
  if (!existing) return null;

  const id = cleaningSubmissions.reduce((max, item) => Math.max(max, item.id), 9000) + 1;
  const created = {
    id,
    stall: existing.stall,
    stallNo: existing.stallNo,
    vendorId: vendorKey,
    vendorName: existing.vendorName,
    vendorEmail: existing.vendorEmail,
    schedule: submission.cleaningType,
    cleaningDate: submission.cleaningDate,
    cleaningTime: submission.cleaningTime || null,
    cleaningDescription: submission.cleaningDescription,
    submissionReason: submission.submissionReason,
    dueDate: submission.cleaningDate,
    photoUrl: submission.savedPhotos?.[0]?.imagePath || "",
    photoUrls: (submission.savedPhotos || []).map((photo) => photo.imagePath),
    status: "pending",
    reviewRemarks: "",
    reviewedBy: "",
    reviewDate: null
  };

  cleaningSubmissions.unshift(created);
  return { ...created };
}

module.exports = {
  getCleaningSubmissions,
  getCleaningSubmissionById,
  reviewCleaningSubmission,
  createVendorSubmission
};
