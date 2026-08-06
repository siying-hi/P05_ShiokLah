/*Patrons*/
INSERT INTO Patrons (username, password, email, first_name, last_name)
VALUES (
  'alice_wong',
  '$2b$10$S07tpAGuFb4IBnssz/kpC.58/UX0r4LEdO93qMIK7uOb8PrjiE98a',
  'alicewong@gmail.com',
  'alice',
  'wong'
),
(
  'emily_lee',
  '$2b$10$8dadx/9TduPmc71sW8evEeH40juY4S.f0hhhCcK2SFV74m2xrPJpe',
  'alicelee@gmail.com',
  'emily',
  'lee'
);

/*Vendors*/
INSERT INTO Vendors (username, password, email, first_name, last_name)
VALUES (
  'johnathon_goh',
  '$2b$10$5.qpE5pfF5FKk2..UoV4sef1FFrFPEGOW4tcOUrQ2kJVq3k0cXBtm',
  'johnathonwong@gmail.com',
  'johnathon',
  'goh'
),
(
  'Harini_Singh',
  '$2b$10$KXZv49hFSZ62RQW0u16dZeHwelFTVXunRi4X5bvUUYCHPXIIjJxJe',
  'harinisinghh@gmail.com',
  'Harini',
  'Singh'
),
(
  'Angela_Koh',
  '$2b$10$SpwX.mL9Vj4edfsZSr2/ceNCzosg9PgDiBqq.UMSKLxYs9g62EvM2',
  'angelakoh@gmail.com',
  'Angela',
  'Koh'
),
(
  'vincent_tan',
  '$2b$10$G4MMQs60PrZu2H30KdVWhup9drXqvb73iO2oPTjomU62DoupeUjAu',
  'vincenttt123@gmail.com',
  'Vincent',
  'Tan'
),
(
  'ben_tan',
  '$2b$10$LyxKfvItxhjLrfpKbFItZekW/Qyfra1LDUYkUFPgb3VdDylsB.Jeq',
  'benjamintan333@gmail.com',
  'Benjamin',
  'Tan'
),
(
  'hansini_singh',
  '$2b$10$LgJweu7wMVw0tlgUnfPF3.MGt1QCOqYQ0zfPiemCWtTl6daN3dPp6',
  'hansini222@gmail.com',
  'Hansini',
  'Singh'
);
/*
INSERT INTO Vendors (username, password, email, first_name, last_name)
VALUES
(
  'mei_lin',
  '$2b$10$5.qpE5pfF5FKk2..UoV4sef1FFrFPEGOW4tcOUrQ2kJVq3k0cXBtm',
  'meilin@example.com',
  'Mei',
  'Lin'
),
(
  'rajesh_kumar',
  '$2b$10$5.qpE5pfF5FKk2..UoV4sef1FFrFPEGOW4tcOUrQ2kJVq3k0cXBtm',
  'rajesh@example.com',
  'Rajesh',
  'Kumar'
);
*/

/*Operators*/
INSERT INTO Operators (username, password, email, first_name, last_name)
VALUES (
  'janine_leow',
  '$2b$10$3h4xjs2mij.oGw5ANPn94ux/q7hcbBQuiXPh38ccLwOmUCOKZkuUO',
  'janineleow@gmail.com',
  'Janine',
  'Leow'
),
(
  'james_tan',
  '$2b$10$hdO0.uTX0nfZgtyDsVCWge3bgXtTk31KTUPrxoRvgGECMAHVdMfHa',
  'jamestan@gmail.com',
  'james',
  'tan'
);

/*NEA Officers*/
INSERT INTO NEAOfficers
    (username, full_name, email, password, phone, assigned_area, profile_image)
VALUES
    ('Jane_Tan',
     'Jane Tan',
     'jane_tan@nea.gov.sg',
     '$2b$10$YxM/NlFeF.Wiqq0HM03Sg.O2.H.gPpKAFpOcL8LA8WyW9re.piMY2',
     '91234567',
     'Jurong West',
     'jane-tan.png'
     ),
     ('William_Ong',
     'William Ong',
     'william_ong@nea.gov.sg',
     '$2b$10$0udZWt75G4RFjpC9xuYwduZ23rgdPtDAJcsXcWOjMnb0JZWxdTgSS',
     '81234561',
     'Tanglin Halt',
     'william-ong.png'
     );

/*Cuisine*/
INSERT INTO Cuisine (cuisine_type,vendor_id,default_status)
VALUES
('Malay',NULL,1),
('Chinese',NULL,1),
('Indian',NULL,1),
('Others',NULL,1);

-- INSERT INTO Stalls (stall_name,vendor_id,cuisine_id,location,contact_number,email,created_at,updated_at)
-- VALUES
-- ('Banana Leaf Nasi Lemak', 1,1,'Test','12345678','bananaleaf_nasi_lemak','2026-06-29 22:25:00','2026-06-29 22:25:00');

INSERT INTO Stalls
(
    stall_name,
    vendor_id,
    cuisine_id,
    location,
    contact_number,
    email,
    image_name,
    rating,
    created_at,
    updated_at
)
VALUES
(
    'Banana Leaf Nasi Lemak',
    1,
    1,
    'Boon Lay Hawker Centre #01-12',
    '87654321',
    'bananaleaf@gmail.com',
    'Banana Leaf Nasi Lemak Picture.jpg',
    4.4,
    '2026-06-29 22:25:00',
    '2026-06-29 22:25:00'
),
(
    'I. Mohamed Ismail Food Stall',
    2,
    3,
    'Boon Lay Hawker Centre #01-18',
    '81234567',
    'ismail_food@gmail.com',
    'I.Mohamed Ismail Food Stall Picture.jpg',
    4.4,
    '2026-06-29 22:25:00',
    '2026-06-29 22:25:00'
),
(
    'Big Daddy''s Chicken & Noodle',
    3,
    4,
    'Boon Lay Hawker Centre #01-34',
    '98773434',
    'daddychicken_foru@gmail.com',
    'Big Daddy''s Chicken & Noodle Picture.webp',
    4.6,
    '2023-04-29 23:25:03',
    '2026-06-29 22:25:00'
),
(
    'Boon Lay Lu Wei',
    4,
    2,
    'Boon Lay Hawker Centre #01-69',
    '90774920',
    'blluwwei125@gmail.com',
    'Boon Lay Lu Wei Picture.jpg',
    4.3,
    '2012-01-14 13:59:35',
    '2026-06-29 22:25:00'
),
(
    'Boon Lay Fried Carrot Cake & Kway Teow Mee',
    5,
    2,
    'Boon Lay Hawker Centre #01-66',
    '83346555',
    'boonlay_cckt@gmail.com',
    'Boon Lay Fried Carrot Cake & Kway Teow Mee Picture.jpg',
    4.7,
    '2025-03-23 09:23:12',
    '2026-06-29 22:25:00'
),
(
    '88 Katong Laksa',
    6,
    2,
    'Boon Lay Hawker Centre #01-75',
    '82223450',
    'boonlay_laksa@gmail.com',
    'katong-laksa.webp',
    4.9,
    '2009-11-09 19:45:38',
    '2026-06-29 22:25:00'
);


INSERT INTO MenuItem(item_name,price,food_description,allergen_info,estimated_waiting_time,image_name,visibility,stall_id)
VALUES
('Chicken Curry', 6.50,'A hearty bowl of curry with tender chicken and spices', 'milk,eggs,peanuts',7,'malaysiacurry.jpg',1,1),
('Set Meal A', 5.50, 'A balanced meal with rice, vegetables, and chicken curry', 'milk,eggs,peanuts', 10, 'Set Meal A Picture.jpg', 1, 1),
('Set Meal B', 6.00, 'A hearty combination of fried fish, sambal, and fragrant rice', 'fish,soy', 12, 'Set Meal B Picture.jpg', 1, 1),
('Set Meal C', 5.80, 'Vegetarian-friendly set with tofu, stir-fried greens, and rice', 'soy', 8, 'Set Meal C Picture.png', 1, 1),
('Set Meal D', 7.80, 'Premium set with beef rendang, sambal egg, and rice', 'milk,eggs', 15, 'Set Meal D Picture.jpg', 1, 1),
('5 pcs Otah', 4.50, 'Grilled spicy fish paste wrapped in banana leaf', 'fish', 6, 'Otah Picture.webp', 1, 1),
('Malaysia Curry', 6.50, 'A hearty bowl of curry with tender chicken and spices', 'milk,eggs,peanuts', 7, 'malaysiacurry.jpg', 1, 1),
('Mee Bakso', 7.20, 'Indonesian beef meatball noodle soup with rich broth', 'gluten', 9, 'meebakso.jpg', 1, 1),
('Nasi Sambal Goreng Daging', 8.80, 'Spicy sambal beef served with rice and vegetables', 'soy', 12, 'nasi-sambal-goreng-daging.jpg', 1, 1),
('Original Nasi Lemak', 6.00, 'Classic coconut rice with fried chicken, sambal, and egg', 'milk,eggs,fish', 10, 'nasilemak.jpg', 1, 1),
('Rendang Ayam', 9.50, 'Slow-cooked chicken in rich rendang spices', 'milk', 14, 'rendangayam.webp', 1, 1),
('White Carrot Cake', 4.50, 'Pan-fried carrot cake with egg and preserved radish', 'eggs,soy', 7, 'White Carrot Cake Picture.jpg', 1, 5),
('Black Carrot Cake', 4.80, 'Sweet dark sauce carrot cake with wok hei', 'eggs,soy', 8, 'Black Carrot Cake Picture.jpg', 1, 5),
('Char Kway Teow', 5.50, 'Flat rice noodles fried with egg, cockles, and dark sauce', 'eggs,shellfish,soy', 10, 'Char Kway Teow Picture.webp', 1, 5),
('Butter Chicken Curry', 7.20, 'Creamy spiced chicken curry served with rice', 'milk', 12, 'Indian Cuisine Picture.webp', 1, 3),
('Chicken Biryani', 8.00, 'Fragrant basmati rice with spiced chicken', 'milk', 14, 'Other Cuisines Picture.webp', 1, 3);

INSERT INTO hygiene_grades
  (stall_id, hygiene_grade, inspection_date, inspection_time, inspection_by, score, remarks)
VALUES
(1, 'A', '2026-07-08', '09:15', 'Jane Tan', 94.00, 'Food preparation area clean and records complete.'),
(2, 'B', '2026-07-08', '10:05', 'Jane Tan', 86.50, 'Minor oil residue found near cooking station. Follow-up during lunch inspection.'),
(3, 'A', '2026-07-09', '08:50', 'Jane Tan', 91.00, 'Good food storage and waste handling observed.');

-- Fake vendor cleaning submissions for the NEA officer Cleaning Reviews page
IF NOT EXISTS (SELECT 1 FROM Cleaning_compliance_rules WHERE stall_id = 1 AND cleaning_type = 'Daily')
BEGIN
  INSERT INTO Cleaning_compliance_rules
    (stall_id, cleaning_type, frequency_days, images_required, require_before_after, max_days_between_cleaning, is_active)
  VALUES
    (1, 'Daily', 1, 3, 1, 2, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Cleaning_compliance_rules WHERE stall_id = 2 AND cleaning_type = 'Weekly')
BEGIN
  INSERT INTO Cleaning_compliance_rules
    (stall_id, cleaning_type, frequency_days, images_required, require_before_after, max_days_between_cleaning, is_active)
  VALUES
    (2, 'Weekly', 7, 3, 1, 8, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Cleaning_compliance_rules WHERE stall_id = 3 AND cleaning_type = 'Deep Clean')
BEGIN
  INSERT INTO Cleaning_compliance_rules
    (stall_id, cleaning_type, frequency_days, images_required, require_before_after, max_days_between_cleaning, is_active)
  VALUES
    (3, 'Deep Clean', 14, 4, 1, 16, 1);
END;

DECLARE @cleaningSubmission1 INT;
DECLARE @cleaningSubmission2 INT;
DECLARE @cleaningSubmission3 INT;
DECLARE @cleaningSubmission4 INT;
DECLARE @cleaningSubmission5 INT;

IF NOT EXISTS (
  SELECT 1 FROM vendor_cleaning_submissions
  WHERE stall_id = 1 AND cleaning_date = '2026-07-15' AND submitted_by = 'johnathon_goh'
)
BEGIN
  INSERT INTO vendor_cleaning_submissions
    (stall_id, cleaning_date, cleaning_time, submission_datetime, submitted_by, cleaning_type, cleaning_duration_minutes, cleaning_description, status, ip_address, device_info)
  VALUES
    (1, '2026-07-15', '07:40', '2026-07-15 07:48:00', 'johnathon_goh', 'Daily', 35, 'Morning counter wipe-down, floor mopping, and bin clearing completed. Photos are watermarked with stall name and date.', 'Pending', '192.168.1.21', 'Vendor mobile upload');

  SET @cleaningSubmission1 = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @cleaningSubmission1 = submission_id
  FROM vendor_cleaning_submissions
  WHERE stall_id = 1 AND cleaning_date = '2026-07-15' AND submitted_by = 'johnathon_goh'
  ORDER BY submission_id;
END;

IF NOT EXISTS (
  SELECT 1 FROM vendor_cleaning_submissions
  WHERE stall_id = 1 AND cleaning_date = '2026-07-12' AND submitted_by = 'johnathon_goh'
)
BEGIN
  INSERT INTO vendor_cleaning_submissions
    (stall_id, cleaning_date, cleaning_time, submission_datetime, submitted_by, cleaning_type, cleaning_duration_minutes, cleaning_description, status, reviewed_by, review_date, review_remarks, review_score, ip_address, device_info)
  VALUES
    (1, '2026-07-12', '21:10', '2026-07-12 21:22:00', 'johnathon_goh', 'Deep Clean', 70, 'End-of-week deep cleaning with before and after watermarked photos.', 'Approved', 'Jane Tan', '2026-07-13 09:15:00', 'Watermarked photos are clear. Cleaning standard accepted.', 92.50, '192.168.1.21', 'Vendor mobile upload');

  SET @cleaningSubmission2 = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @cleaningSubmission2 = submission_id
  FROM vendor_cleaning_submissions
  WHERE stall_id = 1 AND cleaning_date = '2026-07-12' AND submitted_by = 'johnathon_goh'
  ORDER BY submission_id;
END;

IF NOT EXISTS (
  SELECT 1 FROM vendor_cleaning_submissions
  WHERE stall_id = 2 AND cleaning_date = '2026-07-14' AND submitted_by = 'mei_lin'
)
BEGIN
  INSERT INTO vendor_cleaning_submissions
    (stall_id, cleaning_date, cleaning_time, submission_datetime, submitted_by, cleaning_type, cleaning_duration_minutes, cleaning_description, status, ip_address, device_info)
  VALUES
    (2, '2026-07-14', '15:25', '2026-07-14 15:36:00', 'mei_lin', 'Weekly', 48, 'Oil splash area and preparation bench cleaned. Submitted images include visible watermark.', 'Pending', '192.168.1.34', 'Vendor tablet upload');

  SET @cleaningSubmission3 = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @cleaningSubmission3 = submission_id
  FROM vendor_cleaning_submissions
  WHERE stall_id = 2 AND cleaning_date = '2026-07-14' AND submitted_by = 'mei_lin'
  ORDER BY submission_id;
END;

IF NOT EXISTS (
  SELECT 1 FROM vendor_cleaning_submissions
  WHERE stall_id = 3 AND cleaning_date = '2026-07-13' AND submitted_by = 'rajesh_kumar'
)
BEGIN
  INSERT INTO vendor_cleaning_submissions
    (stall_id, cleaning_date, cleaning_time, submission_datetime, submitted_by, cleaning_type, cleaning_duration_minutes, cleaning_description, status, reviewed_by, review_date, review_remarks, review_score, ip_address, device_info)
  VALUES
    (3, '2026-07-13', '18:05', '2026-07-13 18:20:00', 'rajesh_kumar', 'Daily', 25, 'Evening cleaning submission for cooking station and service counter.', 'Rejected', 'Jane Tan', '2026-07-14 08:40:00', 'Watermark is missing from one photo. Vendor must resubmit watermarked evidence.', 61.00, '192.168.1.52', 'Vendor mobile upload');

  SET @cleaningSubmission4 = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @cleaningSubmission4 = submission_id
  FROM vendor_cleaning_submissions
  WHERE stall_id = 3 AND cleaning_date = '2026-07-13' AND submitted_by = 'rajesh_kumar'
  ORDER BY submission_id;
END;

IF NOT EXISTS (
  SELECT 1 FROM vendor_cleaning_submissions
  WHERE stall_id = 2 AND cleaning_date = '2026-07-10' AND submitted_by = 'mei_lin'
)
BEGIN
  INSERT INTO vendor_cleaning_submissions
    (stall_id, cleaning_date, cleaning_time, submission_datetime, submitted_by, cleaning_type, cleaning_duration_minutes, cleaning_description, status, reviewed_by, review_date, review_remarks, review_score, ip_address, device_info)
  VALUES
    (2, '2026-07-10', '20:35', '2026-07-10 20:48:00', 'mei_lin', 'Deep Clean', 65, 'Deep cleaning after dinner service with watermarked before and after photos.', 'Approved', 'Jane Tan', '2026-07-11 09:05:00', 'Before and after photos match the stall and watermark requirements.', 89.00, '192.168.1.34', 'Vendor tablet upload');

  SET @cleaningSubmission5 = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @cleaningSubmission5 = submission_id
  FROM vendor_cleaning_submissions
  WHERE stall_id = 2 AND cleaning_date = '2026-07-10' AND submitted_by = 'mei_lin'
  ORDER BY submission_id;
END;

IF NOT EXISTS (SELECT 1 FROM submission_images WHERE submission_id = @cleaningSubmission1)
BEGIN
  INSERT INTO submission_images
    (submission_id, stall_id, image_path, image_filename, image_file_size, image_mime_type, image_width, image_height, image_description, is_primary, is_before_cleaning, is_after_cleaning, upload_order, uploaded_by)
  VALUES
    (@cleaningSubmission1, 1, '/images/cleaning-submissions/banana-leaf-cleaning-watermarked-1.svg', 'banana-leaf-cleaning-watermarked-1.jpg', 248000, 'image/svg+xml', 1280, 720, 'Watermarked after-cleaning counter photo.', 1, 0, 1, 1, 'johnathon_goh'),
    (@cleaningSubmission1, 1, '/images/nasilemak.jpg', 'banana-leaf-floor-watermarked-2.jpg', 215000, 'image/jpeg', 1280, 720, 'Watermarked floor and bin area photo.', 0, 0, 1, 2, 'johnathon_goh');
END;

IF NOT EXISTS (SELECT 1 FROM submission_images WHERE submission_id = @cleaningSubmission2)
BEGIN
  INSERT INTO submission_images
    (submission_id, stall_id, image_path, image_filename, image_file_size, image_mime_type, image_width, image_height, image_description, is_primary, is_before_cleaning, is_after_cleaning, upload_order, uploaded_by, is_verified, verified_by, verified_date, verification_remarks)
  VALUES
    (@cleaningSubmission2, 1, '/images/cleaning-submissions/banana-leaf-before-watermarked.svg', 'banana-leaf-before-watermarked.jpg', 226000, 'image/svg+xml', 1280, 720, 'Watermarked before-cleaning preparation area photo.', 1, 1, 0, 1, 'johnathon_goh', 1, 'Jane Tan', '2026-07-13 09:15:00', 'Approved by NEA officer'),
    (@cleaningSubmission2, 1, '/images/Set Meal B Picture.jpg', 'banana-leaf-after-watermarked.jpg', 233000, 'image/jpeg', 1280, 720, 'Watermarked after-cleaning preparation area photo.', 0, 0, 1, 2, 'johnathon_goh', 1, 'Jane Tan', '2026-07-13 09:15:00', 'Approved by NEA officer');
END;

IF NOT EXISTS (SELECT 1 FROM submission_images WHERE submission_id = @cleaningSubmission3)
BEGIN
  INSERT INTO submission_images
    (submission_id, stall_id, image_path, image_filename, image_file_size, image_mime_type, image_width, image_height, image_description, is_primary, is_before_cleaning, is_after_cleaning, upload_order, uploaded_by)
  VALUES
    (@cleaningSubmission3, 2, '/images/cleaning-submissions/boon-lay-counter-watermarked.svg', 'boon-lay-counter-watermarked.jpg', 242000, 'image/svg+xml', 1280, 720, 'Watermarked counter cleaning photo.', 1, 0, 1, 1, 'mei_lin'),
    (@cleaningSubmission3, 2, '/images/White Carrot Cake Picture.jpg', 'boon-lay-stove-watermarked.jpg', 219000, 'image/jpeg', 1280, 720, 'Watermarked cooking station photo.', 0, 0, 1, 2, 'mei_lin');
END;

IF NOT EXISTS (SELECT 1 FROM submission_images WHERE submission_id = @cleaningSubmission4)
BEGIN
  INSERT INTO submission_images
    (submission_id, stall_id, image_path, image_filename, image_file_size, image_mime_type, image_width, image_height, image_description, is_primary, is_before_cleaning, is_after_cleaning, upload_order, uploaded_by, verification_remarks)
  VALUES
    (@cleaningSubmission4, 3, '/images/cleaning-submissions/ismail-counter-missing-watermark.svg', 'ismail-counter-missing-watermark.jpg', 238000, 'image/svg+xml', 1280, 720, 'Counter photo missing required watermark.', 1, 0, 1, 1, 'rajesh_kumar', 'Rejected because watermark is missing.');
END;

IF NOT EXISTS (SELECT 1 FROM submission_images WHERE submission_id = @cleaningSubmission5)
BEGIN
  INSERT INTO submission_images
    (submission_id, stall_id, image_path, image_filename, image_file_size, image_mime_type, image_width, image_height, image_description, is_primary, is_before_cleaning, is_after_cleaning, upload_order, uploaded_by, is_verified, verified_by, verified_date, verification_remarks)
  VALUES
    (@cleaningSubmission5, 2, '/images/cleaning-submissions/boon-lay-deep-clean-before.svg', 'boon-lay-deep-clean-before.jpg', 229000, 'image/svg+xml', 1280, 720, 'Watermarked before-cleaning wok area photo.', 1, 1, 0, 1, 'mei_lin', 1, 'Jane Tan', '2026-07-11 09:05:00', 'Approved by NEA officer'),
    (@cleaningSubmission5, 2, '/images/Char Kway Teow Picture.webp', 'boon-lay-deep-clean-after.webp', 231000, 'image/webp', 1280, 720, 'Watermarked after-cleaning wok area photo.', 0, 0, 1, 2, 'mei_lin', 1, 'Jane Tan', '2026-07-11 09:05:00', 'Approved by NEA officer');
END;

IF EXISTS (SELECT 1 FROM Latest_cleaning_dates WHERE stall_id = 1)
BEGIN
  UPDATE Latest_cleaning_dates
  SET last_cleaning_date = '2026-07-15',
      last_cleaning_time = '07:40',
      last_submission_id = @cleaningSubmission1,
      cleaning_type = 'Daily',
      performed_by = 'johnathon_goh',
      next_scheduled_cleaning = '2026-07-16',
      cleaning_status = 'Pending Review',
      remarks = 'Newest submission is waiting for NEA review.',
      updated_at = GETDATE()
  WHERE stall_id = 1;
END
ELSE
BEGIN
  INSERT INTO Latest_cleaning_dates
    (stall_id, last_cleaning_date, last_cleaning_time, last_submission_id, cleaning_type, performed_by, next_scheduled_cleaning, cleaning_status, remarks)
  VALUES
    (1, '2026-07-15', '07:40', @cleaningSubmission1, 'Daily', 'johnathon_goh', '2026-07-16', 'Pending Review', 'Newest submission is waiting for NEA review.');
END;

IF EXISTS (SELECT 1 FROM Latest_cleaning_dates WHERE stall_id = 2)
BEGIN
  UPDATE Latest_cleaning_dates
  SET last_cleaning_date = '2026-07-14',
      last_cleaning_time = '15:25',
      last_submission_id = @cleaningSubmission3,
      cleaning_type = 'Weekly',
      performed_by = 'mei_lin',
      next_scheduled_cleaning = '2026-07-21',
      cleaning_status = 'Pending Review',
      remarks = 'Weekly submission awaiting approval.',
      updated_at = GETDATE()
  WHERE stall_id = 2;
END
ELSE
BEGIN
  INSERT INTO Latest_cleaning_dates
    (stall_id, last_cleaning_date, last_cleaning_time, last_submission_id, cleaning_type, performed_by, next_scheduled_cleaning, cleaning_status, remarks)
  VALUES
    (2, '2026-07-14', '15:25', @cleaningSubmission3, 'Weekly', 'mei_lin', '2026-07-21', 'Pending Review', 'Weekly submission awaiting approval.');
END;

IF EXISTS (SELECT 1 FROM Latest_cleaning_dates WHERE stall_id = 3)
BEGIN
  UPDATE Latest_cleaning_dates
  SET last_cleaning_date = '2026-07-13',
      last_cleaning_time = '18:05',
      last_submission_id = @cleaningSubmission4,
      cleaning_type = 'Daily',
      performed_by = 'rajesh_kumar',
      next_scheduled_cleaning = '2026-07-16',
      cleaning_status = 'Follow-up Required',
      remarks = 'Rejected due to missing watermark.',
      updated_at = GETDATE()
  WHERE stall_id = 3;
END
ELSE
BEGIN
  INSERT INTO Latest_cleaning_dates
    (stall_id, last_cleaning_date, last_cleaning_time, last_submission_id, cleaning_type, performed_by, next_scheduled_cleaning, cleaning_status, remarks)
  VALUES
    (3, '2026-07-13', '18:05', @cleaningSubmission4, 'Daily', 'rajesh_kumar', '2026-07-16', 'Follow-up Required', 'Rejected due to missing watermark.');
END;




INSERT INTO OrderHistory (order_id, patron_id, stall_id, order_date, order_status,
    item_id, item_name, quantity, price, total_amt)
VALUES
-- Order 1
(1, 1, 1, '2026-03-05 12:15:00', 'Completed', 10, 'Original Nasi Lemak', 2, 6.00, 12.00),
(1, 1, 1, '2026-03-05 12:15:00', 'Completed', 6, '5 pcs Otah', 1, 4.50, 4.50),

-- Order 2
(2, 1, 3, '2026-03-12 18:45:00', 'Completed', 15, 'Butter Chicken Curry', 1, 7.20, 7.20),
(2, 1, 5, '2026-03-12 18:45:00', 'Completed', 14, 'Char Kway Teow', 2, 5.50, 11.00),

-- Order 3
(3, 1, 1, '2026-04-02 11:00:00', 'Completed', 1, 'Chicken Curry', 1, 6.50, 6.50),
(3, 1, 1, '2026-04-02 11:00:00', 'Completed', 2, 'Set Meal A', 1, 5.50, 5.50),

-- Order 4
(4, 1, 1, '2026-04-15 19:20:00', 'Completed', 9, 'Nasi Sambal Goreng Daging', 1, 8.80, 8.80),
(4, 1, 4, '2026-04-15 19:20:00', 'Completed', 8, 'Mee Bakso', 1, 7.20, 7.20),

-- Order 5
(5, 1, 1, '2026-05-03 09:45:00', 'Completed', 11, 'Rendang Ayam', 2, 9.50, 19.00),
(5, 1, 5, '2026-05-03 09:45:00', 'Completed', 12, 'White Carrot Cake', 1, 4.50, 4.50),

-- Order 6
(6, 1, 3, '2026-06-11 17:40:00', 'Completed', 16, 'Chicken Biryani', 2, 8.00, 16.00),
(6, 1, 1, '2026-06-11 17:40:00', 'Completed', 4, 'Set Meal C', 1, 5.80, 5.80);

-- Cart
-- INSERT INTO Carts (patron_id, stall_id) Commented out carts and cartitems seed data because it is not crucial for setup
-- VALUES
-- (1, 1),
-- (2, 2),
-- (3, 3),
-- (4, 4),
-- (5, 5),
-- (6, 1),
-- (7, 2),
-- (8, 3),
-- (9, 4),
-- (10, 5),
-- (11, 1),
-- (12, 2),
-- (13, 3),
-- (14, 4),
-- (15, 5),
-- (16, 1),
-- (17, 2),
-- (18, 3),
-- (19, 4),
-- (20, 5);

-- -- CartItems
-- INSERT INTO CartItems (cart_id, item_id, quantity)
-- VALUES
-- (1, 1, 2),
-- (1, 2, 1),
-- (2, 3, 1),
-- (3, 4, 2),
-- (3, 5, 1),
-- (4, 8, 1),
-- (4, 9, 2),
-- (5, 11, 1),
-- (6, 1, 3),
-- (6, 2, 1),
-- (7, 3, 2),
-- (8, 4, 1),
-- (8, 6, 1),
-- (9, 8, 2),
-- (10, 11, 2),
-- (11, 12, 1),
-- (12, 13, 2),
-- (13, 14, 1),
-- (14, 5, 1),
-- (15, 7, 2);

--orders
INSERT INTO Orders
(
    patron_id,
    stall_id,
    order_mode,
    payment_method,
    subtotal,
    packaging_fee,
    total_price
)
VALUES
(
    1,
    1,
    'Self-Pickup',
    'Cash',
    6.50,
    0.00,
    6.50
);

INSERT INTO OrderItems
(
    order_id,
    item_id,
    quantity,
    price
)
VALUES
(
    1,
    1,
    1,
    6.50
);

DECLARE @hygieneOrder1 INT;
DECLARE @hygieneOrder2 INT;
DECLARE @hygieneOrder3 INT;
DECLARE @nonHygieneOrder INT;

SELECT TOP 1 @hygieneOrder1 = order_id
FROM Orders
WHERE patron_id = 1 AND stall_id = 1 AND item_id = 1
ORDER BY order_id;

IF NOT EXISTS (
  SELECT 1 FROM Orders
  WHERE patron_id = 1 AND stall_id = 2 AND item_id = 12 AND time_created = '2026-07-15 12:20:00'
)
BEGIN
  INSERT INTO Orders
    (time_created, patron_id, order_mode, item_id, item_name, price, quantity, stall_id, order_status, packaging_type, size, packaging_price)
  VALUES
    ('2026-07-15 12:20:00', 1, 'Dine-In', 12, 'White Carrot Cake', 4.50, 1, 2, 'Completed', 'nil', 'nil', 0.00);

  SET @hygieneOrder2 = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @hygieneOrder2 = order_id
  FROM Orders
  WHERE patron_id = 1 AND stall_id = 2 AND item_id = 12 AND time_created = '2026-07-15 12:20:00'
  ORDER BY order_id;
END;

IF NOT EXISTS (
  SELECT 1 FROM Orders
  WHERE patron_id = 1 AND stall_id = 3 AND item_id = 15 AND time_created = '2026-07-15 18:45:00'
)
BEGIN
  INSERT INTO Orders
    (time_created, patron_id, order_mode, item_id, item_name, price, quantity, stall_id, order_status, packaging_type, size, packaging_price)
  VALUES
    ('2026-07-15 18:45:00', 1, 'Takeaway', 15, 'Butter Chicken Curry', 7.20, 1, 3, 'Completed', 'nil', 'nil', 0.00);

  SET @hygieneOrder3 = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @hygieneOrder3 = order_id
  FROM Orders
  WHERE patron_id = 1 AND stall_id = 3 AND item_id = 15 AND time_created = '2026-07-15 18:45:00'
  ORDER BY order_id;
END;

IF NOT EXISTS (
  SELECT 1 FROM Orders
  WHERE patron_id = 1 AND stall_id = 1 AND item_id = 2 AND time_created = '2026-07-16 09:30:00'
)
BEGIN
  INSERT INTO Orders
    (time_created, patron_id, order_mode, item_id, item_name, price, quantity, stall_id, order_status, packaging_type, size, packaging_price)
  VALUES
    ('2026-07-16 09:30:00', 1, 'Dine-In', 2, 'Set Meal A', 5.50, 1, 1, 'Completed', 'nil', 'nil', 0.00);

  SET @nonHygieneOrder = SCOPE_IDENTITY();
END
ELSE
BEGIN
  SELECT TOP 1 @nonHygieneOrder = order_id
  FROM Orders
  WHERE patron_id = 1 AND stall_id = 1 AND item_id = 2 AND time_created = '2026-07-16 09:30:00'
  ORDER BY order_id;
END;

IF @hygieneOrder1 IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM Complaints
  WHERE order_id = @hygieneOrder1
    AND complaint_description = 'Hygiene issue: table and serving counter looked dirty during collection.'
)
BEGIN
  INSERT INTO Complaints (order_id, patron_id, complaint_description, date_submitted)
  VALUES (@hygieneOrder1, 1, 'Hygiene issue: table and serving counter looked dirty during collection.', '2026-07-15 13:05:00');
END;

IF @hygieneOrder2 IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM Complaints
  WHERE order_id = @hygieneOrder2
    AND complaint_description = 'Food hygiene complaint: saw oil stains and unclean utensils near the frying station.'
)
BEGIN
  INSERT INTO Complaints (order_id, patron_id, complaint_description, date_submitted)
  VALUES (@hygieneOrder2, 1, 'Food hygiene complaint: saw oil stains and unclean utensils near the frying station.', '2026-07-15 13:35:00');
END;

IF @hygieneOrder3 IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM Complaints
  WHERE order_id = @hygieneOrder3
    AND complaint_description = 'Cleanliness complaint: pest spotted near the stall collection counter.'
)
BEGIN
  INSERT INTO Complaints (order_id, patron_id, complaint_description, date_submitted)
  VALUES (@hygieneOrder3, 1, 'Cleanliness complaint: pest spotted near the stall collection counter.', '2026-07-15 19:10:00');
END;

IF @nonHygieneOrder IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM Complaints
  WHERE order_id = @nonHygieneOrder
    AND complaint_description = 'Order took too long to prepare.'
)
BEGIN
  INSERT INTO Complaints (order_id, patron_id, complaint_description, date_submitted)
  VALUES (@nonHygieneOrder, 1, 'Order took too long to prepare.', '2026-07-16 10:05:00');
END;



INSERT INTO eco_packaging (packaging_name,packaging_type, size, price_per_unit)
VALUES
('Small Box','Box', 'Small', 0.50);


INSERT INTO FoodHandlerCertificate (certificate_name,vendor_id,issue_date,expiry_date,issuing_authority,approval_status)
VALUES
('Basic Food Safety',1,'2026-07-01','2027-07-01','Singapore Food Agency','Pending'),
('Food Handler Refresher',1,'2025-12-15','2026-10-15','Singapore Food Agency','Approved'),
('Stall Hygiene Permit',1,'2026-01-20','2026-08-20','National Environment Agency','Pending'),
('Food Safety Supervisor',1,'2024-09-01','2026-09-01','Health Department','Rejected');


INSERT INTO RentalAgreement (agr_start_date, agr_end_date, agr_term_condition, agr_status, rental_price, trade_type, officer_id, stall_id)
VALUES ('2026-07-16', '2026-07-16', 'Standard rental terms apply', 'expired', 1200.00, 'cooked food', 1, 1),
('2026-07-16', '2026-07-16', 'Standard rental terms apply', 'inactive', 1200.00, 'cooked food', 1, 1);

INSERT INTO Feedbacks
(
    order_id,
    stall_id,
    patron_id,
    food_rating,
    service_rating,
    atmosphere_rating,
    feedback_description
)
VALUES
(1, 1, 1, 5, 5, 4,
'The chicken curry was delicious! The curry was rich and flavourful, and the portion was generous.'),

(2, 1, 1, 4, 5, 4,
'Really enjoyed the nasi lemak. Service was fast and the staff were friendly.'),

(3, 2, 1, 5, 4, 4,
'The mee rebus tasted authentic. Would definitely order again.'),

(4, 3, 1, 4, 5, 5,
'Chicken was juicy and the noodles were cooked perfectly.'),

(5, 4, 1, 4, 3, 4,
'Food was good but had to wait a little longer than expected.'),

(6, 5, 1, 5, 5, 5,
'Best carrot cake I have eaten in a long time! Crispy and flavourful.'),

(7, 6, 1, 5, 4, 5,
'The laksa broth was amazing. Highly recommended!'),

(8, 1, 1, 3, 4, 4,
'Food was decent but could have been hotter when served.'),

(9, 2, 1, 5, 5, 4,
'Very generous portions and excellent value for money.'), 

(10, 3, 1, 4, 4, 5,
'Loved the ambience around the hawker centre. Great experience overall.'),

(11, 4, 1, 2, 3, 4,
'The food was slightly too salty, but customer service was helpful.'),

(12, 5, 1, 5, 5, 5,
'Everything was perfect. Will definitely come back again!'),

(13, 6, 1, 4, 5, 4,
'Fresh ingredients and the queue moved surprisingly quickly.'),

(14, 1, 1, 5, 4, 5,
'Excellent chicken curry and very friendly hawker.'),

(15, 2, 1, 3, 4, 4,
'Food was okay overall but I expected a bigger portion.'),

(16, 3, 1, 5, 5, 4,
'One of my favourite stalls in Boon Lay Hawker Centre.'),

(17, 4, 1, 4, 3, 3,
'Good food although the waiting time was quite long during lunch.'),

(18, 3, 1, 5, 5, 4,
'Highly recommend trying their chicken curry. Great flavour and excellent service.');

INSERT INTO Complaints
(
    order_id,
    patron_id,
    stall_id,
    item_id,
    purchase_date,
    food_issue,
    service_issue,
    additional_comments,
    complaint_status,
    date_submitted,
    date_updated
)
VALUES
(
    1,
    1,
    1,
    1,
    '2026-07-08',
    'The chicken was cold and the curry was watery.',
    'Staff were polite but the waiting time was close to 30 minutes.',
    'Please improve the food temperature.',
    'Pending Review',
    '2026-07-08 11:15:00',
    '2026-08-08 2:15:00'
),


INSERT INTO FavouriteMenuItems
(
    patron_id,
    item_id
)
VALUES
(1, 1),
(1, 2),
(1, 3);

INSERT INTO Rewards
(
    patron_id,
    reward_name,
    reward_description,
    reward_type,
    reward_value,
    reward_code,
    minimum_spend,
    is_used,
    expiry_date
)

VALUES

(
    1,
    '20% OFF',
    'Get 20% off your next order',
    'Percentage',
    20.00,
    'OFF20',
    0.00,
    0,
    '2026-12-31'
),

(
    1,
    '$10 Voucher',
    'Get $10 off when you spend at least $15',
    'Fixed',
    10.00,
    'TENOFF',
    15.00,
    0,
    '2026-12-31'
),

(
    1,
    'Save $15',
    'Get $15 off when you spend at least $25',
    'Fixed',
    15.00,
    'SAVE15',
    25.00,
    0,
    '2026-12-31'
),

(
    1,
    'Free Takeaway',
    'Get free takeaway packaging',
    'Free Takeaway',
    0.00,
    'TAKE2',
    10.00,
    0,
    '2026-12-31'
);
/*
DELETE FROM RentalAgreement;
DELETE FROM Patrons;
DELETE FROM Vendors;
DELETE FROM NEAOfficers;
DELETE FROM Orders;
DELETE FROM MenuItem;
DELETE FROM CartItems;
DELETE FROM Carts;
DELETE FROM Stalls;
DELETE FROM Cuisine;
*/
