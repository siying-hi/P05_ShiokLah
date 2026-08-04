-- CREATING DATABASE
CREATE  DATABASE hawker_centre_management_system;

CREATE TABLE Patrons (
    patron_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    refresh_token VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL
);

-- Vendors Table
CREATE TABLE Vendors (
    vendor_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    refresh_token VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL
);

--Operators Table
CREATE TABLE Operators (
    operator_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    refresh_token VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL
);

-- NEA Officers Table
CREATE TABLE NEAOfficers (
    officer_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    assigned_area VARCHAR(100),
    profile_image VARCHAR(255) DEFAULT 'default-officer.png',
    refresh_token VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL
);

-- Cuisine Table
CREATE TABLE Cuisine (
    cuisine_id INT IDENTITY(1,1) PRIMARY KEY,
    cuisine_type VARCHAR(20) NOT NULL UNIQUE,
    vendor_id INT NULL,
    default_status BIT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- Stalls Table
CREATE TABLE Stalls (
    stall_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_name VARCHAR(255) NOT NULL,
    vendor_id INT NOT NULL,
    cuisine_id INT NOT NULL,
    location VARCHAR(255),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    image_name VARCHAR(255) NULL,
    rating DECIMAL(2,1) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id),
    FOREIGN KEY (cuisine_id) REFERENCES Cuisine(cuisine_id)
);

-- Cards Table
-- CREATE TABLE Cards (
--     card_id INT IDENTITY(1,1) PRIMARY KEY,
--     patron_id INT NOT NULL,
--     card_number VARCHAR(20) NOT NULL,
--     expiry_date DATE NOT NULL,
--     cvv CHAR(3) NOT NULL,
--     FOREIGN KEY (patron_id) REFERENCES Patrons(patron_id)
-- );
CREATE TABLE Cards (
    card_id INT IDENTITY(1,1) PRIMARY KEY,
    patron_id INT NOT NULL,
    cardholder_name VARCHAR(100) NOT NULL,
    card_number VARCHAR(255) NOT NULL,
    expiry_month CHAR(2) NOT NULL,
    expiry_year CHAR(4) NOT NULL,
    cvv VARCHAR(255) NOT NULL,
    is_default BIT NOT NULL
        DEFAULT 0,
    created_at DATETIME NOT NULL
        DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (patron_id) REFERENCES Patrons(patron_id)
);

-- MenuItem Table
CREATE TABLE MenuItem (
    item_id INT IDENTITY(1,1) PRIMARY KEY,
    item_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    food_description VARCHAR(255) NOT NULL,
    allergen_info VARCHAR(255) NOT NULL,
    estimated_waiting_time INT NOT NULL,
    image_name VARCHAR(50) NOT NULL CONSTRAINT DF_MenuItem_ImageName DEFAULT ('placeholder.png'),
    stall_id INT NOT NULL,
    visibility BIT NOT NULL CONSTRAINT DF_MenuItem_Visibility DEFAULT (1),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id)
);

-- Carts Table
CREATE TABLE Carts (
    cart_id INT IDENTITY(1,1) PRIMARY KEY,
    patron_id INT NOT NULL UNIQUE,
    stall_id INT NOT NULL,
    FOREIGN KEY (patron_id) REFERENCES Patrons(patron_id),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id)
);

-- CartItems Table
CREATE TABLE CartItems (
    cart_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id,item_id),
    FOREIGN KEY (cart_id) REFERENCES Carts(cart_id),
    FOREIGN KEY (item_id) REFERENCES MenuItem(item_id)
);

-- Eco Packaging Table
CREATE TABLE eco_packaging (
    packaging_id INT IDENTITY(1,1) PRIMARY KEY,
    packaging_name VARCHAR(255) NOT NULL,
    packaging_code VARCHAR(50) UNIQUE,
    packaging_type VARCHAR(50),
    material_type VARCHAR(50),
    is_biodegradable BIT DEFAULT 0,
    is_compostable BIT DEFAULT 0,
    is_recyclable BIT DEFAULT 0,
    is_reusable BIT DEFAULT 0,
    days_to_decompose INT,
    carbon_footprint DECIMAL(10,2),
    description TEXT,
    unit VARCHAR(20),
    price_per_unit DECIMAL(10,2),
    size VARCHAR(50),
    color VARCHAR(50),
    current_stock INT DEFAULT 0,
    minimum_stock_level INT DEFAULT 10,
    reorder_level INT DEFAULT 5,
    supplier_name VARCHAR(255),
    supplier_contact VARCHAR(100),
    supplier_email VARCHAR(100),
    is_available BIT DEFAULT 1,
    is_featured BIT DEFAULT 0,
    availability_start_date DATE,
    availability_end_date DATE,
    image_path VARCHAR(500),
    image_filename VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Orders Table
-- CREATE TABLE Orders (
--     order_id INT IDENTITY(1,1) PRIMARY KEY,
--     time_created DATETIME NOT NULL DEFAULT GETDATE(),
--     patron_id INT NOT NULL,
--     order_mode VARCHAR(20) NOT NULL,
--     item_id INT NOT NULL,
--     item_name VARCHAR(100) NOT NULL,
--     price DECIMAL(10,2) NOT NULL,
--     quantity INT NOT NULL CHECK (quantity > 0),
--     stall_id INT NOT NULL,
--     order_status VARCHAR(20) NOT NULL CONSTRAINT DF_Orders_OrderStatus DEFAULT 'Pending',
--     packaging_id INT NULL,
--     packaging_type VARCHAR(50),
--     size VARCHAR(50),
--     packaging_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
--     CONSTRAINT FK_Orders_Patrons FOREIGN KEY (patron_id) REFERENCES Patrons(patron_id),
--     CONSTRAINT FK_Orders_MenuItem FOREIGN KEY (item_id) REFERENCES MenuItem(item_id),
--     CONSTRAINT FK_Orders_Stalls FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id),
--     CONSTRAINT FK_Orders_EcoPackaging FOREIGN KEY (packaging_id) REFERENCES eco_packaging(packaging_id)
-- );

CREATE TABLE Orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    patron_id INT NOT NULL,
    stall_id INT NOT NULL,
    time_created DATETIME NOT NULL
        DEFAULT GETDATE(),
    order_mode VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL
    CHECK (payment_method IN ('Cash', 'Visa', 'Mastercard')),
    subtotal DECIMAL(10,2) NOT NULL,
    packaging_fee DECIMAL(10,2) NOT NULL
        DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    order_status VARCHAR(20) NOT NULL
        DEFAULT 'Pending',
    CONSTRAINT FK_Orders_Patron
        FOREIGN KEY (patron_id)
        REFERENCES Patrons(patron_id),
    CONSTRAINT FK_Orders_Stall
        FOREIGN KEY (stall_id)
        REFERENCES Stalls(stall_id)

);

CREATE TABLE OrderItems (
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL
        CHECK(quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY
    (
        order_id,
        item_id
    ),
    CONSTRAINT FK_OrderItems_Order
        FOREIGN KEY (order_id)
        REFERENCES Orders(order_id),
    CONSTRAINT FK_OrderItems_MenuItem
        FOREIGN KEY (item_id)
        REFERENCES MenuItem(item_id)
);

-- Stall Packaging Selections Table
CREATE TABLE stall_packaging_selections (
    selection_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT NOT NULL,
    packaging_id INT NOT NULL,
    is_active BIT DEFAULT 1,
    is_default_option BIT DEFAULT 0,
    price_adjustment DECIMAL(5,2) DEFAULT 0, -- Additional cost or discount
    minimum_order_quantity INT DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE,
    FOREIGN KEY (packaging_id) REFERENCES eco_packaging(packaging_id) ON DELETE CASCADE,
    CONSTRAINT UQ_stall_packaging UNIQUE (stall_id,packaging_id)
);

-- Packaging Stock Transactions Table
CREATE TABLE packaging_stock_transactions (
    transaction_id INT IDENTITY(1,1) PRIMARY KEY,
    packaging_id INT NOT NULL,
    transaction_type VARCHAR(20), -- 'Restock', 'Usage', 'Waste', 'Return'
    quantity_change INT NOT NULL, -- Positive for restock, negative for usage
    previous_stock INT,
    new_stock INT,
    transaction_date DATETIME DEFAULT GETDATE(),
    performed_by VARCHAR(100),
    reference_document VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (packaging_id) REFERENCES eco_packaging(packaging_id) ON DELETE CASCADE
);



CREATE TABLE OrderHistory (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,   
    patron_id INT NOT NULL,
    stall_id INT NOT NULL,
    order_date DATETIME NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    item_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    total_amt DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (patron_id) REFERENCES Patrons(patron_id),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id),
   /* FOREIGN KEY (item_id) REFERENCES MenuItem(item_id)*/
);

-- Favourite Order History Table
CREATE TABLE FavouriteOrderHistory (
    favourite_id INT IDENTITY(1,1) PRIMARY KEY,
    patron_id INT NOT NULL,
    /*history_id INT NOT NULL, */  -- reference to OrderHistory row
    order_id INT NOT NULL,
    custom_name VARCHAR(50) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (patron_id) REFERENCES Patrons(patron_id),
    /*FOREIGN KEY (history_id) REFERENCES OrderHistory(history_id)*/
);


-- Sustainability Reports Table
CREATE TABLE sustainability_reports (
    report_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT NOT NULL,
    report_date DATE NOT NULL,
    report_period VARCHAR(20),
    period_start_date DATE,
    period_end_date DATE,
    -- Packaging metrics
    total_packaging_used INT DEFAULT 0,
    eco_packaging_used INT DEFAULT 0,
    non_eco_packaging_used INT DEFAULT 0,
    packaging_waste_kg DECIMAL(10,2) DEFAULT 0,
    packaging_recycled_kg DECIMAL(10,2) DEFAULT 0,
    packaging_composted_kg DECIMAL(10,2) DEFAULT 0,

    -- Environmental impact
    carbon_footprint_saved_kg DECIMAL(10,2) DEFAULT 0,
    plastic_reduced_kg DECIMAL(10,2) DEFAULT 0,
    trees_saved INT DEFAULT 0,
    water_saved_liters DECIMAL(10,2) DEFAULT 0,
    energy_saved_kwh DECIMAL(10,2) DEFAULT 0,

    -- Eco packaging adoption
    eco_packaging_adoption_rate DECIMAL(5,2) DEFAULT 0,

    -- Additional metrics
    customer_satisfaction_score DECIMAL(3,2) DEFAULT 0,
    cost_savings DECIMAL(10,2) DEFAULT 0,
    total_waste_reduced_kg DECIMAL(10,2) DEFAULT 0,
    sustainability_score INT DEFAULT 0,
    sustainability_grade VARCHAR(5),
    recommendations TEXT,
    notes TEXT,
    generated_by VARCHAR(100),
    generated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE,
    CONSTRAINT UQ_stall_report_date UNIQUE (stall_id,report_date,report_period)
);

-- Food Handler Certificate Table
CREATE TABLE FoodHandlerCertificate (
    certificate_id INT IDENTITY(1,1) PRIMARY KEY,
    certificate_name VARCHAR(100) NOT NULL,
    vendor_id INT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    validity_period AS DATEDIFF(DAY,issue_date,expiry_date) PERSISTED,
    issuing_authority VARCHAR(100) NOT NULL,
    certificate_image_path VARCHAR(500) NULL,
    approval_status VARCHAR(20) NOT NULL CHECK (approval_status IN ('Pending','Rejected','Approved')),
    FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

-- Certificate Types Master Table
CREATE TABLE certificate_types (
    certificate_type_id INT IDENTITY(1,1) PRIMARY KEY,
    certificate_name VARCHAR(100) NOT NULL,
    certificate_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    validity_period_months INT,
    is_mandatory BIT DEFAULT 1,
    requires_renewal BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Certificate Expiry Reminders Table (Original code was referencing an invalid column name, changed certificate_id to certificate_type_id)
CREATE TABLE certificate_expiry_reminders (
    reminder_id INT IDENTITY(1,1) PRIMARY KEY,
    certificate_id INT NOT NULL,
    stall_id INT NOT NULL,
    reminder_type VARCHAR(50),
    reminder_date DATE NOT NULL,
    reminder_sent_date DATETIME,
    reminder_status VARCHAR(20) DEFAULT 'Pending',
    sent_to VARCHAR(255),
    notification_message TEXT,
    acknowledged_by VARCHAR(100),
    acknowledged_date DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    /*FOREIGN KEY (certificate_id) REFERENCES certificate_types(certificate_id)*/
    FOREIGN KEY (certificate_id) REFERENCES certificate_types(certificate_type_id),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE
);

-- Hygiene Grades Table
CREATE TABLE hygiene_grades (
    hygiene_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT NOT NULL,
    hygiene_grade VARCHAR(10) NOT NULL,
    inspection_date DATE NOT NULL,
    inspection_time TIME,
    inspection_by VARCHAR(100),
    score DECIMAL(5,2),
    remarks TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE
);

-- Vendor Cleaning Submissions Table
CREATE TABLE vendor_cleaning_submissions (
    submission_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT NOT NULL,
    cleaning_date DATE NOT NULL,
    cleaning_time TIME,
    submission_datetime DATETIME DEFAULT GETDATE(),
    submitted_by VARCHAR(100),
    cleaning_type VARCHAR(50),
    cleaning_duration_minutes INT,
    cleaning_description TEXT,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'Pending',

    -- Review information
    reviewed_by VARCHAR(100),
    review_date DATETIME,
    review_remarks TEXT,
    review_score DECIMAL(5,2),

    -- Metadata
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE
);

-- Submission Images Table
-- Has a Introducing FOREIGN KEY constraint 'FK__submissio__stall__03C67B1A' on table 'submission_images'
-- may cause cycles or multiple cascade paths. Specify ON DELETE NO ACTION or ON UPDATE NO ACTION, or modify
-- other FOREIGN KEY constraints.)
CREATE TABLE submission_images (
    submission_image_id INT IDENTITY(1,1) PRIMARY KEY,
    submission_id INT NOT NULL,
    stall_id INT NOT NULL,

    -- Image storage
    image_path VARCHAR(500) NOT NULL,

    -- Image metadata
    image_filename VARCHAR(255) NOT NULL,
    image_file_size BIGINT,
    image_mime_type VARCHAR(50),
    image_width INT,
    image_height INT,
    image_description VARCHAR(500),
    is_primary BIT DEFAULT 0,
    is_before_cleaning BIT DEFAULT 0,
    is_after_cleaning BIT DEFAULT 0,

    -- Submission uploader
    upload_order INT DEFAULT 0,
    uploaded_by VARCHAR(100),
    uploaded_at DATETIME DEFAULT GETDATE(),
    is_verified BIT DEFAULT 0,
    verified_by VARCHAR(100),
    verified_date DATETIME,
    verification_remarks TEXT,
    FOREIGN KEY (submission_id) REFERENCES vendor_cleaning_submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE
);

-- Latest Cleaning Dates Table
CREATE TABLE Latest_cleaning_dates (
    cleaning_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT NOT NULL,
    last_cleaning_date DATE NOT NULL,
    last_cleaning_time TIME,
    last_submission_id INT, -- Reference to the latest submission
    cleaning_type VARCHAR(50),
    performed_by VARCHAR(100),
    next_scheduled_cleaning DATE,
    cleaning_status VARCHAR(20),
    remarks TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE,
    FOREIGN KEY (last_submission_id) REFERENCES vendor_cleaning_submissions(submission_id),
    CONSTRAINT UQ_stall_cleaning UNIQUE (stall_id)
);

-- Cleaning Compliance Rules Table
CREATE TABLE Cleaning_compliance_rules (
    rule_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT,
    cleaning_type VARCHAR(50),
    frequency_days INT NOT NULL, -- How often cleaning required
    images_required INT DEFAULT 3, -- Number of images required
    require_before_after BIT DEFAULT 1, -- Need before and after photos
    max_days_between_cleaning INT,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Stall Visibility Table
CREATE TABLE stall_visibility (
    visibility_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT NOT NULL UNIQUE,
    is_visible BIT DEFAULT 1, -- 1 = Visible, 0 = Hidden
    visibility_reason VARCHAR(255), -- 'Maintenance', 'Temporary Closure', 'Permit Issue'
    visibility_updated_by VARCHAR(100),
    visibility_updated_date DATETIME DEFAULT GETDATE(),
    scheduled_visibility_start DATETIME,
    scheduled_visibility_end DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE
);

-- Stall Popularity Table
CREATE TABLE stall_popularity (
    popularity_id INT IDENTITY(1,1) PRIMARY KEY,
    stall_id INT NOT NULL,

    -- Metrics
    tracking_date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    queue_length INT DEFAULT 0,
    average_wait_time_minutes INT DEFAULT 0,

    -- Status based on metrics
    customer_return_rate DECIMAL(5,2) DEFAULT 0,
    peak_hour_orders INT DEFAULT 0,
    popularity_score INT DEFAULT 0,
    popularity_rank VARCHAR(20),
    trend VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id) ON DELETE CASCADE,
    CONSTRAINT UQ_stall_popularity_date UNIQUE (stall_id,tracking_date)
);

-- Feedback Table
CREATE TABLE Feedbacks (
    feedback_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    stall_id INT NOT NULL,
    patron_id INT NOT NULL,

    food_rating INT NOT NULL
        CHECK (food_rating BETWEEN 1 AND 5),

    service_rating INT NOT NULL
        CHECK (service_rating BETWEEN 1 AND 5),

    atmosphere_rating INT NOT NULL
        CHECK (atmosphere_rating BETWEEN 1 AND 5),

    feedback_description VARCHAR(500) NULL,
    date_submitted DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id),
    FOREIGN KEY (patron_id) REFERENCES Patrons(patron_id)
);

-- Complaints Table
CREATE TABLE Complaints (
    complaint_id INT IDENTITY(1,1) PRIMARY KEY,

    order_id INT NULL,
    patron_id INT NOT NULL,

stall_id INT NOT NULL,
item_id INT NOT NULL
    purchase_date DATE NOT NULL,

    food_issue VARCHAR(1000) NOT NULL,
    service_issue VARCHAR(1000) NOT NULL,
    additional_comments VARCHAR(1000) NULL,
    complaint_status VARCHAR(30)
        NOT NULL
        DEFAULT 'Pending Review',
    date_submitted DATETIME
        NOT NULL
        DEFAULT GETDATE(),
    date_updated DATETIME NULL,

    CONSTRAINT FK_Complaints_Orders
        FOREIGN KEY (order_id)
        REFERENCES Orders(order_id),

    CONSTRAINT FK_Complaints_Patrons
        FOREIGN KEY (patron_id)
        REFERENCES Patrons(patron_id),

    CONSTRAINT CK_Complaints_Status
        CHECK (
            complaint_status IN (
                'Pending Review',
                'Under Review',
                'Resolved',
                'Rejected'
            )
        )
);
-- Rental Agreement Table
CREATE TABLE RentalAgreement (
    aid INT IDENTITY(1,1) PRIMARY KEY,
    agr_start_date DATE NOT NULL,
    agr_end_date DATE NOT NULL,
    agr_term_condition NVARCHAR(MAX) NOT NULL,
    agr_status VARCHAR(20) NOT NULL CHECK (agr_status IN ('active','expired','rejected','inactive')),
    rental_price DECIMAL(10,2) NOT NULL,
    trade_type VARCHAR(20) NOT NULL CHECK (trade_type IN ('cooked food','uncooked food')),
    officer_id INT NULL,
    stall_id INT NOT NULL,
    CONSTRAINT FK_RentalAgreement_Officer FOREIGN KEY (officer_id) REFERENCES NEAOfficers(officer_id),
    CONSTRAINT FK_RentalAgreement_Stall FOREIGN KEY (stall_id) REFERENCES Stalls(stall_id)
);

CREATE TABLE FavouriteMenuItems
(
    favourite_id INT IDENTITY(1,1) PRIMARY KEY,

    patron_id INT NOT NULL,

    item_id INT NOT NULL,

    date_added DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_FavouriteMenuItems_Patrons
        FOREIGN KEY (patron_id)
        REFERENCES Patrons(patron_id),

    CONSTRAINT FK_FavouriteMenuItems_MenuItem
        FOREIGN KEY (item_id)
        REFERENCES MenuItem(item_id),

    CONSTRAINT UQ_FavouriteMenuItems
        UNIQUE (patron_id, item_id)
);

CREATE TABLE Rewards (
    reward_id INT IDENTITY(1,1) PRIMARY KEY,

    patron_id INT NOT NULL,

    reward_name VARCHAR(100) NOT NULL,

    reward_description VARCHAR(255),

    reward_type VARCHAR(30) NOT NULL,

    reward_value DECIMAL(10,2) DEFAULT 0,

    reward_code VARCHAR(20),

    minimum_spend DECIMAL(10,2) DEFAULT 0,

    is_used BIT DEFAULT 0,

    expiry_date DATE,

    FOREIGN KEY (patron_id)
        REFERENCES Patrons(patron_id)
);

CREATE TABLE RewardPoints (
    patron_id INT PRIMARY KEY,

    points INT NOT NULL DEFAULT 0,

    last_check_in DATE NULL,

    FOREIGN KEY (patron_id)
        REFERENCES Patrons(patron_id)
);

-- DROP TABLE Code (30)
/*
DROP TABLE IF EXISTS RentalAgreement;
DROP TABLE IF EXISTS Feedbacks;
DROP TABLE IF EXISTS Complaints;
DROP TABLE IF EXISTS FavouriteOrderHistory;
DROP TABLE IF EXISTS DraftOrders;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS CartItems;
DROP TABLE IF EXISTS Carts;
DROP TABLE IF EXISTS Cards;
DROP TABLE IF EXISTS FoodHandlerCertificate;
DROP TABLE IF EXISTS certificate_expiry_reminders;
DROP TABLE IF EXISTS certificate_types;
DROP TABLE IF EXISTS submission_images;
DROP TABLE IF EXISTS Latest_cleaning_dates;
DROP TABLE IF EXISTS vendor_cleaning_submissions;
DROP TABLE IF EXISTS Cleaning_compliance_rules;
DROP TABLE IF EXISTS hygiene_grades;
DROP TABLE IF EXISTS stall_visibility;
DROP TABLE IF EXISTS stall_popularity;
DROP TABLE IF EXISTS sustainability_reports;
DROP TABLE IF EXISTS packaging_stock_transactions;
DROP TABLE IF EXISTS stall_packaging_selections;
DROP TABLE IF EXISTS eco_packaging;
DROP TABLE IF EXISTS OrderHistory;
DROP TABLE IF EXISTS MenuItem;
DROP TABLE IF EXISTS Stalls;
DROP TABLE IF EXISTS Cuisine;
DROP TABLE IF EXISTS NEAOfficers;
DROP TABLE IF EXISTS Vendors;
DROP TABLE IF EXISTS Patrons;
DROP TABLE IF EXISTS FavouriteMenuItems;
*/
