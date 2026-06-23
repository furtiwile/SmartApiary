# SmartApiary Data Flows & Storage Architecture Walkthrough

This document outlines the operational data flows, queues, notifications, databases (SQL and Azure Tables), and real-time SignalR broadcasts of the **SmartApiary** platform.

---

## 1. Relational Database Schema (SQL Server)

Three primary relational and spatial models reside in the Microsoft SQL Server database:

*   **`dbo.Users`**: Stores account records for beekeepers, farmers, and admins.
    *   **Fields**: `Id` (GUID), `Email` (NVarChar), `FirstName` (NVarChar), `LastName` (NVarChar), `PhoneNumber` (NVarChar), `PasswordHash` (NVarChar), `Role` (Int), `IsActive` (Bit), `WeightDropThreshold` (Float).
*   **`dbo.Apiaries`**: Stores beekeeper apiaries, utilizing SQL Server's spatial `geography` type to query geographical coordinate proximity.
    *   **Fields**: `Id` (GUID), `Name` (NVarChar), `Location` (Spatial `geography` POINT), `BeekeeperId` (GUID -> `dbo.Users.Id`).
*   **`dbo.Parcels`**: Stores farm parcels, also using the spatial `geography` type.
    *   **Fields**: `Id` (GUID), `Name` (NVarChar), `Location` (Spatial `geography` POINT), `FarmerId` (GUID -> `dbo.Users.Id`).

---

## 2. NoSQL Database Schema (Azure Table Storage)

High-throughput, flat key-value pairs are stored in Azure Tables. The partition keys (`PK`) and row keys (`RK`) are structured to maximize querying performance:

| Table Name | Entity Model | Partition Key (`PK`) | Row Key (`RK`) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`Hives`** | `Hive` | `ApiaryId` | `HiveId` | Groups all hives under their parent apiary for batch retrievals. |
| **`HiveInspections`** | `HiveInspection` | `HiveId` | `InspectionId` | Fetches historical health inspection cards of a specific hive. |
| **`Crops`** | `Crop` | `ParcelId` | `CropId` | Fetches crop varieties grown on a specific farm parcel. |
| **`SmartScales`** | `SmartScale` | `Status` (`Paired`/`Unpaired`) | `ScaleId` | Stores hardware registry. Changing status deletes & re-inserts. |
| **`SprinklingAnnouncements`** | `SprinklingAnnouncement` | `ParcelId` | `AnnouncementId` | Schedules of planned crop treatment alerts. |
| **`SprinklingRecords`** | `SprinklingRecord` | `AnnouncementId` | `RecordId` | Realized spraying events logging wind/precipitation. |
| **`Telemetries`** | `Telemetry` | `SmartScaleId` | `TelemetryId` | Historical scale readings. |
| **`ActivationTokens`** | `ActivationToken` | `"ActivationTokens"` | `HashedToken` | Activation hashes for new account registrations. |
| **`PasswordResetTokens`** | `PasswordResetToken` | `"PasswordResetTokens"` | `HashedToken` | User password recovery hashes. |
| **`Notifications`** | `Notification` | `UserId` | `NotificationId` | System notifications to display inside user client hubs. |

---

## 3. Asynchronous Messaging Queues (Azure Storage Queues)

Asynchronous operations are dispatched off-thread using three main storage queues:

*   **`telemetry-queue`**: Loaded with a JSON telemetry payload during device ingestion. Pollers broadcast WebSocket events and check for weight anomalies.
*   **`alert-queue`**: Feeds warnings (low battery, weight drops) to a worker that formats database notification records and sends emails.
*   **`announcement-queue`**: Triggers spatial queries and emails beekeepers when farmers schedule pesticide spraying.

---

## 4. Real-Time Socket Event Channels (SignalR)

A custom socket gateway (`DeviceHub`) broadcasts live updates to frontend dashboards based on four client group subscriptions:

*   **`hive:{HiveId}`**: Live weight, battery, and temperature metrics for a specific hive dashboard view.
*   **`apiary:{ApiaryId}`**: Real-time alerts and state indicators compiled for an apiary board.
*   **`beekeeper:{BeekeeperId}`**: Alert warning popups specific to a single owner's assets.
*   **`private:{UserId}`**: Custom alert counter updates and red dot notifications for logged-in accounts.

---

## 5. Walkthrough of Major System Flows

### Flow A: User Account Activation
*   **Mermaid Flow Diagram:** [user_activation_flow.mmd](file:///c:/Faculty/Cloud/Project/Diagrams/user_activation_flow.mmd)
*   **Data Sequence:**
    1.  An Administrator creates a new account:
        *   **SQL Insert:** Writes user record to `dbo.Users` setting `IsActive = 0` and leaving `PasswordHash` empty.
    2.  Activation token generation:
        *   **Table Insert:** Writes `ActivationTokenEntity` to table `ActivationTokens` (PK = `"ActivationTokens"`, RK = `SHA256(RawToken)`).
    3.  Distribution:
        *   **Email:** SendGrid sends a link to the user containing the `RawToken` in the query string.
    4.  Verification & Completion:
        *   User enters password and submits.
        *   **Table Read:** Fetches the record in `ActivationTokens` using the hashed token.
        *   **SQL Update:** Updates `dbo.Users`, setting `IsActive = 1` and `PasswordHash = BCrypt(NewPassword)`.
        *   **Table Update:** Marks `ActivationTokenEntity` as used (`UsedAtUtc = DateTime.UtcNow`).

---

### Flow B: Device Telemetry & Real-Time Broadcasting
*   **Mermaid Flow Diagram:** [device_telemetry_flow.mmd](file:///c:/Faculty/Cloud/Project/Diagrams/device_telemetry_flow.mmd)
*   **Data Sequence:**
    1.  Ingestion:
        *   A scale posts to `/api/telemetry` with header `X-Device-Token`.
        *   **Table Read:** Validates token in `SmartScales` (RK = `ScaleId`).
        *   **Table Insert:** Appends entry to `Telemetries` table (PK = `SmartScaleId`, RK = `TelemetryId`).
        *   **Table Update:** Updates `SmartScales`, modifying `LatestReading` and `TimeOfLastReading` parameters.
        *   **Queue Enqueue:** Pushes telemetry metadata into `telemetry-queue`.
    2.  Processing Worker:
        *   `TelemetryBroadcastWorker` dequeues from `telemetry-queue`.
        *   **Table Read:** Loads `Hives` (PK = `ApiaryId`, RK = `HiveId`).
        *   **SQL Read:** Loads `dbo.Apiaries` & `dbo.Users` to fetch beekeeper owner ID.
        *   **SignalR Broadcasts:** Calls `ReceiveTelemetry` on three groups: `hive:{HiveId}`, `apiary:{ApiaryId}`, and `beekeeper:{BeekeeperId}`.
        *   **Application Command:** Dispatches `ProcessTelemetryCommand` via MediatR to check for anomalies.
        *   **Queue Delete:** Acknowledges and deletes the message from the queue.

---

### Flow C: Anomaly Detection & Notifications
*   **Mermaid Flow Diagram:** [anomaly_detection_flow.mmd](file:///c:/Faculty/Cloud/Project/Diagrams/anomaly_detection_flow.mmd)
*   **Data Sequence:**
    1.  Detection:
        *   During telemetry ingestion or processing, if weight drop $\ge$ 5kg (or beekeeper threshold), the system raises `AnomalyDetectedDomainEvent`.
    2.  Domain Event Interceptors:
        *   **`LogAlertEventHandler`**: De-serializes event parameters and enqueues to `alert-queue`.
        *   **`AlertSignalRBroadcastEventHandler`**: Broadcasts `ReceiveAlert` directly to the `beekeeper:{BeekeeperId}` SignalR group for a push overlay warning.
    3.  Asynchronous Processing:
        *   `ProcessAlerts` Azure Function triggers on the `alert-queue`.
        *   **SQL Read:** Fetches user email from `dbo.Users`.
        *   **Table Insert:** Inserts `NotificationEntity` in `Notifications` table (PK = `UserId`, RK = `NotificationId`).
        *   **Email:** Sends warning email detailing weight drop to Beekeeper via SendGrid.
        *   **Domain Event:** Raises `NotificationCreatedDomainEvent`.
    4.  Live Broadcast:
        *   **`NotificationSignalRBroadcastEventHandler`** catches event and calls `ReceiveNotification` to SignalR group `private:{UserId}` to increment the navbar counter.

---

### Flow D: Agricultural Sprinkling Announcements
*   **Mermaid Flow Diagram:** [sprinkling_announcement_flow.mmd](file:///c:/Faculty/Cloud/Project/Diagrams/sprinkling_announcement_flow.mmd)
*   **Data Sequence:**
    1.  Farmer schedules a spraying event:
        *   **Table Insert:** Writes record to `SprinklingAnnouncements` table (PK = `ParcelId`, RK = `AnnouncementId`).
        *   **Queue Enqueue:** Pushes announcement payload to `announcement-queue`.
    2.  Proximity Processing:
        *   `SprinklingAnnouncementMonitor` Azure Function triggers on the `announcement-queue`.
        *   **SQL Read (Proximity GIS):** Executes spatial distance checking query:
            ```sql
            DECLARE @targetLocation geography = geography::STGeomFromText(@LocationWkt, 4326);
            SELECT Id, BeekeeperId FROM dbo.Apiaries
            WHERE Location.STDistance(@targetLocation) <= 5000; -- 5km radius
            ```
        *   **SQL Read:** Resolves email addresses for the matching Beekeepers from `dbo.Users`.
        *   **Email:** Sends warning emails outlining spraying timeframe and preparation guidelines.
        *   **SignalR Notification:** Raises `PesticideWarningDomainEvent`, prompting `AlertSignalRBroadcastEventHandler` to broadcast warning details to `beekeeper:{BeekeeperId}` group.

---

### Flow E: Password Reset Recovery
*   **Mermaid Flow Diagram:** [password_reset_flow.mmd](file:///c:/Faculty/Cloud/Project/Diagrams/password_reset_flow.mmd)
*   **Data Sequence:**
    1.  Request:
        *   User requests reset link via `/api/auth/forgot-password`.
        *   **SQL Read:** Queries `dbo.Users` by email to verify registration.
        *   **Table Insert:** Writes `PasswordResetTokenEntity` into `PasswordResetTokens` table (PK = `"PasswordResetTokens"`, RK = `SHA256(RawToken)`, UserId, Expires).
        *   **Email:** SendGrid delivers email reset link containing the `RawToken`.
    2.  Submission:
        *   User enters new password and submits reset form.
        *   **Table Read:** Fetches token from `PasswordResetTokens` using hashed value.
        *   **SQL Update:** Updates `dbo.Users`, updating `PasswordHash` for the matching user record.
        *   **Table Update:** Marks `PasswordResetTokenEntity` as used (`UsedAtUtc = DateTime.UtcNow`).
