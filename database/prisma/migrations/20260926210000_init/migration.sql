-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `subscriptionPlan` ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    `subscriptionStartedAt` DATETIME(3) NULL,
    `subscriptionExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_subscriptionPlan_idx`(`subscriptionPlan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trips` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `destinationName` VARCHAR(191) NULL,
    `destinationType` VARCHAR(191) NULL,
    `destinationCode` VARCHAR(191) NULL,
    `destinationPlaceId` VARCHAR(191) NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `travelers` JSON NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `budgetMinor` INTEGER NULL,
    `totalEstimatedCost` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PLANNED', 'CONFIRMED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `selectedTripOptionId` VARCHAR(191) NULL,
    `transportMode` VARCHAR(191) NULL,
    `preferences` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `trips_userId_idx`(`userId`),
    INDEX `trips_status_idx`(`status`),
    INDEX `trips_startDate_endDate_idx`(`startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_options` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `destinationName` VARCHAR(191) NOT NULL,
    `destinationType` VARCHAR(191) NULL,
    `destinationCode` VARCHAR(191) NULL,
    `destinationPlaceId` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `countryCode` VARCHAR(2) NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `travelers` JSON NOT NULL,
    `totalPriceMinor` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `transportSummary` JSON NOT NULL,
    `accommodationSummary` JSON NOT NULL,
    `highlights` JSON NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trip_options_tripId_idx`(`tripId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transports` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NULL,
    `tripOptionId` VARCHAR(191) NULL,
    `type` ENUM('FLIGHT', 'TRAIN', 'BUS', 'CAR', 'FERRY', 'PUBLIC_TRANSPORT', 'TAXI', 'RENTAL_CAR', 'WALK', 'MIXED') NOT NULL,
    `provider` VARCHAR(191) NULL,
    `departureLocation` VARCHAR(191) NOT NULL,
    `arrivalLocation` VARCHAR(191) NOT NULL,
    `departureTime` DATETIME(3) NULL,
    `arrivalTime` DATETIME(3) NULL,
    `durationMinutes` INTEGER NULL,
    `priceMinor` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `stops` INTEGER NOT NULL DEFAULT 0,
    `baggage` VARCHAR(191) NULL,
    `cabinClass` ENUM('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST') NULL,
    `overnight` BOOLEAN NOT NULL DEFAULT false,
    `segments` JSON NULL,
    `sourceOfferId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `transports_tripId_idx`(`tripId`),
    INDEX `transports_tripOptionId_idx`(`tripOptionId`),
    INDEX `transports_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accommodations` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NULL,
    `tripOptionId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `type` ENUM('HOTEL', 'APARTMENT', 'HOSTEL', 'GUESTHOUSE', 'RESORT', 'VILLA', 'APARTHOTEL') NOT NULL,
    `rating` DECIMAL(2, 1) NOT NULL,
    `pricePerNightMinor` INTEGER NOT NULL,
    `totalPriceMinor` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `amenities` JSON NOT NULL,
    `checkIn` DATE NULL,
    `checkOut` DATE NULL,
    `guests` INTEGER NULL,
    `nights` INTEGER NULL,
    `country` VARCHAR(191) NULL,
    `countryCode` VARCHAR(2) NULL,
    `breakfastIncluded` BOOLEAN NOT NULL DEFAULT false,
    `freeCancellation` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `accommodations_tripId_idx`(`tripId`),
    INDEX `accommodations_tripOptionId_idx`(`tripOptionId`),
    INDEX `accommodations_destination_idx`(`destination`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itineraries` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `summary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `itineraries_tripId_key`(`tripId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itinerary_days` (
    `id` VARCHAR(191) NOT NULL,
    `itineraryId` VARCHAR(191) NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `estimatedCostMinor` INTEGER NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL,

    INDEX `itinerary_days_itineraryId_idx`(`itineraryId`),
    UNIQUE INDEX `itinerary_days_itineraryId_dayNumber_key`(`itineraryId`, `dayNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activities` (
    `id` VARCHAR(191) NOT NULL,
    `itineraryDayId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` ENUM('SIGHTSEEING', 'FOOD', 'TRANSPORT', 'NATURE', 'CULTURE', 'SHOPPING', 'WELLNESS', 'ENTERTAINMENT', 'OTHER') NOT NULL,
    `location` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `estimatedCostMinor` INTEGER NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `activities_itineraryDayId_idx`(`itineraryDayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_costs` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `category` ENUM('TRANSPORT', 'ACCOMMODATION', 'BAGGAGE', 'FOOD', 'LOCAL_TRANSPORT', 'ACTIVITIES', 'INSURANCE', 'VISA', 'FEES', 'OTHER') NOT NULL,
    `amountMinor` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trip_costs_tripId_idx`(`tripId`),
    INDEX `trip_costs_tripId_category_idx`(`tripId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_options` ADD CONSTRAINT `trip_options_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transports` ADD CONSTRAINT `transports_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transports` ADD CONSTRAINT `transports_tripOptionId_fkey` FOREIGN KEY (`tripOptionId`) REFERENCES `trip_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accommodations` ADD CONSTRAINT `accommodations_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accommodations` ADD CONSTRAINT `accommodations_tripOptionId_fkey` FOREIGN KEY (`tripOptionId`) REFERENCES `trip_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itineraries` ADD CONSTRAINT `itineraries_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itinerary_days` ADD CONSTRAINT `itinerary_days_itineraryId_fkey` FOREIGN KEY (`itineraryId`) REFERENCES `itineraries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_itineraryDayId_fkey` FOREIGN KEY (`itineraryDayId`) REFERENCES `itinerary_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_costs` ADD CONSTRAINT `trip_costs_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

